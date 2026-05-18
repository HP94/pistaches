'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Participant } from '@/lib/supabase/participants'
import type { TaskCategory, TaskTemplate } from '@/lib/supabase/taskTemplates'
import type { HouseholdFavoriteWithTemplate } from '@/lib/supabase/householdFavorites'
import { upsertHouseholdFavorite } from '@/lib/supabase/householdFavorites'
import {
  syncDeclarationsForDay,
  type TaskDeclarationWithRelations,
} from '@/lib/supabase/taskDeclarations'
import { translateCategory, translateTaskName } from '@/lib/translations'
import {
  CATEGORY_EMOJIS,
  categoriesFromTemplates,
  groupTemplatesByCategory,
} from '@/lib/taskPickerUi'
import {
  buildMatrixFromTemplateIds,
  getTemplateIdsWithPerformers,
  matrixFromDeclarations,
  validateDeclarationMatrix,
  type MatrixState,
} from '@/lib/v3/declarationMatrix'
import { wrapLabelByWords } from '@/lib/taskLabelWrap'
import { formatSupabaseError } from '@/lib/auth/errorMessage'

type WizardStep = 'matrix' | 'catalog' | 'catalogPoints'

const EMPTY_DECLARATIONS: TaskDeclarationWithRelations[] = []

/** Hauteur fixe de la modale (toujours la taille max disponible). */
const MODAL_SHEET_HEIGHT =
  'h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom)-2rem))] sm:h-[min(90vh,720px)]'

type Props = {
  open: boolean
  onClose: () => void
  householdId: string
  declaredOn: string
  participants: Participant[]
  templates: TaskTemplate[]
  favorites: HouseholdFavoriteWithTemplate[]
  mode?: 'declare' | 'edit'
  initialDeclarations?: TaskDeclarationWithRelations[]
  initialStep?: 'matrix' | 'catalog'
  onSuccess: () => void
  onFavoritesChanged?: () => void
}

function pointsForTemplate(
  templateId: string,
  favorites: HouseholdFavoriteWithTemplate[],
  templates: TaskTemplate[],
  declarations?: TaskDeclarationWithRelations[]
): { p: number; m: number } {
  const dec = declarations?.find((d) => d.template_id === templateId)
  if (dec) return { p: dec.performer_points, m: dec.mental_load_points }
  const fav = favorites.find((f) => f.template_id === templateId)
  const t = templates.find((x) => x.id === templateId)
  return {
    p: fav?.performer_points ?? t?.default_points ?? 0,
    m: fav?.mental_load_points ?? t?.default_mental_load_points ?? 0,
  }
}

