import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check for API key or session authentication
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    
    let isAuthorized = false;
    
    // Check API key authentication first
    if (apiKey === expectedApiKey) {
      isAuthorized = true;
    } else {
      // Check session authentication
      const session = await getServerSession(authOptions);
      
      if (session?.user?.email) {
        const supabase = await createClient();
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', session.user.email)
          .single();

        if (!userError && user && user.role === 'ADMIN') {
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Get paginated results
    const { data: subscribers, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter subscribers' },
        { status: 500 }
      );
    }

    // Get statistics
    const { data: stats, error: statsError } = await supabase
      .from('newsletter_subscribers')
      .select('is_active')
      .eq('is_active', true);

    if (statsError) {
      console.error('Error fetching newsletter stats:', statsError);
    }

    const totalSubscribers = count || 0;
    const activeSubscribers = stats?.length || 0;

    return NextResponse.json({
      subscribers: subscribers || [],
      pagination: {
        page,
        limit,
        total: totalSubscribers,
        pages: Math.ceil(totalSubscribers / limit)
      },
      stats: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: totalSubscribers - activeSubscribers
      }
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check for API key or session authentication
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    
    let isAuthorized = false;
    
    // Check API key authentication first
    if (apiKey === expectedApiKey) {
      isAuthorized = true;
    } else {
      // Check session authentication
      const session = await getServerSession(authOptions);
      
      if (session?.user?.email) {
        // Use service role client for admin operations to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', session.user.email)
          .single();

        if (!userError && user && user.role === 'ADMIN') {
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Delete the subscriber
    const { error: deleteError } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting newsletter subscriber:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete subscriber' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Subscriber deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
