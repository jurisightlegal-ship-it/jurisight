import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles, users, legalSections, caseCitations, sourceLinks } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/articles/[slug] - Fetch single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch article with related data
    const article = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        dek: articles.dek,
        body: articles.body,
        featuredImage: articles.featuredImage,
        readingTime: articles.readingTime,
        views: articles.views,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          bio: users.bio,
          avatar: users.image,
        },
        section: {
          id: legalSections.id,
          name: legalSections.name,
          slug: legalSections.slug,
          color: legalSections.color,
          description: legalSections.description,
        }
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(legalSections, eq(articles.sectionId, legalSections.id))
      .where(eq(articles.slug, slug))
      .limit(1);

    if (!article[0]) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Fetch case citations
    const citations = await db
      .select()
      .from(caseCitations)
      .where(eq(caseCitations.articleId, article[0].id));

    // Fetch source links
    const sources = await db
      .select()
      .from(sourceLinks)
      .where(eq(sourceLinks.articleId, article[0].id));

    // Increment view count
    await db
      .update(articles)
      .set({ 
        views: sql`${articles.views} + 1` 
      })
      .where(eq(articles.id, article[0].id));

    return NextResponse.json({
      article: {
        ...article[0],
        views: article[0].views + 1, // Return updated view count
        caseCitations: citations,
        sourceLinks: sources,
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[slug] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, dek, bodyContent, sectionId, featuredImage, status } = body;

    // Update article
    const updatedArticle = await db
      .update(articles)
      .set({
        title,
        dek,
        body: bodyContent,
        sectionId,
        featuredImage,
        status,
        updatedAt: new Date(),
        ...(status === 'PUBLISHED' && { publishedAt: new Date() })
      })
      .where(eq(articles.slug, slug))
      .returning();

    if (!updatedArticle[0]) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: updatedArticle[0] });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
