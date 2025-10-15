import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// GET /api/dashboard/articles/[id] - Get article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch article with related data
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, dek, body, featured_image, reading_time, views, published_at, created_at, updated_at,
        is_featured, is_top_news, featured_at, top_news_at, scheduled_at,
        author_id, section_id,
        users(id, name, bio, image),
        legal_sections(id, name, slug, color, description)
      `)
      .eq('id', id)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if user can view this article
    const isAuthor = article.author_id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isEditor = session.user.role === 'EDITOR';

    // Only authors, editors, and admins can view articles in dashboard
    if (!isAuthor && !isAdmin && !isEditor) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch tags for this article
    const { data: articleTags } = await supabase
      .from('article_tags')
      .select(`
        tags(id, name, slug)
      `)
      .eq('article_id', id);

    const tags = articleTags?.map((at: any) => at.tags?.name).filter(Boolean) || [];

    // Transform the response
    const transformedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      body: article.body,
      featuredImage: article.featured_image,
      readingTime: article.reading_time,
      views: article.views || 0,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      isFeatured: article.is_featured || false,
      isTopNews: article.is_top_news || false,
      featuredAt: article.featured_at,
      topNewsAt: article.top_news_at,
      scheduledAt: article.scheduled_at,
      author: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (article as any).users?.id || (article as any).author_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (article as any).users?.name || 'Unknown Author',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bio: (article as any).users?.bio || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatar: (article as any).users?.image || null,
      },
      section: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (article as any).legal_sections?.id || (article as any).section_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (article as any).legal_sections?.name || 'Unknown Section',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slug: (article as any).legal_sections?.slug || 'unknown',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (article as any).legal_sections?.color || '#6B7280',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (article as any).legal_sections?.description || null,
      },
      tags,
    };

    return NextResponse.json({ article: transformedArticle });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/articles/[id] - Update article (full update or status only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      dek, 
      body: bodyContent, 
      sectionId, 
      featuredImage, 
      status, 
      readingTime, 
      tags, 
      slug: customSlug,
      publishedAt,
      isFeatured,
      isTopNews,
      featuredAt,
      topNewsAt,
      scheduledAt
    } = body;

    // Check if this is a status-only update or full update
    const isStatusOnlyUpdate = Object.keys(body).length === 1 && 'status' in body;
    
    if (isStatusOnlyUpdate) {
      // Handle status-only update (existing logic)
      const validStatuses = ['DRAFT', 'IN_REVIEW', 'NEEDS_REVISIONS', 'APPROVED', 'PUBLISHED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    } else {
      // Handle full article update
      if (!title || !bodyContent || !sectionId) {
        return NextResponse.json(
          { error: 'Title, body, and section are required' },
          { status: 400 }
        );
      }
    }

    // Check if user can update this article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('author_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = article.author_id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isEditor = session.user.role === 'EDITOR';
    const isContributor = session.user.role === 'CONTRIBUTOR';

    if (isStatusOnlyUpdate) {
      // Status-only update permissions
      // Contributors cannot change article status at all
      if (isContributor) {
        return NextResponse.json(
          { error: 'Contributors cannot change article status' },
          { status: 403 }
        );
      }

      // Authors (non-contributors) can only update their own articles to DRAFT or IN_REVIEW
      if (isAuthor && !isAdmin && !isEditor && !isContributor) {
        if (!['DRAFT', 'IN_REVIEW'].includes(status)) {
          return NextResponse.json(
            { error: 'Insufficient permissions to set this status' },
            { status: 403 }
          );
        }
      }

      // Editors and Admins can update any article
      if (!isAuthor && !isAdmin && !isEditor) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    } else {
      // Full article update permissions
      // Only authors, editors, and admins can update articles
      if (!isAuthor && !isAdmin && !isEditor) {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit this article' },
          { status: 403 }
        );
      }

      // Contributors can only edit their own articles
      if (isContributor && !isAuthor) {
        return NextResponse.json(
          { error: 'You can only edit your own articles' },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (isStatusOnlyUpdate) {
      // Status-only update
      updateData.status = status;
      
      // Set published_at if status is PUBLISHED
      if (status === 'PUBLISHED') {
        updateData.published_at = publishedAt || new Date().toISOString();
      } else if (status !== 'PUBLISHED' && article.status === 'PUBLISHED') {
        // If changing from PUBLISHED to another status, clear published_at
        updateData.published_at = null;
      }
    } else {
      // Full article update
      const finalSlug = customSlug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const finalReadingTime = readingTime || Math.ceil(bodyContent.split(/\s+/).length / 200);
      
      updateData.title = title;
      updateData.slug = finalSlug;
      updateData.dek = dek;
      updateData.body = bodyContent;
      updateData.section_id = sectionId;
      updateData.featured_image = featuredImage;
      updateData.reading_time = finalReadingTime;
      
      // Determine the correct status based on scheduling
      let articleStatus = status || 'DRAFT';
      if (scheduledAt) {
        articleStatus = 'SCHEDULED';
      }
      updateData.status = articleStatus;
      
      updateData.is_featured = isFeatured || false;
      updateData.is_top_news = isTopNews || false;
      updateData.scheduled_at = scheduledAt || null;
      
      // Set timestamps for featured and top news
      if (featuredAt) {
        updateData.featured_at = featuredAt;
      }
      if (topNewsAt) {
        updateData.top_news_at = topNewsAt;
      }
      
      // Set published_at if status is PUBLISHED
      if (status === 'PUBLISHED') {
        updateData.published_at = publishedAt || new Date().toISOString();
      } else if (status !== 'PUBLISHED' && article.status === 'PUBLISHED') {
        updateData.published_at = null;
      }
    }

    // Update article
    const { data: updatedArticle, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        title,
        slug,
        dek,
        body,
        featured_image,
        status,
        reading_time,
        published_at,
        updated_at,
        author_id,
        section_id,
        users(
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating article:', error);
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      );
    }

    // Auto-revalidate paths when article is published or updated
    try {
      const becamePublished = (updateData.status === 'PUBLISHED' && article.status !== 'PUBLISHED') || updatedArticle.status === 'PUBLISHED';
      if (becamePublished) {
        // Revalidate sitemap, lists, and the specific article page
        revalidatePath('/');
        revalidatePath('/articles');
        revalidatePath('/sitemap.xml');
        if (updatedArticle.slug) {
          revalidatePath(`/articles/${updatedArticle.slug}`);
        }
      }
    } catch (revalError) {
      console.error('Revalidation after publish failed:', revalError);
      // Do not fail the request due to cache revalidation issues
    }

    // Delete revision notes when author updates their article content
    // This happens when an author revises and resubmits an article
    if (article.status === 'NEEDS_REVISIONS' && !isStatusOnlyUpdate) {
      try {
        const { error: deleteError } = await supabase
          .from('editorial_comments')
          .delete()
          .eq('article_id', id)
          .eq('is_internal', false); // Only delete external revision notes (not internal comments)

        if (deleteError) {
          console.error('Error deleting revision notes:', deleteError);
          // Don't fail the entire update if revision notes deletion fails
        } else {
          console.log(`Deleted revision notes for article ${id} (author updated article content)`);
        }
      } catch (deleteError) {
        console.error('Error deleting revision notes:', deleteError);
        // Don't fail the entire update if revision notes deletion fails
      }
    }

    // Handle tags for full updates
    if (!isStatusOnlyUpdate && tags && tags.length > 0) {
      try {
        // Delete existing article-tag relationships
        await supabase
          .from('article_tags')
          .delete()
          .eq('article_id', id);

        // Create new tags if they don't exist and get tag IDs
        const tagIds: number[] = [];
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          // Try to get existing tag or create new one
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .single();

          if (!existingTag) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({
                name: tagName,
                slug: tagSlug,
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            if (!tagError && newTag) {
              tagIds.push(newTag.id);
            }
          } else {
            tagIds.push(existingTag.id);
          }
        }

        // Create new article-tag relationships
        if (tagIds.length > 0) {
          const articleTagRelations = tagIds.map(tagId => ({
            article_id: id,
            tag_id: tagId
          }));

          await supabase
            .from('article_tags')
            .insert(articleTagRelations);
        }
      } catch (tagError) {
        console.error('Error updating article tags:', tagError);
        // Don't fail the article update, just log the error
      }
    }

    return NextResponse.json({ 
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        slug: updatedArticle.slug,
        status: updatedArticle.status,
        publishedAt: updatedArticle.published_at,
        updatedAt: updatedArticle.updated_at,
        author: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (updatedArticle as any).users?.[0]?.id || (updatedArticle as any).author_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (updatedArticle as any).users?.[0]?.name || 'Unknown Author',
        }
      }
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user can delete this article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('author_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = article.author_id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    // Only authors and admins can delete articles
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Authors can only delete their own DRAFT articles
    if (isAuthor && !isAdmin && article.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft articles' },
        { status: 403 }
      );
    }

    // Delete article and all related data
    try {
      // Delete all foreign key references first
      const deletePromises = [
        // Delete article-tag relationships
        supabase.from('article_tags').delete().eq('article_id', id),
        // Delete case citations
        supabase.from('case_citations').delete().eq('article_id', id),
        // Delete editorial comments
        supabase.from('editorial_comments').delete().eq('article_id', id),
        // Delete source links
        supabase.from('source_links').delete().eq('article_id', id)
      ];

      // Execute all delete operations in parallel
      const deleteResults = await Promise.allSettled(deletePromises);
      
      // Log any errors but continue with article deletion
      deleteResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          const tableNames = ['article_tags', 'case_citations', 'editorial_comments', 'source_links'];
          console.error(`Error deleting from ${tableNames[index]}:`, result.reason);
        }
      });

      // Finally delete the article itself
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json(
          { error: 'Failed to delete article' },
          { status: 500 }
        );
      }
    } catch (deleteError) {
      console.error('Error during article deletion:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
