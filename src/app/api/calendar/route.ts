import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has contributor access or higher
    if (!['CONTRIBUTOR', 'EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Contributor access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // Default to current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Calculate date range for the month using UTC to avoid timezone cutoffs
    const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    // Build query based on user role - simplified version
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        status,
        scheduled_at,
        published_at,
        created_at,
        author_id,
        section_id
      `)
      .eq('status', 'SCHEDULED')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .order('scheduled_at', { ascending: true });

    // If user is only a contributor, only show their own articles
    if (session.user.role === 'CONTRIBUTOR') {
      query = query.eq('author_id', session.user.id);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching calendar articles:', error);
      return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
    }

    // Group articles by date
    const calendarData = articles?.reduce((acc, article) => {
      if (!article.scheduled_at) return acc;
      // Use an ISO-like local date key (YYYY-MM-DD) to better align with client calendar grid
      const d = new Date(article.scheduled_at);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!acc[date]) {
        acc[date] = [];
      }
      
      acc[date].push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        dek: article.dek,
        status: article.status,
        scheduledAt: article.scheduled_at,
        publishedAt: article.published_at,
        createdAt: article.created_at,
        author: {
          id: article.author_id,
          name: 'Author', // Placeholder - will be fetched separately if needed
          email: 'author@example.com'
        },
        section: {
          id: article.section_id,
          name: 'Section', // Placeholder - will be fetched separately if needed
          color: '#6B7280'
        }
      });
      
      return acc;
    }, {} as Record<string, Array<{
      id: number | string;
      title: string;
      slug: string;
      dek?: string;
      status: string;
      scheduledAt: string;
      publishedAt: string | null;
      createdAt: string;
      author: {
        id: string;
        name: string | null;
        email: string;
      };
      section: {
        id: number | string;
        name: string;
        color: string;
      };
    }>>) || {};

    return NextResponse.json({
      calendarData,
      month: targetMonth,
      year: targetYear,
      totalArticles: articles?.length || 0
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
