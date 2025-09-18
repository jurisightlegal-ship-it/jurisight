import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  // Remove hard dependency on env vars for URL/secret
  secret: process.env.NEXTAUTH_SECRET || 'jurisight-secret-do-not-use-in-real-prod',
  // Temporarily disable database adapter for development
  // adapter: DrizzleAdapter(db, {
  //   usersTable: users,
  //   accountsTable: accounts,
  //   sessionsTable: sessions,
  //   verificationTokensTable: verificationTokens,
  // }),
  providers: [
    // Development credentials provider for easy testing
    CredentialsProvider({
      name: 'Development Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        role: { 
          label: 'Role', 
          type: 'select',
          options: ['CONTRIBUTOR', 'EDITOR', 'ADMIN']
        }
      },
      async authorize(credentials) {
        // For development only - accept any email
        if (credentials?.email) {
          return {
            id: 'dev-' + Date.now(),
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: (credentials.role as 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN') || 'CONTRIBUTOR',
            isActive: true,
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'development-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'development-secret',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // Add mock user data for development
        session.user.id = token.sub || 'dev-user-id';
        session.user.role = 'CONTRIBUTOR'; // Default role for development
        session.user.bio = 'Legal enthusiast and contributor';
        session.user.isActive = true;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ account }) {
      // Automatically approve sign-ins for Google OAuth
      if (account?.provider === 'google') {
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Use JWT for development instead of database
  },
  debug: process.env.NODE_ENV === 'development',
};
