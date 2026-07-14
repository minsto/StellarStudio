import type { BrowserWindow } from 'electron'

/**
 * Auto-update neutralise.
 *
 * Ce launcher n'a pas de cible de publication (`build.publish = null`) : il n'existe donc
 * aucun `latest.yml`/release a interroger. Tenter une verification d'update planterait a coup sur.
 * On garde l'API publique (appelee depuis `index.ts` et via IPC) mais chaque fonction est un no-op.
 *
 * Pour reactiver plus tard : reintroduire `electron-updater`, configurer `build.publish` +
 * `repository` dans `package.json`, signer les builds, et restaurer l'implementation reelle.
 */

const UPDATES_ENABLED = false

export function setupAutoUpdater(_mainWindow: BrowserWindow | null, _channel: 'stable' | 'beta'): void {
  if (!UPDATES_ENABLED) return
}

/** @returns toujours false : pas d'auto-update configure. */
export function checkForUpdatesManual(): boolean {
  return false
}

export function quitAndInstall(): void {
  /* no-op : aucune mise a jour a installer. */
}

export async function downloadUpdate(): Promise<void> {
  /* no-op : aucune mise a jour a telecharger. */
}
