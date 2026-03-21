'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { signOutLocal } from '@/lib/supabase/auth'

/** Max time to wait for first session bootstrap; if exceeded, assume stuck refresh loop */
const SESSION_BOOTSTRAP_TIMEOUT_MS = 20_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(label))
    }, ms)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch((e) => {
        clearTimeout(t)
        reject(e)
      })
  })
}

/**
 * Global safety net: if Supabase has a bad refresh token or auth is stuck
 * (infinite /token refresh attempts), we clear local session so the app can
 * show login again instead of "Chargement..." forever.
 */
export default function AuthRecovery() {
  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const result = await withTimeout(
          supabase.auth.getSession(),
          SESSION_BOOTSTRAP_TIMEOUT_MS,
          'SESSION_BOOTSTRAP_TIMEOUT'
        )
        if (cancelled) return

        const { error } = result
        if (error) {
          console.warn('[auth] getSession reported error, clearing local session', error)
          await signOutLocal()
        }
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        if (msg === 'SESSION_BOOTSTRAP_TIMEOUT') {
          console.warn('[auth] Session bootstrap timed out — clearing local session to recover')
          await signOutLocal()
        } else {
          console.warn('[auth] Session bootstrap failed — clearing local session', e)
          await signOutLocal()
        }
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Refresh succeeded but no session → treat as broken state
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('[auth] TOKEN_REFRESHED with no session — clearing local session')
        await signOutLocal()
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return null
}
