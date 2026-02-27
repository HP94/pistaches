// Functions to manage task templates
import { supabase } from './client'

export interface TaskTemplate {
  id: string
  name: string
  category: string
  default_points: number
  default_mental_load_points: number
}

export type TaskCategory =
  | 'cleaning'
  | 'cooking'
  | 'parenting'
  | 'laundry'
  | 'shopping'
  | 'car_maintenance'
  | 'diy'
  | 'administrative'
  | 'other'

/**
 * Get all task templates
 */
export async function getTaskTemplates() {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return { data: data as TaskTemplate[] | null, error }
}

/**
 * Get task templates by category
 */
export async function getTaskTemplatesByCategory(category: TaskCategory) {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true })

  return { data: data as TaskTemplate[] | null, error }
}

/**
 * Get a single task template by ID
 */
export async function getTaskTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  return { data: data as TaskTemplate | null, error }
}

