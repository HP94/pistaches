'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, type Household } from '@/lib/supabase/households'

interface HouseholdSelectorProps {
  currentHouseholdId: string | null
  onHouseholdChange: (householdId: string) => void
}

export default function HouseholdSelector({ currentHouseholdId, onHouseholdChange }: HouseholdSelectorProps) {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadHouseholds = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data, error } = await getUserHouseholds(user.id)
        if (!error && data) {
          setHouseholds(data)
          // If no current household selected, select the first one
          if (!currentHouseholdId && data.length > 0) {
            onHouseholdChange(data[0].id)
          }
        }
      }
      setLoading(false)
    }
    loadHouseholds()
  }, [currentHouseholdId, onHouseholdChange])

  if (loading) {
    return <div className="text-sm text-[#6B7280]">Chargement...</div>
  }

  if (households.length === 0) {
    return null
  }

  if (households.length === 1) {
    return (
      <div className="text-sm text-[#6B7280]">
        {households[0].name}
      </div>
    )
  }

  return (
    <select
      value={currentHouseholdId || ''}
      onChange={(e) => onHouseholdChange(e.target.value)}
      className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/30"
    >
      {households.map((household) => (
        <option key={household.id} value={household.id}>
          {household.name}
        </option>
      ))}
    </select>
  )
}

