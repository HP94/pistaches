'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-400">
        Chargement...
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-teal-500/50 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
      >
        Connexion
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-400">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        Déconnexion
      </button>
    </div>
  )
}

