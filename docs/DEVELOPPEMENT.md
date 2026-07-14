# Guide développeur — Stellar Studio Launcher

Ce guide explique **comment travailler sur le launcher comme un pro** : où se trouvent les choses, comment ajouter des fonctionnalités sans rien casser, et les règles de sécurité à respecter.

> Pas encore à l'aise avec le code ? Commence par le `README.md` à la racine, puis reviens ici.

---

## 1. La règle la plus importante : les 3 processus

Electron sépare le code en trois « mondes ». Comprendre ça, c'est comprendre 90 % du launcher.

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│   RENDERER (React)   │  <==>  │   PRELOAD (le pont)  │  <==>  │   MAIN (Node.js)     │
│  ce que l'on voit    │  IPC   │  window.stellar.*    │  IPC   │  fenêtres, jeu, fs   │
│  AUCUN accès système │        │  API contrôlée       │        │  comptes, réseau     │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
     src/renderer/                    src/preload/                     src/main/
```

- **`src/main/`** : tourne sous Node.js. A tous les pouvoirs (fichiers, process, réseau). C'est là qu'on lance Minecraft, qu'on gère les comptes, etc.
- **`src/renderer/`** : c'est l'interface React. Elle est **isolée** : elle ne peut PAS lire un fichier ou lancer un process directement.
- **`src/preload/index.ts`** : le **contrat**. Il expose une liste précise de fonctions sous `window.stellar`. C'est le **seul** canal entre l'interface et le cerveau.

**Ne jamais contourner ce schéma.** Toute nouvelle capacité « système » passe par un handler IPC dans `main` + une entrée dans `preload`.

---

## 2. Ajouter une fonctionnalité qui parle au système (recette IPC)

Exemple : ajouter un bouton « Ouvrir le dossier des captures d'écran ».

**Étape 1 — Handler côté `main`** (`src/main/index.ts`) :

```ts
ipcMain.handle('shell:open-screenshots-folder', async (_e, modpackId: string) => {
  // ... valider modpackId, calculer le chemin, ouvrir le dossier ...
  return { ok: true as const }
})
```

**Étape 2 — Exposition côté `preload`** (`src/preload/index.ts`) :

```ts
openScreenshotsFolder: (modpackId: string) =>
  ipcRenderer.invoke('shell:open-screenshots-folder', modpackId) as Promise<
    { ok: true } | { ok: false; error: string }
  >,
