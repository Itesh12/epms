import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value || request.headers.get('authorization')?.split(' ')[1];
  
  // Note: In a real app with HttpOnly cookies, we'd check the cookie.
  // Since we are using localStorage + api interceptors for now, 
  // middleware is limited unless we move tokens to cookies.
  
  const path = request.nextUrl.pathname;
  
  // Define protected routes
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/projects') || 
                          path.startsWith('/employees');
  
  // Define auth routes (where logged in users shouldn't go)
  const isAuthRoute = path === '/login' || path === '/signup';

  // For this demo, we'll assume authentication status is managed 
  // mainly on the client, but we can add basic cookie-based checks here 
  // if we move tokens to cookies later.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/employees/:path*', '/login', '/signup'],
};
