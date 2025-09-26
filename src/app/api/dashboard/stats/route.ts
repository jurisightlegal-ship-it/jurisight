import { NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase-db';

// GET /api/dashboard/stats - Fetch dashboard statistics
export async function GET() {
  try {
    // Use Supabase client directly
    const stats = await SupabaseDB.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
