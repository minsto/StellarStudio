/** AETHER UI — V1 | Stellar Studio Launcher (proprietary interface layer). */
// =============================================================================
//  THÈME VISUEL DES MODPACKS (côté interface)
// -----------------------------------------------------------------------------
//  Pour CHAQUE modpack de main/modpacks.ts, il faut ici :
//    1) importer son fond d'écran + son icône (dossier assets/modpacks/<id>/)
//    2) ajouter son id dans le type ModpackIdUi
//    3) ajouter une entrée dans MODPACK_THEME et MODPACK_HOME_LEAD_KEY
//  (Tutoriel complet : docs/AJOUTER-UN-MODPACK.md)
// =============================================================================

// 1) Images du pack. Le dossier DOIT s'appeler comme l'id du pack.
//    Chaque dossier contient exactement : wallpaper.png (fond) et icon.png (barre latérale).
import exWall from './assets/modpacks/exemple/wallpaper.png?url'
import exIcon from './assets/modpacks/exemple/icon.png?url'

// 2) La liste des ids connus côté interface (doit refléter main/modpacks.ts).
//    Pour ajouter un pack : «  | 'mon-pack' ».
export type ModpackIdUi = 'exemple'

// 3) Le thème de chaque pack : image de fond, icône, et classe CSS optionnelle.
export const MODPACK_THEME: Record<
  ModpackIdUi,
  {
    wallpaper: string
    sidebarIcon: string
    /** Classe CSS ajoutée à .shell-main pour personnaliser les couleurs (optionnel). */
    themeClass: string
  }
> = {
  exemple: {
    wallpaper: exWall,
    sidebarIcon: exIcon,
    themeClass: 'theme-exemple'
  }
}

/** Retourne vrai si la chaîne est un id de modpack connu (garde de type). */
export function isModpackId(s: string): s is ModpackIdUi {
  return s === 'exemple'
}

/**
 * Clé i18n `home.lead.<id>` — description d'accueil propre à chaque modpack.
 * Le texte correspondant est défini dans i18n/fr.ts et i18n/en.ts.
 */
export const MODPACK_HOME_LEAD_KEY: Record<ModpackIdUi, string> = {
  exemple: 'home.lead.exemple'
}
