import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';

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
    // Supabase Email/Password Authentication
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            return null;
          }

          // Get user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || profile?.name || data.user.email?.split('@')[0],
            role: profile?.role || 'CONTRIBUTOR',
            isActive: profile?.isActive ?? true,
            bio: profile?.bio,
            image: data.user.user_metadata?.avatar_url || profile?.image,
            accessToken: data.session?.access_token,
          };
        } catch (error) {
          console.error('Supabase auth error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        // Use cached data from token if available, only fetch fresh data occasionally
        const now = Date.now();
        const lastFetch = token.lastUserFetch as number || 0;
        const shouldFetchFresh = !token.userData || (now - lastFetch) > 30000; // 30 seconds cache

        if (shouldFetchFresh) {
          try {
            console.log('Session callback: Fetching fresh user data for', token.sub);
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', token.sub)
              .single();

            if (error) {
              console.error('Session callback: Error fetching user profile:', error);
              throw error;
            }

            if (profile) {
              // Cache the user data in token
              token.userData = {
                id: profile.id,
                role: profile.role,
                bio: profile.bio,
                isActive: profile.is_active ?? true, // Default to true if undefined/null
                image: profile.image,
                name: profile.name,
                email: profile.email
              };
              
              // Get fresh access token from Supabase
              const { data: sessionData } = await supabase.auth.getSession();
              token.accessToken = sessionData.session?.access_token;
              token.lastUserFetch = now;
              
              console.log('Session callback: Fresh user data cached:', {
                id: profile.id,
                role: profile.role,
                isActive: profile.is_active ?? true,
                name: profile.name
              });
            } else {
              console.warn('Session callback: No profile found for user', token.sub);
              // Fallback for new users
              token.userData = {
                id: token.sub || 'user-id',
                role: 'CONTRIBUTOR',
                isActive: true,
                name: 'User',
                email: session.user.email
              };
              token.lastUserFetch = now;
            }
          } catch (error) {
            console.error('Session callback error:', error);
            // Fallback data
            token.userData = {
              id: token.sub || 'user-id',
              role: 'CONTRIBUTOR',
              isActive: true,
              name: 'User',
              email: session.user.email
            };
            token.lastUserFetch = now;
          }
        }

        // Use cached data or fallback
        const userData: any = token.userData || {
          id: token.sub || 'user-id',
          role: 'CONTRIBUTOR',
          isActive: true,
          name: 'User',
          email: session.user.email
        };

        // Ensure isActive is always a boolean
        if (userData.isActive === null || userData.isActive === undefined) {
          userData.isActive = true;
        }

        // Update session with user data
        session.user.id = userData.id;
        session.user.role = userData.role;
        session.user.bio = userData.bio;
        session.user.isActive = userData.isActive;
        session.user.image = userData.image;
        session.user.name = userData.name;
        session.user.email = userData.email;
        (session as { id: string; name: string; email: string; role: string; }).accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
        token.accessToken = (user as { id: string; name: string; email: string; role: string; }).accessToken;
      }
      return token;
    },
    async signIn({ user }) {
      // Handle magic link sign-in
      if (user.id === 'magic-link-sent') {
        return false; // Don't create a session for magic link sent
      }

      // For regular sign-ins, create/update user in our database
      if (user.id && user.email) {
        try {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role || 'CONTRIBUTOR',
              isActive: user.isActive ?? true,
              bio: user.bio,
              updatedAt: new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (error) {
            console.error('User upsert error:', error);
          }
        } catch (error) {
          console.error('User creation error:', error);
        }
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
