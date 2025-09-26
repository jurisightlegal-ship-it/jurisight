import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';


// GET /api/dashboard/articles - Fetch articles with role-based filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const sectionId = searchParams.get('sectionId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        body,
        featured_image,
        status,
        reading_time,
        views,
        published_at,
        created_at,
        updated_at,
        author_id,
        section_id,
        users(
          id,
          name,
          image
        ),
        legal_sections(
          id,
          name,
          slug,
          color
        ),
        article_tags(
          tags(
            id,
            name,
            slug
          )
        )
      `);

    // Role-based filtering
    if (session.user.role === 'CONTRIBUTOR') {
      // Contributors can only see their own articles
      query = query.eq('author_id', session.user.id);
    }
    // Admins and Editors can see all articles

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,dek.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // Transform the data to match expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedArticles = (articles || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      body: article.body,
      featuredImage: article.featured_image,
      status: article.status,
      readingTime: article.reading_time,
      views: article.views,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        id: article.users?.id || article.author_id,
        name: article.users?.name || 'Unknown Author',
        image: article.users?.image || null,
      },
      section: {
        id: article.legal_sections?.id || article.section_id,
        name: article.legal_sections?.name || 'Unknown Section',
        slug: article.legal_sections?.slug || 'unknown',
        color: article.legal_sections?.color || '#6B7280',
      },
      tags: (article.article_tags || []).map((at: any) => at.tags?.name || '').filter(Boolean)
    }));

    return NextResponse.json({
      articles: transformedArticles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
