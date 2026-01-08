'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
            setIsValidToken(true)
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)
          }
        } else {
          setIsValidToken(false)
          setError('Le lien de réinitialisation est invalide.')
        }
      } else {
        // Check if there's already a session
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
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
        <div className="text-center">
          <div className="text-slate-400">Vérification du lien...</div>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Lien invalide</h2>
            <p className="text-slate-400 mb-4">
              {error || 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'}
            </p>
            <Link
              href="/reset-password"
              className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-600"
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Mot de passe mis à jour !</h2>
            <p className="text-slate-400 mb-4">
              Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Equal Housing</h1>
          <p className="mt-2 text-slate-400">Créer un nouveau mot de passe</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

