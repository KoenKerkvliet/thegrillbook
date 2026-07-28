import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
  }

  function sendWelcomeEmail() {
    void supabase.functions.invoke('send-welcome-email').then(({ error }) => {
      if (error) console.error('Welkomstmail kon niet worden verstuurd:', error.message)
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        sendWelcomeEmail()
        loadProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        sendWelcomeEmail()
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id)
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
