'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, type Household } from '@/lib/supabase/households'
import { pickHouseholdFromList, setStoredHouseholdId } from '@/lib/currentHouseholdStorage'
import HouseholdSwitcher from '@/components/HouseholdSwitcher'
import AddToHomeScreenDrawer from '@/components/AddToHomeScreenDrawer'

export default function Home() {
  const router = useRouter()
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyCode = async () => {
    if (currentHousehold?.invitation_code) {
      await navigator.clipboard.writeText(currentHousehold.invitation_code)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // getSession() is faster than getUser() (no extra Auth API round-trip)
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user ?? null

        if (!user) {
          router.replace('/login')
          return
        }

        if (cancelled) return
        setUserId(user.id)

        const { data: households, error } = await getUserHouseholds(user.id)

        if (cancelled) return

        if (error || !households || households.length === 0) {
          router.replace('/select-household')
          return
        }

        setCurrentHousehold(pickHouseholdFromList(households, user.id))
      } catch (e) {
        console.error('Home init error:', e)
        router.replace('/login')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleHouseholdChange = (household: Household) => {
    if (userId) setStoredHouseholdId(userId, household.id)
    setCurrentHousehold(household)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center text-[#6B7280]">Chargement...</div>
      </div>
    )
  }

  if (!currentHousehold) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] px-6 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <img src="/pistaches-logo.svg" alt="Pistâches" className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
          </Link>
          <h1 className="text-5xl font-bold text-[#93C572] sm:text-6xl">
            Pistâches
          </h1>
          <p className="text-lg text-[#6B7280] sm:text-xl">
            Suivez et visualisez la répartition des tâches ménagères
          </p>
        </div>

        {/* Household Info Card */}
        <div className="relative rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          {/* Changer de foyer button - top right */}
          <div className="absolute top-4 right-4">
            <HouseholdSwitcher
              currentHousehold={currentHousehold}
              onHouseholdChange={handleHouseholdChange}
            />
          </div>
          
          {/* Foyer actif label */}
          <p className="text-sm text-[#6B7280] mb-1">Foyer actif</p>
          
          {/* Household name */}
          <p className="text-2xl font-bold text-[#1F2937] mb-4">{currentHousehold.name}</p>
          
          {/* Invitation Code - inline with label */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Code d'invitation</span>
            <div className="flex-1 rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-1.5">
              <span className="text-base font-bold text-[#93C572] font-mono">{currentHousehold.invitation_code}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="rounded-lg border border-[#E5E7EB] bg-gray-50 p-2 hover:bg-gray-100 transition-colors"
              title="Copier le code"
            >
              {copySuccess ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <AddToHomeScreenDrawer />

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/participants"
            className="block rounded-xl border border-[#93C572] bg-[#93C572]/10 px-6 py-4 text-center font-medium text-[#7bad5c] transition-colors hover:bg-[#93C572]/20"
          >
            Voir les membres
          </Link>
          <Link
            href="/tasks"
            className="block rounded-xl border border-[#E5E7EB] bg-white px-6 py-4 text-center font-medium text-[#1F2937] transition-colors hover:bg-gray-50 shadow-sm"
          >
            Voir les tâches
          </Link>
        </div>

        {/* Features - bloc explicatif unique */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="py-4 border-b border-[#E5E7EB]">
            <h3 className="mb-1 font-semibold text-[#1F2937]">Suivre les tâches</h3>
            <p className="text-sm text-[#6B7280]">
              Attribuez des points à chaque tâche ménagère
            </p>
          </div>
          <div className="py-4 border-b border-[#E5E7EB]">
            <h3 className="mb-1 font-semibold text-[#1F2937]">Charge mentale</h3>
            <p className="text-sm text-[#6B7280]">
              Prenez en compte le travail de planification et de réflexion
            </p>
          </div>
          <div className="py-4">
            <h3 className="mb-1 font-semibold text-[#1F2937]">Voir l'équilibre</h3>
            <p className="text-sm text-[#6B7280]">
              Visualisez qui en fait plus ou moins
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
