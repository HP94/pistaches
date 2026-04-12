'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase/auth'
import AuthScreenWithFooter from '@/components/AuthScreenWithFooter'

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
      <AuthScreenWithFooter>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm">
              <div className="mb-4 text-4xl">📧</div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Email envoyé !</h2>
              <p className="text-[#6B7280] mb-4">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation de mot de passe.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-[#93C572] px-6 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </AuthScreenWithFooter>
    )
  }

  return (
    <AuthScreenWithFooter>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src="/pistaches-logo.svg" alt="Pistâches" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 text-4xl font-bold text-[#1F2937]">Pistâches</h1>
          <p className="mt-2 text-[#6B7280]">Réinitialiser votre mot de passe</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm">
          <form onSubmit={handleReset} className="space-y-6">
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
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="votre@email.com"
              />
              <p className="mt-2 text-sm text-[#6B7280]">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
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
    </AuthScreenWithFooter>
  )
}

