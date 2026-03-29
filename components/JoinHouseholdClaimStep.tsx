'use client'

import { useState } from 'react'
import type { Participant } from '@/lib/supabase/participants'
import type { Household } from '@/lib/supabase/households'
import { translateGender } from '@/lib/translations'

type Props = {
  household: Household
  nonUserMembers: Participant[]
  onValidate: (choice: 'new' | { mergeParticipantId: string }) => Promise<void>
  onCancel: () => void
  variant?: 'page' | 'modal'
}

export function JoinHouseholdClaimStep({
  household,
  nonUserMembers,
  onValidate,
  onCancel,
  variant = 'page',
}: Props) {
  const [choice, setChoice] = useState<'new' | string>('new')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSubmitting(true)
    try {
      if (choice === 'new') {
        await onValidate('new')
      } else {
        await onValidate({ mergeParticipantId: choice })
      }
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const containerClass =
    variant === 'modal'
      ? 'space-y-4'
      : 'rounded-2xl border border-[#E5E7EB] bg-white p-8 backdrop-blur-sm'

  return (
    <div className={containerClass}>
      <h2 className="text-2xl font-semibold text-[#1F2937] mb-2">
        Qui êtes-vous dans ce foyer ?
      </h2>
      <p className="text-[#6B7280] mb-6">
        Foyer « {household.name} » — certains membres n’ont pas encore de compte. Indiquez si vous
        correspondez à l’un d’eux, ou si vous arrivez comme un nouveau membre.
      </p>

      {localError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="sr-only">Votre profil dans ce foyer</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-4 has-[:checked]:border-[#93C572] has-[:checked]:bg-[#93C572]/10">
            <input
              type="radio"
              name="claim"
              className="mt-1"
              checked={choice === 'new'}
              onChange={() => setChoice('new')}
            />
            <span className="text-[#1F2937] font-medium">Nouveau membre</span>
          </label>
          {nonUserMembers.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-4 has-[:checked]:border-[#93C572] has-[:checked]:bg-[#93C572]/10"
            >
              <input
                type="radio"
                name="claim"
                className="mt-1"
                checked={choice === p.id}
                onChange={() => setChoice(p.id)}
              />
              <span>
                <span className="text-[#1F2937] font-medium">{p.name}</span>
                <span className="text-[#6B7280] text-sm"> — {translateGender(p.gender)}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 font-medium text-[#1F2937] transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Validation…' : 'Valider'}
          </button>
        </div>
      </form>
    </div>
  )
}
