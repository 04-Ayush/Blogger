import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  type CookieSetOptions = Parameters<typeof response.cookies.set>[2]

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieSetOptions) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieSetOptions) {
          response.cookies.set(name, '', options)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/dashboard', '/posts']
  const authRoutes = ['/login', '/register']

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(route + '/')
  )

  const isAuthRoute = authRoutes.includes(pathname)

  // Not logged in
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/:path*',
    '/login',
    '/register',
  ],
}