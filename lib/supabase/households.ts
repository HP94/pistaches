// Functions to manage households
import { supabase } from './client'
import {
  createParticipant,
  linkParticipantToUser,
  type Participant,
  type Gender,
} from './participants'

export interface Household {
  id: string
  owner: string
  name: string
  invitation_code: string
  created_at: string
}

/**
 * Generate a unique 6-character alphanumeric invitation code
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new household for the current user
 */
export async function createHousehold(userId: string, name: string) {
  // Generate unique invitation code
  let invitationCode = generateInvitationCode()
  let attempts = 0
  const maxAttempts = 10

  // Ensure code is unique (retry if needed)
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('households')
      .select('id')
      .eq('invitation_code', invitationCode)
      .single()

    if (!existing) {
      break // Code is unique
    }
    invitationCode = generateInvitationCode()
    attempts++
  }

  const { data, error } = await supabase
    .from('households')
    .insert({
      owner: userId,
      name,
      invitation_code: invitationCode,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get household by invitation code
 */
export async function getHouseholdByCode(invitationCode: string) {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('invitation_code', invitationCode.toUpperCase())
    .single()

  return { data, error }
}

/**
 * Get all households for a user (where user is owner or participant)
 */
export async function getUserHouseholds(userId: string) {
  // Get households where user is owner
  const { data: ownedHouseholds, error: ownedError } = await supabase
    .from('households')
    .select('*')
    .eq('owner', userId)

  if (ownedError) {
    return { data: [], error: ownedError }
  }

  // Get households where user is a participant
  const { data: participantData, error: participantError } = await supabase
    .from('participants')
    .select('household_id, households(*)')
    .eq('user_id', userId)

  if (participantError) {
    return { data: ownedHouseholds || [], error: participantError }
  }

  // Combine owned and participant households
  const participantHouseholds = (participantData || [])
    .map((p: any) => p.households)
    .filter(Boolean)

  // Merge and deduplicate
  const allHouseholds = [
    ...(ownedHouseholds || []),
    ...participantHouseholds,
  ].filter((h, index, self) => 
    index === self.findIndex((t) => t.id === h.id)
  )

  return { data: allHouseholds, error: null }
}

/**
 * Get current household (for a user)
 * For now, we'll get the first household. Later we can add a "current household" selection
 */
export async function getCurrentHousehold(userId: string) {
  const { data, error } = await getUserHouseholds(userId)
  if (error || !data || data.length === 0) {
    return { data: null, error }
  }
  // Return the first household (or we can add logic to remember the selected one)
  return { data: data[0], error: null }
}

export type PrepareJoinResult =
  | { ok: false; error: string }
  | { ok: true; case: 'already_member'; household: Household }
  | { ok: true; case: 'need_claim'; household: Household; nonUserMembers: Participant[] }
  | { ok: true; case: 'direct_join'; household: Household }

/**
 * Étape 1 du flux « rejoindre un foyer » : valide le code et indique si un choix de membre est nécessaire.
 */
export async function prepareJoinHousehold(
  userId: string,
  invitationCode: string
): Promise<PrepareJoinResult> {
  const code = invitationCode.trim().toUpperCase()
  const { data: household, error: householdError } = await getHouseholdByCode(code)

  if (householdError || !household) {
    return { ok: false, error: "Code d'invitation invalide" }
  }

  const { data: existingParticipant } = await supabase
    .from('participants')
    .select('id')
    .eq('household_id', household.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingParticipant) {
    return { ok: true, case: 'already_member', household }
  }

  const { data: orphans } = await supabase
    .from('participants')
    .select('*')
    .eq('household_id', household.id)
    .is('user_id', null)

  const nonUserMembers = (orphans || []) as Participant[]
  if (nonUserMembers.length > 0) {
    return { ok: true, case: 'need_claim', household, nonUserMembers }
  }

  return { ok: true, case: 'direct_join', household }
}

/**
 * Crée un nouveau membre lié au compte (pas de fusion).
 */
export async function finalizeJoinNewMember(
  householdId: string,
  userId: string,
  userName: string,
  userGender: Gender
) {
  return createParticipant(householdId, userName, userGender, userId)
}

/**
 * Fusionne le compte avec un membre sans compte existant.
 */
export async function finalizeJoinMerge(participantId: string, userId: string) {
  return linkParticipantToUser(participantId, userId)
}

/**
 * @deprecated Utiliser prepareJoinHousehold + finalizeJoinNewMember / finalizeJoinMerge
 */
export async function joinHouseholdByCode(
  userId: string,
  invitationCode: string,
  userName: string,
  userGender: 'male' | 'female' | 'neutral'
) {
  const prepared = await prepareJoinHousehold(userId, invitationCode)
  if (!prepared.ok) {
    return { data: null, error: new Error(prepared.error) }
  }
  if (prepared.case === 'already_member') {
    return { data: prepared.household, error: null }
  }
  if (prepared.case === 'need_claim') {
    return {
      data: null,
      error: new Error(
        'REJOINDRE_FOYER: des membres sans compte existent — utilisez le flux de choix (prepareJoinHousehold).'
      ),
    }
  }
  const { error } = await finalizeJoinNewMember(
    prepared.household.id,
    userId,
    userName,
    userGender
  )
  if (error) {
    return { data: null, error }
  }
  return { data: prepared.household, error: null }
}

