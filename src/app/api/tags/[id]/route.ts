import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// GET /api/tags/[id] - Fetch single tag with article count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: tag, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Get article count for this tag
    const { count: articleCount } = await supabase
      .from('article_tags')
      .select('*', { count: 'exact' })
      .eq('tag_id', id);

    return NextResponse.json({
      tag: {
        ...tag,
        articleCount: articleCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin/editor permissions
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin or Editor role required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Generate new slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if another tag with this slug already exists (excluding current tag)
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      );
    }

    // Update tag
    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update({
        name: name.trim(),
        slug,
        description: description?.trim() || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedTag) {
      return NextResponse.json(
        { error: 'Tag not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag: updatedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Delete tag
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

    // Check if tag has any articles
    const { count: articleCount } = await supabase
      .from('article_tags')
      .select('*', { count: 'exact' })
      .eq('tag_id', id);

    if (articleCount && articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete tag. It is used by ${articleCount} article(s).` },
        { status: 400 }
      );
    }

    // Delete tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tag:', error);
      return NextResponse.json(
        { error: 'Failed to delete tag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
