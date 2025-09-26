import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

// GET /api/comments - Get comments for an article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        name,
        email,
        content,
        created_at,
        is_approved
      `)
      .eq('article_id', articleId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comments: comments || [],
      success: true
    });

  } catch (error) {
    console.error('Error in comments GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, name, email, content } = body;

    // Validate required fields
    if (!articleId || !name || !email || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        content: content.trim(),
        is_approved: false, // Comments need approval
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        name,
        email,
        content,
        created_at,
        is_approved
      `)
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comment,
      success: true,
      message: 'Comment submitted successfully. It will be reviewed before being published.'
    });

  } catch (error) {
    console.error('Error in comments POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
