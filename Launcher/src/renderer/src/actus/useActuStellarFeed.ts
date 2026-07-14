import { useCallback, useEffect, useState } from 'react'
import { getActuStellarJsonUrl } from './actustellarConfig'
import type { ActuStellarJson } from './actustellarTypes'
import {
  ACTU_STELLAR_UPDATED_EVENT,
  fetchAndCacheActuStellar,
  readActuStellarCache,
  readActuStellarFetchedAt
} from './actustellarFetch'

export type ActuStellarFeedState = {
  loading: boolean
  error: string | null
  data: ActuStellarJson | null
  fetchedAt: string | null
  hasUrl: boolean
}

export function useActuStellarFeed(): ActuStellarFeedState & {
  refresh: () => Promise<void>
} {
  const url = getActuStellarJsonUrl()
  const hasUrl = Boolean(url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ActuStellarJson | null>(() => readActuStellarCache())
  const [fetchedAt, setFetchedAt] = useState<string | null>(() => readActuStellarFetchedAt())

  useEffect(() => {
    const sync = () => {
      setData(readActuStellarCache())
      setFetchedAt(readActuStellarFetchedAt())
    }
    window.addEventListener(ACTU_STELLAR_UPDATED_EVENT, sync)
    return () => window.removeEventListener(ACTU_STELLAR_UPDATED_EVENT, sync)
  }, [])

  const refresh = useCallback(async () => {
    const u = getActuStellarJsonUrl()
    if (!u) {
      setError(null)
      setData(readActuStellarCache())
      return
    }
    setLoading(true)
    setError(null)
    try {
      const r = await fetchAndCacheActuStellar()
      if (r.ok) {
        setData(r.data)
        setFetchedAt(readActuStellarFetchedAt())
        window.dispatchEvent(new Event(ACTU_STELLAR_UPDATED_EVENT))
      } else if (r.error !== 'no_url') {
        setError(r.error)
        if (!readActuStellarCache()) setData(null)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, data, fetchedAt, hasUrl, refresh }
}
