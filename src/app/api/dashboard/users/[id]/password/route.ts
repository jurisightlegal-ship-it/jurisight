import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

// PATCH /api/dashboard/users/[id]/password - Update user password (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user data first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      // Try to update existing auth user password
      const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
        password: password
      });

      if (updateError) {
        // If user doesn't exist in auth.users, check the error type
        if (updateError.message.includes('User not found') || 
            updateError.message.includes('not found') ||
            updateError.message.includes('Invalid user')) {
          
          console.log(`Creating auth account for existing user: ${userData.email}`);
          
          // Create auth user for existing user
          const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.name
            }
          });

          if (createError) {
            // If email already exists but user ID doesn't match, try different approach
            if (createError.message.includes('already registered')) {
              // Try to find the existing auth user by email and update password
              const { data: existingAuthUser, error: findError } = await supabase.auth.admin.listUsers();
              
              if (!findError && existingAuthUser.users) {
                const authUser = existingAuthUser.users.find(u => u.email === userData.email);
                
                if (authUser) {
                  // Update password for the found auth user
                  const { error: finalUpdateError } = await supabase.auth.admin.updateUserById(authUser.id, {
                    password: password
                  });
                  
                  if (finalUpdateError) {
                    throw new Error(`Failed to update password: ${finalUpdateError.message}`);
                  }
                  
                  return NextResponse.json({ 
                    message: 'Password updated successfully for existing auth user',
                    authUserId: authUser.id 
                  });
                }
              }
            }
            
            throw new Error(`Failed to create auth account: ${createError.message}`);
          }

          return NextResponse.json({ 
            message: 'Auth account created and password set successfully',
            authUserId: authUser.user?.id 
          });
        } else {
          throw new Error(`Failed to update password: ${updateError.message}`);
        }
      }

      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update password' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in password update endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
