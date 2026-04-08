import type { NextAuthConfig } from 'next-auth';

// Edge-safe auth config — no Node.js-only imports (no bcrypt, no mongoose).
// Used by middleware. Full auth (with Credentials provider) is in auth.ts.
export const authConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.id = token.sub;
        u.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const },
} satisfies NextAuthConfig;
