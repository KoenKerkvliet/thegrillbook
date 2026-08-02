import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const db = supabase as any

export function useFeatureFlag(key: string) {
  const [enabled, setEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    db.from('app_feature_flags').select('is_enabled').eq('key', key).maybeSingle()
      .then(({ data }: any) => {
        if (!cancelled) {
          setEnabled(Boolean(data?.is_enabled))
          setLoaded(true)
        }
      })
    return () => { cancelled = true }
  }, [key])

  return { enabled, loaded, setEnabled }
}

export async function setFeatureFlag(key: string, isEnabled: boolean) {
  return db.from('app_feature_flags').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('key', key)
}
