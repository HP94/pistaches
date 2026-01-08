// Functions to manage tasks
import { supabase } from './client'

export interface Task {
  id: string
  household_id: string
  template_id: string
  performer_points: number | null
  mental_load_points: number | null
  created_at: string
}

export interface TaskWithTemplate extends Task {
  task_templates: {
    id: string
    name: string
    category: string
    default_points: number
    default_mental_load_points: number
  }
}

/**
 * Get all tasks for a specific household
 */
export async function getTasks(householdId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })

  return { data: data as TaskWithTemplate[] | null, error }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
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

  return { data: data as TaskWithTemplate | null, error }
}

/**
 * Create a new task from a template
 * Points default to NULL (will use template defaults)
 */
export async function createTask(
  householdId: string,
  templateId: string,
  performerPoints: number | null = null,
  mentalLoadPoints: number | null = null
) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      household_id: householdId,
      template_id: templateId,
      performer_points: performerPoints,
      mental_load_points: mentalLoadPoints,
    })
    .select(`
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `)
    .single()

  return { data: data as TaskWithTemplate | null, error }
}

/**
 * Update task points
 */
export async function updateTaskPoints(
  taskId: string,
  performerPoints: number | null,
  mentalLoadPoints: number | null
) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      performer_points: performerPoints,
      mental_load_points: mentalLoadPoints,
    })
    .eq('id', taskId)
    .select(`
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `)
    .single()

  return { data: data as TaskWithTemplate | null, error }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  return { error }
}

/**
 * Get effective points for a task (uses template defaults if NULL)
 */
export async function getEffectiveTaskPoints(taskId: string) {
  const { data, error } = await supabase.rpc('get_task_points', {
    task_uuid: taskId,
  })

  if (error) {
    return { performerPoints: 0, mentalLoadPoints: 0, error }
  }

  return {
    performerPoints: (data?.[0]?.performer_points as number) || 0,
    mentalLoadPoints: (data?.[0]?.mental_load_points as number) || 0,
    error: null,
  }
}

