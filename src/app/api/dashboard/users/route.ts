import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase-db';

// GET /api/dashboard/users - Fetch all users (admin only)
export async function GET() {
  try {
    // Use Supabase client directly
    const allUsers = await SupabaseDB.getAllUsers();
    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, password, bio, image, linkedinUrl, personalEmail } = body;

    // Validate required fields
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Use Supabase client directly with password support
    const newUser = await SupabaseDB.createUserWithPassword({
      name,
      email,
      role: role || 'CONTRIBUTOR',
      password,
      bio,
      image,
      linkedinUrl,
      personalEmail
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
