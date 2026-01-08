'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase/auth'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 text-4xl">📧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email envoyé !</h2>
            <p className="text-slate-400 mb-4">
              Si un compte existe avec cet email, vous recevrez un lien de réinitialisation de mot de passe.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-600"
            >
              Retour à la connexion
            </Link>
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
          <p className="mt-2 text-slate-400">Réinitialiser votre mot de passe</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleReset} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="votre@email.com"
              />
              <p className="mt-2 text-sm text-slate-400">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
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