export default function TaskDeclarationWizard({
  open,
  onClose,
  householdId,
  declaredOn,
  participants,
  templates,
  favorites,
  mode = 'declare',
  initialDeclarations = EMPTY_DECLARATIONS,
  initialStep = 'matrix',
  onSuccess,
  onFavoritesChanged,
}: Props) {
  const [step, setStep] = useState<WizardStep>('matrix')
  const [filterCategories, setFilterCategories] = useState<Set<TaskCategory>>(new Set())
  const [matrix, setMatrix] = useState<MatrixState>({})
  const [pointsById, setPointsById] = useState<Record<string, { p: number; m: number }>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [catalogTemplate, setCatalogTemplate] = useState<TaskTemplate | null>(null)
  const [catPoints, setCatPoints] = useState({ p: 0, m: 0 })

  const favoriteTemplates = useMemo(
    () => favorites.map((f) => f.task_templates).filter(Boolean) as TaskTemplate[],
    [favorites]
  )

  const favoriteCategories = useMemo(
    () => categoriesFromTemplates(favoriteTemplates),
    [favoriteTemplates]
  )

  const matrixGroups = useMemo(
    () => groupTemplatesByCategory(favoriteTemplates, filterCategories),
    [favoriteTemplates, filterCategories]
  )

  const initMatrixState = () => {
    const ids = favoriteTemplates.map((t) => t.id)
    const m =
      mode === 'edit' && initialDeclarations.length > 0
        ? matrixFromDeclarations(ids, initialDeclarations)
        : buildMatrixFromTemplateIds(ids)
    setMatrix(m)
    const pts: Record<string, { p: number; m: number }> = {}
    for (const id of ids) {
      pts[id] = pointsForTemplate(id, favorites, templates, initialDeclarations)
    }
    setPointsById(pts)
  }

  useEffect(() => {
    if (!open) return
    setStep(initialStep)
    setFilterCategories(new Set())
    setCatalogTemplate(null)
    setError(null)
    initMatrixState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // initialDeclarations lu à l’ouverture (évite boucle si le parent passe un nouveau [] à chaque rendu)
  }, [open, declaredOn, mode, initialStep])

  const toggleCategory = (c: TaskCategory) => {
    setFilterCategories((prev) => {
      const n = new Set(prev)
      if (n.has(c)) n.delete(c)
      else n.add(c)
      return n
    })
  }

  const toggleMatrix = (templateId: string, role: 'performers' | 'thinkers', participantId: string) => {
    setMatrix((prev) => {
      const cell = prev[templateId] ?? { performers: new Set<string>(), thinkers: new Set<string>() }
      const pSet = new Set(cell.performers)
      const tSet = new Set(cell.thinkers)
      if (role === 'performers') {
        if (pSet.has(participantId)) pSet.delete(participantId)
        else pSet.add(participantId)
      } else {
        if (tSet.has(participantId)) tSet.delete(participantId)
        else tSet.add(participantId)
      }
      return { ...prev, [templateId]: { performers: pSet, thinkers: tSet } }
    })
  }

  const submitMatrix = async () => {
    const ids = getTemplateIdsWithPerformers(matrix)
    if (ids.length === 0) {
      setError('Cochez au moins une personne dans « A fait la tâche » pour une tâche.')
      return
    }
    const v = validateDeclarationMatrix(ids, matrix)
    if (!v.ok) {
      setError(v.message)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const rows = ids.map((templateId) => ({
        templateId,
        performerPoints: pointsById[templateId]?.p ?? 0,
        mentalLoadPoints: pointsById[templateId]?.m ?? 0,
        performerParticipantIds: [...(matrix[templateId]?.performers ?? [])],
        thinkerParticipantIds: [...(matrix[templateId]?.thinkers ?? [])],
      }))
      const { error: e } = await syncDeclarationsForDay(householdId, declaredOn, rows)
      if (e) throw e
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(formatSupabaseError(err, 'Erreur à l’enregistrement'))
    } finally {
      setSaving(false)
    }
  }

  const openCatalog = () => {
    setCatalogTemplate(null)
    setStep('catalog')
  }

  const filteredCatalog = useMemo(() => {
    const all = templates
    if (filterCategories.size === 0) return all
    return all.filter((t) => filterCategories.has(t.category as TaskCategory))
  }, [templates, filterCategories])

  const pickCatalogTemplate = (t: TaskTemplate) => {
    setCatalogTemplate(t)
    setCatPoints({ p: t.default_points, m: t.default_mental_load_points })
    setStep('catalogPoints')
  }

  const confirmCatalogTask = async () => {
    if (!catalogTemplate) return
    setSaving(true)
    setError(null)
    try {
      const { error: u } = await upsertHouseholdFavorite(
        householdId,
        catalogTemplate.id,
        catPoints.p,
        catPoints.m
      )
      if (u) throw u
      const newId = catalogTemplate.id
      setPointsById((prev) => ({
        ...prev,
        [newId]: { p: catPoints.p, m: catPoints.m },
      }))
      setMatrix((prev) =>
        buildMatrixFromTemplateIds([...favoriteTemplates.map((t) => t.id), newId], {
          ...prev,
          [newId]: { performers: new Set(), thinkers: new Set() },
        })
      )
      onFavoritesChanged?.()
      setStep('matrix')
      setCatalogTemplate(null)
    } catch (err: unknown) {
      setError(formatSupabaseError(err, 'Erreur'))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const title =
    step === 'matrix'
      ? mode === 'edit'
        ? 'Modifier les tâches du jour'
        : 'Qui a fait / pensé ?'
      : step === 'catalog'
        ? 'Nouvelle tâche pour le foyer'
        : 'Points de la tâche'

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-4 pb-6 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] shadow-2xl ${MODAL_SHEET_HEIGHT}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
          <button
            type="button"
            className="rounded-lg p-2 text-[#6B7280] hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-4 py-3 [-webkit-overflow-scrolling:touch]">
          {step === 'matrix' && (
            <>
              {favoriteCategories.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {favoriteCategories.map((c) => {
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
              )}

              {favoriteTemplates.length === 0 ? (
                <p className="text-sm text-[#6B7280]">
                  Aucune tâche favorite. Utilisez « Gérer les tâches du foyer » sur la page pour en ajouter.
                </p>
              ) : (
                <div className="w-full min-w-0">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-left text-sm text-[#6B7280]">
                        <th className="py-2 pr-2">Tâche</th>
                        <th className="py-2 pr-2">A fait la tâche</th>
                        <th className="py-2">A pensé à la tâche</th>
                      </tr>
                    </thead>
                    {matrixGroups.map(({ category, tasks }) => (
                      <tbody key={category}>
                        <tr className="bg-[#F9FAFB]">
                          <td
                            colSpan={3}
                            className="py-2 pr-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
                          >
                            {CATEGORY_EMOJIS[category]} {translateCategory(category)}
                          </td>
                        </tr>
                        {tasks.map((t) => (
                          <tr key={t.id} className="border-b border-[#F3F4F6] align-top">
                            <td className="py-2 pr-2 text-base font-medium text-[#1F2937]">
                              <span className="mr-1">{CATEGORY_EMOJIS[t.category as TaskCategory]}</span>
                              {wrapLabelByWords(translateTaskName(t.name)).map((line) => (
                                <span key={line} className="block">
                                  {line}
                                </span>
                              ))}
                            </td>
                            <td className="py-2 pr-2">
                              <div className="flex flex-col gap-1">
                                {participants.map((p) => (
                                  <label key={p.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={matrix[t.id]?.performers.has(p.id) ?? false}
                                      onChange={() => toggleMatrix(t.id, 'performers', p.id)}
                                    />
                                    {p.name}
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="flex flex-col gap-1">
                                {participants.map((p) => (
                                  <label key={p.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={matrix[t.id]?.thinkers.has(p.id) ?? false}
                                      onChange={() => toggleMatrix(t.id, 'thinkers', p.id)}
                                    />
                                    {p.name}
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
              )}
            </>
          )}

          {step === 'catalog' && (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                {categoriesFromTemplates(templates).map((c) => {
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
              <div className="grid max-h-64 gap-2 overflow-y-auto">
                {filteredCatalog.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickCatalogTemplate(t)}
                    className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {CATEGORY_EMOJIS[t.category as TaskCategory]} {translateTaskName(t.name)}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'catalogPoints' && catalogTemplate && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1F2937]">
                {CATEGORY_EMOJIS[catalogTemplate.category as TaskCategory]}{' '}
                {translateTaskName(catalogTemplate.name)}
              </p>
              <label className="block text-xs text-[#6B7280]">
                Points réalisation
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={10}
                  className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                  value={catPoints.p}
                  onChange={(e) => setCatPoints((x) => ({ ...x, p: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="block text-xs text-[#6B7280]">
                Points charge mentale
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={10}
                  className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                  value={catPoints.m}
                  onChange={(e) => setCatPoints((x) => ({ ...x, m: Number(e.target.value) || 0 }))}
                />
              </label>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {step === 'matrix' && (
            <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={saving || favoriteTemplates.length === 0}
                  className="flex-1 rounded-xl bg-[#93C572] py-2.5 text-sm font-medium text-white disabled:opacity-40"
                  onClick={() => void submitMatrix()}
                >
                  Confirmer
                </button>
            </div>
          )}
          {step === 'catalog' && (
            <button
              type="button"
              className="w-full rounded-xl border border-[#E5E7EB] py-2.5 text-sm"
              onClick={() => setStep('matrix')}
            >
              Retour
            </button>
          )}
          {step === 'catalogPoints' && (
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border py-2.5 text-sm"
                onClick={() => setStep('catalog')}
              >
                Retour
              </button>
              <button
                type="button"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#93C572] py-2.5 text-sm font-medium text-white"
                onClick={() => void confirmCatalogTask()}
              >
                Valider
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
