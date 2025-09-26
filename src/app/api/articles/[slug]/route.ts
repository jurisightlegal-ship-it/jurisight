import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';


// GET /api/articles/[slug] - Fetch single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch article with related data
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        body,
        featured_image,
        reading_time,
        views,
        published_at,
        created_at,
        updated_at,
        users(
          id,
          name,
          bio,
          image
        ),
        legal_sections(
          id,
          name,
          slug,
          color,
          description
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Fetch case citations (if you have this table)
    const { data: citations } = await supabase
      .from('case_citations')
      .select('*')
      .eq('article_id', article.id);

    // Fetch source links (if you have this table)
    const { data: sources } = await supabase
      .from('source_links')
      .select('*')
      .eq('article_id', article.id);

    // Increment view count
    await supabase
      .from('articles')
      .update({ 
        views: (article.views || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id);

    // Transform the data to match expected format
    const transformedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      body: article.body,
      featuredImage: article.featured_image,
      readingTime: article.reading_time,
      views: (article.views || 0) + 1, // Return updated view count
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (article as any).users?.id || (article as any).author_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (article as any).users?.name || 'Unknown Author',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bio: (article as any).users?.bio || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatar: (article as any).users?.image || null,
      },
      section: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (article as any).legal_sections?.id || (article as any).section_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (article as any).legal_sections?.name || 'Unknown Section',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slug: (article as any).legal_sections?.slug || 'unknown',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (article as any).legal_sections?.color || '#6B7280',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (article as any).legal_sections?.description || null,
      },
      caseCitations: citations || [],
      sourceLinks: sources || [],
    };

    return NextResponse.json({
      article: transformedArticle
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[slug] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, dek, bodyContent, sectionId, featuredImage, status } = body;

    const updateData: {
      title: string;
      dek: string;
      body: string;
      section_id: string;
      featured_image: string;
      status: string;
      updated_at: string;
      published_at?: string;
    } = {
      title,
      dek,
      body: bodyContent,
      section_id: sectionId,
      featured_image: featuredImage,
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'PUBLISHED') {
      updateData.published_at = new Date().toISOString();
    }

    // Update article
    const { data: updatedArticle, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error || !updatedArticle) {
      return NextResponse.json(
        { error: 'Article not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
