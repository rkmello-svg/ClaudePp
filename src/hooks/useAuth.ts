import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          setUser(null)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError

        if (isMounted) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            current_company_id: profile.current_company_id,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed'
        if (isMounted) setError(message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user && isMounted) {
        setUser(null)
      } else if (session?.user && isMounted) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          current_company_id: profile?.current_company_id,
        })
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
