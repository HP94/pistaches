'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { signOut } from '@/lib/supabase/auth'
import ConsentCheckboxes from '@/components/ConsentCheckboxes'
import {
  buildSignupUserMetadata,
  CGU_VERSION,
  hasAcceptedCgu,
} from '@/lib/legal/userConsent'

export default function AcceptCguPage() {
  const router = useRouter()
  const [acceptCgu, setAcceptCgu] = useState(false)
  const [statsConsent, setStatsConsent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refusing, setRefusing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      if (hasAcceptedCgu(session.user)) {
        router.replace('/')
        return
      }
      const stats = session.user.user_metadata?.stats_research_consent === true
      setStatsConsent(stats)
      setLoading(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptCgu) return
    setSaving(true)
    setError(null)

    const meta = buildSignupUserMetadata(statsConsent)
    const { error: err } = await supabase.auth.updateUser({
      data: meta,
    })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  const handleRefuse = async () => {
    setRefusing(true)
    setError(null)
    await signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-cgu-title"
        aria-describedby="accept-cgu-desc"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl sm:p-8"
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-[#6B7280]">Chargement…</p>
        ) : (
          <>
            <div className="text-center">
              <img src="/pistaches-logo.svg" alt="" className="mx-auto h-12 w-12" />
              <h1 id="accept-cgu-title" className="mt-3 text-xl font-bold text-[#1F2937] sm:text-2xl">
                Mise à jour des conditions
              </h1>
              <p id="accept-cgu-desc" className="mt-2 text-sm text-[#6B7280]">
                Pour continuer à utiliser Pistâches, vous devez accepter les conditions générales
                (version {CGU_VERSION}). Les statistiques restent facultatives.
              </p>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <ConsentCheckboxes
                idPrefix="accept"
                acceptCgu={acceptCgu}
                onAcceptCguChange={setAcceptCgu}
                statsConsent={statsConsent}
                onStatsConsentChange={setStatsConsent}
              />

              <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
                <button
                  type="submit"
                  disabled={saving || refusing || !acceptCgu}
                  className="w-full rounded-lg bg-[#93C572] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[140px]"
                >
                  {saving ? 'Enregistrement…' : 'Accepter et continuer'}
                </button>
                <button
                  type="button"
                  disabled={saving || refusing}
                  onClick={() => void handleRefuse()}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#6B7280] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[140px]"
                >
                  {refusing ? 'Déconnexion…' : 'Refuser et me déconnecter'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-[#9CA3AF]">
              <Link href="/cgu" className="text-[#93C572] hover:underline" target="_blank" rel="noopener noreferrer">
                Lire les CGU
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
