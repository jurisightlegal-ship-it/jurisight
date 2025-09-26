import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
  bio: string | null;
  linkedin_url: string | null;
  personal_email: string | null;
  created_at: string;
}

// GET /api/team - Fetch all contributors and editors (public)
export async function GET() {
  try {
    const { data: teamMembers, error } = await supabase
      .from('users')
      .select('id, name, email, image, role, bio, linkedin_url, personal_email, created_at')
      .in('role', ['CONTRIBUTOR', 'EDITOR', 'ADMIN'])
      .eq('is_active', true)
      .neq('email', 'jurisightlegal@gmail.com')
      .order('role', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    return NextResponse.json({ team: teamMembers || [] });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
