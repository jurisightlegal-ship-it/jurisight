import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

export async function POST(request: NextRequest) {
  try {
    // Check for API key or basic auth to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const apiKey = request.headers.get('x-api-key');
    
    // Simple API key check (you should use a more secure method in production)
    const expectedApiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    
    if (apiKey !== expectedApiKey && authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Publish Scheduled: Starting scheduled article check');

    // Get current time
    const now = new Date();
    const currentTime = now.toISOString();

    // Find articles that are scheduled and ready to be published
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, slug, scheduled_at, status')
      .not('scheduled_at', 'is', null)
      .eq('status', 'SCHEDULED')
      .lte('scheduled_at', currentTime);

    if (fetchError) {
      console.error('Error fetching scheduled articles:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch scheduled articles' }, { status: 500 });
    }

    if (!scheduledArticles || scheduledArticles.length === 0) {
      console.log('Publish Scheduled: No articles ready for publishing');
      return NextResponse.json({ 
        message: 'No articles ready for publishing',
        publishedCount: 0,
        articles: []
      });
    }

    console.log(`Publish Scheduled: Found ${scheduledArticles.length} articles ready for publishing`);

    const publishedArticles = [];

    // Publish each scheduled article
    for (const article of scheduledArticles) {
      try {
        const { data: updatedArticle, error: updateError } = await supabase
          .from('articles')
          .update({
            status: 'PUBLISHED',
            published_at: currentTime,
            updated_at: currentTime
          })
          .eq('id', article.id)
          .select('id, title, slug, published_at')
          .single();

        if (updateError) {
          console.error(`Error publishing article ${article.id}:`, updateError);
          continue;
        }

        publishedArticles.push(updatedArticle);
        console.log(`Publish Scheduled: Published article "${article.title}" (ID: ${article.id})`);

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        continue;
      }
    }

    console.log(`Publish Scheduled: Successfully published ${publishedArticles.length} articles`);

    return NextResponse.json({
      message: `Successfully published ${publishedArticles.length} articles`,
      publishedCount: publishedArticles.length,
      articles: publishedArticles,
      timestamp: currentTime
    });

  } catch (error) {
    console.error('Publish Scheduled API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const currentTime = now.toISOString();

    // Find articles that are scheduled and ready to be published (read-only)
    const { data: scheduledArticles, error } = await supabase
      .from('articles')
      .select('id, title, slug, scheduled_at, status')
      .not('scheduled_at', 'is', null)
      .eq('status', 'SCHEDULED')
      .lte('scheduled_at', currentTime);

    if (error) {
      console.error('Error fetching scheduled articles:', error);
      return NextResponse.json({ error: 'Failed to fetch scheduled articles' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Scheduled articles check (read-only)',
      currentTime,
      readyToPublish: scheduledArticles?.length || 0,
      articles: scheduledArticles || []
    });

  } catch (error) {
    console.error('Publish Scheduled GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
