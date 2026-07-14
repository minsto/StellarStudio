# Stellar Studio Launcher

Launcher Minecraft moderne (Electron + React + TypeScript) : modpacks Modrinth sur **NeoForge 1.21.1**, accès **vanilla**, comptes **Microsoft** et **hors ligne**, skins/capes, Discord Rich Presence, console de logs et rapport de crash.

Ce dépôt contient **trois** parties :

| Dossier      | Rôle                                                        |
| ------------ | ---------------------------------------------------------- |
| `Launcher/`  | L'application de bureau (le launcher lui-même).            |
| `Website/`   | Le site vitrine statique (accueil, licence, actus, 404).  |
| `netlify/`   | Les fonctions serveur (flux d'actus via Supabase).        |

---

## Sommaire

- [Prérequis](#prérequis)
- [Démarrage ultra-rapide](#démarrage-ultra-rapide)
- [Ouvrir le projet dans VSCode](#ouvrir-le-projet-dans-vscode)
- [Structure du projet](#structure-du-projet)
- [Scripts disponibles](#scripts-disponibles)
- [Architecture (comment ça marche)](#architecture-comment-ça-marche)
- [Sécurité](#sécurité)
- [Où sont stockées les données](#où-sont-stockées-les-données)
- [Actus (optionnel)](#actus-optionnel)
- [Construire l'installateur](#construire-linstallateur)
- [Dépannage](#dépannage)
- [Licence](#licence)

---

## Prérequis

Un **seul** logiciel à installer : **Node.js LTS (version 20 ou plus)**.
Télécharge-le sur [https://nodejs.org/fr](https://nodejs.org/fr) (choisis « LTS »).

> Sous Windows, tu n'as même pas besoin de le télécharger à la main : lance **`Installer.cmd`**.
> S'il ne trouve pas Node, il propose de l'**installer automatiquement** (via winget).

Tout le reste (Electron, React, outils de build...) s'installe **tout seul**.
Aucun compte, aucune clé, aucun serveur n'est nécessaire pour développer et lancer le launcher en local.

> La version de Node conseillée est notée dans le fichier `.nvmrc` (`20`).

---

## Démarrage ultra-rapide

### Windows (double-clic)

1. Double-clique sur **`Installer.cmd`** → installe toutes les dépendances (à faire une seule fois).
2. Double-clique sur **`Launch.cmd`** puis tape `launcher`, ou en ligne de commande :
   ```
   Launch.cmd launcher
   ```

### En ligne de commande (Windows / macOS / Linux)

```bash
# 1. Installer TOUTES les dépendances (une seule fois)
npm run setup

# 2. Démarrer le launcher en développement
npm run dev
```

Le launcher s'ouvre avec le **rechargement à chaud** : modifie un fichier, l'interface se met à jour automatiquement.

---

## Ouvrir le projet dans VSCode

Le dépôt est prêt à l'emploi : rien à configurer.

1. **Fichier > Ouvrir le dossier...** et choisis `stellar-studio-launcher`
   (ou double-clique sur `stellar-studio.code-workspace`).
2. VSCode propose d'installer les **extensions conseillées** → accepte.
3. Lance une **tâche** : `Terminal > Exécuter la tâche...` puis :
   - `1 - Installer les dependances (tout)` (une seule fois)
   - `2 - Demarrer le launcher (dev)`
4. Ou appuie simplement sur **F5** pour lancer le launcher.

Les fichiers de configuration se trouvent dans `.vscode/` (`tasks.json`, `launch.json`, `extensions.json`, `settings.json`). Ils sont non intrusifs : **aucun reformatage forcé** de ton code.

---

## Structure du projet

```
stellar-studio-launcher/
├─ Launcher/                    # L'application Electron
│  ├─ src/
│  │  ├─ main/                  # Processus principal (Node) : fenêtres, jeu, comptes, IPC
│  │  ├─ preload/               # Pont sécurisé main <-> interface (contrat IPC)
│  │  ├─ renderer/              # Interface React (ce que l'utilisateur voit)
│  │  └─ shared/                # Code partagé (couleurs de marque, types)
│  ├─ resources/                # Icône de l'app
│  ├─ scripts/                  # Génération d'icône, smoke test
│  ├─ electron.vite.config.ts   # Configuration de build
│  └─ package.json
├─ Website/                     # Site vitrine (HTML/CSS/JS statique + i18n)
├─ netlify/functions/           # Fonctions serveur (actus Supabase)
├─ docs/                        # Documentation (dont DEVELOPPEMENT.md)
├─ Installer.cmd                # Installation en un clic (Windows)
├─ Launch.cmd                   # Démarrage en un clic (Windows)
├─ .env.example                 # Modèle de configuration
└─ package.json                 # Scripts « chapeau » du dépôt
```

---

## Scripts disponibles

Depuis la **racine** du dépôt :

| Commande                 | Effet                                            |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Démarre le launcher en développement.            |
| `npm run "Launch site"`  | Démarre le site vitrine en local.                |
| `npm run build`          | Compile le launcher.                             |
| `npm run dist`           | Génère l'installateur (electron-builder).        |
| `npm run test:smoke`     | Vérifie que le build se charge correctement.     |

Depuis `Launcher/` (options avancées) :

| Commande            | Effet                                             |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Développement avec rechargement à chaud.          |
| `npm run build`     | Compile `main` + `preload` + `renderer`.          |
| `npm run dist:win`  | Installateur + version portable Windows.          |
| `npm run dist:mac`  | Image DMG macOS.                                   |
| `npm run dist:dir`  | Build non empaqueté (dossier), pratique pour tester. |

---

## Architecture (comment ça marche)

Un launcher Electron se compose de **trois mondes** qui communiquent :

1. **`main/`** — le « cerveau » (processus Node.js). Il crée les fenêtres, lance Minecraft, gère les comptes, lit/écrit les fichiers, parle à Microsoft et à Modrinth.
2. **`renderer/`** — l'**interface** React affichée à l'utilisateur. Elle n'a **aucun accès direct** au système (sécurité).
3. **`preload/`** — le **pont** entre les deux. C'est le seul point de passage : il expose une API contrôlée sous `window.stellar` (voir `Launcher/src/preload/index.ts`).

Concrètement, quand l'interface veut lancer le jeu :

```
Interface (renderer)  ->  window.stellar.launch()  ->  preload  ->  IPC  ->  main  ->  lance Minecraft
```

> **Règle d'or** : ne jamais donner d'accès Node direct à l'interface. Tout passe par le contrat IPC du `preload`. C'est ce qui rend le launcher sûr.

---

## Sécurité

Le launcher est **durci** au-delà de la plupart des launchers du même type :

- **Comptes chiffrés au repos** : les jetons Microsoft (`accounts.json`) sont chiffrés via Electron `safeStorage` (DPAPI sur Windows, Keychain sur macOS, libsecret sur Linux). Migration automatique depuis un ancien format en clair, avec repli si le coffre du système est indisponible. Voir `Launcher/src/main/accounts.ts`.
- **Isolation stricte** : `contextIsolation` activé, pas d'intégration Node dans l'interface.
- **Content-Security-Policy** appliquée aux pages locales en build (bloque l'exécution de scripts injectés).
- **Navigation verrouillée** : impossible de rediriger l'app vers un site externe ; les liens autorisés s'ouvrent dans le navigateur (liste blanche d'hôtes dans `safeOpenExternal.ts`).
- **Permissions web refusées** par défaut, pas de fenêtres `window.open` sauvages, DevTools refermées en build.

Le tout est centralisé dans `Launcher/src/main/security.ts`.

---

## Où sont stockées les données

Le launcher range ses données utilisateur dans un dossier dédié :

- **Windows** : `%APPDATA%\.stellarstudio`
- **macOS** : `~/Library/Application Support/.stellarstudio`
- **Linux** : `~/.config/.stellarstudio`

On y trouve notamment : `accounts.json` (chiffré), les réglages, les instances de modpacks, les logs et le cache.

---

## Actus (optionnel)

Le flux d'actus est **désactivé par défaut**. Pour l'activer, renseigne dans un fichier `.env` (copie de `.env.example`) :

```
VITE_ACTU_STELLAR_JSON_URL=https://ton-site/.netlify/functions/news-feed
```

Côté serveur (Netlify), les actus s'appuient sur Supabase. Les variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEWS_ADMIN_TOKEN`) se définissent dans l'interface Netlify, **jamais** dans le code. Le schéma de base est dans `docs/supabase-news-schema.sql`.

---

## Construire l'installateur

```bash
cd Launcher
npm run dist:win      # Windows : installateur NSIS + portable
# ou
npm run dist:mac      # macOS : DMG
```

Les fichiers générés arrivent dans `Launcher/release/`.

> **Note** : les mises à jour automatiques sont **désactivées** pour l'instant (aucune cible de publication). Pour les réactiver plus tard : configurer `build.publish` + un dépôt de releases, signer les builds, et restaurer `Launcher/src/main/updater.ts`.

---

## Dépannage

| Problème | Solution |
| -------- | -------- |
| `npm : terme non reconnu` | Node.js n'est pas installé (ou pas dans le PATH). Installe la LTS depuis nodejs.org, puis rouvre le terminal. |
| L'installation échoue | Vérifie ta connexion internet, supprime `node_modules` et `Launcher/node_modules`, relance `Installer.cmd`. |
| Écran blanc en build packagé | Probablement la CSP qui bloque un asset. Elle est **uniquement active en build** (pas en `npm run dev`) et se règle en une ligne dans `Launcher/src/main/security.ts` (`PROD_CSP`). |
| La connexion Microsoft ne s'ouvre pas | La fenêtre d'auth utilise sa propre session ; vérifie ta connexion. Elle n'est pas affectée par le durcissement. |
| Icône Windows pas à jour | Windows met l'icône en cache (AUMID). Réinstalle ou change de version. |

---

## Licence

Le code du launcher est sous licence **MIT** (voir `Launcher/package.json`).

Documentation développeurs :
- Guide général : [`docs/DEVELOPPEMENT.md`](docs/DEVELOPPEMENT.md)
- **Ajouter un modpack** (pas à pas) : [`docs/AJOUTER-UN-MODPACK.md`](docs/AJOUTER-UN-MODPACK.md)
- **Créer l'exécutable** (Windows) : [`docs/CREER-EXECUTABLE.md`](docs/CREER-EXECUTABLE.md)
- **Signer le launcher** (Windows, optionnel) : [`docs/SIGNATURE-WINDOWS.md`](docs/SIGNATURE-WINDOWS.md)
