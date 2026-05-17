import { describe, expect, it } from 'vitest'
import {
  filterDeclarationsByDateRange,
  isIsoDateInInclusiveRange,
  isValidDeclarationDateRange,
} from '@/lib/v3/dateRange'

type Dec = { declared_on: string; id: string }

describe('isValidDeclarationDateRange', () => {
  it('returns true when from <= to', () => {
    expect(isValidDeclarationDateRange('2026-01-01', '2026-01-31')).toBe(true)
    expect(isValidDeclarationDateRange('2026-01-15', '2026-01-15')).toBe(true)
  })

  it('returns false when from > to', () => {
    expect(isValidDeclarationDateRange('2026-02-01', '2026-01-31')).toBe(false)
  })
})

describe('isIsoDateInInclusiveRange', () => {
  it('includes dates within range', () => {
    expect(isIsoDateInInclusiveRange('2026-01-15', '2026-01-01', '2026-01-31')).toBe(true)
  })

  it('excludes dates outside range', () => {
    expect(isIsoDateInInclusiveRange('2026-02-01', '2026-01-01', '2026-01-31')).toBe(false)
  })

  it('includes boundary dates', () => {
    expect(isIsoDateInInclusiveRange('2026-01-01', '2026-01-01', '2026-01-31')).toBe(true)
    expect(isIsoDateInInclusiveRange('2026-01-31', '2026-01-01', '2026-01-31')).toBe(true)
  })
})

describe('filterDeclarationsByDateRange', () => {
  const decs: Dec[] = [
    { id: '1', declared_on: '2026-01-10' },
    { id: '2', declared_on: '2026-01-20' },
    { id: '3', declared_on: '2026-02-01' },
  ]

  it('filters declarations in inclusive range', () => {
    expect(filterDeclarationsByDateRange(decs, '2026-01-01', '2026-01-31')).toEqual([
      { id: '1', declared_on: '2026-01-10' },
      { id: '2', declared_on: '2026-01-20' },
    ])
  })

  it('returns empty array when from > to', () => {
    expect(filterDeclarationsByDateRange(decs, '2026-02-01', '2026-01-01')).toEqual([])
  })
})
