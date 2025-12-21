import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes - allow access without authentication
  const publicRoutes = ['/', '/login', '/cadastro']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes that require authentication
  const isDashboardRoute = pathname.startsWith('/aluno') ||
                          pathname.startsWith('/instrutor') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/configuracoes')

  // Redirect to login if accessing protected route without auth
  if (isDashboardRoute && (!user || error)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user role from profiles table if authenticated
  if (user && isDashboardRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role

    // Role-based route protection
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/instrutor') && userRole !== 'INSTRUTOR') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/aluno') && userRole !== 'ALUNO') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/cadastro')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role
    const redirectUrl = request.nextUrl.clone()

    // Redirect to appropriate dashboard based on role
    if (userRole === 'ADMIN') {
      redirectUrl.pathname = '/admin/instrutores'
    } else if (userRole === 'INSTRUTOR') {
      redirectUrl.pathname = '/instrutor/aulas'
    } else if (userRole === 'ALUNO') {
      redirectUrl.pathname = '/aluno/buscar'
    }

    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
