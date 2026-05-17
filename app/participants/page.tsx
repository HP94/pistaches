'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  type Participant,
  type Gender,
} from '@/lib/supabase/participants'
import { getUserHouseholds, createHousehold, type Household } from '@/lib/supabase/households'
import { translateGender, translateTaskName, translateCategory } from '@/lib/translations'
import { pickHouseholdFromList, setStoredHouseholdId } from '@/lib/currentHouseholdStorage'
import HouseholdSelector from '@/components/HouseholdSelector'
import { ContextActionsMenu } from '@/components/ContextActionsMenu'
import { canEditParticipant, canDeleteParticipant } from '@/lib/participantPermissions'
import { getDeclarationsBetweenDates } from '@/lib/supabase/taskDeclarations'
import { participantTotalInDeclarations } from '@/lib/v3/balanceAggregate'
import { formatLocalDate } from '@/components/TaskDayPicker'
import { SuccessToast, useSuccessToast } from '@/components/SuccessToast'

export default function ParticipantsPage() {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [formName, setFormName] = useState('')
  const [formGender, setFormGender] = useState<Gender>('neutral')
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null)
  const [households, setHouseholds] = useState<Household[]>([])
  const [createHouseholdName, setCreateHouseholdName] = useState('')

  const [userId, setUserId] = useState<string | null>(null)

  const [participantMenuKey, setParticipantMenuKey] = useState<string | null>(null)
  const { toastMessage, showSuccessToast } = useSuccessToast()

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.')
        router.push('/login')
        return
      }
      if (user) {
        setUserId(user.id)
        try {
          const { data: households, error: householdsError } = await getUserHouseholds(user.id)
          if (householdsError) throw householdsError
          
          if (!households || households.length === 0) {
            // No household, redirect to selection page
            router.push('/select-household')
            return
          }
          
          await loadHouseholds(user.id)
        } catch (err: any) {
          // If error is about missing columns, it means migration hasn't been run
          if (err.message?.includes('column') || err.message?.includes('does not exist')) {
            setError('La base de données n\'est pas à jour. Veuillez exécuter la migration SQL dans Supabase.')
          } else {
            setError(err.message || 'Erreur lors du chargement des foyers')
          }
        }
      } else {
        router.push('/login')
      }
    }
    init()
  }, [router])

  useEffect(() => {
    if (currentHousehold) {
      loadParticipants(currentHousehold.id)
    }
  }, [currentHousehold])

  const loadHouseholds = async (userId: string) => {
    const { data, error } = await getUserHouseholds(userId)
    if (error || !data || data.length === 0) {
      // No households, show create form
      setShowCreateForm(true)
      return
    }
    setHouseholds(data)
    setCurrentHousehold(pickHouseholdFromList(data, userId))
  }

  const loadParticipants = async (
    householdId: string,
    opts?: { silent?: boolean }
  ) => {
    if (!opts?.silent) setLoading(true)
    setError(null)
    try {
      const participantsResult = await getParticipants(householdId)
      if (participantsResult.error) throw participantsResult.error
      const plist = participantsResult.data || []
      setParticipants(plist)

      const now = new Date()
      const from = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
      const to = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
      const { data: decs, error: decErr } = await getDeclarationsBetweenDates(householdId, from, to)
      if (decErr) throw decErr

      const balanceMap: Record<string, number> = {}
      for (const p of plist) {
        balanceMap[p.id] = participantTotalInDeclarations(p.id, decs || [])
      }
      setBalances(balanceMap)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des membres')
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError(null)
    try {
      const { data: household, error } = await createHousehold(userId, createHouseholdName || 'Mon foyer')
      if (error) throw error

      // Create participant for the user in this household
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get user metadata or use email as name
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'
        await createParticipant(household.id, userName, 'neutral', user.id)
      }

      await loadHouseholds(userId)
      setShowCreateForm(false)
      setCreateHouseholdName('')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du foyer')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHousehold) return

    setError(null)
    try {
      if (editingParticipant) {
        const { error } = await updateParticipant(
          editingParticipant.id,
          formName,
          formGender
        )
        if (error) throw error
      } else {
        // Create participant without user_id (non-user participant)
        const { error } = await createParticipant(
          currentHousehold.id,
          formName,
          formGender,
          null
        )
        if (error) throw error
      }

      await loadParticipants(currentHousehold.id, { silent: true })
      showSuccessToast()
      setShowForm(false)
      setEditingParticipant(null)
      setFormName('')
      setFormGender('neutral')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setFormName(participant.name)
    setFormGender(participant.gender)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return
    }

    if (!currentHousehold) return

    setError(null)
    try {
      const { error } = await deleteParticipant(id)
      if (error) throw error
      await loadParticipants(currentHousehold.id, { silent: true })
      showSuccessToast()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-6 py-8">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1F2937]">Créer un foyer</h1>
            <p className="mt-2 text-[#6B7280]">
              Créez votre premier foyer pour commencer
            </p>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="householdName" className="block text-sm font-medium text-[#6B7280] mb-2">
                  Nom du foyer
                </label>
                <input
                  id="householdName"
                  type="text"
                  value={createHouseholdName}
                  onChange={(e) => setCreateHouseholdName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  placeholder="Mon foyer"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
              >
                Créer le foyer
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (loading && participants.length === 0 && !currentHousehold) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-[#6B7280]">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Membres</h1>
              <p className="mt-2 text-[#6B7280]">
                Ajoutez et gérez les membres du foyer
              </p>
            </div>
            <div className="flex items-center gap-4">
              {households.length > 1 && (
                <HouseholdSelector
                  currentHouseholdId={currentHousehold?.id || null}
                  onHouseholdChange={(id) => {
                    const household = households.find(h => h.id === id)
                    if (household && userId) {
                      setStoredHouseholdId(userId, id)
                      setCurrentHousehold(household)
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {!showForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingParticipant(null)
                  setFormName('')
                  setFormGender('neutral')
                  setShowForm(true)
                }}
                className="rounded-lg bg-[#93C572] px-6 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
              >
                + Ajouter un membre
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-red-400">
            {error}
          </div>
        )}


        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  {editingParticipant ? 'Modifier le membre' : 'Ajouter un membre'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingParticipant(null)
                    setFormName('')
                    setFormGender('neutral')
                  }}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#6B7280] mb-2">
                    Prénom ou surnom
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                    placeholder="Prénom ou surnom"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-[#6B7280] mb-2">
                    Genre
                  </label>
                  <select
                    id="gender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  >
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="neutral">Autre</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingParticipant(null)
                      setFormName('')
                      setFormGender('neutral')
                    }}
                    className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c]"
                  >
                    {editingParticipant ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {participants.length === 0 && !showForm ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-[#6B7280] mb-4">Aucun membre pour le moment.</p>
            <button
              type="button"
              onClick={() => {
                setEditingParticipant(null)
                setFormName('')
                setFormGender('neutral')
                setShowForm(true)
              }}
              className="rounded-lg bg-[#93C572] px-6 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
            >
              Ajouter le premier membre
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="rounded-lg border border-[#E5E7EB] bg-white p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">
                      {participant.name}
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      {translateGender(participant.gender)}
                      {participant.user_id && (
                        <span className="ml-2 text-xs text-[#8B5CF6]">(Compte)</span>
                      )}
                    </p>
                  </div>
                  {userId && currentHousehold && (() => {
                    const ownerId = currentHousehold.owner
                    const canEdit = canEditParticipant(participant, userId, ownerId)
                    const canDelete = canDeleteParticipant(userId, ownerId)
                    const menuItems = [
                      ...(canEdit
                        ? [{ label: 'Modifier' as const, onClick: () => handleEdit(participant) }]
                        : []),
                      ...(canDelete
                        ? [
                            {
                              label: 'Supprimer' as const,
                              onClick: () => handleDelete(participant.id),
                              variant: 'danger' as const,
                            },
                          ]
                        : []),
                    ]
                    if (menuItems.length === 0) return null
                    return (
                      <div className="shrink-0">
                        <ContextActionsMenu
                          menuKey={participant.id}
                          openMenuKey={participantMenuKey}
                          onOpenMenuKeyChange={setParticipantMenuKey}
                          triggerAriaLabel="Menu membre"
                          items={menuItems}
                        />
                      </div>
                    )
                  })()}
                </div>

                <div className="mb-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-3">
                  <p className="text-xs text-[#6B7280] mb-1">Points ce mois-ci (déclarations)</p>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {Math.round(balances[participant.id] ?? 0)} pts
                  </p>
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    Les tâches se déclarent depuis l’onglet « Tâches » avec le calendrier.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <SuccessToast message={toastMessage} />
    </div>
  )
}
