import { describe, expect, it, vi, beforeEach } from 'vitest'
import { syncDeclarationsForDay } from './taskDeclarations'

const upsertMock = vi.fn()
const selectMock = vi.fn()
const deletePerformersMock = vi.fn()
const deleteThinkersMock = vi.fn()
const insertPerformersMock = vi.fn()
const deleteDeclarationMock = vi.fn()

vi.mock('./client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'task_declarations') {
        return {
          upsert: upsertMock,
          select: selectMock,
          delete: deleteDeclarationMock,
        }
      }
      if (table === 'task_declaration_performers') {
        return {
          delete: deletePerformersMock,
          insert: insertPerformersMock,
        }
      }
      if (table === 'task_declaration_thinkers') {
        return { delete: deleteThinkersMock }
      }
      throw new Error(`unexpected table ${table}`)
    }),
  },
}))

describe('syncDeclarationsForDay', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    upsertMock.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: 'dec-1' },
            error: null,
          }),
      }),
    })

    deletePerformersMock.mockReturnValue({ eq: () => Promise.resolve({ error: null }) })
    deleteThinkersMock.mockReturnValue({ eq: () => Promise.resolve({ error: null }) })
    insertPerformersMock.mockResolvedValue({ error: null })
    deleteDeclarationMock.mockReturnValue({ eq: () => Promise.resolve({ error: null }) })

    selectMock.mockReturnValue({
      eq: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: [{ id: 'dec-1', template_id: 5, household_id: 'hh-1', declared_on: '2026-05-18' }],
              error: null,
            }),
        }),
      }),
    })
  })

  it('does not delete a row when template_id is number but row input id is string', async () => {
    const { error } = await syncDeclarationsForDay('hh-1', '2026-05-18', [
      {
        templateId: '5',
        performerPoints: 10,
        mentalLoadPoints: 0,
        performerParticipantIds: ['p-1'],
        thinkerParticipantIds: [],
      },
    ])

    expect(error).toBeNull()
    expect(deleteDeclarationMock).not.toHaveBeenCalled()
  })
})
