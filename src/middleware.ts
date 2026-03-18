import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Redirect root to default clinic
  if (path === '/') {
    return NextResponse.redirect(new URL('/c/aura-premium', request.url));
  }
  
  // Protect /admin and /sys routes (Basic structure, real auth should be added)
  if (path.startsWith('/admin')) {
    // Check for clinic_admin/staff session
  }
  
  if (path.startsWith('/sys')) {
    // Check for super_admin session
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
