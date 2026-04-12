import type { User } from '@supabase/supabase-js'

/** Incrémenter lors d’un changement substantiel des CGU (nouvelle acceptation requise). */
export const CGU_VERSION = '1'

/** Stockage navigateur avant redirection OAuth (inscription). */
export const OAUTH_SIGNUP_CHOICES_KEY = 'equal_housing_oauth_signup_choices'

/** Durée max entre le clic « Google » et le retour OAuth (évite d’appliquer de vieux choix à un autre compte). */
export const OAUTH_SIGNUP_CHOICES_MAX_AGE_MS = 25 * 60 * 1000

export type OAuthSignupChoicesPayload = {
  cguAcceptedAt: string
  cguVersion: string
  statsResearchConsent: boolean
  flowStartedAt: string
}

export function hasAcceptedCgu(user: User | null | undefined): boolean {
  const v = user?.user_metadata?.cgu_accepted_at
  return typeof v === 'string' && v.length > 0
}

export function buildSignupUserMetadata(statsResearchConsent: boolean) {
  const now = new Date().toISOString()
  return {
    cgu_accepted_at: now,
    cgu_version: CGU_VERSION,
    stats_research_consent: statsResearchConsent,
    stats_research_consent_at: now,
  }
}

export function readStatsResearchConsent(user: User | null | undefined): boolean {
  return user?.user_metadata?.stats_research_consent === true
}
