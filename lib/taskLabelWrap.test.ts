import { describe, expect, it } from 'vitest'
import { wrapLabelByWords } from '@/lib/taskLabelWrap'

describe('wrapLabelByWords', () => {
  it('returns empty line for blank input', () => {
    expect(wrapLabelByWords('   ')).toEqual([''])
  })

  it('keeps short phrases on one line', () => {
    expect(wrapLabelByWords('Vaisselle du soir')).toEqual(['Vaisselle du soir'])
  })

  it('wraps at word boundaries near 20 characters', () => {
    const lines = wrapLabelByWords('Nettoyer la salle de bain', 20)
    expect(lines.every((l) => l.length <= 20 || l === 'bain')).toBe(true)
    expect(lines.join(' ')).toBe('Nettoyer la salle de bain')
  })

  it('puts an overlong word alone on its line', () => {
    const long = 'abcdefghijklmnopqrstuvwxyz'
    expect(wrapLabelByWords(long, 20)).toEqual([long])
  })
})
