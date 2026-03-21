import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Protected routes that require authentication
  const protectedRoutes = ['/participants', '/tasks', '/balance']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/login', '/signup', '/reset-password', '/update-password']
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth route, redirect to home
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  // Only these routes need auth redirects — avoids running middleware (and Supabase)
  // on every page, which caused MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge.
  matcher: [
    '/participants/:path*',
    '/tasks/:path*',
    '/balance/:path*',
    '/login',
    '/signup',
    '/reset-password',
    '/update-password',
  ],
}

