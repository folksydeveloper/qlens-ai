import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin', '/settings', '/billing', '/api-keys'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('qlens-token')?.value;

  // Redirect to login if accessing protected route without token
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if accessing auth pages with token
  if (publicRoutes.some((route) => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to home if non-admin accesses admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route)) && token) {
    // We'll check role on client side for now
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register', '/forgot-password', '/settings/:path*', '/billing/:path*', '/api-keys/:path*'],
};
