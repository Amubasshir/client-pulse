import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

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