```

**Étape 3 — Utilisation côté `renderer`** (React) :

```ts
await window.stellar.openScreenshotsFolder(modpackId)
```

Règles :
- **Valide toujours** les entrées reçues dans le handler `main` (ne fais jamais confiance à ce qui vient de l'interface).
- Renvoie un résultat typé `{ ok: true } | { ok: false; error: string }` pour gérer proprement les erreurs.

---

## 3. Où se trouve quoi (dans `Launcher/src/main/`)

| Fichier | Rôle |
| ------- | ---- |
| `index.ts` | Point d'entrée : création des fenêtres, tous les handlers IPC. |
| `security.ts` | Durcissement (CSP, navigation, permissions, DevTools). |
| `accounts.ts` | Stockage **chiffré** des comptes Microsoft / hors ligne. |
| `microsoftAuthCode.ts` | Fenêtre et flux de connexion Microsoft. |
| `settings.ts` | Réglages du launcher (RAM, Java, chemins...). |
| `modpacks.ts` | Définition des modpacks (Modrinth). |
| `modrinth.ts` | Installation / vérification d'intégrité des modpacks. |
| `gameProcess.ts` / `gameLaunchWorker.ts` | Lancement et suivi du process Minecraft. |
| `instancePaths.ts` / `vanillaPaths.ts` | Emplacements des instances et du vanilla. |
| `updater.ts` | Mises à jour (actuellement **neutralisé**). |
| `discordRpc*.ts` | Discord Rich Presence. |
| `logger.ts` | Journalisation côté main (`logMain`). |

Côté interface (`Launcher/src/renderer/src/`) :

| Fichier / dossier | Rôle |
| ----------------- | ---- |
| `App.tsx` | Composant principal de l'interface. |
| `main.tsx` | Point d'entrée : choisit quelle « vue » afficher (app, logs, debug, crash...). |
| `i18n/fr.ts` + `en.ts` | Tous les textes (français / anglais). |
| `assets/branding/` | Logos, wordmark, splash, fonds. |
| `actus/` | Flux d'actualités (désactivé par défaut). |

---

## 4. Traductions (i18n)

Tous les textes visibles sont des **clés** définies dans `i18n/fr.ts` et `i18n/en.ts`.

- Pour changer un texte : modifie la valeur de la clé dans **les deux** fichiers.
- Pour ajouter un texte : ajoute la **même clé** dans `fr.ts` et `en.ts`, puis utilise `t('ma.cle')` dans le composant.

Ne jamais écrire un texte « en dur » dans un composant : passe toujours par `t(...)`.

---

## 5. Marque et visuels

- **Nom, appId, etc.** : `Launcher/package.json` (`productName`, `build.appId`).
- **Couleurs** : `Launcher/src/shared/stellarBrandColors.ts` et `renderer/src/appearance.ts`.
- **Images de marque** : `renderer/src/assets/branding/` (et `renderer/public/branding/`).
  L'icône de l'app est générée depuis `Launcher/resources/app-icon.png` par `scripts/generate-icon.mjs`.

Pour remplacer l'icône : écrase `resources/app-icon.png` par ton image carrée, puis relance un build (`npm run build`), l'`.ico` sera régénéré.

---

## 6. Sécurité — ce qu'il faut savoir

- Les jetons de compte sont **chiffrés** (`accounts.ts`, `safeStorage`). N'écris jamais un token en clair.
- La **CSP** (`security.ts`, `PROD_CSP`) n'autorise que ce dont l'app a besoin. Si tu ajoutes une ressource distante (police, image, API), pense à l'autoriser ici — **uniquement le strict nécessaire**.
- Les liens externes passent par la **liste blanche** de `safeOpenExternal.ts`. Pour ouvrir un nouveau domaine, ajoute-le à `ALLOWED_HOSTS`.
- Ne désactive jamais `contextIsolation` et n'active jamais `nodeIntegration` dans une fenêtre.

**Follow-up sécurité connu** : le `preload` est en ESM (`index.mjs`), donc `sandbox: true` n'est pas activé sur les fenêtres du launcher (ça casserait le pont IPC). Pour l'activer proprement : convertir le preload en CommonJS puis passer `sandbox: true`.

---

## 7. Build & distribution

```bash
cd Launcher
npm run build       # compile dans out/
npm run dist:win    # installateur Windows dans release/
```

Les mises à jour automatiques sont désactivées (pas de cible de publication). Pour les réactiver :
1. Configurer `build.publish` + `repository` dans `Launcher/package.json`.
2. Mettre en place la signature de code.
3. Restaurer l'implémentation réelle dans `src/main/updater.ts`.

---

## 8. Dépannage avancé

- **Écran blanc seulement en build** → CSP trop stricte. Repère l'erreur dans la console (build `dist:dir` puis lance l'exe), et ajuste `PROD_CSP` dans `security.ts`.
- **`window.stellar` est `undefined`** → le preload ne s'est pas chargé. Vérifie le chemin `preload` dans `new BrowserWindow(...)` et que le build du preload existe (`out/preload/index.mjs`).
- **Le jeu ne se lance pas** → regarde la console de logs du launcher (fenêtre dédiée) et le dernier crash report (`%APPDATA%\.stellarstudio`).
- **Changement non pris en compte** → en dev le rechargement est automatique ; pour le `main`, coupe et relance `npm run dev`.

---

## 9. Conventions

- **TypeScript strict** partout (voir `tsconfig.json`).
- Indentation **2 espaces**, fins de ligne **LF** (voir `.editorconfig`).
- Résultats d'opérations « qui peuvent échouer » typés `{ ok: true } | { ok: false; error: string }`.
- Pas de commentaire qui répète le code ; commente seulement l'intention ou une contrainte non évidente.
