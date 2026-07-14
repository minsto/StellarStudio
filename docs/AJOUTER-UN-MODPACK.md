# Ajouter un modpack au launcher

Ce guide explique, pas à pas, comment ajouter tes propres modpacks dans le
**Stellar Studio Launcher** — comme l'a été « Better MC ». Tout se fait dans
**VSCode**, sans connaissances avancées.

> Un modpack « modèle » nommé **`exemple`** est déjà en place. Le plus simple :
> **copier** ce modèle et changer les valeurs.

---

## 1. Ce qu'il faut préparer avant

- **Le projet sur Modrinth** : note le *slug*, c'est la fin de l'URL.
  Exemple : `https://modrinth.com/modpack/`**`stellar-optimised`** → slug = `stellar-optimised`.
- **2 images** pour le pack :
  - `wallpaper.png` — le grand fond d'écran (idéal : **1920 × 1080**).
  - `icon.png` — la petite icône dans la barre latérale (idéal : **carré, 128 × 128** ou plus).

---

## 2. Les 4 fichiers à toucher (toujours les mêmes)

| # | Fichier | Rôle |
|---|---------|------|
| 1 | `Launcher/src/renderer/src/assets/modpacks/<id>/` | Les 2 images du pack (`wallpaper.png`, `icon.png`) |
| 2 | `Launcher/src/main/modpacks.ts` | Déclare le pack (nom, slug, version, loader…) |
| 3 | `Launcher/src/renderer/src/modpackTheme.ts` | Relie le pack à ses images |
| 4 | `Launcher/src/renderer/src/i18n/fr.ts` **et** `en.ts` | Le texte de présentation |

> Règle d'or : l'**`<id>`** (identifiant interne, en minuscules, sans espace)
> doit être **exactement le même** dans les 4 endroits, et **égal au nom du dossier d'images**.

---

## 3. Étapes détaillées

Pour l'exemple, on ajoute un pack d'id **`mon-pack`**.

### Étape 1 — Créer le dossier d'images

Dans VSCode, dans l'explorateur à gauche :

1. Ouvre `Launcher/src/renderer/src/assets/modpacks/`.
2. Clic droit → **Nouveau dossier** → nomme-le `mon-pack`.
3. Glisse-dépose dedans tes 2 images, renommées **exactement** :
   - `wallpaper.png`
   - `icon.png`

> Astuce : recopie le dossier `exemple/` et renomme-le, tu gardes ainsi la bonne structure.

### Étape 2 — Déclarer le pack dans `modpacks.ts`

Ouvre `Launcher/src/main/modpacks.ts`.

**a)** Ajoute l'id dans le type `ModpackId` :

```ts
export type ModpackId = 'exemple' | 'mon-pack'
```

**b)** Copie le bloc `{ ... }` du modèle dans la liste `MODPACKS` et adapte-le
(n'oublie pas la **virgule** entre deux blocs) :

```ts
export const MODPACKS: ModpackSpec[] = [
  {
    id: 'exemple',
    displayName: 'Exemple',
    projectSlug: 'exemple',
    gameVersion: '1.21.1',
    loader: 'neoforge',
    recommendedJava: '21',
    discordUrl: 'https://discord.gg/jVGq5aZ6Wc'
  },
  {
    id: 'mon-pack',
    displayName: 'Mon Super Pack',
    projectSlug: 'le-slug-modrinth',
    gameVersion: '1.21.1',
    loader: 'neoforge',
    recommendedJava: '21',
    discordUrl: 'https://discord.gg/xxxxxxxx'
  }
]
```

Signification des champs :

| Champ | Obligatoire | Exemple | Notes |
|-------|:-:|---------|-------|
| `id` | oui | `'mon-pack'` | = nom du dossier d'images |
| `displayName` | oui | `'Mon Super Pack'` | nom affiché à l'utilisateur |
| `projectSlug` | oui | `'bmcmod'` | fin de l'URL Modrinth |
| `gameVersion` | oui | `'1.21.1'` | version de Minecraft |
| `loader` | oui | `'neoforge'` | `neoforge`, `forge` ou `fabric` |
| `recommendedJava` | oui | `'21'` | `17` (MC 1.20.x) ou `21` (MC 1.21+) |
| `modrinthKind` | non | `'mod'` | seulement si le projet est un mod `.jar` (rare) |
| `loaderBuild` | non | `'0.18.4'` | fige une version précise de Fabric/Forge |
| `discordLargeImageKey` | non | `'stellar_pack_mon_pack'` | image Discord Rich Presence |
| `discordUrl` | non | `'https://discord.gg/…'` | invitation affichée sur l'accueil |

### Étape 3 — Relier les images dans `modpackTheme.ts`

Ouvre `Launcher/src/renderer/src/modpackTheme.ts`.

**a)** Importe les 2 images (en haut, avec les autres imports) :

```ts
import mpWall from './assets/modpacks/mon-pack/wallpaper.png?url'
import mpIcon from './assets/modpacks/mon-pack/icon.png?url'
```

**b)** Ajoute l'id dans le type `ModpackIdUi` :

```ts
export type ModpackIdUi = 'exemple' | 'mon-pack'
```

**c)** Ajoute une entrée dans `MODPACK_THEME` :

