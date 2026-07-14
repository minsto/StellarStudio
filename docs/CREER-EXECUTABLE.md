# Créer l'exécutable du launcher (Windows)

Ce guide explique comment transformer le code en un **vrai `.exe`** distribuable
(installateur + version portable). Tout se fait en une commande.

---

## 1. Prérequis (une seule fois)

- **Node.js** installé (voir le README).
- Les dépendances installées : double-clic sur `Installer.cmd`, ou :

```bash
npm run setup
```

---

## 2. En résumé (la commande à retenir)

Depuis le dossier **`Launcher`** :

```bash
npm run dist:win
```

C'est tout. À la fin, tes fichiers sont dans **`Launcher/release/`**.

> `dist:win` fait 3 choses automatiquement : génère l'icône, compile le code,
> puis fabrique l'installateur avec electron-builder.

---

## 3. Ce que tu obtiens (dans `Launcher/release/`)

| Fichier | Type | À quoi ça sert |
|---------|------|----------------|
| `Stellar-Studio-Setup-<version>.exe` | **Installateur** | L'utilisateur l'exécute, choisit le dossier, crée les raccourcis bureau + menu Démarrer. **C'est celui à distribuer.** |
| `Stellar-Studio-<version>-portable.exe` (ou similaire) | **Portable** | Un seul `.exe`, aucune installation. Pratique pour tester ou pour une clé USB. |
| `win-unpacked/` | Dossier brut | L'app décompressée (pour vérifier), pas destiné à la distribution. |

---

## 4. Étape par étape

### Option A — Dans VSCode (le plus simple)

1. Ouvre le dossier du projet dans VSCode.
2. **Terminal → Exécuter la tâche… → `5 - Generer l'installateur Windows`**.
3. Attends la fin (quelques minutes la première fois).
4. Ouvre le dossier `Launcher/release/`.

### Option B — En ligne de commande

```bash
# depuis la racine du projet
npm run dist
```

…ou en ciblant explicitement Windows depuis le dossier Launcher :

```bash
cd Launcher
npm run dist:win
```

---

## 5. Tester vite, sans fabriquer l'installateur

Fabriquer l'installateur NSIS prend du temps. Pour juste **vérifier que l'app packagée
fonctionne**, génère seulement le dossier décompressé (beaucoup plus rapide) :

```bash
npm run dist:dir
```

Puis lance `Launcher/release/win-unpacked/Stellar Studio.exe`.

---

## 6. Distribuer l'exécutable

- Donne le fichier **`Stellar-Studio-Setup-<version>.exe`** à tes utilisateurs.
- ⚠️ **Sans signature**, Windows affichera au 1er lancement un avertissement
  « application non vérifiée / éditeur inconnu ». L'utilisateur peut cliquer
  **« Informations complémentaires » → « Exécuter quand même »**.
- Pour supprimer cet avertissement, voir [`SIGNATURE-WINDOWS.md`](SIGNATURE-WINDOWS.md).

> Ce launcher n'a **pas de mise à jour automatique** (`publish: null`). Pour diffuser une
> nouvelle version, tu régénères l'installateur et tu redistribues le nouveau `.exe`.

---

## 7. Changer le numéro de version

Avant un build, mets à jour la version dans **`Launcher/package.json`** (champ `"version"`).
Le nom du fichier généré la reprend automatiquement
(ex. `version: "1.1.0"` → `Stellar-Studio-Setup-1.1.0.exe`).

---

## 8. Personnaliser l'installateur (optionnel)

Dans `Launcher/package.json`, section `build.nsis` :

- `createDesktopShortcut` / `createStartMenuShortcut` : raccourcis (activés).
- `allowToChangeInstallationDirectory` : laisse l'utilisateur choisir le dossier (activé).
- `shortcutName` : nom du raccourci (« Stellar Studio »).
- `oneClick: false` : affiche un vrai assistant d'installation.

L'icône de l'exe et de l'installateur vient de `Launcher/build/icon.ico`
(générée depuis `Launcher/resources/app-icon.png`).

---

## 9. Dépannage

| Problème | Solution |
|----------|----------|
| `electron-builder` introuvable | Lance `npm run setup` (dépendances manquantes). |
| Build très long / bloqué au 1er essai | Normal la 1re fois (téléchargement d'outils). Laisse finir. |
| Antivirus bloque le `.exe` généré | Faux positif fréquent sur les apps non signées → voir `SIGNATURE-WINDOWS.md`. |
| L'icône n'est pas la bonne | Régénère-la : `node scripts/generate-icon.mjs`, puis relance le build. |
| Erreur de permission sur `release/` | Ferme toute fenêtre du launcher en cours et supprime le dossier `Launcher/release/`, puis relance. |
