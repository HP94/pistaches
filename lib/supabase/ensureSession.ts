import { supabase } from './client'

/** Vérifie qu’une session utilisable est présente avant les écritures Supabase. */
export async function ensureSupabaseSession(): Promise<{ ok: true } | { ok: false; message: string }> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return {
      ok: false,
      message: 'Session expirée. Reconnectez-vous pour enregistrer vos modifications.',
    }
  }

  if (!session) {
    return {
      ok: false,
      message: 'Session expirée. Reconnectez-vous pour enregistrer vos modifications.',
    }
  }

  return { ok: true }
}
