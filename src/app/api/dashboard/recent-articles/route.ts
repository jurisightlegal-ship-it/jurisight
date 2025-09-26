import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase-db';

// GET /api/dashboard/recent-articles - Fetch recent articles for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    let articles;
    
    // If status is specified and it's for review queue, use the review queue method
    if (status && (status === 'REVIEW_QUEUE' || status === 'IN_REVIEW' || status === 'DRAFT' || status === 'NEEDS_REVISIONS' || status === 'APPROVED')) {
      articles = await SupabaseDB.getReviewQueueArticles(limit);
    } else {
      // Use regular recent articles method
      articles = await SupabaseDB.getRecentArticles(limit);
    }
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent articles' },
      { status: 500 }
    );
  }
}
