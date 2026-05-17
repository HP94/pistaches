import { describe, expect, it } from 'vitest'
import {
  buildMatrixFromTemplateIds,
  getTemplateIdsWithPerformers,
  validateDeclarationMatrix,
} from '@/lib/v3/declarationMatrix'

describe('validateDeclarationMatrix', () => {
  it('fails when a task has no performer', () => {
    const m = buildMatrixFromTemplateIds(['a', 'b'])
    m.a.performers.add('p1')
    expect(validateDeclarationMatrix(['a', 'b'], m).ok).toBe(false)
  })

  it('passes when every task has at least one performer (thinkers optional)', () => {
    const m = buildMatrixFromTemplateIds(['a', 'b'])
    m.a.performers.add('p1')
    m.b.performers.add('p2')
    expect(validateDeclarationMatrix(['a', 'b'], m)).toEqual({ ok: true })
  })
})

describe('getTemplateIdsWithPerformers', () => {
  it('returns only template ids with at least one performer', () => {
    const m = buildMatrixFromTemplateIds(['a', 'b', 'c'])
    m.a.performers.add('p1')
    m.c.performers.add('p2')
    expect(getTemplateIdsWithPerformers(m)).toEqual(['a', 'c'])
  })
})