```ts
'mon-pack': {
  wallpaper: mpWall,
  sidebarIcon: mpIcon,
  themeClass: 'theme-mon-pack'
},
```

**d)** Ajoute l'id dans `isModpackId` :

```ts
export function isModpackId(s: string): s is ModpackIdUi {
  return s === 'exemple' || s === 'mon-pack'
}
```

**e)** Ajoute la clé dans `MODPACK_HOME_LEAD_KEY` :

```ts
export const MODPACK_HOME_LEAD_KEY: Record<ModpackIdUi, string> = {
  exemple: 'home.lead.exemple',
  'mon-pack': 'home.lead.mon-pack'
}
```

### Étape 4 — Ajouter le texte de présentation (i18n)

Le texte affiché sous le nom du pack sur l'accueil.

Dans `Launcher/src/renderer/src/i18n/fr.ts`, à côté de `'home.lead.exemple'` :

```ts
'home.lead.mon-pack':
  'Description en français de mon pack…',
```

Puis la **même chose** dans `Launcher/src/renderer/src/i18n/en.ts` (en anglais) :

```ts
'home.lead.mon-pack':
  'English description of my pack…',
```

> Si tu oublies l'anglais, l'appli affichera la clé brute `home.lead.mon-pack`.

---

## 4. (Optionnel) Aller plus loin

### Étiquettes de la carte d'accueil

Dans `Launcher/src/renderer/src/homeTagPresets.ts`, fonction `homeTagsForModpack` :

```ts
} else if (modpackId === 'mon-pack') {
  tags.push('featured', 'huge')
}
```

Valeurs possibles : `modded_survival`, `news`, `featured`, `most_popular`,
`vanilla`, `small`, `medium`, `huge`.

### Couleurs personnalisées (classe CSS)

Le `themeClass` (ex. `theme-mon-pack`) est ajouté à `.shell-main`. Tu peux
définir des couleurs dans `Launcher/src/renderer/src/App.css`. C'est **facultatif** :
sans CSS, le pack s'affiche avec le style par défaut + son fond d'écran.

---

## 5. Tester dans VSCode

1. **Terminal → Exécuter la tâche… → `2 - Demarrer le launcher (dev)`**
   (ou appuie sur **F5**, ou tape `npm run dev` dans le dossier `Launcher`).
2. Le launcher s'ouvre : ton pack doit apparaître dans la barre latérale.
3. Modifie un fichier → l'interface se recharge automatiquement (hot reload).

Pour compiler proprement et vérifier qu'il n'y a pas d'erreur :

```bash
npm run build
```

---

## 6. Exemple complet réel : « Better MC »

Voici comment Better MC était configuré (utile comme référence). Better MC est
un cas **particulier** : sur Modrinth c'est un **mod `.jar`**, d'où `modrinthKind: 'mod'`.

```ts
{
  id: 'exemple2',
  displayName: 'Exemple MC',
  projectSlug: 'exemple',            // modrinth.com/mod/bmcmod
  gameVersion: '1.21.1',
  loader: 'neoforge',
  modrinthKind: 'mod',             // <-- projet publié comme un mod, pas un .mrpack
  recommendedJava: '21',
  discordLargeImageKey: 'stellar_pack_exemple_mc',
  discordUrl: 'https://discord.gg/jVGq5aZ6Wc'
}
```

Avec, en parallèle :
- un dossier `assets/modpacks/exemple-mc/` contenant `wallpaper.png` + `icon.png` ;
- l'id `'better-mc'` ajouté dans `ModpackId` (modpacks.ts) et `ModpackIdUi` (modpackTheme.ts) ;
- une entrée dans `MODPACK_THEME`, `isModpackId`, `MODPACK_HOME_LEAD_KEY` ;
- les textes `home.lead.better-mc` dans `fr.ts` **et** `en.ts`.

---

## 7. Retirer un pack

Fais l'inverse : supprime l'id dans **les 4 fichiers** (`modpacks.ts`,
`modpackTheme.ts`, `i18n/fr.ts`, `i18n/en.ts`) et supprime son dossier d'images.
Vérifie que `DEFAULT_MODPACK_ID` (dans `modpacks.ts`) pointe toujours vers un id existant.

---

## 8. Dépannage

| Message / symptôme | Cause probable | Solution |
|--------------------|----------------|----------|
| `Failed to resolve import "./assets/modpacks/xxx/wallpaper.png"` | Le dossier ou l'image n'existe pas / mal nommé | Vérifie le nom du dossier `<id>` et que `wallpaper.png` + `icon.png` sont bien dedans |
| Le pack n'apparaît pas | Id oublié dans `MODPACKS` (modpacks.ts) | Ajoute le bloc `{ ... }` dans la liste |
| Le texte affiche `home.lead.xxx` | Clé i18n manquante | Ajoute `home.lead.xxx` dans `fr.ts` **et** `en.ts` |
| Erreur de type rouge sous `MODPACK_THEME` | Un id est dans `ModpackIdUi` mais pas dans le record (ou l'inverse) | Les ids doivent être identiques partout dans `modpackTheme.ts` |
| Rien ne change après modif | Le serveur dev tournait avec l'ancien code | Arrête-le puis relance `npm run dev` |
