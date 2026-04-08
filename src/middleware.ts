import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic =
    pathname === '/login' || pathname.startsWith('/api/auth');

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }
});

export const config = {
  // Skip Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
