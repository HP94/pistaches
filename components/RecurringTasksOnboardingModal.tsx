'use client'

import { useEffect, useMemo, useState } from 'react'
import { getTaskTemplates, type TaskCategory, type TaskTemplate } from '@/lib/supabase/taskTemplates'
import { replaceHouseholdFavorites } from '@/lib/supabase/householdFavorites'
import { markRecurringTasksOnboardingComplete } from '@/lib/supabase/households'
import { translateCategory, translateTaskName } from '@/lib/translations'
import { CATEGORY_EMOJIS, TASK_CATEGORIES_ALPHABETICAL_FR } from '@/lib/taskPickerUi'

type Step = 1 | 2

type Props = {
  householdId: string
  onCompleted: () => void
}

export default function RecurringTasksOnboardingModal({ householdId, onCompleted }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterCategories, setFilterCategories] = useState<Set<TaskCategory>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pointsById, setPointsById] = useState<Record<string, { p: number; m: number }>>({})

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error: e } = await getTaskTemplates()
      if (cancelled) return
      if (e) setError(e.message)
      setTemplates(data || [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredTemplates = useMemo(() => {
    if (filterCategories.size === 0) return templates
    return templates.filter((t) => filterCategories.has(t.category as TaskCategory))
  }, [templates, filterCategories])

  const toggleCategoryFilter = (c: TaskCategory) => {
    setFilterCategories((prev) => {
      const n = new Set(prev)
      if (n.has(c)) n.delete(c)
      else n.add(c)
      return n
    })
  }

  const toggleTask = (t: TaskTemplate) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(t.id)) n.delete(t.id)
      else n.add(t.id)
      return n
    })
  }

  const goStep2 = () => {
    const next: Record<string, { p: number; m: number }> = {}
    for (const id of selectedIds) {
      const t = templates.find((x) => x.id === id)
      if (t) next[id] = { p: t.default_points, m: t.default_mental_load_points }
    }
    setPointsById(next)
    setStep(2)
  }

  const finishWithFavorites = async () => {
    setSaving(true)
    setError(null)
    try {
      const rows = [...selectedIds].map((templateId) => ({
        templateId,
        performerPoints: pointsById[templateId]?.p ?? 0,
        mentalLoadPoints: pointsById[templateId]?.m ?? 0,
      }))
      const { error: favErr } = await replaceHouseholdFavorites(householdId, rows)
      if (favErr) throw favErr
      const { error: rpcErr } = await markRecurringTasksOnboardingComplete(householdId)
      if (rpcErr) throw rpcErr
      onCompleted()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur à la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const skip = async () => {
    setSaving(true)
    setError(null)
    try {
      const { error: rpcErr } = await markRecurringTasksOnboardingComplete(householdId)
      if (rpcErr) throw rpcErr
      onCompleted()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const selectedList = useMemo(
    () => [...selectedIds].map((id) => templates.find((t) => t.id === id)).filter(Boolean) as TaskTemplate[],
    [selectedIds, templates]
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] shadow-2xl"
      >
        <div className="shrink-0 border-b border-[#E5E7EB] bg-white px-5 py-4">
          <h2 id="onboarding-title" className="text-lg font-semibold text-[#1F2937]">
            {step === 1 ? 'Sélectionner vos tâches récurrentes' : 'Ajuster les points'}
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Étape {step} sur 2 — vous pourrez modifier ces favoris plus tard via les tâches.
          </p>
        </div>

        {error && (
          <div className="shrink-0 bg-red-50 px-5 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-[#6B7280]">Chargement des tâches…</p>
          ) : step === 1 ? (
            <>
              {selectedList.length > 0 && (
                <div className="mb-4 rounded-lg border border-[#93C572]/40 bg-[#93C572]/10 p-3">
                  <p className="mb-2 text-xs font-medium text-[#5a7d44]">Sélection ({selectedList.length})</p>
                  <ul className="flex flex-wrap gap-2">
                    {selectedList.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-full bg-white px-3 py-1 text-xs text-[#1F2937] shadow-sm"
                      >
                        {translateTaskName(t.name)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mb-2 text-xs font-medium text-[#6B7280]">Catégories (filtres, plusieurs possibles)</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {TASK_CATEGORIES_ALPHABETICAL_FR.map((c) => {
                  const on = filterCategories.has(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategoryFilter(c)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        on
                          ? 'border-[#93C572] bg-[#93C572]/15 text-[#1F2937]'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">{CATEGORY_EMOJIS[c]}</span>
                      {translateCategory(c)}
                    </button>
                  )
                })}
              </div>

              <p className="mb-2 text-xs font-medium text-[#6B7280]">Tâches</p>
              <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:max-h-80">
                {filteredTemplates.map((t) => {
                  const sel = selectedIds.has(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTask(t)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        sel
                          ? 'border-[#93C572] bg-[#93C572]/15 text-[#1F2937]'
                          : 'border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{CATEGORY_EMOJIS[t.category as TaskCategory]}</span>
                      {translateTaskName(t.name)}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {[...selectedIds].map((id) => {
                const t = templates.find((x) => x.id === id)
                if (!t) return null
                const pts = pointsById[id] ?? { p: t.default_points, m: t.default_mental_load_points }
                return (
                  <div key={id} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <p className="mb-3 text-sm font-medium text-[#1F2937]">{translateTaskName(t.name)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-[#6B7280]">
                        Points réalisation
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={10}
                          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-2 py-2 text-sm"
                          value={pts.p}
                          onChange={(e) =>
                            setPointsById((prev) => ({
                              ...prev,
                              [id]: { ...pts, p: Number(e.target.value) || 0 },
                            }))
                          }
                        />
                      </label>
                      <label className="text-xs text-[#6B7280]">
                        Points charge mentale
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={10}
                          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-2 py-2 text-sm"
                          value={pts.m}
                          onChange={(e) =>
                            setPointsById((prev) => ({
                              ...prev,
                              [id]: { ...pts, m: Number(e.target.value) || 0 },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-[#E5E7EB] bg-white px-5 py-4">
          {step === 1 ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => void skip()}
                className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#6B7280] hover:bg-gray-50 disabled:opacity-50"
              >
                Passer pour l’instant
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0 || saving}
                onClick={() => goStep2()}
                className="rounded-xl bg-[#93C572] px-4 py-3 text-sm font-medium text-white hover:bg-[#7bad5c] disabled:opacity-40"
              >
                Valider
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={saving}
                onClick={() => setStep(1)}
                className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#1F2937] hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void finishWithFavorites()}
                className="rounded-xl bg-[#93C572] px-4 py-3 text-sm font-medium text-white hover:bg-[#7bad5c] disabled:opacity-40"
              >
                Confirmer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
