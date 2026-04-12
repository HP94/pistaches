'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AuthButton from './AuthButton'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/participants', label: 'Membres' },
  { href: '/tasks', label: 'Tâches' },
  { href: '/balance', label: 'Équilibre' },
]

export default function Navigation() {
  const pathname = usePathname()
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/update-password' ||
    pathname === '/politique-confidentialite' ||
    pathname === '/mentions-legales' ||
    pathname === '/cgu'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading || !isAuthenticated) {
    return null
  }

  // Pas de barre d’app sur les écrans auth (dont réinitialisation MDP avec session « recovery »)
  if (isAuthPage) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-sm pb-[30px] sm:pb-0 sm:relative sm:border-t-0 sm:border-b sm:bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between sm:gap-8 sm:px-6 sm:py-4 pl-20 pr-4 sm:pl-6">
        <Link href="/" className="hidden sm:flex shrink-0 items-center gap-2">
          <img src="/pistaches-logo.svg" alt="Pistâches" className="h-8 w-8" />
        </Link>
        <div className="flex items-center justify-between sm:justify-start sm:gap-8 flex-1 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors sm:flex-none sm:py-2 ${
                  isActive
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6] sm:border-b-0 sm:border-t-2'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        {!isAuthPage && (
          <div className="hidden sm:block">
            <AuthButton />
          </div>
        )}
      </div>
    </nav>
  )
}

