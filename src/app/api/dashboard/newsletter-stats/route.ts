import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get newsletter statistics
    const { data: totalSubscribers, error: totalError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' });

    const { data: activeSubscribers, error: activeError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Get recent subscribers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentSubscribers, error: recentError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' })
      .gte('subscribed_at', sevenDaysAgo.toISOString());

    if (totalError || activeError || recentError) {
      console.error('Error fetching newsletter stats:', { totalError, activeError, recentError });
      return NextResponse.json(
        { error: 'Failed to fetch newsletter statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      total: totalSubscribers?.length || 0,
      active: activeSubscribers?.length || 0,
      inactive: (totalSubscribers?.length || 0) - (activeSubscribers?.length || 0),
      recent: recentSubscribers?.length || 0
    });

  } catch (error) {
    console.error('Newsletter stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
