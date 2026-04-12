'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LEGAL_ROUTES } from '@/lib/legal/routes'
import { readStatsResearchConsent } from '@/lib/legal/userConsent'

type Props = {
  open: boolean
  onClose: () => void
  user: User
}

export default function StatsConsentModal({ open, onClose, user }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedHint, setSavedHint] = useState(false)

  useEffect(() => {
    if (open) {
      setEnabled(readStatsResearchConsent(user))
      setSavedHint(false)
    }
  }, [open, user])

  if (!open) return null

  const apply = async (next: boolean) => {
    setSaving(true)
    setSavedHint(false)
    const { error } = await supabase.auth.updateUser({
      data: {
        stats_research_consent: next,
        stats_research_consent_at: new Date().toISOString(),
      },
    })
    setSaving(false)
    if (!error) {
      setEnabled(next)
      setSavedHint(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-consent-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl"
      >
        <h2 id="stats-consent-title" className="text-lg font-semibold text-[#1F2937]">
          Statistiques et recherche
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          Ce réglage est <strong className="font-medium text-[#1F2937]">facultatif</strong>. Vous pouvez
          l’activer ou le désactiver à tout moment. Détails :{' '}
          <Link
            href={LEGAL_ROUTES.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#93C572] underline-offset-2 hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] px-4 py-3">
          <span className="text-sm font-medium text-[#1F2937]">Utilisation à des fins statistiques</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={saving}
            onClick={() => void apply(!enabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-[#93C572]' : 'bg-[#D1D5DB]'
            } ${saving ? 'opacity-60' : ''}`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {savedHint && (
          <p className="mt-3 text-xs text-[#93C572]" role="status">
            Préférence enregistrée.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
