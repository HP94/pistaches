/**
 * Règles métier v3 : matrice « a fait » / « a pensé » avant persistance.
 */

import type { TaskDeclarationWithRelations } from '@/lib/supabase/taskDeclarations'

export type MatrixState = Record<string, { performers: Set<string>; thinkers: Set<string> }>
/** templateId -> */

export function getTemplateIdsWithPerformers(matrix: MatrixState): string[] {
  return Object.entries(matrix)
    .filter(([, cell]) => cell.performers.size > 0)
    .map(([id]) => id)
}

export function matrixFromDeclarations(
  templateIds: string[],
  declarations: TaskDeclarationWithRelations[]
): MatrixState {
  const initial: MatrixState = {}
  for (const d of declarations) {
    initial[d.template_id] = {
      performers: new Set((d.task_declaration_performers || []).map((x) => x.participant_id)),
      thinkers: new Set((d.task_declaration_thinkers || []).map((x) => x.participant_id)),
    }
  }
  return buildMatrixFromTemplateIds(templateIds, initial)
}

export function validateDeclarationMatrix(
  templateIds: string[],
  matrix: MatrixState
): { ok: true } | { ok: false; message: string } {
  for (const tid of templateIds) {
    const cell = matrix[tid]
    if (!cell || cell.performers.size === 0) {
      return {
        ok: false,
        message: 'Chaque tâche doit avoir au moins un membre coché dans « A fait la tâche ».',
      }
    }
  }
  return { ok: true }
}

export function buildMatrixFromTemplateIds(
  templateIds: string[],
  initial?: MatrixState
): MatrixState {
  const out: MatrixState = {}
  for (const tid of templateIds) {
    out[tid] = {
      performers: new Set(initial?.[tid]?.performers ?? []),
      thinkers: new Set(initial?.[tid]?.thinkers ?? []),
    }
  }
  return out
}
