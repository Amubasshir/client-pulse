import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'admin' | 'member';
  }

  interface Session {
    user: {
      role: 'admin' | 'member';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'member';
  }
}
