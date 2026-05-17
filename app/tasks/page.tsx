'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHousehold } from '@/lib/hooks/useHousehold'
import { getParticipants, type Participant } from '@/lib/supabase/participants'
import { getTaskTemplates, type TaskTemplate } from '@/lib/supabase/taskTemplates'
import { getHouseholdFavorites, type HouseholdFavoriteWithTemplate } from '@/lib/supabase/householdFavorites'
import { getDeclarationsForDate, type TaskDeclarationWithRelations } from '@/lib/supabase/taskDeclarations'
import { translateTaskName } from '@/lib/translations'
import {
  CATEGORY_EMOJIS,
  PERFORMER_NAME_CLASS,
  THINKER_NAME_CLASS,
} from '@/lib/taskPickerUi'
import type { TaskCategory } from '@/lib/supabase/taskTemplates'
import TaskDayPicker, { formatLocalDate } from '@/components/TaskDayPicker'
import TaskDeclarationWizard from '@/components/TaskDeclarationWizard'
import HouseholdFavoritesModal from '@/components/HouseholdFavoritesModal'
import { SuccessToast, useSuccessToast } from '@/components/SuccessToast'

export default function TasksPage() {
  const router = useRouter()
  const { currentHousehold, loading: householdLoading } = useHousehold()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [favorites, setFavorites] = useState<HouseholdFavoriteWithTemplate[]>([])
  const [declarations, setDeclarations] = useState<TaskDeclarationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)
  const { toastMessage, showSuccessToast } = useSuccessToast()

  const hasDeclarations = declarations.length > 0

  const loadData = useCallback(async () => {
    if (!currentHousehold) return
    setLoading(true)
    setError(null)
    try {
      const [pRes, tRes, fRes, dRes] = await Promise.all([
        getParticipants(currentHousehold.id),
        getTaskTemplates(),
        getHouseholdFavorites(currentHousehold.id),
        selectedDate
          ? getDeclarationsForDate(currentHousehold.id, selectedDate)
          : Promise.resolve({ data: [], error: null }),
      ])
      if (pRes.error) throw pRes.error
      if (tRes.error) throw tRes.error
      if (fRes.error) throw fRes.error
      if (dRes.error) throw dRes.error
      setParticipants(pRes.data || [])
      setTemplates(tRes.data || [])
      setFavorites(fRes.data || [])
      setDeclarations((dRes.data as TaskDeclarationWithRelations[]) || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [currentHousehold, selectedDate])

  useEffect(() => {
    if (!householdLoading && !currentHousehold) {
      router.push('/select-household')
    } else if (currentHousehold) {
      void loadData()
    }
  }, [currentHousehold, householdLoading, router, loadData])

  const openWizard = () => {
    if (!selectedDate) return
    setWizardOpen(true)
  }

  const afterWizard = () => {
    void loadData()
    showSuccessToast()
  }

  const afterFavoritesSaved = () => {
    void loadData()
    showSuccessToast()
  }

  if (householdLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#6B7280]">Chargement…</div>
    )
  }

  if (!currentHousehold) {
    return null
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 pb-12">
      <h1 className="text-2xl font-bold text-[#1F2937]">Tâches</h1>
      <p className="text-sm text-[#6B7280]">
        Choisissez un jour, puis déclarez les tâches réalisées (favoris en priorité).
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <TaskDayPicker value={selectedDate} onChange={setSelectedDate} />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!selectedDate}
          onClick={openWizard}
          className="w-full rounded-xl bg-[#93C572] py-3 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hasDeclarations ? 'Modifier les tâches' : 'Ajouter une tâche'}
        </button>
        <button
          type="button"
          onClick={() => setFavoritesModalOpen(true)}
          className="w-full rounded-xl border border-[#93C572] bg-white py-3 text-sm font-medium text-[#5a8f45] transition-colors hover:bg-[#93C572]/10"
        >
          Gérer les tâches du foyer
        </button>
      </div>

      {selectedDate && (
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#1F2937]">
            Jour sélectionné : {selectedDate}
          </h2>
          {declarations.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Aucune tâche ajoutée pour ce jour.</p>
          ) : (
            <ul className="space-y-3">
              {declarations.map((d) => {
                const cat = d.task_templates?.category as TaskCategory | undefined
                const names =
                  (d.task_templates?.name && translateTaskName(d.task_templates.name)) || '—'
                const perf = (d.task_declaration_performers || [])
                  .map((x) => participants.find((p) => p.id === x.participant_id)?.name)
                  .filter(Boolean)
                  .join(', ')
                const think = (d.task_declaration_thinkers || [])
                  .map((x) => participants.find((p) => p.id === x.participant_id)?.name)
                  .filter(Boolean)
                  .join(', ')
                return (
                  <li
                    key={d.id}
                    className="rounded-lg border border-[#F3F4F6] bg-[#FAFAF8] px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-[#1F2937]">
                      {cat ? `${CATEGORY_EMOJIS[cat]} ` : ''}
                      {names}
                    </p>
                    <p className="text-xs">
                      <span className="text-[#6B7280]">A fait : </span>
                      <span className={PERFORMER_NAME_CLASS}>{perf || '—'}</span>
                      <span className="text-[#6B7280]"> · A pensé : </span>
                      <span className={THINKER_NAME_CLASS}>{think || '—'}</span>
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      Points réalisation {d.performer_points} · charge {d.mental_load_points}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      <HouseholdFavoritesModal
        open={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        householdId={currentHousehold.id}
        templates={templates}
        favorites={favorites}
        onSaved={afterFavoritesSaved}
      />

      {selectedDate && (
        <TaskDeclarationWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          householdId={currentHousehold.id}
          declaredOn={selectedDate}
          participants={participants}
          templates={templates}
          favorites={favorites}
          mode={hasDeclarations ? 'edit' : 'declare'}
          initialDeclarations={declarations}
          onSuccess={afterWizard}
          onFavoritesChanged={() => void loadData()}
        />
      )}

      <SuccessToast message={toastMessage} />
    </div>
  )
}
