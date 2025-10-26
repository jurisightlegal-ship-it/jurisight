export const revalidate = 120;
export const fetchCache = 'default-cache';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

// GET /api/featured-articles - Get featured articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Fetch featured articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        featured_image,
        reading_time,
        views,
        published_at,
        featured_at,
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
        )
      `)
      .eq('status', 'PUBLISHED')
      .eq('is_featured', true)
      .not('featured_at', 'is', null)
      .order('featured_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured articles' },
        { status: 500 }
      );
    }

    // Transform the response
    const transformedArticles = articles?.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      featuredImage: article.featured_image,
      readingTime: article.reading_time,
      views: article.views || 0,
      publishedAt: article.published_at,
      featuredAt: article.featured_at,
      author: {
        id: Array.isArray(article.users) ? (article.users as { id: string; name: string; slug: string; color: string; })[0]?.id || 'unknown' : (article.users as { id: string; name: string; slug: string; color: string; })?.id || 'unknown',
        name: Array.isArray(article.users) ? (article.users as { id: string; name: string; slug: string; color: string; })[0]?.name || 'Unknown Author' : (article.users as { id: string; name: string; slug: string; color: string; })?.name || 'Unknown Author',
        avatar: Array.isArray(article.users) ? (article.users as { id: string; name: string; slug: string; color: string; })[0]?.image || null : (article.users as { id: string; name: string; slug: string; color: string; })?.image || null,
      },
      section: {
        id: Array.isArray(article.legal_sections) ? (article.legal_sections as { id: string; name: string; slug: string; color: string; })[0]?.id || 0 : (article.legal_sections as { id: string; name: string; slug: string; color: string; })?.id || 0,
        name: Array.isArray(article.legal_sections) ? (article.legal_sections as { id: string; name: string; slug: string; color: string; })[0]?.name || 'Unknown Section' : (article.legal_sections as { id: string; name: string; slug: string; color: string; })?.name || 'Unknown Section',
        slug: Array.isArray(article.legal_sections) ? (article.legal_sections as { id: string; name: string; slug: string; color: string; })[0]?.slug || 'unknown' : (article.legal_sections as { id: string; name: string; slug: string; color: string; })?.slug || 'unknown',
        color: Array.isArray(article.legal_sections) ? (article.legal_sections as { id: string; name: string; slug: string; color: string; })[0]?.color || '#6B7280' : (article.legal_sections as { id: string; name: string; slug: string; color: string; })?.color || '#6B7280',
      },
    })) || [];

    return NextResponse.json({ 
      articles: transformedArticles,
      count: transformedArticles.length 
    });

  } catch (error) {
    console.error('Error in featured articles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
