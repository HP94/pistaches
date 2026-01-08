'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, type Household } from '@/lib/supabase/households'
import HouseholdSwitcher from '@/components/HouseholdSwitcher'

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
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserId(user.id)
      
      // Check if user has any households
      const { data: households, error } = await getUserHouseholds(user.id)
      
      if (error || !households || households.length === 0) {
        // No household, redirect to selection page
        router.push('/select-household')
        return
      }
      
      // Set current household (first one for now)
      setCurrentHousehold(households[0])
      setLoading(false)
    }
    
    init()
  }, [router])

  const handleHouseholdChange = (household: Household) => {
    setCurrentHousehold(household)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900">
        <div className="text-center text-slate-400">Chargement...</div>
      </div>
    )
  }

  if (!currentHousehold) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white sm:text-6xl">
            Equal Housing
          </h1>
          <p className="text-lg text-slate-300 sm:text-xl">
            Suivez et visualisez la répartition des tâches ménagères
          </p>
        </div>

        {/* Household Info Card */}
        <div className="relative rounded-lg border border-white/10 bg-white/5 p-6">
          {/* Changer de foyer button - top right */}
          <div className="absolute top-4 right-4">
            <HouseholdSwitcher
              currentHousehold={currentHousehold}
              onHouseholdChange={handleHouseholdChange}
            />
          </div>
          
          {/* Foyer actif label */}
          <p className="text-sm text-slate-400 mb-1">Foyer actif</p>
          
          {/* Household name */}
          <p className="text-2xl font-bold text-white mb-4">{currentHousehold.name}</p>
          
          {/* Invitation Code - inline with label */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Code d'invitation</span>
            <div className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-base font-bold text-teal-400 font-mono">{currentHousehold.invitation_code}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="rounded border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors"
              title="Copier le code"
            >
              {copySuccess ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/participants"
            className="block rounded-lg border border-teal-500/50 bg-teal-500/10 px-6 py-4 text-center font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
          >
            Voir les membres
          </Link>
          <Link
            href="/tasks"
            className="block rounded-lg border border-white/20 bg-white/5 px-6 py-4 text-center font-medium text-white transition-colors hover:bg-white/10"
          >
            Voir les tâches
          </Link>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3 pt-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">Suivre les tâches</h3>
            <p className="text-sm text-slate-400">
              Attribuez des points à chaque tâche ménagère
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">Charge mentale</h3>
            <p className="text-sm text-slate-400">
              Prenez en compte le travail de planification et de réflexion
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 font-semibold text-white">Voir l'équilibre</h3>
            <p className="text-sm text-slate-400">
              Visualisez qui en fait plus ou moins
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
