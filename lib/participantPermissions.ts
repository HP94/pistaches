import type { Participant } from '@/lib/supabase/participants'

/**
 * Modifier le prénom/surnom et le genre :
 * - sa propre fiche (membre lié au compte) ;
 * - ou fiche sans compte, si on est propriétaire du foyer.
 */
export function canEditParticipant(
  participant: Pick<Participant, 'user_id'>,
  authUserId: string,
  householdOwnerId: string
): boolean {
  if (participant.user_id === authUserId) return true
  if (participant.user_id === null && authUserId === householdOwnerId) return true
  return false
}

/** Supprimer un membre : uniquement le propriétaire du foyer (tous types de membres). */
export function canDeleteParticipant(authUserId: string, householdOwnerId: string): boolean {
  return authUserId === householdOwnerId
}
