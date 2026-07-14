import { getActuStellarJsonUrl } from './actustellarConfig'
import type { ActuStellarJson } from './actustellarTypes'

export const ACTU_STELLAR_CACHE_KEY = 'stellar.actuStellar.cache.v1'
export const ACTU_STELLAR_FETCHED_AT_KEY = 'stellar.actuStellar.fetchedAt.v1'

/** Contourne le cache CDN/navigateur sur les URLs GitHub raw. */
function fetchUrlNoCache(base: string): string {
  try {
    const u = new URL(base)
    u.searchParams.set('_', String(Date.now()))
    return u.toString()
  } catch {
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}_=${Date.now()}`
  }
}

export function readActuStellarFetchedAt(): string | null {
  try {
    const v = localStorage.getItem(ACTU_STELLAR_FETCHED_AT_KEY)
    return v && v.trim().length > 0 ? v.trim() : null
  } catch {
    return null
  }
}

function writeActuStellarFetchedAt(iso: string): void {
  try {
    localStorage.setItem(ACTU_STELLAR_FETCHED_AT_KEY, iso)
  } catch {
    /* ignore */
  }
}

/** Réponse JSON ou texte (Markdown) — le dépôt peut servir du `.json` qui contient du Markdown. */
function parseActuStellarPayload(raw: string): ActuStellarJson {
  const text = raw.replace(/^\uFEFF/, '').trimStart()
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw.replace(/^\uFEFF/, '')) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as ActuStellarJson
      }
      if (Array.isArray(parsed)) {
        return { segments: parsed.map((x) => String(x)) }
      }
    } catch {
      /* fallback markdown / texte brut */
    }
  }
  return { content: raw.replace(/^\uFEFF/, '') }
}

export const ACTU_STELLAR_UPDATED_EVENT = 'stellar-actu-updated'

export function readActuStellarCache(): ActuStellarJson | null {
  try {
    const raw = localStorage.getItem(ACTU_STELLAR_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActuStellarJson
  } catch {
    return null
  }
}

function writeActuStellarCache(data: ActuStellarJson): void {
  try {
    localStorage.setItem(ACTU_STELLAR_CACHE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

function shouldUseRendererFetchAfterIpcFailure(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  /* Processus principal pas relancé après ajout du handler, ou build désynchronisé */
  return /no handler registered/i.test(msg)
}

async function fetchRemoteText(finalUrl: string): Promise<string> {
  if (typeof window !== 'undefined' && window.stellar?.fetchActuText) {
    try {
      const r = await window.stellar.fetchActuText(finalUrl)
      if (r.ok) return r.text
      throw new Error(r.error)
    } catch (e) {
      if (!shouldUseRendererFetchAfterIpcFailure(e)) throw e
    }
  }
  const res = await fetch(finalUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

export async function fetchAndCacheActuStellar(): Promise<
  { ok: true; data: ActuStellarJson } | { ok: false; error: string }
> {
  const url = getActuStellarJsonUrl()
  if (!url) return { ok: false, error: 'no_url' }
  try {
    const raw = await fetchRemoteText(fetchUrlNoCache(url))
    const data = parseActuStellarPayload(raw)
    writeActuStellarCache(data)
    const now = new Date().toISOString()
    writeActuStellarFetchedAt(now)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
