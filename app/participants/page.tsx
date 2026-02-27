'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  getParticipantBalance,
  type Participant,
  type Gender,
} from '@/lib/supabase/participants'
import {
  getUserHouseholds,
  getCurrentHousehold,
  createHousehold,
  joinHouseholdByCode,
  type Household,
} from '@/lib/supabase/households'
import { translateGender, translateTaskName, translateCategory } from '@/lib/translations'
import HouseholdSelector from '@/components/HouseholdSelector'
import { getTasks, type TaskWithTemplate } from '@/lib/supabase/tasks'
import { getTaskTemplates, type TaskTemplate, type TaskCategory } from '@/lib/supabase/taskTemplates'
import { getAssignments, createAssignment, type AssignmentWithDetails } from '@/lib/supabase/assignments'

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

  // Assignment modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningToParticipant, setAssigningToParticipant] = useState<Participant | null>(null)
  const [assignStep, setAssignStep] = useState<1 | 2>(1)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | ''>('')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskWithTemplate | null>(null)
  const [isPerformer, setIsPerformer] = useState<boolean>(true)
  const [isThinker, setIsThinker] = useState<boolean>(false)
  const [isFrequentTask, setIsFrequentTask] = useState<boolean>(false)
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<number>(1)

  // Data for assignments
  const [tasks, setTasks] = useState<TaskWithTemplate[]>([])
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [expandedParticipants, setExpandedParticipants] = useState<Set<string>>(new Set())

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
    setCurrentHousehold(data[0])
  }

  const loadParticipants = async (householdId: string) => {
    setLoading(true)
    setError(null)
    try {
      // Load all data in parallel
      const [participantsResult, tasksResult, templatesResult, assignmentsResult] = await Promise.all([
        getParticipants(householdId),
        getTasks(householdId),
        getTaskTemplates(),
        getAssignments(householdId),
      ])

      if (participantsResult.error) throw participantsResult.error
      if (tasksResult.error) throw tasksResult.error
      if (templatesResult.error) throw templatesResult.error
      if (assignmentsResult.error) throw assignmentsResult.error
      
      setParticipants(participantsResult.data || [])
      setTasks(tasksResult.data || [])
      setTemplates(templatesResult.data || [])
      setAssignments(assignmentsResult.data || [])
      
      // Load balances for all participants
      if (participantsResult.data) {
        const balancePromises = participantsResult.data.map(async (p) => {
          const { balance } = await getParticipantBalance(p.id)
          return { id: p.id, balance }
        })
        const balanceResults = await Promise.all(balancePromises)
        const balanceMap: Record<string, number> = {}
        balanceResults.forEach(({ id, balance }) => {
          balanceMap[id] = balance
        })
        setBalances(balanceMap)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
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

      await loadParticipants(currentHousehold.id)
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
      await loadParticipants(currentHousehold.id)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  // Assignment functions
  const openAssignModal = (participant: Participant) => {
    setAssigningToParticipant(participant)
    setAssignStep(1)
    setSelectedCategory('')
    setSelectedTemplate(null)
    setSelectedTask(null)
    setIsPerformer(true)
    setIsThinker(false)
    setIsFrequentTask(false)
    setFrequencyPerWeek(1)
    setShowAssignModal(true)
  }

  const handleStep1Next = () => {
    if (!selectedTemplate) return
    
    // Find or create task
    const existingTask = tasks.find(t => t.template_id === String(selectedTemplate.id))
    if (existingTask) {
      setSelectedTask(existingTask)
    } else {
      // Task doesn't exist yet, we'll need to create it first
      // For now, we'll proceed to step 2 and create task + assignment together
      setSelectedTask(null)
    }
    setAssignStep(2)
  }

  const handleAssignTask = async () => {
    if (!assigningToParticipant || !selectedTemplate || !currentHousehold) return

    setError(null)
    setLoading(true)
    try {
      let taskId: string

      // Check if task exists, if not create it
      const existingTask = tasks.find(t => t.template_id === String(selectedTemplate.id))
      if (existingTask) {
        taskId = existingTask.id
      } else {
        // Create task first
        const { createTask } = await import('@/lib/supabase/tasks')
        const { data: newTask, error: taskError } = await createTask(
          currentHousehold.id,
          selectedTemplate.id,
          null,
          null
        )
        if (taskError || !newTask) throw taskError || new Error('Erreur lors de la création de la tâche')
        taskId = newTask.id
      }

      // Create assignment
      const performerId = isPerformer ? assigningToParticipant.id : null
      const thinkerId = isThinker ? assigningToParticipant.id : null
      const frequency = isFrequentTask ? frequencyPerWeek : null

      const { error } = await createAssignment(
        taskId,
        performerId,
        thinkerId,
        frequency
      )
      if (error) throw error

      // Reload data
      await loadParticipants(currentHousehold.id)
      
      // Close modal
      setShowAssignModal(false)
      setAssigningToParticipant(null)
      setAssignStep(1)
      setSelectedCategory('')
      setSelectedTemplate(null)
      setSelectedTask(null)
      setIsPerformer(true)
      setIsThinker(false)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'assignation')
    } finally {
      setLoading(false)
    }
  }

  // Get assignment stats for a participant
  const getParticipantAssignmentStats = (participantId: string) => {
    const performerAssignments = assignments.filter(a => a.performer_id === participantId)
    const thinkerAssignments = assignments.filter(a => a.thinker_id === participantId)
    const totalAssignments = new Set([
      ...performerAssignments.map(a => a.task_id),
      ...thinkerAssignments.map(a => a.task_id)
    ]).size

    return {
      total: totalAssignments,
      performed: performerAssignments.length,
      thought: thinkerAssignments.length,
    }
  }

  // Get assignments for a participant
  const getParticipantAssignments = (participantId: string) => {
    return assignments.filter(a => 
      a.performer_id === participantId || a.thinker_id === participantId
    )
  }

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates


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
                    if (household) setCurrentHousehold(household)
                  }}
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
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
          <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#1F2937]">
              {editingParticipant ? 'Modifier le membre' : 'Nouveau membre'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#6B7280] mb-2">
                  Nom
                </label>
                <input
                  id="name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  placeholder="Nom du membre"
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
                  <option value="neutral">Neutre</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#93C572] px-4 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
                >
                  {editingParticipant ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingParticipant(null)
                    setFormName('')
                    setFormGender('neutral')
                  }}
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-3 font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {participants.length === 0 && !showForm ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-[#6B7280] mb-4">Aucun membre pour le moment.</p>
            <button
              onClick={() => setShowForm(true)}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(participant)}
                      className="text-[#8B5CF6] hover:text-teal-300 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(participant.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Assignment Stats */}
                {(() => {
                  const stats = getParticipantAssignmentStats(participant.id)
                  return (
                    <div className="mb-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-3">
                      <p className="text-xs text-[#6B7280] mb-2">Tâches assignées : {stats.total}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[#6B7280]">Réalisées : </span>
                          <span className="font-semibold text-[#8B5CF6]">{stats.performed}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Pensées : </span>
                          <span className="font-semibold text-[#8B5CF6]">{stats.thought}</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-3 mb-4">
                  <p className="text-xs text-[#6B7280] mb-1">Balance (par semaine)</p>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {balances[participant.id]?.toLocaleString() || 0} pts/sem
                  </p>
                </div>

                {/* Assign Task Button */}
                <button
                  onClick={() => openAssignModal(participant)}
                  className="w-full mb-4 rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c]"
                >
                  ➕ Assigner une tâche
                </button>

                {/* Details Accordion */}
                {(() => {
                  const participantAssignments = getParticipantAssignments(participant.id)
                  if (participantAssignments.length === 0) return null

                  return (
                    <div className="border-t border-[#E5E7EB] pt-4">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedParticipants)
                          if (newExpanded.has(participant.id)) {
                            newExpanded.delete(participant.id)
                          } else {
                            newExpanded.add(participant.id)
                          }
                          setExpandedParticipants(newExpanded)
                        }}
                        className="w-full flex items-center justify-between text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
                      >
                        <span>Détails tâches</span>
                        <span>{expandedParticipants.has(participant.id) ? '▼' : '▶'}</span>
                      </button>
                      {expandedParticipants.has(participant.id) && (
                        <div className="mt-2 space-y-2">
                          {participantAssignments.map((assignment) => {
                            const task = assignment.tasks
                            const isPerformer = assignment.performer_id === participant.id
                            const isThinker = assignment.thinker_id === participant.id
                            
                            return (
                              <div
                                key={assignment.id}
                                className="rounded border border-[#E5E7EB] bg-white p-2 text-xs"
                              >
                                <p className="font-medium text-[#1F2937]">
                                  {translateTaskName(task.task_templates.name)}
                                </p>
                                <div className="mt-1 space-y-1">
                                  {isPerformer && (
                                    <p className="text-[#8B5CF6]">
                                      ✓ Réalisée {assignment.frequency_per_week 
                                        ? `${assignment.frequency_per_week}x/semaine`
                                        : '(ponctuelle)'}
                                    </p>
                                  )}
                                  {isThinker && (
                                    <p className="text-[#8B5CF6]">
                                      💭 Charge mentale {assignment.frequency_per_week 
                                        ? `${assignment.frequency_per_week}x/semaine`
                                        : '(ponctuelle)'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Assign Task Modal */}
        {showAssignModal && assigningToParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  Assigner une tâche à {assigningToParticipant.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setAssigningToParticipant(null)
                    setAssignStep(1)
                    setSelectedCategory('')
                    setSelectedTemplate(null)
                    setSelectedTask(null)
                  }}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Step Indicator */}
              <div className="mb-6 flex items-center gap-2">
                <div className={`flex-1 h-1 rounded ${assignStep >= 1 ? 'bg-[#93C572]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1 rounded ${assignStep >= 2 ? 'bg-[#93C572]' : 'bg-gray-100'}`} />
              </div>
              <div className="mb-6 text-center text-sm text-[#6B7280]">
                Étape {assignStep}/2
              </div>

              {/* Step 1: Task Selection */}
              {assignStep === 1 && (
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">
                      Catégorie
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value as TaskCategory | '')
                        setSelectedTemplate(null)
                      }}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                    >
                      <option value="">Toutes les catégories</option>
                      <option value="cleaning">Nettoyage</option>
                      <option value="cooking">Cuisine</option>
                      <option value="parenting">Parentalité</option>
                      <option value="laundry">Lessive</option>
                      <option value="shopping">Courses</option>
                      <option value="car_maintenance">Entretien automobile</option>
                      <option value="diy">Bricolage</option>
                      <option value="administrative">Administratif</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-2">
                      Tâche {selectedCategory && `(${translateCategory(selectedCategory)})`}
                    </label>
                    {filteredTemplates.length === 0 ? (
                      <div className="text-sm text-[#6B7280] py-2">
                        <p>
                          {selectedCategory 
                            ? `Aucune tâche disponible dans la catégorie "${translateCategory(selectedCategory)}".`
                            : 'Sélectionnez une catégorie pour filtrer les tâches.'}
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedTemplate ? String(selectedTemplate.id) : ''}
                        onChange={(e) => {
                          const selectedId = e.target.value
                          if (!selectedId) {
                            setSelectedTemplate(null)
                            return
                          }
                          const template = filteredTemplates.find(t => String(t.id) === selectedId) ||
                            templates.find(t => String(t.id) === selectedId)
                          if (template) {
                            setSelectedTemplate(template)
                          } else {
                            setSelectedTemplate(null)
                          }
                        }}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                      >
                        <option value="">Sélectionnez une tâche</option>
                        {filteredTemplates.map((template) => (
                          <option key={template.id} value={String(template.id)}>
                            {translateTaskName(template.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false)
                        setAssigningToParticipant(null)
                        setAssignStep(1)
                        setSelectedCategory('')
                        setSelectedTemplate(null)
                      }}
                      className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleStep1Next}
                      disabled={!selectedTemplate}
                      className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Assignment Type and Frequency */}
              {assignStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-3">
                      Type d'assignation
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPerformer}
                          onChange={(e) => setIsPerformer(e.target.checked)}
                          className="h-4 w-4 text-[#93C572] focus:ring-[#93C572] rounded"
                        />
                        <div>
                          <span className="text-[#1F2937] font-medium">Réalisation</span>
                          <p className="text-xs text-[#6B7280]">Le membre effectue la tâche</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isThinker}
                          onChange={(e) => setIsThinker(e.target.checked)}
                          className="h-4 w-4 text-[#93C572] focus:ring-[#93C572] rounded"
                        />
                        <div>
                          <span className="text-[#1F2937] font-medium">Charge mentale</span>
                          <p className="text-xs text-[#6B7280]">Le membre pense à la tâche</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-3">
                      Fréquence
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          checked={!isFrequentTask}
                          onChange={() => {
                            setIsFrequentTask(false)
                            setFrequencyPerWeek(1)
                          }}
                          className="h-4 w-4 text-[#93C572] focus:ring-[#93C572]"
                        />
                        <span className="text-[#1F2937]">Tâche ponctuelle</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          checked={isFrequentTask}
                          onChange={() => setIsFrequentTask(true)}
                          className="h-4 w-4 text-[#93C572] focus:ring-[#93C572]"
                        />
                        <span className="text-[#1F2937]">Tâche fréquente</span>
                      </label>
                      {isFrequentTask && (
                        <div className="ml-7">
                          <label className="block text-xs text-[#6B7280] mb-1">
                            Fréquence par semaine
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="14"
                            value={frequencyPerWeek}
                            onChange={(e) => setFrequencyPerWeek(parseInt(e.target.value) || 1)}
                            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setAssignStep(1)}
                      className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleAssignTask}
                      disabled={loading || (isFrequentTask && frequencyPerWeek < 1) || (!isPerformer && !isThinker)}
                      className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Assignation...' : 'Assigner'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
