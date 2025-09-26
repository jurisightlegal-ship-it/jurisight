import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// GET /api/dashboard/revision-notes - Fetch revision notes for the current user's articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get revision notes for articles authored by the current user
    const { data: revisionNotes, error } = await supabase
      .from('editorial_comments')
      .select(`
        id,
        comment,
        is_internal,
        created_at,
        editor_id,
        article_id,
        articles!inner(
          id,
          title,
          slug,
          status,
          author_id
        ),
        users(
          id,
          name,
          email
        )
      `)
      .eq('articles.author_id', session.user.id)
      .eq('is_internal', false) // Only external revision notes (for authors)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching revision notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch revision notes' },
        { status: 500 }
      );
    }

    // Group revision notes by article
    const notesByArticle = revisionNotes?.reduce((acc, note) => {
      const articleId = note.article_id;
      if (!acc[articleId]) {
        acc[articleId] = {
          article: note.articles,
          notes: []
        };
      }
      acc[articleId].notes.push({
        id: note.id,
        comment: note.comment,
        created_at: note.created_at,
        editor: note.users
      });
      return acc;
    }, {} as Record<number, { article: any; notes: any[] }>) || {};

    return NextResponse.json({ 
      revisionNotes: Object.values(notesByArticle),
      totalCount: revisionNotes?.length || 0
    });

  } catch (error) {
    console.error('Error fetching revision notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revision notes' },
      { status: 500 }
    );
  }
}
