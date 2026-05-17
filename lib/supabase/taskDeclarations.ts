import { supabase } from './client'
import type { TaskTemplate } from './taskTemplates'

export interface TaskDeclaration {
  id: string
  household_id: string
  template_id: string
  declared_on: string
  performer_points: number
  mental_load_points: number
  created_at: string
}

export type TaskDeclarationWithTemplate = TaskDeclaration & {
  task_templates: TaskTemplate
}

export type TaskDeclarationWithRelations = TaskDeclarationWithTemplate & {
  task_declaration_performers: { participant_id: string }[]
  task_declaration_thinkers: { participant_id: string }[]
}

export async function getDeclarationsForDate(householdId: string, declaredOn: string) {
  const { data, error } = await supabase
    .from('task_declarations')
    .select(
      `
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      ),
      task_declaration_performers(participant_id),
      task_declaration_thinkers(participant_id)
    `
    )
    .eq('household_id', householdId)
    .eq('declared_on', declaredOn)
    .order('created_at', { ascending: false })

  return { data: data as TaskDeclarationWithRelations[] | null, error }
}

export async function getDeclarationsBetweenDates(
  householdId: string,
  fromDate: string,
  toDate: string
) {
  const { data, error } = await supabase
    .from('task_declarations')
    .select(
      `
      *,
      task_templates (
        id,
        name,
        category,
        default_points,
        default_mental_load_points
      ),
      task_declaration_performers(participant_id),
      task_declaration_thinkers(participant_id)
    `
    )
    .eq('household_id', householdId)
    .gte('declared_on', fromDate)
    .lte('declared_on', toDate)

  return { data: data as TaskDeclarationWithRelations[] | null, error }
}

export type DeclarationRowInput = {
  templateId: string
  performerPoints: number
  mentalLoadPoints: number
  performerParticipantIds: string[]
  thinkerParticipantIds: string[]
}

/**
 * Pour chaque ligne : upsert la déclaration (clé foyer+template+jour), remplace les liaisons performers/thinkers.
 */
export async function upsertDeclarationsForDay(
  householdId: string,
  declaredOn: string,
  rows: DeclarationRowInput[]
) {
  for (const row of rows) {
    const { data: dec, error: upErr } = await supabase
      .from('task_declarations')
      .upsert(
        {
          household_id: householdId,
          template_id: row.templateId,
          declared_on: declaredOn,
          performer_points: row.performerPoints,
          mental_load_points: row.mentalLoadPoints,
        },
        { onConflict: 'household_id,template_id,declared_on' }
      )
      .select('id')
      .single()

    if (upErr || !dec) {
      return { error: upErr || new Error('declaration upsert failed') }
    }

    const declarationId = dec.id as string

    const { error: delP } = await supabase
      .from('task_declaration_performers')
      .delete()
      .eq('declaration_id', declarationId)
    if (delP) return { error: delP }

    const { error: delT } = await supabase
      .from('task_declaration_thinkers')
      .delete()
      .eq('declaration_id', declarationId)
    if (delT) return { error: delT }

    if (row.performerParticipantIds.length > 0) {
      const { error: insP } = await supabase.from('task_declaration_performers').insert(
        row.performerParticipantIds.map((participant_id) => ({
          declaration_id: declarationId,
          participant_id,
        }))
      )
      if (insP) return { error: insP }
    }

    if (row.thinkerParticipantIds.length > 0) {
      const { error: insT } = await supabase.from('task_declaration_thinkers').insert(
        row.thinkerParticipantIds.map((participant_id) => ({
          declaration_id: declarationId,
          participant_id,
        }))
      )
      if (insT) return { error: insT }
    }
  }

  return { error: null }
}

export async function deleteDeclaration(declarationId: string) {
  return supabase.from('task_declarations').delete().eq('id', declarationId)
}

/**
 * Upsert les lignes fournies puis supprime les déclarations du jour dont le template
 * n’est plus dans rows (retrait d’une tâche ou décocher tous les performers).
 */
export async function syncDeclarationsForDay(
  householdId: string,
  declaredOn: string,
  rows: DeclarationRowInput[]
) {
  const { error: upErr } = await upsertDeclarationsForDay(householdId, declaredOn, rows)
  if (upErr) return { error: upErr }

  const { data: existing, error: fetchErr } = await getDeclarationsForDate(householdId, declaredOn)
  if (fetchErr) return { error: fetchErr }

  const kept = new Set(rows.map((r) => r.templateId))
  for (const dec of existing || []) {
    if (!kept.has(dec.template_id)) {
      const { error: delErr } = await deleteDeclaration(dec.id)
      if (delErr) return { error: delErr }
    }
  }

  return { error: null }
}
