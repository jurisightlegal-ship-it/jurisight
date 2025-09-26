import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// GET /api/sections - Fetch all legal sections
export async function GET() {
  try {
    const { data: sections, error } = await supabase
      .from('legal_sections')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching sections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ sections: sections || [] });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/sections - Create new legal section (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Section name is required' },
        { status: 400 }
      );
    }

    if (!color || !color.match(/^#[0-9A-F]{6}$/i)) {
      return NextResponse.json(
        { error: 'Valid color hex code is required (e.g., #FF5733)' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if section with this slug already exists
    const { data: existingSection } = await supabase
      .from('legal_sections')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSection) {
      return NextResponse.json(
        { error: 'A section with this name already exists' },
        { status: 400 }
      );
    }

    const { data: newSection, error } = await supabase
      .from('legal_sections')
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color,
        icon: icon?.trim() || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return NextResponse.json(
        { error: 'Failed to create section' },
        { status: 500 }
      );
    }

    return NextResponse.json({ section: newSection }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
