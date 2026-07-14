/** AETHER UI — V1 | Stellar Studio Launcher (proprietary interface layer). */
import { isModpackId } from './modpackTheme'

/**
 * Presets d’étiquettes carte d’accueil — prêts pour assignation modpack (futures mises à jour).
 * Les IDs servent aux clés i18n `home.tagPreset.<id>.label` / `.desc` et aux classes CSS
 * `tag-pill--preset-<kebab>`.
 */
export type HomeTagPresetId =
  | 'modded_survival'
  | 'news'
  | 'featured'
  | 'most_popular'
  | 'vanilla'
  | 'huge'
  | 'medium'
  | 'small'

/** Ordre stable pour prévisualisation debug et documentation. */
export const HOME_TAG_PRESET_IDS: HomeTagPresetId[] = [
  'modded_survival',
  'news',
  'featured',
  'most_popular',
  'vanilla',
  'small',
  'medium',
  'huge'
]

/** Étiquettes affichées sur la carte d’accueil pour le modpack sélectionné (logique produit actuelle). */
export function homeTagsForModpack(modpackId: string): HomeTagPresetId[] {
  if (!isModpackId(modpackId)) return ['modded_survival']
  const tags: HomeTagPresetId[] = ['modded_survival']

  // Étiquettes affichées selon le pack. Ajoute un « else if (modpackId === 'mon-pack') »
  // pour personnaliser (valeurs possibles : voir HomeTagPresetId ci-dessus).
  if (modpackId === 'exemple') {
    tags.push('most_popular', 'small')
  }

  return tags
}
