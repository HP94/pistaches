import { describe, expect, it } from 'vitest'
import {
  aggregateDeclarationBalances,
  participantTotalInDeclarations,
  roundHalfUp,
  sharePerPersonRounded,
} from '@/lib/v3/balanceAggregate'
import type { TaskDeclarationWithRelations } from '@/lib/supabase/taskDeclarations'

function dec(
  performerPoints: number,
  mentalLoadPoints: number,
  performers: string[],
  thinkers: string[]
): TaskDeclarationWithRelations {
  return {
    id: '1',
    household_id: 'h',
    template_id: 't',
    declared_on: '2026-01-01',
    performer_points: performerPoints,
    mental_load_points: mentalLoadPoints,
    created_at: '',
    task_templates: {
      id: 't',
      name: 'X',
      category: 'other',
      default_points: 0,
      default_mental_load_points: 0,
    },
    task_declaration_performers: performers.map((participant_id) => ({ participant_id })),
    task_declaration_thinkers: thinkers.map((participant_id) => ({ participant_id })),
  }
}

describe('roundHalfUp', () => {
  it('rounds with half-up rule', () => {
    expect(roundHalfUp(7.4)).toBe(7)
    expect(roundHalfUp(7.5)).toBe(8)
    expect(roundHalfUp(13.333)).toBe(13)
  })
})

describe('sharePerPersonRounded', () => {
  it('40 among 3 → 13 each (total credited 39, not 40)', () => {
    expect(sharePerPersonRounded(40, 3)).toBe(13)
    expect(sharePerPersonRounded(40, 3) * 3).toBe(39)
  })

  it('30 among 2 → 15 each', () => {
    expect(sharePerPersonRounded(30, 2)).toBe(15)
  })
})

describe('aggregateDeclarationBalances', () => {
  it('gives equal rounded share to each performer', () => {
    const r = aggregateDeclarationBalances([dec(40, 0, ['a', 'b', 'c'], [])], ['a', 'b', 'c'])
    expect(r.every((x) => x.performerPoints === 13)).toBe(true)
    expect(r.reduce((s, x) => s + x.performerPoints, 0)).toBe(39)
  })

  it('splits mental load among thinkers only', () => {
    const r = aggregateDeclarationBalances([dec(0, 20, ['a'], ['b'])], ['a', 'b'])
    const byId = Object.fromEntries(r.map((x) => [x.participantId, x]))
    expect(byId.a.mentalLoadPoints).toBe(0)
    expect(byId.b.mentalLoadPoints).toBe(20)
  })
})

describe('participantTotalInDeclarations', () => {
  it('matches aggregate total for equal rounded performer share', () => {
    const declarations = [dec(40, 0, ['a', 'b', 'c'], [])]
    expect(participantTotalInDeclarations('a', declarations)).toBe(13)
    const row = aggregateDeclarationBalances(declarations, ['a', 'b', 'c']).find(
      (x) => x.participantId === 'a'
    )
    expect(row?.totalPoints).toBe(participantTotalInDeclarations('a', declarations))
  })

  it('credits mental load to thinkers only', () => {
    const declarations = [dec(0, 20, ['a'], ['b'])]
    expect(participantTotalInDeclarations('a', declarations)).toBe(0)
    expect(participantTotalInDeclarations('b', declarations)).toBe(20)
  })

  it('sums across multiple declarations', () => {
    const declarations = [
      dec(30, 0, ['a'], []),
      dec(30, 0, ['a'], []),
    ]
    expect(participantTotalInDeclarations('a', declarations)).toBe(60)
  })
})
