'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHousehold } from '@/lib/hooks/useHousehold'
import { getParticipants, type Participant } from '@/lib/supabase/participants'
import { getAssignments, type AssignmentWithDetails } from '@/lib/supabase/assignments'
import { translateGender } from '@/lib/translations'

interface ParticipantBalance {
  participant: Participant
  performerPointsWeekly: number
  mentalLoadPointsWeekly: number
  totalPointsWeekly: number
  performerPointsMonthly: number
  mentalLoadPointsMonthly: number
  totalPointsMonthly: number
}

export default function BalancePage() {
  const router = useRouter()
  const { currentHousehold, loading: householdLoading } = useHousehold()
  
  const [participants, setParticipants] = useState<Participant[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [balances, setBalances] = useState<ParticipantBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [activeTab, setActiveTab] = useState<'balance' | 'comparison'>('balance')

  useEffect(() => {
    if (!householdLoading && !currentHousehold) {
      router.push('/select-household')
    } else if (currentHousehold) {
      loadData()
    }
  }, [currentHousehold, householdLoading, router])

  const loadData = async () => {
    if (!currentHousehold) return
    
    setLoading(true)
    setError(null)
    try {
      const [participantsResult, assignmentsResult] = await Promise.all([
        getParticipants(currentHousehold.id),
        getAssignments(currentHousehold.id),
      ])

      if (participantsResult.error) throw participantsResult.error
      if (assignmentsResult.error) throw assignmentsResult.error

      setParticipants(participantsResult.data || [])
      setAssignments(assignmentsResult.data || [])
      
      // Calculate balances
      calculateBalances(participantsResult.data || [], assignmentsResult.data || [])
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const calculateBalances = (participantsList: Participant[], assignmentsList: AssignmentWithDetails[]) => {
    const balancesMap = new Map<string, ParticipantBalance>()

    // Initialize balances
    participantsList.forEach(participant => {
      balancesMap.set(participant.id, {
        participant,
        performerPointsWeekly: 0,
        mentalLoadPointsWeekly: 0,
        totalPointsWeekly: 0,
        performerPointsMonthly: 0,
        mentalLoadPointsMonthly: 0,
        totalPointsMonthly: 0,
      })
    })

    // Calculate points from assignments
    assignmentsList.forEach(assignment => {
      const task = assignment.tasks
      const performerPoints = task.performer_points ?? task.task_templates.default_points
      const mentalLoadPoints = task.mental_load_points ?? task.task_templates.default_mental_load_points
      
      // Check if this is a one-time task (frequency_per_week is null)
      const isOneTimeTask = assignment.frequency_per_week === null
      
      if (isOneTimeTask) {
        // One-time tasks: count once for both weekly and monthly (no multiplication)
        const weeklyPerformerPoints = performerPoints
        const weeklyMentalLoadPoints = mentalLoadPoints
        const monthlyPerformerPoints = performerPoints // Same as weekly, not multiplied
        const monthlyMentalLoadPoints = mentalLoadPoints // Same as weekly, not multiplied

        // Add performer points
        if (assignment.performer_id) {
          const balance = balancesMap.get(assignment.performer_id)
          if (balance) {
            balance.performerPointsWeekly += weeklyPerformerPoints
            balance.performerPointsMonthly += monthlyPerformerPoints
            balance.totalPointsWeekly += weeklyPerformerPoints
            balance.totalPointsMonthly += monthlyPerformerPoints
          }
        }

        // Add mental load points
        if (assignment.thinker_id) {
          const balance = balancesMap.get(assignment.thinker_id)
          if (balance) {
            balance.mentalLoadPointsWeekly += weeklyMentalLoadPoints
            balance.mentalLoadPointsMonthly += monthlyMentalLoadPoints
            balance.totalPointsWeekly += weeklyMentalLoadPoints
            balance.totalPointsMonthly += monthlyMentalLoadPoints
          }
        }
      } else {
        // Frequent tasks: multiply by frequency and then by 4 for monthly
        // At this point, frequency_per_week is guaranteed to be a number (not null)
        const frequency = assignment.frequency_per_week!
        const weeklyPerformerPoints = performerPoints * frequency
        const weeklyMentalLoadPoints = mentalLoadPoints * frequency
        
        // Points per month = weekly points * 4 weeks
        const monthlyPerformerPoints = weeklyPerformerPoints * 4
        const monthlyMentalLoadPoints = weeklyMentalLoadPoints * 4

        // Add performer points
        if (assignment.performer_id) {
          const balance = balancesMap.get(assignment.performer_id)
          if (balance) {
            balance.performerPointsWeekly += weeklyPerformerPoints
            balance.performerPointsMonthly += monthlyPerformerPoints
            balance.totalPointsWeekly += weeklyPerformerPoints
            balance.totalPointsMonthly += monthlyPerformerPoints
          }
        }

        // Add mental load points
        if (assignment.thinker_id) {
          const balance = balancesMap.get(assignment.thinker_id)
          if (balance) {
            balance.mentalLoadPointsWeekly += weeklyMentalLoadPoints
            balance.mentalLoadPointsMonthly += monthlyMentalLoadPoints
            balance.totalPointsWeekly += weeklyMentalLoadPoints
            balance.totalPointsMonthly += monthlyMentalLoadPoints
          }
        }
      }
    })

    // Convert to array and sort by total points (descending) - using weekly for sorting
    const balancesArray = Array.from(balancesMap.values())
      .sort((a, b) => b.totalPointsWeekly - a.totalPointsWeekly)

    setBalances(balancesArray)
  }

  const getTotalPoints = () => {
    if (balances.length === 0) return 0
    return balances.reduce((sum, b) => sum + (period === 'weekly' ? b.totalPointsWeekly : b.totalPointsMonthly), 0)
  }

  const getAveragePoints = () => {
    if (balances.length === 0) return 0
    const total = getTotalPoints()
    return total / balances.length
  }

  const getDifferences = () => {
    const average = getAveragePoints()
    return balances.map(balance => ({
      ...balance,
      difference: (period === 'weekly' ? balance.totalPointsWeekly : balance.totalPointsMonthly) - average,
    }))
  }

  if (householdLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <p className="text-[#6B7280]">Chargement...</p>
      </div>
    )
  }


  if (!currentHousehold) {
    return null
  }

  const differences = getDifferences()
  const total = getTotalPoints()
  const average = getAveragePoints()

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8">
      <div className="mx-auto max-w-4xl">
<div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#1F2937]">
                    Équilibre du foyer<br />
                    &quot;{currentHousehold.name}&quot;
                  </h1>
                  <p className="mt-2 text-[#6B7280]">
                    Répartition du travail entre les membres
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-sm text-[#6B7280]">Période :</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly')}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-[#1F2937] focus:border-[#93C572] focus:outline-none focus:ring-2 focus:ring-[#93C572]/20"
                    >
                      <option value="weekly">Par semaine</option>
                      <option value="monthly">Par mois</option>
                    </select>
                  </div>
                </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        {balances.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-[#6B7280]">Aucune assignation de tâche. Commencez par assigner des tâches aux membres.</p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-[#1F2937]">Résumé</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[#6B7280]">Total de points ({period === 'weekly' ? 'semaine' : 'mois'})</p>
                  <p className="text-2xl font-bold text-[#1F2937]">{total.toFixed(0)} pts</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Nombre de membres</p>
                  <p className="text-2xl font-bold text-[#1F2937]">{balances.length}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-[#E5E7EB]">
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'balance'
                    ? 'border-b-2 border-[#93C572] text-[#8B5CF6]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Répartition
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'border-b-2 border-[#93C572] text-[#8B5CF6]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Comparaison
              </button>
            </div>

            {/* Balance Tab */}
            {activeTab === 'balance' && (
              <>

                {/* Balances List */}
                <div className="space-y-4">
                  {differences.map((balance) => {
                    return (
                      <div
                        key={balance.participant.id}
                        className="rounded-lg border border-[#E5E7EB] bg-white p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-[#1F2937]">
                                {balance.participant.name}
                              </h3>
                              <span className="text-sm text-[#6B7280]">
                                ({translateGender(balance.participant.gender)})
                              </span>
                            </div>
                            
                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                              <div>
                                <p className="text-sm text-[#6B7280]">Points réalisation</p>
                                <p className="text-lg font-semibold text-[#8B5CF6]">
                                  {period === 'weekly' 
                                    ? `${balance.performerPointsWeekly.toFixed(0)} pts/sem`
                                    : `${balance.performerPointsMonthly.toFixed(0)} pts/mois`}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-[#6B7280]">Points charge mentale</p>
                                <p className="text-lg font-semibold text-purple-400">
                                  {period === 'weekly'
                                    ? `${balance.mentalLoadPointsWeekly.toFixed(0)} pts/sem`
                                    : `${balance.mentalLoadPointsMonthly.toFixed(0)} pts/mois`}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-[#6B7280]">Total</p>
                                <p className="text-2xl font-bold text-[#1F2937]">
                                  {period === 'weekly'
                                    ? `${balance.totalPointsWeekly.toFixed(0)} pts/sem`
                                    : `${balance.totalPointsMonthly.toFixed(0)} pts/mois`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full bg-gradient-to-r from-[#93C572] to-[#8B5CF6] transition-all"
                              style={{
                                width: `${Math.min(((period === 'weekly' ? balance.totalPointsWeekly : balance.totalPointsMonthly) / (average * 2)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
              <>
                {/* Comparison Chart */}
                {differences.length > 1 && (
                  <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#1F2937]">Graphique de comparaison</h2>
                    <div className="space-y-3">
                      {differences
                        .sort((a, b) => (period === 'weekly' ? b.totalPointsWeekly - a.totalPointsWeekly : b.totalPointsMonthly - a.totalPointsMonthly))
                        .map((balance, index) => {
                          const maxPoints = period === 'weekly' ? differences[0].totalPointsWeekly : differences[0].totalPointsMonthly
                          const currentPoints = period === 'weekly' ? balance.totalPointsWeekly : balance.totalPointsMonthly
                          const percentage = maxPoints > 0 ? (currentPoints / maxPoints) * 100 : 0
                          
                          return (
                            <div key={balance.participant.id}>
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="text-[#6B7280]">{balance.participant.name}</span>
                                <span className="text-[#6B7280]">
                                  {currentPoints.toFixed(0)} pts{period === 'weekly' ? '/sem' : '/mois'}
                                </span>
                              </div>
                              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full bg-gradient-to-r from-[#93C572] to-[#8B5CF6] transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Differences between members */}
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-[#1F2937]">Écarts entre membres</h2>
                  <div className="space-y-4">
                    {differences.map((balanceA) => {
                      const pointsA = period === 'weekly' ? balanceA.totalPointsWeekly : balanceA.totalPointsMonthly
                      const comparisons: Array<{ member: string; diff: number; isMore: boolean; isEqual: boolean }> = []
                      
                      differences.forEach((balanceB) => {
                        if (balanceA.participant.id !== balanceB.participant.id) {
                          const pointsB = period === 'weekly' ? balanceB.totalPointsWeekly : balanceB.totalPointsMonthly
                          const diff = pointsA - pointsB
                          comparisons.push({
                            member: balanceB.participant.name,
                            diff: Math.abs(diff),
                            isMore: diff > 0,
                            isEqual: diff === 0,
                          })
                        }
                      })

                      if (comparisons.length === 0) return null

                      return (
                        <div key={balanceA.participant.id} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
                          <p className="text-lg font-semibold text-[#1F2937] mb-2">
                            {balanceA.participant.name}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            {comparisons.map((comp, idx) => (
                              <span key={idx}>
                                {comp.isEqual ? (
                                  <>
                                    est <span className="font-semibold text-green-400">à l'équilibre</span> avec {comp.member}
                                  </>
                                ) : comp.isMore ? (
                                  <>
                                    fait <span className="font-semibold text-purple-400">plus {comp.diff.toFixed(0)} pts</span> que {comp.member}
                                  </>
                                ) : (
                                  <>
                                    fait <span className="font-semibold text-red-400">moins {comp.diff.toFixed(0)} pts</span> que {comp.member}
                                  </>
                                )}
                                {idx < comparisons.length - 1 && ' et '}
                              </span>
                            ))}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
