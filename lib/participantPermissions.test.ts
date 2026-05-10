import { describe, expect, it } from 'vitest'
import { canDeleteParticipant, canEditParticipant } from '@/lib/participantPermissions'

const ownerId = 'owner-user'
const memberId = 'member-user'

describe('canEditParticipant', () => {
  it('allows editing own linked participant row', () => {
    expect(
      canEditParticipant({ user_id: memberId }, memberId, ownerId)
    ).toBe(true)
  })

  it('allows owner to edit unclaimed participant (null user)', () => {
    expect(
      canEditParticipant({ user_id: null }, ownerId, ownerId)
    ).toBe(true)
  })

  it('does not allow non-owner to edit unclaimed participant', () => {
    expect(
      canEditParticipant({ user_id: null }, memberId, ownerId)
    ).toBe(false)
  })

  it('does not allow member to edit another linked participant', () => {
    expect(
      canEditParticipant({ user_id: ownerId }, memberId, ownerId)
    ).toBe(false)
  })
})

describe('canDeleteParticipant', () => {
  it('only owner can delete', () => {
    expect(canDeleteParticipant(ownerId, ownerId)).toBe(true)
    expect(canDeleteParticipant(memberId, ownerId)).toBe(false)
  })
})
