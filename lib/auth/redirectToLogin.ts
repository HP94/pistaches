const AUTH_PATH_PREFIXES = [
  '/login',
  '/signup',
  '/reset-password',
  '/update-password',
  '/accept-cgu',
  '/auth/',
  '/politique-confidentialite',
  '/mentions-legales',
  '/cgu',
]

/** Redirection complète vers la connexion (hors écrans auth). */
export function redirectToLoginIfNeeded() {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (AUTH_PATH_PREFIXES.some((p) => path === p || path.startsWith(p))) return
  window.location.assign('/login')
}
