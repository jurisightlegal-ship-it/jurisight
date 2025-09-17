import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles, users, legalSections } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/articles - Fetch published articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereConditions = [eq(articles.status, 'PUBLISHED')];
    
    if (section) {
      whereConditions.push(eq(legalSections.slug, section));
    }

    const query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        dek: articles.dek,
        featuredImage: articles.featuredImage,
        readingTime: articles.readingTime,
        views: articles.views,
        publishedAt: articles.publishedAt,
        author: {
          id: users.id,
          name: users.name,
          avatar: users.image,
        },
        section: {
          id: legalSections.id,
          name: legalSections.name,
          slug: legalSections.slug,
          color: legalSections.color,
        }
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(legalSections, eq(articles.sectionId, legalSections.id))
      .where(and(...whereConditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    const result = await query;

    return NextResponse.json({
      articles: result,
      pagination: {
        limit,
        offset,
        hasMore: result.length === limit
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

// POST /api/articles - Create new article (for contributors)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, dek, bodyContent, sectionId, authorId, featuredImage } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = bodyContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const newArticle = await db.insert(articles).values({
      title,
      slug,
      dek,
      body: bodyContent,
      featuredImage,
      sectionId,
      authorId,
      readingTime,
      status: 'DRAFT',
    }).returning();

    return NextResponse.json({ article: newArticle[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
