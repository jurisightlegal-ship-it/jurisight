import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB, supabase } from '@/lib/supabase-db';

// GET /api/dashboard/users/[id] - Get single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use Supabase client directly
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Map database fields to frontend interface
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active, // Map is_active to isActive
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      bio: user.bio,
      image: user.image,
      linkedinUrl: user.linkedin_url,
      personalEmail: user.personal_email
    };

    return NextResponse.json({ user: mappedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/users/[id] - Update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { 
      name, 
      email, 
      role, 
      password,
      isActive, 
      bio, 
      image, 
      linkedinUrl, 
      personalEmail 
    } = body;

    // Validate required fields only if they are being updated
    // If only isActive is being updated, name and email are not required
    const isOnlyUpdatingStatus = Object.keys(body).length === 1 && 'isActive' in body;
    
    if (!isOnlyUpdatingStatus && (!name || !email)) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Clean up data - convert null/undefined to empty strings for optional fields
    const cleanData: {
      name?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
      bio?: string;
      image?: string;
      linkedinUrl?: string;
      personalEmail?: string;
    } = {};

    // Only include fields that are being updated
    if (name !== undefined) cleanData.name = name.trim() || '';
    if (email !== undefined) cleanData.email = email.trim() || '';
    if (role !== undefined) cleanData.role = ['CONTRIBUTOR', 'EDITOR', 'ADMIN'].includes(role) ? role : 'CONTRIBUTOR';
    if (isActive !== undefined) cleanData.isActive = Boolean(isActive);
    if (bio !== undefined) cleanData.bio = bio.trim() || '';
    if (image !== undefined) cleanData.image = image.trim() || '';
    if (linkedinUrl !== undefined) cleanData.linkedinUrl = linkedinUrl.trim() || '';
    if (personalEmail !== undefined) cleanData.personalEmail = personalEmail.trim() || '';

    // Use Supabase client directly with password support
    const updatedUser = await SupabaseDB.updateUserWithPassword(id, cleanData, password);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
