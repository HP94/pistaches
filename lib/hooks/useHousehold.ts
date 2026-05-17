'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, type Household } from '@/lib/supabase/households'
import { pickHouseholdFromList, setStoredHouseholdId } from '@/lib/currentHouseholdStorage'

/**
 * Hook to check if user has a household and redirect if not
 */
export function useHousehold(redirectIfNone: boolean = true) {
  const router = useRouter()
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null)
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const loadHouseholds = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setHouseholds([])
      setCurrentHousehold(null)
      if (redirectIfNone) router.push('/login')
      setLoading(false)
      return
    }

    setUserId(user.id)

    try {
      const { data, error } = await getUserHouseholds(user.id)
      if (error) throw error

      if (!data || data.length === 0) {
        if (redirectIfNone) {
          router.push('/select-household')
        }
        setHouseholds([])
        setCurrentHousehold(null)
        setLoading(false)
        return
      }

      setHouseholds(data)
      const chosen = pickHouseholdFromList(data, user.id)
      setCurrentHousehold(chosen)
      setLoading(false)
    } catch (err) {
      console.error('Error loading households:', err)
      setLoading(false)
    }
  }, [router, redirectIfNone])

  useEffect(() => {
    void loadHouseholds()
  }, [loadHouseholds])

  const setCurrentHouseholdPersisted = useCallback(
    (household: Household) => {
      if (userId) setStoredHouseholdId(userId, household.id)
      setCurrentHousehold(household)
    },
    [userId]
  )

  return {
    currentHousehold,
    households,
    loading,
    userId,
    setCurrentHousehold: setCurrentHouseholdPersisted,
    refetchHouseholds: loadHouseholds,
  }
}
