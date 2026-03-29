'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  getUserHouseholds,
  prepareJoinHousehold,
  finalizeJoinNewMember,
  finalizeJoinMerge,
  type Household,
} from '@/lib/supabase/households'
import type { Participant } from '@/lib/supabase/participants'
import { JoinHouseholdClaimStep } from '@/components/JoinHouseholdClaimStep'

interface HouseholdSwitcherProps {
  currentHousehold: Household | null
  onHouseholdChange: (household: Household) => void
}

export default function HouseholdSwitcher({ currentHousehold, onHouseholdChange }: HouseholdSwitcherProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [households, setHouseholds] = useState<Household[]>([])
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [claimContext, setClaimContext] = useState<{
    household: Household
    nonUserMembers: Participant[]
  } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadHouseholds(user.id)
      }
    }
    getUser()
  }, [])

  const loadHouseholds = async (userId: string) => {
    const { data, error } = await getUserHouseholds(userId)
    if (!error && data) {
      setHouseholds(data)
    }
  }

  const handleSelectHousehold = (household: Household) => {
    onHouseholdChange(household)
    setShowModal(false)
    router.refresh()
  }

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)
    try {
      const prepared = await prepareJoinHousehold(userId, joinCode)
      if (!prepared.ok) {
        setError(prepared.error)
        return
      }

      if (prepared.case === 'already_member') {
        await loadHouseholds(userId)
        handleSelectHousehold(prepared.household)
        setShowJoinForm(false)
        setJoinCode('')
        setShowModal(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'

      if (prepared.case === 'need_claim') {
        setClaimContext({
          household: prepared.household,
          nonUserMembers: prepared.nonUserMembers,
        })
        return
      }

      const { error: finErr } = await finalizeJoinNewMember(
        prepared.household.id,
        userId,
        userName,
        'neutral'
      )
      if (finErr) throw finErr

      await loadHouseholds(userId)
      handleSelectHousehold(prepared.household)
      setShowJoinForm(false)
      setJoinCode('')
      setShowModal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la jointure du foyer')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimValidate = async (
    choice: 'new' | { mergeParticipantId: string }
  ) => {
    if (!userId || !claimContext) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non connecté')
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'

    if (choice === 'new') {
      const { error: finErr } = await finalizeJoinNewMember(
        claimContext.household.id,
        userId,
        userName,
        'neutral'
      )
      if (finErr) throw finErr
    } else {
      const { error: mergeErr } = await finalizeJoinMerge(choice.mergeParticipantId, userId)
      if (mergeErr) throw mergeErr
    }

    await loadHouseholds(userId)
    handleSelectHousehold(claimContext.household)
    setClaimContext(null)
    setShowJoinForm(false)
    setJoinCode('')
    setShowModal(false)
  }

  if (!currentHousehold) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-50 shadow-sm"
      >
        Changer de foyer
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1F2937]">Changer de foyer</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setShowJoinForm(false)
                  setClaimContext(null)
                  setError(null)
                }}
                className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!showJoinForm ? (
              <>
                {households.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-3 text-sm font-medium text-[#6B7280]">Mes foyers</h3>
                    <div className="space-y-2">
                      {households.map((household) => (
                        <button
                          key={household.id}
                          onClick={() => handleSelectHousehold(household)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            household.id === currentHousehold.id
                              ? 'border-[#93C572] bg-[#93C572]/10 text-[#7bad5c]'
                              : 'border-[#E5E7EB] bg-gray-50 text-[#1F2937] hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{household.name}</div>
                          {household.id === currentHousehold.id && (
                            <div className="text-xs text-[#93C572]">Actuel</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      router.push('/select-household')
                    }}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                  >
                    + Créer un nouveau foyer
                  </button>
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full rounded-lg border border-[#93C572] bg-[#93C572]/10 px-4 py-3 font-medium text-[#7bad5c] transition-colors hover:bg-[#93C572]/20"
                  >
                    + Rejoindre un foyer avec un code
                  </button>
                </div>
              </>
            ) : claimContext ? (
              <JoinHouseholdClaimStep
                household={claimContext.household}
                nonUserMembers={claimContext.nonUserMembers}
                variant="modal"
                onValidate={handleClaimValidate}
                onCancel={() => {
                  setClaimContext(null)
                  setJoinCode('')
                  setError(null)
                }}
              />
            ) : (
              <form onSubmit={handleJoinHousehold} className="space-y-4">
                <div>
                  <label htmlFor="joinCodeModal" className="block text-sm font-medium text-[#6B7280] mb-2">
                    Code d'invitation
                  </label>
                  <input
                    id="joinCodeModal"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30 font-mono uppercase text-center text-xl tracking-wider"
                    placeholder="ABC123"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Rejoindre...' : 'Rejoindre'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false)
                      setJoinCode('')
                      setError(null)
                    }}
                    className="flex-1 rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                  >
                    Retour
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

