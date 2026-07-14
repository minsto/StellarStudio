import { app, session, shell } from 'electron'
import type { BrowserWindow, WebContents } from 'electron'
import { isUrlAllowedForExternalOpen } from './safeOpenExternal.js'
import { logMain } from './logger.js'

/**
 * Couche de durcissement Electron (defense-in-depth), independante du contrat IPC.
 *
 * Objectifs :
 *  - Interdire toute navigation/ouverture de fenetre vers une origine non-app (anti phishing/redirection).
 *  - Router les liens externes autorises uniquement via `shell.openExternal` (allowlist d'hotes existante).
 *  - Refuser toutes les permissions web (geoloc, camera, notifications web, etc.) — le launcher n'en a pas besoin.
 *  - Appliquer une Content-Security-Policy stricte aux pages locales du launcher (build package uniquement).
 *
 * Ce qui n'est PAS touche :
 *  - La fenetre d'auth Microsoft utilise sa PROPRE session (partition dediee) et sa propre logique de
 *    navigation : elle n'est jamais durcie ici, donc le flux de connexion reste intact.
 *  - En dev, aucune CSP n'est injectee (sinon le HMR de Vite casserait).
 */

/**
 * CSP appliquee aux pages locales (file://) du build package.
 * - `script-src 'self'` : aucun script inline/eval => une injection ne peut pas s'executer.
 * - `style-src 'unsafe-inline'` : requis par le CSS-in-JS / styles inline du renderer.
 * - `connect-src https:` : autorise le flux d'actus distant (fetch de secours) ; le gros du trafic passe par IPC.
 */
const PROD_CSP = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "worker-src 'self' blob:",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self' https:"
].join('; ')

/** true si l'URL cible est une page du launcher (fichier local ou serveur de dev Vite). */
function isAppOrigin(url: string): boolean {
  if (typeof url !== 'string') return false
  if (url.startsWith('file://')) return true
  const dev = process.env.ELECTRON_RENDERER_URL
  return Boolean(dev && url.startsWith(dev))
}

/**
 * A appeler une fois `app` prete, AVANT la creation des fenetres.
 * Agit sur la session par defaut (celle des fenetres du launcher).
 */
export function installGlobalSecurity(): void {
  const ses = session.defaultSession

  // Aucune permission web accordee par defaut.
  ses.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
  try {
    ses.setPermissionCheckHandler(() => false)
  } catch {
    /* API absente sur certaines versions : best-effort */
  }

  // CSP stricte uniquement en build package, et seulement pour les pages locales (file://).
  // Les pages https distantes (ex. session d'auth, qui utilise de toute facon une autre session) ne sont pas touchees.
  if (app.isPackaged) {
    ses.webRequest.onHeadersReceived((details, callback) => {
      if (isAppOrigin(details.url)) {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [PROD_CSP],
            'X-Content-Type-Options': ['nosniff']
          }
        })
        return
      }
      callback({ responseHeaders: details.responseHeaders })
    })
  }
}

function hardenContents(contents: WebContents): void {
  // window.open / target=_blank : jamais de nouvelle fenetre Electron ; on route vers le navigateur si autorise.
  contents.setWindowOpenHandler(({ url }) => {
    if (isUrlAllowedForExternalOpen(url)) {
      void shell.openExternal(url)
    } else {
      logMain('warn', 'window-open bloque', url)
    }
    return { action: 'deny' }
  })

  // Navigation du document principal : seule l'origine app est autorisee.
  contents.on('will-navigate', (event, url) => {
    if (isAppOrigin(url)) return
    event.preventDefault()
    if (isUrlAllowedForExternalOpen(url)) void shell.openExternal(url)
    else logMain('warn', 'will-navigate bloque', url)
  })

  contents.on('will-redirect', (event, url) => {
    if (isAppOrigin(url)) return
    event.preventDefault()
    logMain('warn', 'will-redirect bloque', url)
  })

  // Pas de <webview> embarquee.
  contents.on('will-attach-webview', (event) => {
    event.preventDefault()
    logMain('warn', 'attach-webview bloque')
  })

  // En build package : referme immediatement les DevTools (empeche l'inspection de la console/tokens).
  // La fenetre Debug dediee du launcher reste disponible pour le diagnostic.
  if (app.isPackaged) {
    contents.on('devtools-opened', () => {
      try {
        contents.closeDevTools()
      } catch {
        /* ignore */
      }
    })
  }
}

/**
 * Durcit une fenetre du launcher (main, logs, crash, debug, already-running).
 * NE PAS appeler sur la fenetre d'auth Microsoft (elle gere sa propre navigation).
 */
export function hardenAppWindow(win: BrowserWindow): void {
  hardenContents(win.webContents)
}
