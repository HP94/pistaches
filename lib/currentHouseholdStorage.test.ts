import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Household } from '@/lib/supabase/households'

const ownerId = 'owner-1'

const households: Household[] = [
  { id: 'h1', owner: ownerId, name: 'A', invitation_code: 'x', created_at: '' },
  { id: 'h2', owner: ownerId, name: 'B', invitation_code: 'y', created_at: '' },
]

function stubWindowAndLocalStorage() {
  const backing: Record<string, string> = {}

  const ls = {
    clear() {
      Object.keys(backing).forEach((key) => delete backing[key])
    },
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(backing, key) ? backing[key] : null
    },
    setItem(key: string, value: string) {
      backing[key] = String(value)
    },
    removeItem(key: string) {
      delete backing[key]
    },
    key(index: number): string | null {
      return Object.keys(backing)[index] ?? null
    },
    get length() {
      return Object.keys(backing).length
    },
  }

  vi.stubGlobal('localStorage', ls)
  vi.stubGlobal('window', { localStorage: ls })
}

describe('currentHouseholdStorage', () => {
  const userId = 'user-1'

  beforeEach(async () => {
    stubWindowAndLocalStorage()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('setStoredHouseholdId / getStoredHouseholdId roundtrip', async () => {
    const {
      getStoredHouseholdId,
      setStoredHouseholdId,
    } = await import('@/lib/currentHouseholdStorage')

    expect(getStoredHouseholdId(userId)).toBeNull()
    setStoredHouseholdId(userId, 'h2')
    expect(getStoredHouseholdId(userId)).toBe('h2')
  })

  it('pickHouseholdFromList uses stored id when still in list', async () => {
    const { pickHouseholdFromList, setStoredHouseholdId } = await import('@/lib/currentHouseholdStorage')

    setStoredHouseholdId(userId, 'h2')
    expect(pickHouseholdFromList(households, userId).id).toBe('h2')
  })

  it('pickHouseholdFromList falls back to first and updates storage when stored id missing', async () => {
    const {
      getStoredHouseholdId,
      pickHouseholdFromList,
      setStoredHouseholdId,
    } = await import('@/lib/currentHouseholdStorage')

    setStoredHouseholdId(userId, 'gone')
    expect(pickHouseholdFromList(households, userId).id).toBe('h1')
    expect(getStoredHouseholdId(userId)).toBe('h1')
  })

  it('pickHouseholdFromList throws on empty list', async () => {
    const { pickHouseholdFromList } = await import('@/lib/currentHouseholdStorage')

    expect(() => pickHouseholdFromList([], userId)).toThrow('empty households')
  })
})
