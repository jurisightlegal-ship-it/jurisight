import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

// POST /api/newsletter/check-subscription - Check if email is subscribed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if email exists in newsletter table
    const { data: subscriber, error } = await supabase
      .from('newsletter')
      .select('email, subscribed_at')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking subscription:', error);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    const isSubscribed = !!subscriber;

    return NextResponse.json({
      isSubscribed,
      subscribedAt: subscriber?.subscribed_at || null,
      success: true
    });

  } catch (error) {
    console.error('Error in check-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
