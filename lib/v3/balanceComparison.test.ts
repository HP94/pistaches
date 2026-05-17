import { describe, expect, it } from 'vitest'
import { buildPairwiseComparisons } from '@/lib/v3/balanceComparison'

describe('buildPairwiseComparisons', () => {
  it('compares two members with more and less', () => {
    const result = buildPairwiseComparisons([
      { id: 'a', name: 'Alice', totalPoints: 30 },
      { id: 'b', name: 'Bob', totalPoints: 10 },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]?.phrases[0]).toMatchObject({
      tone: 'more',
      text: 'fait 20 pts de plus que Bob',
    })
    expect(result[1]?.phrases[0]).toMatchObject({
      tone: 'less',
      text: 'fait 20 pts de moins que Alice',
    })
  })

  it('reports equilibrium when totals match', () => {
    const result = buildPairwiseComparisons([
      { id: 'a', name: 'Alice', totalPoints: 15 },
      { id: 'b', name: 'Bob', totalPoints: 15 },
    ])

    expect(result[0]?.phrases[0]).toMatchObject({
      tone: 'equal',
      text: "est à l'équilibre avec Bob",
    })
  })

  it('builds phrases for three members', () => {
    const result = buildPairwiseComparisons([
      { id: 'a', name: 'Alice', totalPoints: 10 },
      { id: 'b', name: 'Bob', totalPoints: 5 },
      { id: 'c', name: 'Claire', totalPoints: 0 },
    ])

    expect(result[0]?.phrases).toHaveLength(2)
    expect(result[1]?.phrases).toHaveLength(2)
    expect(result[2]?.phrases).toHaveLength(2)
  })
})
