'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getUserHouseholds, createHousehold, joinHouseholdByCode, type Household } from '@/lib/supabase/households'
import { createParticipant } from '@/lib/supabase/participants'

export default function SelectHouseholdPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [createHouseholdName, setCreateHouseholdName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)
    try {
      const { data: household, error } = await createHousehold(userId, createHouseholdName || 'Mon foyer')
      if (error) throw error

      // Create participant for the user in this household
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'
        await createParticipant(household.id, userName, 'neutral', user.id)
      }

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du foyer')
      setLoading(false)
    }
  }

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur'
      const { data: household, error } = await joinHouseholdByCode(
        userId,
        joinCode,
        userName,
        'neutral'
      )
      if (error) throw error

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la jointure du foyer')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 px-6 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Equal Housing</h1>
          <p className="mt-2 text-slate-400">
            Créez ou rejoignez un foyer pour commencer
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {!showJoinForm && !showCreateForm && (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Join Household Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white mb-4">Rejoindre un foyer</h2>
              <p className="text-slate-400 mb-6">
                Vous avez reçu un code d'invitation ? Rejoignez un foyer existant.
              </p>
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-600"
              >
                Rejoindre avec un code
              </button>
            </div>

            {/* Create Household Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white mb-4">Créer un foyer</h2>
              <p className="text-slate-400 mb-6">
                Créez un nouveau foyer et invitez d'autres personnes à vous rejoindre.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-lg border border-teal-500/50 bg-teal-500/10 px-6 py-3 font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
              >
                Créer un foyer
              </button>
            </div>
          </div>
        )}

        {showJoinForm && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Rejoindre un foyer</h2>
            <form onSubmit={handleJoinHousehold} className="space-y-4">
              <div>
                <label htmlFor="joinCode" className="block text-sm font-medium text-slate-300 mb-2">
                  Code d'invitation
                </label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono uppercase text-center text-2xl tracking-wider"
                  placeholder="ABC123"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Rejoindre...' : 'Rejoindre'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false)
                    setJoinCode('')
                    setError(null)
                  }}
                  className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        )}

        {showCreateForm && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Créer un foyer</h2>
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              <div>
                <label htmlFor="householdName" className="block text-sm font-medium text-slate-300 mb-2">
                  Nom du foyer
                </label>
                <input
                  id="householdName"
                  type="text"
                  value={createHouseholdName}
                  onChange={(e) => setCreateHouseholdName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Mon foyer"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer le foyer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateHouseholdName('')
                    setError(null)
                  }}
                  className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

