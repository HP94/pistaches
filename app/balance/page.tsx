'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHousehold } from '@/lib/hooks/useHousehold'
import { getParticipants, type Participant } from '@/lib/supabase/participants'
import { getDeclarationsBetweenDates } from '@/lib/supabase/taskDeclarations'
import { translateGender } from '@/lib/translations'
import { formatLocalDate } from '@/components/TaskDayPicker'
import TaskRangePicker from '@/components/TaskRangePicker'
import { aggregateDeclarationBalances, type ParticipantPointsRange } from '@/lib/v3/balanceAggregate'
import { buildPairwiseComparisons, type PairwisePhrase } from '@/lib/v3/balanceComparison'
import { isValidDeclarationDateRange } from '@/lib/v3/dateRange'
import { PERFORMER_POINTS_CLASS, THINKER_POINTS_CLASS } from '@/lib/taskPickerUi'

function phraseToneClass(tone: PairwisePhrase['tone']): string {
  if (tone === 'more') return 'font-semibold text-[#5a8f45]'
  if (tone === 'less') return 'font-semibold text-red-600'
  return 'font-semibold text-[#6B7280]'
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export default function BalancePage() {
  const router = useRouter()
  const { currentHousehold, loading: householdLoading } = useHousehold()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [fromDate, setFromDate] = useState(() => formatLocalDate(startOfMonth(new Date())))
  const [toDate, setToDate] = useState(() => formatLocalDate(endOfMonth(new Date())))
  const [rows, setRows] = useState<ParticipantPointsRange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'balance' | 'comparison'>('balance')

  const loadData = useCallback(async () => {
    if (!currentHousehold) return
    setLoading(true)
    setError(null)
    try {
      const [pRes, dRes] = await Promise.all([
        getParticipants(currentHousehold.id),
        getDeclarationsBetweenDates(currentHousehold.id, fromDate, toDate),
      ])
      if (pRes.error) throw pRes.error
      if (dRes.error) throw dRes.error
      const plist = pRes.data || []
      setParticipants(plist)
      const ids = plist.map((p) => p.id)
      setRows(aggregateDeclarationBalances(dRes.data || [], ids))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [currentHousehold, fromDate, toDate])

  useEffect(() => {
    if (!householdLoading && !currentHousehold) {
      router.push('/select-household')
    } else if (currentHousehold) {
      void loadData()
    }
  }, [currentHousehold, householdLoading, router, loadData])

  const merged = participants.map((p) => {
    const r = rows.find((x) => x.participantId === p.id)
    return {
      participant: p,
      performerPoints: r?.performerPoints ?? 0,
      mentalLoadPoints: r?.mentalLoadPoints ?? 0,
      totalPoints: r?.totalPoints ?? 0,
    }
  })

  const sorted = [...merged].sort((a, b) => b.totalPoints - a.totalPoints)
  const total = sorted.reduce((s, b) => s + b.totalPoints, 0)
  const pairwise =
    sorted.length > 1
      ? buildPairwiseComparisons(
          sorted.map((b) => ({
            id: b.participant.id,
            name: b.participant.name,
            totalPoints: b.totalPoints,
          }))
        )
      : []

  if (householdLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <p className="text-[#6B7280]">Chargement…</p>
      </div>
    )
  }

  if (!currentHousehold) return null

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-[#1F2937]">
          Équilibre du foyer « {currentHousehold.name} »
        </h1>
        <div className="mt-4">
          <TaskRangePicker
            from={fromDate}
            to={toDate}
            onChange={(from, to) => {
              setFromDate(from)
              setToDate(to)
            }}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {!isValidDeclarationDateRange(fromDate, toDate) && (
          <p className="mt-4 text-sm text-amber-700">La date de début doit être antérieure ou égale à la date de fin.</p>
        )}

        {isValidDeclarationDateRange(fromDate, toDate) && (
          <>
            <div className="mt-6 mb-4 flex gap-2 border-b border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setActiveTab('balance')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'balance'
                    ? 'border-b-2 border-[#93C572] text-[#1F2937]'
                    : 'text-[#6B7280]'
                }`}
              >
                Répartition
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comparison')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'comparison'
                    ? 'border-b-2 border-[#93C572] text-[#1F2937]'
                    : 'text-[#6B7280]'
                }`}
              >
                Comparaison
              </button>
            </div>

            {sorted.length === 0 ? (
              <p className="text-[#6B7280]">Aucun membre.</p>
            ) : (
              <>
                <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-white p-6">
                  <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Résumé</h2>
                  <p className="text-sm text-[#6B7280]">Total points (plage) : {Math.round(total)}</p>
                </div>

                {activeTab === 'balance' && (
                  <div className="space-y-4">
                    {sorted.map((b) => (
                        <div key={b.participant.id} className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-[#1F2937]">{b.participant.name}</h3>
                            <span className="text-sm text-[#6B7280]">
                              ({translateGender(b.participant.gender)})
                            </span>
                          </div>
                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div>
                              <p className="text-sm text-[#6B7280]">Points réalisation</p>
                              <p className={`text-lg font-semibold ${PERFORMER_POINTS_CLASS}`}>
                                {b.performerPoints} pts
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[#6B7280]">Charge mentale</p>
                              <p className={`text-lg font-semibold ${THINKER_POINTS_CLASS}`}>
                                {b.mentalLoadPoints} pts
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[#6B7280]">Total</p>
                              <p className="text-2xl font-bold text-[#1F2937]">{b.totalPoints} pts</p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                )}

                {activeTab === 'comparison' && sorted.length > 1 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                      <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Comparaison</h2>
                      <div className="space-y-3">
                        {sorted.map((b) => {
                          const maxPts = sorted[0]?.totalPoints || 1
                          const pct = maxPts > 0 ? (b.totalPoints / maxPts) * 100 : 0
                          return (
                            <div key={b.participant.id}>
                              <div className="mb-1 flex justify-between text-sm">
                                <span className="text-[#6B7280]">{b.participant.name}</span>
                                <span className="text-[#6B7280]">{b.totalPoints} pts</span>
                              </div>
                              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#93C572] to-[#8B5CF6]"
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                      <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Écarts entre membres</h2>
                      <div className="space-y-4">
                        {pairwise.map((entry) => (
                          <div
                            key={entry.memberId}
                            className="rounded-lg border border-[#E5E7EB] bg-[#FAFAF8] p-4"
                          >
                            <p className="mb-2 text-lg font-semibold text-[#1F2937]">{entry.memberName}</p>
                            <p className="text-sm text-[#6B7280]">
                              {entry.phrases.map((phrase, idx) => (
                                <span key={`${entry.memberId}-${idx}`}>
                                  <span className={phraseToneClass(phrase.tone)}>{phrase.text}</span>
                                  {idx < entry.phrases.length - 1 ? ' et ' : null}
                                </span>
                              ))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
