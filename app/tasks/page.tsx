'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHousehold } from '@/lib/hooks/useHousehold'
import { getTasks, createTask, updateTaskPoints, deleteTask, type TaskWithTemplate } from '@/lib/supabase/tasks'
import { getTaskTemplates, type TaskTemplate } from '@/lib/supabase/taskTemplates'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, deleteAllAssignmentsForHousehold, type AssignmentWithDetails } from '@/lib/supabase/assignments'
import { getParticipants, type Participant } from '@/lib/supabase/participants'
import { translateTaskName, translateCategory } from '@/lib/translations'

type TaskCategory = 'administrative' | 'car_maintenance' | 'parenting' | 'cleaning' | 'cooking' | 'diy' | 'laundry' | 'other' | 'shopping'

export default function TasksPage() {
  const router = useRouter()
  const { currentHousehold, loading: householdLoading } = useHousehold()
  
  const [tasks, setTasks] = useState<TaskWithTemplate[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showEditPointsModal, setShowEditPointsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  // Form states
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | ''>('')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [editingTask, setEditingTask] = useState<TaskWithTemplate | null>(null)
  const [assigningTask, setAssigningTask] = useState<TaskWithTemplate | null>(null)
  const [performerPoints, setPerformerPoints] = useState<number>(0)
  const [mentalLoadPoints, setMentalLoadPoints] = useState<number>(0)
  
  // Assignment form states
  const [selectedPerformer, setSelectedPerformer] = useState<string>('')
  const [selectedThinker, setSelectedThinker] = useState<string>('')
  const [isFrequentTask, setIsFrequentTask] = useState<boolean>(false)
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<number>(1)
  const [editingAssignment, setEditingAssignment] = useState<AssignmentWithDetails | null>(null)
  const [taskContextMenu, setTaskContextMenu] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'none' | 'oldest' | 'newest'>('none')
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showDeleteAssignmentsModal, setShowDeleteAssignmentsModal] = useState(false)

  useEffect(() => {
    if (!householdLoading && !currentHousehold) {
      router.push('/select-household')
    } else if (currentHousehold) {
      loadData()
    }
  }, [currentHousehold, householdLoading, router])

  const loadData = async () => {
    if (!currentHousehold) return
    
    setLoading(true)
    setError(null)
    try {
      // Load all data in parallel
      const [tasksResult, assignmentsResult, participantsResult, templatesResult] = await Promise.all([
        getTasks(currentHousehold.id),
        getAssignments(currentHousehold.id),
        getParticipants(currentHousehold.id),
        getTaskTemplates(),
      ])

      if (tasksResult.error) throw tasksResult.error
      if (assignmentsResult.error) throw assignmentsResult.error
      if (participantsResult.error) throw participantsResult.error
      if (templatesResult.error) throw templatesResult.error

      setTasks(tasksResult.data || [])
      setAssignments(assignmentsResult.data || [])
      setParticipants(participantsResult.data || [])
      setTemplates(templatesResult.data || [])
      
      // Debug: log templates
      console.log('Templates chargés:', templatesResult.data?.length || 0)
      if (templatesResult.data && templatesResult.data.length > 0) {
        console.log('Premier template:', templatesResult.data[0])
        console.log('Catégories disponibles:', [...new Set(templatesResult.data.map(t => t.category))])
      } else {
        console.warn('Aucun template chargé! Vérifiez que la table task_templates est remplie et que les RLS policies permettent la lecture.')
      }
      
      // Debug: log templates
      console.log('Templates chargés:', templatesResult.data?.length || 0)
      if (templatesResult.data && templatesResult.data.length > 0) {
        console.log('Premier template:', templatesResult.data[0])
        console.log('Catégories disponibles:', [...new Set(templatesResult.data.map(t => t.category))])
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!currentHousehold || !selectedTemplate) {
      console.warn('Cannot add task: missing household or template', { 
        hasHousehold: !!currentHousehold, 
        hasTemplate: !!selectedTemplate,
        template: selectedTemplate 
      })
      return
    }

    setError(null)
    setLoading(true)
    try {
      console.log('Adding task:', { 
        householdId: currentHousehold.id, 
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name 
      })
      const { error } = await createTask(
        currentHousehold.id,
        selectedTemplate.id,
        null, // Use template defaults initially
        null
      )
      if (error) throw error

      await loadData()
      setShowAddTaskModal(false)
      setSelectedTemplate(null)
      setSelectedCategory('')
    } catch (err: any) {
      console.error('Error adding task:', err)
      setError(err.message || 'Erreur lors de la création de la tâche')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePoints = async () => {
    if (!editingTask) return

    setError(null)
    try {
      const { error } = await updateTaskPoints(
        editingTask.id,
        performerPoints || null,
        mentalLoadPoints || null
      )
      if (error) throw error

      await loadData()
      setShowEditPointsModal(false)
      setEditingTask(null)
      setPerformerPoints(0)
      setMentalLoadPoints(0)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des points')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return

    setError(null)
    try {
      const { error } = await deleteTask(taskId)
      if (error) throw error

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleCreateAssignment = async () => {
    if (!assigningTask || !selectedPerformer || !selectedThinker) return

    setError(null)
    setLoading(true)
    try {
      // null for one-time tasks, number for frequent tasks
      const finalFrequency = isFrequentTask ? frequencyPerWeek : null
      const { error } = await createAssignment(
        assigningTask.id,
        selectedPerformer,
        selectedThinker,
        finalFrequency
      )
      if (error) throw error

      await loadData()
      setShowAssignModal(false)
      setAssigningTask(null)
      setEditingAssignment(null)
      setSelectedPerformer('')
      setSelectedThinker('')
      setIsFrequentTask(false)
      setFrequencyPerWeek(1)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'assignation')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !selectedPerformer || !selectedThinker) return

    setError(null)
    setLoading(true)
    try {
      // null for one-time tasks, number for frequent tasks
      const finalFrequency = isFrequentTask ? frequencyPerWeek : null
      const { error } = await updateAssignment(
        editingAssignment.id,
        selectedPerformer,
        selectedThinker,
        finalFrequency
      )
      if (error) throw error

      await loadData()
      setShowAssignModal(false)
      setEditingAssignment(null)
      setAssigningTask(null)
      setSelectedPerformer('')
      setSelectedThinker('')
      setIsFrequentTask(false)
      setFrequencyPerWeek(1)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'assignation')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) return

    setError(null)
    try {
      const { error } = await deleteAssignment(assignmentId)
      if (error) throw error

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleResetAllAssignments = async () => {
    if (!currentHousehold) return

    setError(null)
    setLoading(true)
    try {
      const { error } = await deleteAllAssignmentsForHousehold(currentHousehold.id)
      if (error) throw error

      await loadData()
      setShowDeleteAssignmentsModal(false)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la remise à zéro des assignations')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  const openEditPointsModal = (task: TaskWithTemplate) => {
    setEditingTask(task)
    const effectivePerformerPoints = task.performer_points ?? task.task_templates.default_points
    const effectiveMentalLoadPoints = task.mental_load_points ?? task.task_templates.default_mental_load_points
    setPerformerPoints(effectivePerformerPoints)
    setMentalLoadPoints(effectiveMentalLoadPoints)
    setShowEditPointsModal(true)
  }

  const openAssignModal = (task: TaskWithTemplate, assignment: AssignmentWithDetails | null = null) => {
    setAssigningTask(task)
    setEditingAssignment(assignment)
    if (assignment) {
      setSelectedPerformer(assignment.performer_id || '')
      setSelectedThinker(assignment.thinker_id || '')
      setIsFrequentTask(assignment.frequency_per_week !== null && assignment.frequency_per_week > 1)
      setFrequencyPerWeek(assignment.frequency_per_week || 1)
    } else {
      setSelectedPerformer('')
      setSelectedThinker('')
      setIsFrequentTask(false)
      setFrequencyPerWeek(1)
    }
    setShowAssignModal(true)
  }

  const getAssignmentsForTask = (taskId: string) => {
    return assignments.filter(a => a.task_id === taskId)
  }

  const getEffectivePoints = (task: TaskWithTemplate) => {
    return {
      performer: task.performer_points ?? task.task_templates.default_points,
      mentalLoad: task.mental_load_points ?? task.task_templates.default_mental_load_points,
    }
  }

  // Get tasks sorted by assignment date if sort is active
  const getSortedTasks = () => {
    if (sortOrder === 'none') {
      return tasks
    }

    // Separate tasks with and without assignments
    const tasksWithAssignments: Array<{ task: TaskWithTemplate; date: Date }> = []
    const tasksWithoutAssignments: TaskWithTemplate[] = []

    tasks.forEach(task => {
      const taskAssignments = getAssignmentsForTask(task.id)
      if (taskAssignments.length === 0) {
        // No assignment, will be put at the end
        tasksWithoutAssignments.push(task)
      } else {
        // Get the most recent assignment date
        const dates = taskAssignments.map(a => new Date(a.created_at))
        const mostRecentDate = new Date(Math.max(...dates.map(d => d.getTime())))
        tasksWithAssignments.push({ task, date: mostRecentDate })
      }
    })

    // Sort only tasks with assignments by date
    tasksWithAssignments.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.date.getTime() - a.date.getTime() // Newest first
      } else {
        return a.date.getTime() - b.date.getTime() // Oldest first
      }
    })

    // Return sorted tasks with assignments first, then tasks without assignments at the end
    return [
      ...tasksWithAssignments.map(t => t.task),
      ...tasksWithoutAssignments
    ]
  }

  const sortedTasks = getSortedTasks()

  const handleToggleSortOrder = () => {
    if (sortOrder === 'oldest') {
      setSortOrder('newest')
    } else if (sortOrder === 'newest') {
      setSortOrder('oldest')
    }
  }

  const tasksByCategory = sortOrder === 'none' 
    ? tasks.reduce((acc, task) => {
        const category = task.task_templates.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(task)
        return acc
      }, {} as Record<string, TaskWithTemplate[]>)
    : {} // Empty when sorting is active

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates

  // Debug: log when category changes
  useEffect(() => {
    if (selectedCategory) {
      console.log('🔍 Filtrage templates:')
      console.log('  - Catégorie sélectionnée:', selectedCategory)
      console.log('  - Templates totaux:', templates.length)
      console.log('  - Templates filtrés:', filteredTemplates.length)
      if (templates.length > 0) {
        console.log('  - Catégories dans templates:', [...new Set(templates.map(t => t.category))])
        console.log('  - Exemples de templates:', templates.slice(0, 3).map(t => ({ name: t.name, category: t.category })))
      }
      if (filteredTemplates.length > 0) {
        console.log('  - Premiers templates filtrés:', filteredTemplates.slice(0, 3).map(t => t.name))
      } else {
        console.warn('  ⚠️ Aucun template trouvé pour la catégorie:', selectedCategory)
      }
    }
  }, [selectedCategory, templates, filteredTemplates])

  // Debug: log when template is selected
  useEffect(() => {
    console.log('📌 Template sélectionné:', selectedTemplate ? { id: selectedTemplate.id, name: selectedTemplate.name } : null)
  }, [selectedTemplate])

  if (householdLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <p className="text-[#6B7280]">Chargement...</p>
      </div>
    )
  }


  if (!currentHousehold) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937]">
            Tâches du foyer<br />
            &quot;{currentHousehold.name}&quot;
          </h1>
          <p className="mt-2 text-[#6B7280]">
            Gérez les tâches ménagères et leurs assignations
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="rounded-lg bg-[#93C572] px-6 py-3 font-medium text-white transition-colors hover:bg-[#7bad5c]"
          >
            + Ajouter une tâche
          </button>
          
          {/* Actions Menu - Aligned to right */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActionsMenu(!showActionsMenu)
              }}
              className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-2 text-lg text-[#1F2937] transition-colors hover:bg-gray-100"
              aria-label="Menu actions"
            >
              ···
            </button>

            {/* Actions Menu Dropdown */}
            {showActionsMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActionsMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-[#E5E7EB] bg-white backdrop-blur-sm shadow-lg">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSortOrder(sortOrder === 'none' ? 'oldest' : 'none')
                        setShowActionsMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-gray-100 transition-colors"
                    >
                      {sortOrder === 'none' ? 'Trier par date d\'assignation' : 'Ne plus trier'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteAssignmentsModal(true)
                        setShowActionsMenu(false)
                      }}
                      disabled={loading || assignments.length === 0}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Supprimer les assignations
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sort Indicator */}
        {sortOrder !== 'none' && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">
                {sortOrder === 'oldest' ? 'Du plus ancien au plus récent' : 'Du plus récent au plus ancien'}
              </span>
              <button
                onClick={handleToggleSortOrder}
                className="text-sm text-[#8B5CF6] hover:text-[#7c3aed] transition-colors underline"
              >
                {sortOrder === 'oldest' ? 'Voir les plus récentes' : 'Voir les plus anciennes'}
              </button>
            </div>
            <button
              onClick={() => setSortOrder('none')}
              className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
              aria-label="Fermer le tri"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tasks List by Category or Sorted */}
        {sortOrder === 'none' ? (
          Object.keys(tasksByCategory).length === 0 ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <p className="text-[#6B7280]">Aucune tâche dans ce foyer. Ajoutez-en une !</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
                <div key={category} className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-[#1F2937]">
                    {translateCategory(category)}
                  </h2>
                  <div className="space-y-4">
                    {categoryTasks.map((task) => {
                      const taskAssignments = getAssignmentsForTask(task.id)
                      const points = getEffectivePoints(task)
                      return (
                        <div
                          key={task.id}
                          className="rounded-lg border border-[#E5E7EB] bg-white p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-[#1F2937] mb-3">
                                {translateTaskName(task.task_templates.name)}
                              </h3>
                              <div className="flex flex-col gap-1 text-sm text-[#6B7280]">
                                <span>Réalisation : {points.performer} pts</span>
                                <span>Charge mentale : {points.mentalLoad} pts</span>
                              </div>
                            </div>
                            <div className="ml-4 relative">
                              {/* Context Menu Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setTaskContextMenu(taskContextMenu === task.id ? null : task.id)
                                }}
                                className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-2 text-lg text-[#1F2937] transition-colors hover:bg-gray-100"
                                aria-label="Menu"
                              >
                                ···
                              </button>

                              {/* Context Menu Dropdown */}
                              {taskContextMenu === task.id && (
                                <>
                                  {/* Backdrop */}
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setTaskContextMenu(null)}
                                  />
                                  
                                  {/* Menu */}
                                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-[#E5E7EB] bg-white backdrop-blur-sm shadow-lg">
                                    <div className="py-2">
                                      <button
                                        onClick={() => {
                                          openEditPointsModal(task)
                                          setTaskContextMenu(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-gray-100 transition-colors"
                                      >
                                        Modifier les points
                                      </button>
                                      <button
                                        onClick={() => {
                                          openAssignModal(task)
                                          setTaskContextMenu(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-gray-100 transition-colors"
                                      >
                                        Assigner à un membre
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteTask(task.id)
                                          setTaskContextMenu(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100 transition-colors"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Assignments List - Full Width */}
                          {taskAssignments.length > 0 && (
                            <div className="mt-8 space-y-5">
                              <p className="text-sm font-medium text-[#6B7280] mb-5">Assignations :</p>
                              {taskAssignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="rounded border border-[#E5E7EB] bg-white p-6 w-full"
                                >
                                  <div className="flex items-center justify-between gap-[5px] mb-6">
                                    <span className="text-sm text-[#6B7280]">
                                      {assignment.frequency_per_week === null
                                        ? 'Ponctuelle'
                                        : assignment.frequency_per_week > 1
                                        ? `${assignment.frequency_per_week}x/semaine`
                                        : '1x/semaine'}
                                    </span>
                                    <div className="flex gap-[5px]">
                                      <button
                                        onClick={() => openAssignModal(task, assignment)}
                                        className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-1.5 text-xs font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                                        aria-label="Modifier l'assignation"
                                      >
                                        Modifier
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                                        aria-label="Supprimer l'assignation"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-4 text-sm">
                                    <p className="text-[#6B7280]">
                                      Fait par : {assignment.performers?.name || 'Non assigné'}
                                    </p>
                                    <p className="text-[#6B7280]">
                                      Pensé par : {assignment.thinkers?.name || 'Non assigné'}
                                    </p>
                                    <p className="text-xs text-[#6B7280]">
                                      Assigné le {formatDate(assignment.created_at)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Sorted tasks (no categories)
          sortedTasks.length === 0 ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <p className="text-[#6B7280]">Aucune tâche dans ce foyer. Ajoutez-en une !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task) => {
                    const taskAssignments = getAssignmentsForTask(task.id)
                    const points = getEffectivePoints(task)
                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-[#E5E7EB] bg-white p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#1F2937] mb-3">
                              {translateTaskName(task.task_templates.name)}
                            </h3>
                            <div className="flex flex-col gap-1 text-sm text-[#6B7280]">
                              <span>Réalisation : {points.performer} pts</span>
                              <span>Charge mentale : {points.mentalLoad} pts</span>
                            </div>
                          </div>
                          <div className="ml-4 relative">
                            {/* Context Menu Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setTaskContextMenu(taskContextMenu === task.id ? null : task.id)
                              }}
                              className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-2 text-lg text-[#1F2937] transition-colors hover:bg-gray-100"
                              aria-label="Menu"
                            >
                              ···
                            </button>

                            {/* Context Menu Dropdown */}
                            {taskContextMenu === task.id && (
                              <>
                                {/* Backdrop */}
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setTaskContextMenu(null)}
                                />
                                
                                {/* Menu */}
                                <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-[#E5E7EB] bg-white backdrop-blur-sm shadow-lg">
                                  <div className="py-2">
                                    <button
                                      onClick={() => {
                                        openEditPointsModal(task)
                                        setTaskContextMenu(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-gray-100 transition-colors"
                                    >
                                      Modifier les points
                                    </button>
                                    <button
                                      onClick={() => {
                                        openAssignModal(task)
                                        setTaskContextMenu(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-gray-100 transition-colors"
                                    >
                                      Assigner à un membre
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteTask(task.id)
                                        setTaskContextMenu(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Assignments List - Full Width */}
                        {taskAssignments.length > 0 && (
                          <div className="mt-8 space-y-5">
                            <p className="text-sm font-medium text-[#6B7280] mb-5">Assignations :</p>
                            {taskAssignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="rounded border border-[#E5E7EB] bg-white p-6 w-full"
                              >
                                <div className="flex items-center justify-between gap-[5px] mb-6">
                                  <span className="text-sm text-[#6B7280]">
                                    {assignment.frequency_per_week === null
                                      ? 'Ponctuelle'
                                      : assignment.frequency_per_week > 1
                                      ? `${assignment.frequency_per_week}x/semaine`
                                      : '1x/semaine'}
                                  </span>
                                  <div className="flex gap-[5px]">
                                    <button
                                      onClick={() => openAssignModal(task, assignment)}
                                      className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-1.5 text-xs font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                                      aria-label="Modifier l'assignation"
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAssignment(assignment.id)}
                                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                                      aria-label="Supprimer l'assignation"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-4 text-sm">
                                  <p className="text-[#6B7280]">
                                    Fait par : {assignment.performers?.name || 'Non assigné'}
                                  </p>
                                  <p className="text-[#6B7280]">
                                    Pensé par : {assignment.thinkers?.name || 'Non assigné'}
                                  </p>
                                  <p className="text-xs text-[#6B7280]">
                                    Assigné le {formatDate(assignment.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
            </div>
          )
        )}

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Ajouter une tâche</h2>
              
              {/* Category Selection */}
              <div className="mb-4">
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
                  <option value="administrative">Administratif</option>
                  <option value="car_maintenance">Entretien automobile</option>
                  <option value="parenting">Parentalité</option>
                  <option value="cleaning">Nettoyage</option>
                  <option value="cooking">Cuisine</option>
                  <option value="diy">Bricolage</option>
                  <option value="laundry">Lessive</option>
                  <option value="other">Autre</option>
                  <option value="shopping">Courses</option>
</select>
              </div>

              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Tâche {selectedCategory && `(${translateCategory(selectedCategory)})`}
                </label>
                {filteredTemplates.length === 0 ? (
                  <div className="text-sm text-[#6B7280] py-2">
                    <p>
                      {selectedCategory 
                        ? `Aucune tâche disponible dans la catégorie "${translateCategory(selectedCategory)}".`
                        : templates.length === 0
                        ? 'Aucune tâche disponible. Vérifiez que les templates sont chargés.'
                        : 'Sélectionnez une catégorie pour filtrer les tâches, ou choisissez directement une tâche ci-dessous.'}
                    </p>
                    <p className="text-xs mt-1">
                      Templates chargés: {templates.length} 
                      {selectedCategory && ` | Catégorie sélectionnée: ${selectedCategory}`}
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
                      // Comparer avec String(t.id) car les IDs peuvent être des nombres dans la DB mais strings dans l'interface
                      let template = filteredTemplates.find(t => String(t.id) === selectedId)
                      if (!template) {
                        // Si pas trouvé dans filteredTemplates, chercher dans tous les templates
                        template = templates.find(t => String(t.id) === selectedId)
                      }
                      if (template) {
                        setSelectedTemplate(template)
                        console.log('Template sélectionné:', template)
                      } else {
                        console.warn('Template non trouvé pour ID:', selectedId)
                        console.warn('Templates disponibles:', templates.map(t => ({ id: t.id, name: t.name })))
                        console.warn('Filtered templates:', filteredTemplates.map(t => ({ id: t.id, name: t.name })))
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

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskModal(false)
                    setSelectedCategory('')
                    setSelectedTemplate(null)
                  }}
                  className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!selectedTemplate || loading}
                  className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!selectedTemplate ? 'Sélectionnez une tâche pour l\'ajouter' : ''}
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Points Modal */}
        {showEditPointsModal && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">
                Modifier les points - {translateTaskName(editingTask.task_templates.name)}
              </h2>
              
              <div className="mb-4">
                <p className="mb-2 text-sm text-[#6B7280]">
                  Points par défaut : {editingTask.task_templates.default_points} (performer), {editingTask.task_templates.default_mental_load_points} (mental load)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Points performer (0-100, par pas de 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="10"
                    value={performerPoints}
                    onChange={(e) => setPerformerPoints(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Points charge mentale (0-100, par pas de 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="10"
                    value={mentalLoadPoints}
                    onChange={(e) => setMentalLoadPoints(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPointsModal(false)
                    setEditingTask(null)
                  }}
                  className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdatePoints}
                  className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c]"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Task Modal */}
        {showAssignModal && assigningTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">
                {editingAssignment ? 'Modifier l\'assignation' : 'Assigner'} - {translateTaskName(assigningTask.task_templates.name)}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Qui fait la tâche ? (performer) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedPerformer}
                    onChange={(e) => setSelectedPerformer(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  >
                    <option value="">Sélectionnez un membre</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Qui pense à la tâche ? (charge mentale) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedThinker}
                    onChange={(e) => setSelectedThinker(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                  >
                    <option value="">Sélectionnez un membre</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-3">
                    Fréquence
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="oneTime"
                        name="frequency"
                        checked={!isFrequentTask}
                        onChange={() => {
                          setIsFrequentTask(false)
                          setFrequencyPerWeek(1)
                        }}
                        className="h-4 w-4 text-[#93C572] focus:ring-[#93C572]"
                      />
                      <label htmlFor="oneTime" className="text-sm text-[#6B7280] cursor-pointer">
                        Tâche ponctuelle (1 fois)
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="frequentTask"
                        name="frequency"
                        checked={isFrequentTask}
                        onChange={() => setIsFrequentTask(true)}
                        className="h-4 w-4 text-[#93C572] focus:ring-[#93C572]"
                      />
                      <label htmlFor="frequentTask" className="text-sm text-[#6B7280] cursor-pointer">
                        Tâche fréquente
                      </label>
                    </div>
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
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false)
                    setAssigningTask(null)
                  }}
                  className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                  disabled={!selectedPerformer || !selectedThinker || loading}
                  className="rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : editingAssignment ? 'Modifier' : 'Assigner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Assignments Confirmation Modal */}
        {showDeleteAssignmentsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white backdrop-blur-sm p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">
                Confirmation de suppression
              </h2>
              
              <p className="mb-6 text-[#6B7280]">
                Êtes-vous sûr de vouloir supprimer toutes les assignations ? Cette action ne peut pas être annulée.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteAssignmentsModal(false)}
                  className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetAllAssignments}
                  disabled={loading}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
