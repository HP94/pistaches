// Functions to manage participants
import { supabase } from './client'

export type Gender = 'male' | 'female' | 'neutral'

export interface Participant {
  id: string
  household_id: string
  user_id: string | null
  name: string
  gender: Gender
  created_at: string
}

/**
 * Get all participants for a specific household
 */
export async function getParticipants(householdId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })

  return { data: data || [], error }
}

/**
 * Get participant by user_id and household_id
 */
export async function getParticipantByUser(userId: string, householdId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('user_id', userId)
    .eq('household_id', householdId)
    .single()

  return { data, error }
}

/**
 * Create a new participant
 * If user_id is provided, it links the participant to a user account
 * If user_id is null, it's a participant without an account (e.g., child)
 */
export async function createParticipant(
  householdId: string,
  name: string,
  gender: Gender,
  userId: string | null = null
) {
  const { data, error } = await supabase
    .from('participants')
    .insert({
      household_id: householdId,
      user_id: userId,
      name,
      gender,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Create participant for current user when joining a household
 */
export async function createUserParticipant(
  householdId: string,
  userId: string,
  name: string,
  gender: Gender
) {
  return createParticipant(householdId, name, gender, userId)
}

/**
 * Rattache un compte utilisateur à un membre existant sans compte (fusion à l'entrée dans le foyer).
 */
export async function linkParticipantToUser(participantId: string, userId: string) {
  const { data, error } = await supabase
    .from('participants')
    .update({ user_id: userId })
    .eq('id', participantId)
    .is('user_id', null)
    .select()
    .single()

  return { data, error }
}

/**
 * Update a participant
 */
export async function updateParticipant(
  id: string,
  name: string,
  gender: Gender
) {
  const { data, error } = await supabase
    .from('participants')
    .update({
      name,
      gender,
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a participant
 */
export async function deleteParticipant(id: string) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Calculate total points for a participant
 * This includes both performer points and mental load points
 */
export async function getParticipantBalance(participantId: string) {
  // Get assignments where participant is performer
  const { data: performerData, error: performerError } = await supabase
    .from('assignments')
    .select(`
      frequency_per_week,
      tasks (
        performer_points,
        mental_load_points,
        task_templates (
          default_points,
          default_mental_load_points
        )
      )
    `)
    .eq('performer_id', participantId)

  // Get assignments where participant is thinker (mental load)
  const { data: thinkerData, error: thinkerError } = await supabase
    .from('assignments')
    .select(`
      frequency_per_week,
      tasks (
        performer_points,
        mental_load_points,
        task_templates (
          default_points,
          default_mental_load_points
        )
      )
    `)
    .eq('thinker_id', participantId)

  if (performerError || thinkerError) {
    return { balance: 0, error: performerError || thinkerError }
  }

  // Calculate total points (weekly)
  // Points per week = (performer_points + mental_load_points) * frequency_per_week
  // Note: This function returns weekly points. Multiply by 4 for monthly if needed.
  let balance = 0

  // Add performer points (weekly)
  // For one-time tasks (frequency_per_week is null), count as 1 occurrence
  if (performerData) {
    balance += performerData.reduce((total, assignment: any) => {
      const task = assignment.tasks
      const performerPoints = task?.performer_points ?? task?.task_templates?.default_points ?? 0
      const frequency = assignment.frequency_per_week ?? 1 // null means one-time task = 1 occurrence
      return total + performerPoints * frequency
    }, 0)
  }

  // Add mental load points (weekly)
  // For one-time tasks (frequency_per_week is null), count as 1 occurrence
  if (thinkerData) {
    balance += thinkerData.reduce((total, assignment: any) => {
      const task = assignment.tasks
      const mentalLoadPoints = task?.mental_load_points ?? task?.task_templates?.default_mental_load_points ?? 0
      const frequency = assignment.frequency_per_week ?? 1 // null means one-time task = 1 occurrence
      return total + mentalLoadPoints * frequency
    }, 0)
  }

  // Return weekly balance (multiply by 4 for monthly if needed)
  return { balance, error: null }
}
