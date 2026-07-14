// =============================================================================
//  CATALOGUE DES MODPACKS  —  Stellar Studio Launcher
// -----------------------------------------------------------------------------
//  C'est LA source de vérité : la liste `MODPACKS` ci-dessous décide quels packs
//  apparaissent dans la barre latérale du launcher.
//
//  Pour AJOUTER un pack, suis le tutoriel : docs/AJOUTER-UN-MODPACK.md
//  (résumé : 1) ajouter l'id dans `ModpackId`, 2) ajouter un objet dans `MODPACKS`,
//   3) créer le dossier d'images assets/modpacks/<id>/, 4) le déclarer dans
//   modpackTheme.ts, 5) ajouter le texte home.lead.<id> dans i18n/fr.ts + en.ts).
// =============================================================================

/**
 * Identifiant interne unique de chaque modpack (en minuscules, sans espace).
 * Il doit être IDENTIQUE partout : ici, dans le nom du dossier d'images
 * (assets/modpacks/<id>/) et dans modpackTheme.ts.
 *
 * Pour ajouter un pack, ajoute son id ici avec «  | 'mon-pack' ».
 */
export type ModpackId = 'exemple'

/** Chargeur de mods du pack. NeoForge = récent 1.21+, Forge = classique, Fabric = léger. */
export type ModpackLoader = 'neoforge' | 'forge' | 'fabric'

/**
 * Type d'installation Modrinth :
 *  - 'modpack' : le projet est un vrai modpack (fichier .mrpack). CAS LE PLUS COURANT.
 *  - 'mod'     : le projet est un mod unique (.jar). Rare (ex. Better MC est publié ainsi).
 */
export type ModrinthInstallKind = 'modpack' | 'mod'

/** Décrit un modpack. Les champs marqués « ? » sont optionnels. */
export interface ModpackSpec {
  /** Id interne (voir ModpackId). Sert aussi de nom de dossier d'images. */
  id: ModpackId
  /** Nom affiché à l'utilisateur dans le launcher. */
  displayName: string
  /** Slug Modrinth = la fin de l'URL du projet (modrinth.com/modpack/<slug>). */
  projectSlug: string
  /** Version de Minecraft du pack (ex. '1.21.1'). */
  gameVersion: string
  /** Chargeur de mods (voir ModpackLoader). */
  loader: ModpackLoader
  /** modpack = .mrpack (défaut) ; mod = .jar unique. Ne le mets que si c'est un 'mod'. */
  modrinthKind?: ModrinthInstallKind
  /** Version précise du loader si besoin (Fabric/Forge). NeoForge : détecté automatiquement. */
  loaderBuild?: string
  /** Version de Java conseillée (affichage + valeur par défaut des réglages). */
  recommendedJava: string
  /**
   * Clé « Art Assets » Discord (même nom que dans le portail développeur Discord).
   * Optionnel : si absente, la Rich Presence utilise l'image « logo ».
   */
  discordLargeImageKey?: string
  /** Lien d'invitation Discord affiché sur le panneau d'accueil (optionnel). */
  discordUrl?: string
}

/**
 * LISTE DES MODPACKS affichés dans le launcher.
 *
 * Pour ajouter le tien : COPIE le bloc { ... } ci-dessous, colle-le à la suite
 * (sépare les blocs par une virgule) et modifie les valeurs.
 */
export const MODPACKS: ModpackSpec[] = [
  {
    // ---- MODPACK MODÈLE (à copier pour créer les tiens) --------------------
    // id : identifiant interne. DOIT correspondre au dossier assets/modpacks/exemple/
    id: 'exemple',
    // displayName : le nom visible par l'utilisateur.
    displayName: 'Exemple',
    // projectSlug : fin de l'URL Modrinth. Ici 'exemple' est un PLACEHOLDER —
    // remplace-le par le vrai slug (ex. 'bmcmod' pour Better MC).
    projectSlug: 'exemple',
    // gameVersion : version de Minecraft ciblée.
    gameVersion: '1.21.1',
    // loader : 'neoforge' | 'forge' | 'fabric'.
    loader: 'neoforge',
    // recommendedJava : '17' (MC 1.20.x) ou '21' (MC 1.21+).
    recommendedJava: '21',
    // discordUrl : optionnel. Invitation affichée sur l'accueil.
    discordUrl: 'https://discord.gg/jVGq5aZ6Wc'

    // --- Champs optionnels supplémentaires (décommente si besoin) -----------
    // Si le projet Modrinth est un mod .jar unique (rare, ex. Better MC) :
    // modrinthKind: 'mod',
    // Pour figer une version précise de Fabric/Forge :
    // loaderBuild: '0.18.4',
    // Clé d'image Rich Presence Discord :
    // discordLargeImageKey: 'stellar_pack_exemple',
  }

  // ------------------------------------------------------------------------
  // EXEMPLE CONCRET (comme "Better MC") — copie/adapte ce bloc pour un pack :
  //
  // ,{
  //   id: 'better-mc',
  //   displayName: 'Better MC',
  //   projectSlug: 'bmcmod',
  //   gameVersion: '1.21.1',
  //   loader: 'neoforge',
  //   modrinthKind: 'mod',            // Better MC est publié comme un mod .jar
  //   recommendedJava: '21',
  //   discordLargeImageKey: 'stellar_pack_better_mc',
  //   discordUrl: 'https://discord.gg/jVGq5aZ6Wc'
  // }
  // ------------------------------------------------------------------------
]

/**
 * URL de la page Modrinth du pack.
 * On choisit /mod/ ou /modpack/ selon `modrinthKind` (générique, aucun id en dur).
 */
export function modrinthModpackPageUrl(spec: ModpackSpec): string {
  const kind = spec.modrinthKind === 'mod' ? 'mod' : 'modpack'
  return `https://modrinth.com/${kind}/${spec.projectSlug}`
}

/** Pack sélectionné par défaut (doit être un id présent dans MODPACKS). */
export const DEFAULT_MODPACK_ID: ModpackId = 'exemple'

const BY_ID = Object.fromEntries(MODPACKS.map((m) => [m.id, m])) as Record<ModpackId, ModpackSpec>

export function resolveModpackId(raw: string | undefined | null): ModpackId {
  if (raw && raw in BY_ID) return raw as ModpackId
  return DEFAULT_MODPACK_ID
}

export function getModpackSpec(id: ModpackId): ModpackSpec {
  return BY_ID[id]
}

export function listModpackSummaries(): { id: ModpackId; displayName: string }[] {
  return MODPACKS.map((m) => ({ id: m.id, displayName: m.displayName }))
}
