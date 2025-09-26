import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Get fresh user data from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compare session data with database data
    const sessionData = {
      id: session.user.id,
      role: session.user.role,
      isActive: session.user.isActive,
      name: session.user.name,
      email: session.user.email
    };

    const dbData = {
      id: profile.id,
      role: profile.role,
      isActive: profile.is_active,
      name: profile.name,
      email: profile.email
    };

    const isInSync = JSON.stringify(sessionData) === JSON.stringify(dbData);

    return NextResponse.json({
      isInSync,
      sessionData,
      dbData,
      needsRefresh: !isInSync
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
