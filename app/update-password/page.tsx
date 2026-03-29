'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut, updatePassword } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import {
  clearRecoveryPendingCookie,
  setRecoveryPendingCookie,
} from '@/lib/auth/recoveryCookie'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if there's a valid session/token
    const checkSession = async () => {
      // First, check if there's a hash in the URL (from email link)
      const hash = window.location.hash
      if (hash) {
        // Extract token from hash and exchange it for a session
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (error || !data.session) {
            setIsValidToken(false)
            setError('Le lien de réinitialisation est invalide ou a expiré.')
          } else {
            const linkType = hashParams.get('type')
            if (linkType === 'recovery') {
              setRecoveryPendingCookie()
            }
            setIsValidToken(true)
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)
          }
        } else {
          setIsValidToken(false)
          setError('Le lien de réinitialisation est invalide.')
        }
      } else {
        // PKCE ou session déjà établie (PASSWORD_RECOVERY + cookie gérés par PasswordRecoveryListener)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsValidToken(true)
        } else {
          setIsValidToken(false)
          setError('Aucun lien de réinitialisation trouvé.')
        }
      }
    }

    checkSession()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    const { error } = await updatePassword(password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      clearRecoveryPendingCookie()
      await signOut()
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <div className="text-center">
          <div className="text-[#6B7280]">Vérification du lien...</div>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Lien invalide</h2>
            <p className="text-[#6B7280] mb-4">
              {error || 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'}
            </p>
            <Link
              href="/reset-password"
              className="inline-block rounded-lg bg-[#93C572] px-6 py-3 font-medium text-[#1F2937] transition-colors hover:bg-[#7bad5c]"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm">
            <div className="mb-4 text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Mot de passe mis à jour !</h2>
            <p className="text-[#6B7280] mb-4">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src="/pistaches-logo.svg" alt="Pistâches" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 text-4xl font-bold text-[#1F2937]">Pistâches</h1>
          <p className="mt-2 text-[#6B7280]">Créer un nouveau mot de passe</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#6B7280] mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#6B7280] mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            <Link href="/login" className="text-[#93C572] hover:text-[#7bad5c] transition-colors">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

