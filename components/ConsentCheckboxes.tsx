'use client'

import Link from 'next/link'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

type Props = {
  acceptCgu: boolean
  onAcceptCguChange: (value: boolean) => void
  statsConsent: boolean
  onStatsConsentChange: (value: boolean) => void
  idPrefix?: string
}

const checkboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#93C572] focus:ring-[#93C572]/40'

export default function ConsentCheckboxes({
  acceptCgu,
  onAcceptCguChange,
  statsConsent,
  onStatsConsentChange,
  idPrefix = 'consent',
}: Props) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer gap-3 text-sm text-[#1F2937]">
        <input
          id={`${idPrefix}-cgu`}
          type="checkbox"
          checked={acceptCgu}
          onChange={(e) => onAcceptCguChange(e.target.checked)}
          className={checkboxClass}
        />
        <span className="leading-snug">
          J’ai lu et j’accepte les{' '}
          <Link
            href={LEGAL_ROUTES.cgu}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#93C572] underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            conditions générales d’utilisation
          </Link>
          .
        </span>
      </label>

      <label className="flex cursor-pointer gap-3 text-sm text-[#6B7280]">
        <input
          id={`${idPrefix}-stats`}
          type="checkbox"
          checked={statsConsent}
          onChange={(e) => onStatsConsentChange(e.target.checked)}
          className={checkboxClass}
        />
        <span className="leading-snug">
          <span className="font-medium text-[#1F2937]">Facultatif — </span>
          J’accepte que mes données soient utilisées à des fins statistiques et de recherche, comme
          décrit dans la{' '}
          <Link
            href={LEGAL_ROUTES.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#93C572] underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            politique de confidentialité
          </Link>
          . Sans ce consentement, vous pouvez utiliser l’app normalement.
        </span>
      </label>
    </div>
  )
}
