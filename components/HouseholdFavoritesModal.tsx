'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TaskCategory, TaskTemplate } from '@/lib/supabase/taskTemplates'
import type { HouseholdFavoriteWithTemplate } from '@/lib/supabase/householdFavorites'
import { replaceHouseholdFavorites } from '@/lib/supabase/householdFavorites'
import { translateCategory, translateTaskName } from '@/lib/translations'
import { CATEGORY_EMOJIS, TASK_CATEGORIES_ALPHABETICAL_FR } from '@/lib/taskPickerUi'

type Props = {
  open: boolean
  onClose: () => void
  householdId: string
  templates: TaskTemplate[]
  favorites: HouseholdFavoriteWithTemplate[]
  onSaved: () => void
}

export default function HouseholdFavoritesModal({
  open,
  onClose,
  householdId,
  templates,
  favorites,
  onSaved,
}: Props) {
  const [filterCategories, setFilterCategories] = useState<Set<TaskCategory>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pointsById, setPointsById] = useState<Record<string, { p: number; m: number }>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const ids = new Set(favorites.map((f) => f.template_id))
    const pts: Record<string, { p: number; m: number }> = {}
    for (const f of favorites) {
      pts[f.template_id] = {
        p: f.performer_points,
        m: f.mental_load_points,
      }
    }
    setSelectedIds(ids)
    setPointsById(pts)
    setFilterCategories(new Set())
    setError(null)
  }, [open, favorites])

  const filteredTemplates = useMemo(() => {
    if (filterCategories.size === 0) return templates
    return templates.filter((t) => filterCategories.has(t.category as TaskCategory))
  }, [templates, filterCategories])

  const selectedList = useMemo(
    () => [...selectedIds].map((id) => templates.find((t) => t.id === id)).filter(Boolean) as TaskTemplate[],
    [selectedIds, templates]
  )

  const toggleCategory = (c: TaskCategory) => {
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
      if (n.has(t.id)) {
        n.delete(t.id)
        setPointsById((p) => {
          const { [t.id]: _, ...rest } = p
          return rest
        })
      } else {
        n.add(t.id)
        const fav = favorites.find((f) => f.template_id === t.id)
        setPointsById((p) => ({
          ...p,
          [t.id]: {
            p: fav?.performer_points ?? t.default_points,
            m: fav?.mental_load_points ?? t.default_mental_load_points,
          },
        }))
      }
      return n
    })
  }

  const removeSelected = (templateId: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      n.delete(templateId)
      return n
    })
    setPointsById((p) => {
      const { [templateId]: _, ...rest } = p
      return rest
    })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const rows = [...selectedIds].map((templateId) => ({
        templateId,
        performerPoints: pointsById[templateId]?.p ?? 0,
        mentalLoadPoints: pointsById[templateId]?.m ?? 0,
      }))
      const { error: e } = await replaceHouseholdFavorites(householdId, rows)
      if (e) throw e
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur à l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/45 p-4 pb-6 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom)-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] shadow-2xl sm:max-h-[min(90vh,720px)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-[#1F2937]">Gérer les tâches du foyer</h2>
          <button
            type="button"
            className="rounded-lg p-2 text-[#6B7280] hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {error && <div className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {selectedList.length > 0 && (
            <div className="mb-4 rounded-lg border border-[#93C572]/40 bg-[#93C572]/10 p-3">
              <p className="mb-2 text-xs font-medium text-[#5a7d44]">
                Tâches du foyer ({selectedList.length})
              </p>
              <ul className="flex flex-wrap gap-2">
                {selectedList.map((t) => (
                  <li key={t.id} className="relative pr-1 pt-1">
                    <span className="inline-block rounded-full bg-white py-1.5 pl-3 pr-6 text-xs text-[#1F2937] shadow-sm">
                      {CATEGORY_EMOJIS[t.category as TaskCategory]}{' '}
                      {translateTaskName(t.name)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Retirer ${translateTaskName(t.name)}`}
                      className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-sm font-bold text-[#6B7280] shadow hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeSelected(t.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mb-2 text-xs font-medium text-[#6B7280]">Catégories (filtres)</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {TASK_CATEGORIES_ALPHABETICAL_FR.map((c) => {
              const on = filterCategories.has(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`rounded-xl border px-2 py-1.5 text-xs ${
                    on
                      ? 'border-[#93C572] bg-[#93C572]/15'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                  }`}
                >
                  {CATEGORY_EMOJIS[c]} {translateCategory(c)}
                </button>
              )
            })}
          </div>

          <p className="mb-2 text-xs font-medium text-[#6B7280]">Toutes les tâches</p>
          <div className="grid grid-cols-1 gap-2">
            {filteredTemplates.map((t) => {
              const sel = selectedIds.has(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTask(t)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
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
        </div>

        <div className="shrink-0 flex gap-2 border-t border-[#E5E7EB] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#1F2937]"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            className="flex-1 rounded-xl bg-[#93C572] py-2.5 text-sm font-medium text-white disabled:opacity-40"
            onClick={() => void save()}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
