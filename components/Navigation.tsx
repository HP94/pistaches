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
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password'
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

  // Don't show navigation if not authenticated
  if (loading || !isAuthenticated) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-sm pb-[30px] sm:pb-0 sm:relative sm:border-t-0 sm:border-b sm:bg-slate-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between sm:gap-8 sm:px-6 sm:py-4 pl-20 pr-4 sm:pl-6">
        <div className="flex items-center justify-between sm:justify-start sm:gap-8 flex-1 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors sm:flex-none sm:py-2 ${
                  isActive
                    ? 'text-teal-400 border-b-2 border-teal-400 sm:border-b-0 sm:border-t-2'
                    : 'text-slate-400 hover:text-slate-200'
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

