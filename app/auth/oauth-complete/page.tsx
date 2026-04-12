'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  hasAcceptedCgu,
  OAUTH_SIGNUP_CHOICES_KEY,
  OAUTH_SIGNUP_CHOICES_MAX_AGE_MS,
  type OAuthSignupChoicesPayload,
} from '@/lib/legal/userConsent'

export default function OAuthCompletePage() {
  const router = useRouter()
  const [message, setMessage] = useState('Finalisation de votre compte…')

  useEffect(() => {
    let cancelled = false

    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session) {
        router.replace('/login')
        return
      }

      let raw: string | null = null
      try {
        raw = sessionStorage.getItem(OAUTH_SIGNUP_CHOICES_KEY)
      } catch {
        raw = null
      }

      if (raw) {
        let payload: OAuthSignupChoicesPayload
        try {
          payload = JSON.parse(raw) as OAuthSignupChoicesPayload
        } catch {
          sessionStorage.removeItem(OAUTH_SIGNUP_CHOICES_KEY)
          if (!hasAcceptedCgu(session.user)) {
            router.replace('/accept-cgu')
            return
          }
          router.replace('/')
          return
        }

        sessionStorage.removeItem(OAUTH_SIGNUP_CHOICES_KEY)

        const started = Date.parse(payload.flowStartedAt)
        const stale =
          Number.isNaN(started) ||
          Date.now() - started > OAUTH_SIGNUP_CHOICES_MAX_AGE_MS

        if (stale) {
          if (!hasAcceptedCgu(session.user)) {
            router.replace('/accept-cgu')
            return
          }
          router.replace('/')
          return
        }

        const { error } = await supabase.auth.updateUser({
          data: {
            cgu_accepted_at: payload.cguAcceptedAt,
            cgu_version: payload.cguVersion,
            stats_research_consent: payload.statsResearchConsent,
            stats_research_consent_at: new Date().toISOString(),
          },
        })

        if (cancelled) return

        if (error) {
          setMessage('Impossible d’enregistrer vos choix. Réessayez ou contactez le support.')
          return
        }

        router.replace('/')
        return
      }

      if (!hasAcceptedCgu(session.user)) {
        router.replace('/accept-cgu')
        return
      }

      router.replace('/')
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-6 py-12">
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  )
}
