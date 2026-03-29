import type { Household } from '@/lib/supabase/households'

const STORAGE_KEY_PREFIX = 'equal_housing:currentHouseholdId:'

export function getStoredHouseholdId(userId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY_PREFIX + userId)
  } catch {
    return null
  }
}

export function setStoredHouseholdId(userId: string, householdId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, householdId)
  } catch (e) {
    console.warn('Could not persist current household id', e)
  }
}

/**
 * Choisit le foyer courant : id stocké s’il est encore dans la liste, sinon premier foyer
 * (et synchronise le stockage sur ce fallback).
 */
export function pickHouseholdFromList(households: Household[], userId: string): Household {
  if (households.length === 0) {
    throw new Error('pickHouseholdFromList: empty households')
  }
  const stored = getStoredHouseholdId(userId)
  if (stored) {
    const found = households.find((h) => h.id === stored)
    if (found) return found
  }
  const fallback = households[0]
  setStoredHouseholdId(userId, fallback.id)
  return fallback
}
