import { supabase } from './client'
import type { TaskTemplate } from './taskTemplates'

export interface HouseholdFavoriteTask {
  id: string
  household_id: string
  template_id: string
  performer_points: number
  mental_load_points: number
  created_at: string
  updated_at: string
}

export type HouseholdFavoriteWithTemplate = HouseholdFavoriteTask & {
  task_templates: TaskTemplate
}

export async function getHouseholdFavorites(householdId: string) {
  const { data, error } = await supabase
    .from('household_favorite_tasks')
    .select(
      `
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      )
    `
    )
    .eq('household_id', householdId)
    .order('updated_at', { ascending: false })

  return { data: data as HouseholdFavoriteWithTemplate[] | null, error }
}

export async function upsertHouseholdFavorite(
  householdId: string,
  templateId: string,
  performerPoints: number,
  mentalLoadPoints: number
) {
  const { data, error } = await supabase
    .from('household_favorite_tasks')
    .upsert(
      {
        household_id: householdId,
        template_id: templateId,
        performer_points: performerPoints,
        mental_load_points: mentalLoadPoints,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'household_id,template_id' }
    )
    .select()
    .single()

  return { data: data as HouseholdFavoriteTask | null, error }
}

/** Remplace tous les favoris du foyer (ex. onboarding étape finale). */
export async function replaceHouseholdFavorites(
  householdId: string,
  rows: { templateId: string; performerPoints: number; mentalLoadPoints: number }[]
) {
  const { error: delErr } = await supabase
    .from('household_favorite_tasks')
    .delete()
    .eq('household_id', householdId)
  if (delErr) return { error: delErr }

  if (rows.length === 0) {
    return { error: null }
  }

  const { error } = await supabase.from('household_favorite_tasks').insert(
    rows.map((r) => ({
      household_id: householdId,
      template_id: r.templateId,
      performer_points: r.performerPoints,
      mental_load_points: r.mentalLoadPoints,
    }))
  )

  return { error }
}

export async function deleteHouseholdFavorite(householdId: string, templateId: string) {
  return supabase
    .from('household_favorite_tasks')
    .delete()
    .eq('household_id', householdId)
    .eq('template_id', templateId)
}
