'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'
import { LegalPageLinks } from '@/components/LegalPageLinks'

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
      <div className="text-sm text-[#6B7280]">
        Chargement...
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-[#93C572] bg-[#93C572]/10 px-4 py-2 text-sm font-medium text-[#7bad5c] transition-colors hover:bg-[#93C572]/20"
      >
        Connexion
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex max-w-full items-center gap-3">
        <span className="max-w-[min(280px,40vw)] break-all text-right text-sm text-[#6B7280]">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-50"
        >
          Déconnexion
        </button>
      </div>
      <LegalPageLinks />
    </div>
  )
}

