'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, joinHouseholdByCode, type Household } from '@/lib/supabase/households'
import { createParticipant } from '@/lib/supabase/participants'

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'
      const { data: household, error } = await joinHouseholdByCode(
        userId,
        joinCode,
        userName,
        'neutral'
      )
      if (error) throw error

      await loadHouseholds(userId)
      if (household) {
        handleSelectHousehold(household)
      }
      setShowJoinForm(false)
      setJoinCode('')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la jointure du foyer')
      setLoading(false)
    }
  }

  if (!currentHousehold) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        Changer de foyer
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Changer de foyer</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setShowJoinForm(false)
                  setError(null)
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {!showJoinForm ? (
              <>
                {households.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-3 text-sm font-medium text-slate-300">Mes foyers</h3>
                    <div className="space-y-2">
                      {households.map((household) => (
                        <button
                          key={household.id}
                          onClick={() => handleSelectHousehold(household)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            household.id === currentHousehold.id
                              ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">{household.name}</div>
                          {household.id === currentHousehold.id && (
                            <div className="text-xs text-teal-400">Actuel</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      router.push('/select-household')
                    }}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    + Créer un nouveau foyer
                  </button>
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full rounded-lg border border-teal-500/50 bg-teal-500/10 px-4 py-3 font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
                  >
                    + Rejoindre un foyer avec un code
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleJoinHousehold} className="space-y-4">
                <div>
                  <label htmlFor="joinCodeModal" className="block text-sm font-medium text-slate-300 mb-2">
                    Code d'invitation
                  </label>
                  <input
                    id="joinCodeModal"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono uppercase text-center text-xl tracking-wider"
                    placeholder="ABC123"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
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

