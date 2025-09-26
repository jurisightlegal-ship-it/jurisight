import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// GET /api/sections/[id] - Fetch single section with article count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: section, error } = await supabase
      .from('legal_sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    // Get article count for this section
    const { count: articleCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('section_id', id);

    return NextResponse.json({
      section: {
        ...section,
        articleCount: articleCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PUT /api/sections/[id] - Update section (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Generate new slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if another section with this slug already exists (excluding current section)
    const { data: existingSection } = await supabase
      .from('legal_sections')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingSection) {
      return NextResponse.json(
        { error: 'A section with this name already exists' },
        { status: 400 }
      );
    }

    // Update section
    const { data: updatedSection, error } = await supabase
      .from('legal_sections')
      .update({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color,
        icon: icon?.trim() || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedSection) {
      return NextResponse.json(
        { error: 'Section not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ section: updatedSection });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/sections/[id] - Delete section (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if section has any articles
    const { count: articleCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('section_id', id);

    if (articleCount && articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete section. It contains ${articleCount} article(s).` },
        { status: 400 }
      );
    }

    // Delete section
    const { error } = await supabase
      .from('legal_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting section:', error);
      return NextResponse.json(
        { error: 'Failed to delete section' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
