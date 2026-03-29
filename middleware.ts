import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RECOVERY_PENDING_COOKIE_NAME } from '@/lib/auth/recoveryCookie'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Use getSession() — reads from cookies without an extra Auth API round-trip.
  // getUser() validates with Supabase on every request and often causes
  // MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const pathname = request.nextUrl.pathname
  const recoveryPending =
    request.cookies.get(RECOVERY_PENDING_COOKIE_NAME)?.value === '1'

  // CORE #5 : tant que la réinitialisation n’est pas terminée, pas d’accès au reste de l’app
  if (user && recoveryPending && pathname !== '/update-password') {
    return NextResponse.redirect(new URL('/update-password', request.url))
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/participants', '/tasks', '/balance']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Connexion / inscription / demande de lien : rediriger vers l’accueil si déjà connecté.
  // Ne pas inclure /update-password : la session « recovery » est nécessaire pour changer le MDP.
  const authRoutesRedirectWhenLoggedIn = ['/login', '/signup', '/reset-password']
  const isAuthRouteRedirectWhenLoggedIn = authRoutesRedirectWhenLoggedIn.includes(
    pathname
  )

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthRouteRedirectWhenLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  // Only these routes need auth redirects — avoids running middleware (and Supabase)
  // on every page, which caused MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge.
  matcher: [
    '/',
    '/select-household',
    '/select-household/:path*',
    '/participants/:path*',
    '/tasks/:path*',
    '/balance/:path*',
    '/login',
    '/signup',
    '/reset-password',
    '/update-password',
  ],
}

