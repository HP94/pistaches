/** Cookie set while the user must finish password recovery (client + middleware). */
export const RECOVERY_PENDING_COOKIE_NAME = 'ph_recovery_pending'

const MAX_AGE_SEC = 60 * 60 // 1 h — aligné avec l’ordre de grandeur des liens e-mail

export function setRecoveryPendingCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${RECOVERY_PENDING_COOKIE_NAME}=1; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`
}

export function clearRecoveryPendingCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${RECOVERY_PENDING_COOKIE_NAME}=; path=/; max-age=0`
}
