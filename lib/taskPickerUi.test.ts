import { describe, expect, it } from 'vitest'
import { sortCategoriesAlphabeticalFr } from '@/lib/taskPickerUi'
import type { TaskCategory } from '@/lib/supabase/taskTemplates'

describe('sortCategoriesAlphabeticalFr', () => {
  it('places other last regardless of alphabetical order', () => {
    const input: TaskCategory[] = ['other', 'cleaning', 'cooking', 'laundry']
    const sorted = sortCategoriesAlphabeticalFr(input)

    expect(sorted[sorted.length - 1]).toBe('other')
    expect(sorted).not.toEqual(input)
  })

  it('omits other when not in input', () => {
    const sorted = sortCategoriesAlphabeticalFr(['cleaning', 'cooking'])
    expect(sorted).not.toContain('other')
  })
})
