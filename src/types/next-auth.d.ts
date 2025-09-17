import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
      bio?: string;
      isActive: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
    bio?: string;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
    bio?: string;
    isActive: boolean;
  }
}
