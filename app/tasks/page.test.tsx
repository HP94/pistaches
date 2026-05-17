// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TasksPage from '@/app/tasks/page'
import { getDeclarationsForDate } from '@/lib/supabase/taskDeclarations'

const mockHousehold = { id: 'hh-1', name: 'Test' }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/hooks/useHousehold', () => ({
  useHousehold: () => ({
    currentHousehold: mockHousehold,
    loading: false,
  }),
}))

vi.mock('@/lib/supabase/participants', () => ({
  getParticipants: vi.fn().mockResolvedValue({ data: [], error: null }),
}))

vi.mock('@/lib/supabase/taskTemplates', () => ({
  getTaskTemplates: vi.fn().mockResolvedValue({ data: [], error: null }),
}))

vi.mock('@/lib/supabase/householdFavorites', () => ({
  getHouseholdFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}))

vi.mock('@/lib/supabase/taskDeclarations', () => ({
  getDeclarationsForDate: vi.fn().mockResolvedValue({ data: [], error: null }),
}))

vi.mock('@/components/TaskDeclarationWizard', () => ({
  default: () => null,
}))

vi.mock('@/components/HouseholdFavoritesModal', () => ({
  default: () => null,
}))

describe('TasksPage', () => {
  it('disables day declaration until a day is selected', async () => {
    render(<TasksPage />)

    await waitFor(() => {
      expect(screen.queryByText('Chargement…')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gérer les tâches du foyer' })).toBeEnabled()
  })

  it('enables declaration after selecting a day', async () => {
    render(<TasksPage />)

    await waitFor(() => {
      expect(screen.queryByText('Chargement…')).not.toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button', { name: /^\d+$/ })
    fireEvent.click(dayButtons[0]!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeEnabled()
    })
  })

  it('shows Modifier les tâches when day has declarations', async () => {
    vi.mocked(getDeclarationsForDate).mockResolvedValue({
      data: [
        {
          id: 'd1',
          household_id: 'hh-1',
          template_id: 't1',
          declared_on: '2026-05-01',
          performer_points: 10,
          mental_load_points: 0,
          created_at: '',
          task_templates: {
            id: 't1',
            name: 'dishes',
            category: 'kitchen',
            default_points: 10,
            default_mental_load_points: 0,
          },
          task_declaration_performers: [{ participant_id: 'p1' }],
          task_declaration_thinkers: [],
        },
      ],
      error: null,
    })

    render(<TasksPage />)

    await waitFor(() => {
      expect(screen.queryByText('Chargement…')).not.toBeInTheDocument()
    })

    const dayButtons = screen.getAllByRole('button', { name: /^\d+$/ })
    fireEvent.click(dayButtons[0]!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Modifier les tâches' })).toBeInTheDocument()
    })
  })
})
