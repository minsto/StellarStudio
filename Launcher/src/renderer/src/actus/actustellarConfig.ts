/**
 * URL du flux actu (JSON `ActuStellarJson` : segments / content, etc.).
 * Défaut : fonction Netlify sur le site (posts publiés via l’admin + Supabase).
 * Secours / dev : `VITE_ACTU_STELLAR_JSON_URL` dans `.env` (ex. ancien GitHub raw `actustellar.md`).
 */
// Desactive par defaut : renseigne VITE_ACTU_STELLAR_JSON_URL dans .env pour activer le flux
// d'actus (ex. ta fonction Netlify news-feed ou un fichier JSON/Markdown distant).
const DEFAULT_ACTU_STELLAR_JSON_URL = ''

export function getActuStellarJsonUrl(): string {
  const fromEnv = import.meta.env.VITE_ACTU_STELLAR_JSON_URL as string | undefined
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim()
  return DEFAULT_ACTU_STELLAR_JSON_URL
}
