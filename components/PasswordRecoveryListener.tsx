'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  clearRecoveryPendingCookie,
  setRecoveryPendingCookie,
} from '@/lib/auth/recoveryCookie'

/**
 * Marque le flux « réinitialisation mot de passe » pour le middleware (pas d’accès app tant que le MDP n’est pas défini).
 * Supabase émet PASSWORD_RECOVERY après échange du lien (hash ou PKCE).
 */
export default function PasswordRecoveryListener() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setRecoveryPendingCookie()
      }
      if (event === 'SIGNED_OUT') {
        clearRecoveryPendingCookie()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
