import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  buildSignupUserMetadata,
  CGU_VERSION,
  hasAcceptedCgu,
  readStatsResearchConsent,
} from '@/lib/legal/userConsent'

function userWithMetadata(meta: Record<string, unknown>): User {
  return {
    id: 'u1',
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2020-01-01T00:00:00Z',
    user_metadata: meta,
  } as User
}

describe('hasAcceptedCgu', () => {
  it('returns false when user is null', () => {
    expect(hasAcceptedCgu(null)).toBe(false)
  })

  it('returns false when cgu_accepted_at is missing or empty', () => {
    expect(hasAcceptedCgu(userWithMetadata({}))).toBe(false)
    expect(hasAcceptedCgu(userWithMetadata({ cgu_accepted_at: '' }))).toBe(false)
  })

  it('returns true when cgu_accepted_at is a non-empty string', () => {
    expect(hasAcceptedCgu(userWithMetadata({ cgu_accepted_at: '2026-01-01T00:00:00.000Z' }))).toBe(true)
  })
})

describe('readStatsResearchConsent', () => {
  it('returns false when stats_research_consent is not true', () => {
    expect(readStatsResearchConsent(null)).toBe(false)
    expect(readStatsResearchConsent(userWithMetadata({}))).toBe(false)
    expect(readStatsResearchConsent(userWithMetadata({ stats_research_consent: false }))).toBe(false)
  })

  it('returns true when stats_research_consent is true', () => {
    expect(readStatsResearchConsent(userWithMetadata({ stats_research_consent: true }))).toBe(true)
  })
})

describe('buildSignupUserMetadata', () => {
  it('sets CGU version and consent flags with ISO timestamps', () => {
    const meta = buildSignupUserMetadata(true)
    expect(meta.cgu_version).toBe(CGU_VERSION)
    expect(typeof meta.cgu_accepted_at).toBe('string')
    expect(meta.cgu_accepted_at.length).toBeGreaterThan(0)
    expect(meta.stats_research_consent).toBe(true)
    expect(meta.stats_research_consent_at).toBe(meta.cgu_accepted_at)

    const metaNoStats = buildSignupUserMetadata(false)
    expect(metaNoStats.stats_research_consent).toBe(false)
  })
})
