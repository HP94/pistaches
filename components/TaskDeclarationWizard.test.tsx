// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskDeclarationWizard from '@/components/TaskDeclarationWizard'
import { syncDeclarationsForDay } from '@/lib/supabase/taskDeclarations'

vi.mock('@/lib/supabase/taskDeclarations', () => ({
  syncDeclarationsForDay: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase/householdFavorites', () => ({
  upsertHouseholdFavorite: vi.fn().mockResolvedValue({ error: null }),
}))

const template = {
  id: 'tpl-1',
  name: 'dishes',
  category: 'kitchen',
  default_points: 30,
  default_mental_load_points: 10,
}

const participant = {
  id: 'p-1',
  name: 'Alice',
  household_id: 'hh-1',
  user_id: null,
  gender: null,
  created_at: '',
}

const favorite = {
  id: 'fav-1',
  household_id: 'hh-1',
  template_id: 'tpl-1',
  performer_points: 30,
  mental_load_points: 10,
  task_templates: template,
}

const baseProps = {
  open: true,
  onClose: vi.fn(),
  householdId: 'hh-1',
  declaredOn: '2026-05-15',
  participants: [participant],
  templates: [template],
  favorites: [favorite],
  onSuccess: vi.fn(),
}

function matrixDialog() {
  return screen.getByRole('heading', { name: /Qui a fait|Modifier les tâches/ }).closest('.fixed') as HTMLElement
}

describe('TaskDeclarationWizard', () => {
  beforeEach(() => {
    vi.mocked(syncDeclarationsForDay).mockClear()
  })

  it('opens directly on matrix and shows validation error without performer', async () => {
    const user = userEvent.setup()
    render(<TaskDeclarationWizard {...baseProps} />)

    expect(screen.getByRole('heading', { name: 'Qui a fait / pensé ?' })).toBeInTheDocument()
    await user.click(within(matrixDialog()).getByRole('button', { name: 'Confirmer' }))

    expect(
      screen.getByText(/Cochez au moins une personne|Chaque tâche doit avoir/)
    ).toBeInTheDocument()
    expect(syncDeclarationsForDay).not.toHaveBeenCalled()
  })

  it('calls syncDeclarationsForDay when performer is checked', async () => {
    const user = userEvent.setup()
    render(<TaskDeclarationWizard {...baseProps} />)

    const dialog = matrixDialog()
    const [performerCheckbox] = within(dialog).getAllByRole('checkbox')
    await user.click(performerCheckbox)
    await user.click(within(dialog).getByRole('button', { name: 'Confirmer' }))

    expect(syncDeclarationsForDay).toHaveBeenCalledTimes(1)
    expect(syncDeclarationsForDay).toHaveBeenCalledWith(
      'hh-1',
      '2026-05-15',
      expect.arrayContaining([
        expect.objectContaining({
          templateId: 'tpl-1',
          performerParticipantIds: ['p-1'],
        }),
      ])
    )
  })
})
