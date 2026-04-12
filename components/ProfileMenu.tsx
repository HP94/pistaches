'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'
import { LegalPageLinks } from '@/components/LegalPageLinks'
import StatsConsentModal from '@/components/StatsConsentModal'

const triggerClass =
  'flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] shadow-md transition-colors hover:bg-gray-50'

export default function ProfileMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [statsModalOpen, setStatsModalOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    setShowMenu(false)
    await signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading || !user) {
    return null
  }

  if (pathname === '/update-password') {
    return null
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U'

  const menuBody = (
    <div className="space-y-3">
      <p className="break-all text-xs leading-snug text-[#6B7280]">{user.email}</p>

      <button
        type="button"
        onClick={() => {
          setShowMenu(false)
          setStatsModalOpen(true)
        }}
        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-50"
      >
        Gérer mes consentements
      </button>

      <button
        type="button"
        onClick={() => void handleSignOut()}
        className="w-full rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
      >
        Se déconnecter
      </button>

      <LegalPageLinks onNavigate={() => setShowMenu(false)} />
    </div>
  )

  return (
    <>
      <StatsConsentModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        user={user}
      />

      {showMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          aria-hidden
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mobile : bouton fixe bas-gauche + menu qui remonte */}
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className={`${triggerClass} fixed bottom-[30px] left-4 z-50 h-12 w-12 sm:hidden`}
        aria-label="Menu profil"
        aria-expanded={showMenu}
      >
        <span className="text-lg font-semibold">{userInitial}</span>
      </button>

      {showMenu && (
        <div className="fixed bottom-[90px] left-4 z-50 w-64 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-xl sm:hidden">
          {menuBody}
        </div>
      )}

      {/* Desktop (sm+) : même menu, dans la barre de navigation à droite */}
      <div className="relative z-50 hidden shrink-0 sm:block">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className={`${triggerClass} h-12 w-12`}
          aria-label="Menu profil"
          aria-expanded={showMenu}
        >
          <span className="text-lg font-semibold">{userInitial}</span>
        </button>

        {showMenu && (
          <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-xl">
            {menuBody}
          </div>
        )}
      </div>
    </>
  )
}
