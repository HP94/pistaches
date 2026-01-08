// Functions to manage task assignments
import { supabase } from './client'

export interface Assignment {
  id: string
  task_id: string
  performer_id: string | null
  thinker_id: string | null
  frequency_per_week: number | null
  created_at: string
}

export interface AssignmentWithDetails extends Assignment {
  tasks: {
    id: string
    household_id: string
    template_id: string
    performer_points: number | null
    mental_load_points: number | null
    task_templates: {
      id: string
      name: string
      category: string
      default_points: number
      default_mental_load_points: number
    }
  }
  performers: {
    id: string
    name: string
    gender: string
  } | null
  thinkers: {
    id: string
    name: string
    gender: string
  } | null
}

/**
 * Get all assignments for a specific household
 */
export async function getAssignments(householdId: string) {
  // First get assignments with tasks
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('assignments')
    .select(`
      *,
      tasks!inner (
        id,
        household_id,
        template_id,
        performer_points,
        mental_load_points,
        task_templates (
          id,
          name,
          category,
          default_points,
          default_mental_load_points
        )
      )
    `)
    .eq('tasks.household_id', householdId)
    .order('created_at', { ascending: false })

  if (assignmentsError || !assignmentsData) {
    return { data: null, error: assignmentsError }
  }

  // Then fetch participants separately and merge
  const performerIds = assignmentsData
    .map(a => a.performer_id)
    .filter((id): id is string => id !== null)
  const thinkerIds = assignmentsData
    .map(a => a.thinker_id)
    .filter((id): id is string => id !== null)
  const allParticipantIds = [...new Set([...performerIds, ...thinkerIds])]

  let participantsMap = new Map<string, { id: string; name: string; gender: string }>()
  
  if (allParticipantIds.length > 0) {
    const { data: participantsData } = await supabase
      .from('participants')
      .select('id, name, gender')
      .in('id', allParticipantIds)

    if (participantsData) {
      participantsData.forEach(p => {
        participantsMap.set(p.id, p)
      })
    }
  }

  // Merge participants into assignments
  const data = assignmentsData.map(assignment => ({
    ...assignment,
    performers: assignment.performer_id ? participantsMap.get(assignment.performer_id) || null : null,
    thinkers: assignment.thinker_id ? participantsMap.get(assignment.thinker_id) || null : null,
  })) as AssignmentWithDetails[]

  return { data, error: null }
}

/**
 * Get assignments for a specific task
 */
export async function getAssignmentsByTask(taskId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      performers:participants!performer_id (
        id,
        name,
        gender
      ),
      thinkers:participants!thinker_id (
        id,
        name,
        gender
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  return { data: data as Assignment[] | null, error }
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  taskId: string,
  performerId: string | null,
  thinkerId: string | null,
  frequencyPerWeek: number | null
) {
  // Insert assignment
  const { data: assignmentData, error: insertError } = await supabase
    .from('assignments')
    .insert({
      task_id: taskId,
      performer_id: performerId,
      thinker_id: thinkerId,
      frequency_per_week: frequencyPerWeek, // null for one-time tasks, number for frequent tasks
    })
    .select('*')
    .single()

  if (insertError || !assignmentData) {
    return { data: null, error: insertError }
  }

  // Fetch task with template
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(`
      id,
      household_id,
      template_id,
      performer_points,
      mental_load_points,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `)
    .eq('id', taskId)
    .single()

  if (taskError || !taskData) {
    return { data: null, error: taskError }
  }

  // Fetch participants
  const participantIds = [performerId, thinkerId].filter((id): id is string => id !== null)
  let performers = null
  let thinkers = null

  if (participantIds.length > 0) {
    const { data: participantsData } = await supabase
      .from('participants')
      .select('id, name, gender')
      .in('id', participantIds)

    if (participantsData) {
      performers = participantsData.find(p => p.id === performerId) || null
      thinkers = participantsData.find(p => p.id === thinkerId) || null
    }
  }

  const data: AssignmentWithDetails = {
    ...assignmentData,
    tasks: taskData as any,
    performers,
    thinkers,
  }

  return { data, error: null }
}

/**
 * Update an assignment
 */
export async function updateAssignment(
  assignmentId: string,
  performerId: string | null,
  thinkerId: string | null,
  frequencyPerWeek: number | null
) {
  // Update assignment
  const { data: assignmentData, error: updateError } = await supabase
    .from('assignments')
    .update({
      performer_id: performerId,
      thinker_id: thinkerId,
      frequency_per_week: frequencyPerWeek, // null for one-time tasks, number for frequent tasks
    })
    .eq('id', assignmentId)
    .select('*')
    .single()

  if (updateError || !assignmentData) {
    return { data: null, error: updateError }
  }

  // Fetch task with template
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(`
      id,
      household_id,
      template_id,
      performer_points,
      mental_load_points,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `)
    .eq('id', assignmentData.task_id)
    .single()

  if (taskError || !taskData) {
    return { data: null, error: taskError }
  }

  // Fetch participants
  const participantIds = [performerId, thinkerId].filter((id): id is string => id !== null)
  let performers = null
  let thinkers = null

  if (participantIds.length > 0) {
    const { data: participantsData } = await supabase
      .from('participants')
      .select('id, name, gender')
      .in('id', participantIds)

    if (participantsData) {
      performers = participantsData.find(p => p.id === performerId) || null
      thinkers = participantsData.find(p => p.id === thinkerId) || null
    }
  }

  const data: AssignmentWithDetails = {
    ...assignmentData,
    tasks: taskData as any,
    performers,
    thinkers,
  }

  return { data, error: null }
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  return { error }
}

/**
 * Delete all assignments for a household
 */
export async function deleteAllAssignmentsForHousehold(householdId: string) {
  // First, get all task IDs for this household
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('id')
    .eq('household_id', householdId)

  if (tasksError || !tasksData) {
    return { error: tasksError }
  }

  const taskIds = tasksData.map(t => t.id)

  if (taskIds.length === 0) {
    return { error: null } // No tasks, so no assignments to delete
  }

  // Delete all assignments for these tasks
  const { error } = await supabase
    .from('assignments')
    .delete()
    .in('task_id', taskIds)

  return { error }
}

