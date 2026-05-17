'use client'

import { usePathname } from 'next/navigation'
import { useHousehold } from '@/lib/hooks/useHousehold'
import RecurringTasksOnboardingModal from '@/components/RecurringTasksOnboardingModal'

const AUTH_STYLE_PATHS = new Set([
  '/login',
  '/signup',
  '/reset-password',
  '/update-password',
  '/accept-cgu',
  '/auth/oauth-complete',
  '/politique-confidentialite',
  '/mentions-legales',
  '/cgu',
])

/**
 * Affiche la modale d’onboarding v3 tant que le foyer n’a pas `recurring_tasks_onboarding_completed_at`.
 */
export default function HouseholdOnboardingGate() {
  const pathname = usePathname()
  const { currentHousehold, loading, refetchHouseholds } = useHousehold(false)

  if (loading || AUTH_STYLE_PATHS.has(pathname)) {
    return null
  }

  if (!currentHousehold) {
    return null
  }

  if (currentHousehold.recurring_tasks_onboarding_completed_at) {
    return null
  }

  return (
    <RecurringTasksOnboardingModal
      householdId={currentHousehold.id}
      onCompleted={() => void refetchHouseholds()}
    />
  )
}
