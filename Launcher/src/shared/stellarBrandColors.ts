/** Jaune abeille / or — accent principal AETHER UI v3 (boutons, barres, chrome studio). */
export const STELLAR_ACCENT_BEE_GOLD = '#FFD54A'
export const STELLAR_ACCENT_BEE_GOLD_BRIGHT = '#FFE082'
export const STELLAR_ACCENT_BEE_GOLD_DEEP = '#FFB300'
export const STELLAR_ACCENT_BEE_GOLD_AMBER = '#FFAB00'

/** Orange-rouge historique du launcher (thème « Ancien STELLAR STUDIO »). */
export const STELLAR_ACCENT_LEGACY_ORANGE = '#ff6a1a'
export const STELLAR_ACCENT_LEGACY_ORANGE_DEEP = '#e85a10'

export function isLegacyOrangeAccent(hex: string): boolean {
  const h = hex.trim().toLowerCase()
  return h === STELLAR_ACCENT_LEGACY_ORANGE || h === '#ff6a1b' || h === '#ff6b1a'
}
