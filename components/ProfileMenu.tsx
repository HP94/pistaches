'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'
import { LegalPageLinks } from '@/components/LegalPageLinks'

export default function ProfileMenu() {
  const pathname = usePathname()
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

  if (pathname === '/update-password') {
    return null
  }

  // Get user initial from email
  const userInitial = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      {/* Profile Icon Button - Bottom Left */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-[30px] left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] shadow-md transition-colors hover:bg-gray-50 sm:hidden"
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
          <div className="fixed bottom-[90px] left-4 z-50 w-64 rounded-lg border border-[#E5E7EB] bg-white backdrop-blur-sm p-4 shadow-xl sm:hidden">
            <div className="space-y-3">
              <p className="break-all text-xs leading-snug text-[#6B7280]">{user.email}</p>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
              >
                Se déconnecter
              </button>

              <LegalPageLinks onNavigate={() => setShowMenu(false)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

