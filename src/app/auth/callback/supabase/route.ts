import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (token_hash && type) {
    try {
      // Verify the magic link token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'email',
      });

      if (error) {
        console.error('Magic link verification error:', error);
        return NextResponse.redirect(
          new URL('/auth/signin?error=magic-link-failed', request.url)
        );
      }

      if (data.user) {
        // Get or create user profile
        const { error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // User doesn't exist in our users table, create it
          await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
              role: 'CONTRIBUTOR',
              is_active: true,
              emailVerified: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }

        // Redirect to dashboard or home page
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Magic link callback error:', error);
    }
  }

  // If we get here, something went wrong
  return NextResponse.redirect(
    new URL('/auth/signin?error=magic-link-failed', request.url)
  );
}
