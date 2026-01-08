'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'

export default function ProfileMenu() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

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

  // Don't show if no user
  if (loading || !user) {
    return null
  }

  // Get user initial from email
  const userInitial = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      {/* Profile Icon Button - Bottom Left */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-[30px] left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 sm:hidden"
        aria-label="Menu profil"
      >
        <span className="text-lg font-semibold">{userInitial}</span>
      </button>

      {/* Drop-up Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="fixed bottom-[90px] left-4 z-50 w-64 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-sm p-4 shadow-lg sm:hidden">
            <div className="space-y-3">
              {/* Email */}
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-sm font-medium text-white">{user.email}</p>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

