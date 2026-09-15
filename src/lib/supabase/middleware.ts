import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    const isLoginPage = path === '/admin/login';

    if (!user && !isLoginPage) {
      // Unauthenticated user trying to access admin page
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (user) {
      // Check user role in user_roles table
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const role = userRole?.role;
      const isAdminOrManager = role === 'admin' || role === 'manager';

      if (isLoginPage) {
        if (isAdminOrManager) {
          url.pathname = '/admin/dashboard';
          return NextResponse.redirect(url);
        }
      } else {
        if (!isAdminOrManager) {
          url.pathname = '/unauthorized';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
