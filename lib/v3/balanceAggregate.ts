import type { TaskDeclarationWithRelations } from '@/lib/supabase/taskDeclarations'

export type ParticipantPointsRange = {
  participantId: string
  performerPoints: number
  mentalLoadPoints: number
  totalPoints: number
}

/**
 * Arrondi à l’entier le plus proche (pas de décimales).
 * > x,0 et < x,5 → x ; ≥ x,5 et < x+1 → x+1 (ex. 7,4→7, 7,5→8, 13,333…→13).
 */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value)
}

/**
 * Part égale par personne : round(total / count) pour chacun.
 * La somme des parts peut différer du total de la tâche (ex. 40÷3 → 13×3 = 39).
 */
export function sharePerPersonRounded(total: number, count: number): number {
  if (count <= 0) return 0
  return roundHalfUp(total / count)
}

/** Chaque participant coché reçoit la même part arrondie. */
function splitAmongParticipantIds(total: number, participantIds: string[]): Map<string, number> {
  const share = sharePerPersonRounded(total, participantIds.length)
  const map = new Map<string, number>()
  for (const id of participantIds) {
    map.set(id, share)
  }
  return map
}

/** Total points (réalisation + charge) crédités à un membre sur une liste de déclarations. */
export function participantTotalInDeclarations(
  participantId: string,
  declarations: TaskDeclarationWithRelations[]
): number {
  let sum = 0
  for (const d of declarations) {
    const perfIds = (d.task_declaration_performers || []).map((x) => x.participant_id)
    const thinkIds = (d.task_declaration_thinkers || []).map((x) => x.participant_id)
    const perfMap = splitAmongParticipantIds(d.performer_points, perfIds)
    const thinkMap = splitAmongParticipantIds(d.mental_load_points, thinkIds)
    sum += perfMap.get(participantId) ?? 0
    sum += thinkMap.get(participantId) ?? 0
  }
  return sum
}

/** Agrège les points par membre (somme des parts arrondies sur chaque déclaration). */
export function aggregateDeclarationBalances(
  declarations: TaskDeclarationWithRelations[],
  participantIds: string[]
): ParticipantPointsRange[] {
  const map = new Map<string, { perf: number; mental: number }>()
  for (const id of participantIds) {
    map.set(id, { perf: 0, mental: 0 })
  }

  for (const d of declarations) {
    const perfIds = (d.task_declaration_performers || []).map((x) => x.participant_id)
    const thinkIds = (d.task_declaration_thinkers || []).map((x) => x.participant_id)

    const perfShares = splitAmongParticipantIds(d.performer_points, perfIds)
    for (const [pid, pts] of perfShares) {
      const row = map.get(pid)
      if (row) row.perf += pts
    }

    const mentalShares = splitAmongParticipantIds(d.mental_load_points, thinkIds)
    for (const [pid, pts] of mentalShares) {
      const row = map.get(pid)
      if (row) row.mental += pts
    }
  }

  return participantIds.map((participantId) => {
    const row = map.get(participantId) ?? { perf: 0, mental: 0 }
    return {
      participantId,
      performerPoints: row.perf,
      mentalLoadPoints: row.mental,
      totalPoints: row.perf + row.mental,
    }
  })
}
