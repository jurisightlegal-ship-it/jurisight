import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only editors and admins can send revision notes
    if (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { notes, editorId } = await request.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: 'Revision notes are required' },
        { status: 400 }
      );
    }

    // Get the article to verify it exists and get author info
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, author_id, status')
      .eq('id', id)
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is in NEEDS_REVISIONS status
    if (article.status !== 'NEEDS_REVISIONS') {
      return NextResponse.json(
        { error: 'Article is not in NEEDS_REVISIONS status' },
        { status: 400 }
      );
    }

    // Insert revision notes into editorial_comments table
    const { data: revisionNote, error: insertError } = await supabase
      .from('editorial_comments')
      .insert({
        article_id: parseInt(id),
        editor_id: editorId || session.user.id,
        comment: notes.trim(),
        is_internal: false, // This is a revision note for the author
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting revision notes:', insertError);
      return NextResponse.json(
        { error: 'Failed to save revision notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Revision notes sent successfully',
      revisionNote
    });

  } catch (error) {
    console.error('Error sending revision notes:', error);
    return NextResponse.json(
      { error: 'Failed to send revision notes' },
      { status: 500 }
    );
  }
}
