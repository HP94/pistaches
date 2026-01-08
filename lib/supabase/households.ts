// Functions to manage households
import { supabase } from './client'

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

/**
 * Join a household by invitation code
 */
export async function joinHouseholdByCode(
  userId: string,
  invitationCode: string,
  userName: string,
  userGender: 'male' | 'female' | 'neutral'
) {
  // Get household by code
  const { data: household, error: householdError } = await getHouseholdByCode(invitationCode)
  
  if (householdError || !household) {
    return { data: null, error: householdError || new Error('Code d\'invitation invalide') }
  }

  // Check if user is already a participant in this household
  const { data: existingParticipant } = await supabase
    .from('participants')
    .select('id')
    .eq('household_id', household.id)
    .eq('user_id', userId)
    .single()

  if (existingParticipant) {
    return { data: household, error: null } // Already a member
  }

  // Create participant for this user in this household
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({
      household_id: household.id,
      user_id: userId,
      name: userName,
      gender: userGender,
    })
    .select()
    .single()

  if (participantError) {
    return { data: null, error: participantError }
  }

  return { data: household, error: null }
}

