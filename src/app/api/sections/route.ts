import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { legalSections } from '@/lib/schema';

// GET /api/sections - Fetch all legal sections
export async function GET() {
  try {
    const sections = await db.select().from(legalSections);
    
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/sections - Create new legal section (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newSection = await db.insert(legalSections).values({
      name,
      slug,
      description,
      color,
      icon,
    }).returning();

    return NextResponse.json({ section: newSection[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
