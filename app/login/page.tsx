'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signInWithGoogle, signOutLocal } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import AuthScreenWithFooter from '@/components/AuthScreenWithFooter'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('[login] getSession error, clearing local session', error)
          await signOutLocal()
          return
        }
        if (session) {
          const redirectTo = searchParams?.get('redirect') || '/'
          router.push(redirectTo)
        }
      } catch (e) {
        console.warn('[login] getSession failed, clearing local session', e)
        await signOutLocal()
      }
    }
    void checkSession()
  }, [router, searchParams])

  // Get redirect URL from query params
  const redirectTo = searchParams?.get('redirect') || '/'

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Wait for session to be fully set, then redirect
      // Use a small delay to ensure cookies are written
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Verify session exists before redirecting
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Force full page reload to ensure middleware sees the session
        window.location.href = redirectTo
      } else {
        setError('Erreur lors de la connexion. Veuillez réessayer.')
        setLoading(false)
      }
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // Google OAuth will redirect, so we don't need to handle success here
  }

  return (
    <AuthScreenWithFooter>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src="/pistaches-logo.svg" alt="Pistâches" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 text-4xl font-bold text-[#93C572]">Pistâches</h1>
          <p className="mt-2 text-[#6B7280]">Connectez-vous à votre compte</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-md">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#6B7280] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#6B7280] mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/reset-password"
                className="text-sm text-[#93C572] hover:text-[#7bad5c] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#6B7280]">ou</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 font-medium text-[#1F2937] transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connexion avec Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-[#93C572] hover:text-[#7bad5c] transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
        </div>
      </div>
    </AuthScreenWithFooter>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthScreenWithFooter>
          <div className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="text-[#6B7280]">Chargement...</div>
          </div>
        </AuthScreenWithFooter>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

