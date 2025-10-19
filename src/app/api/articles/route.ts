import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

interface SupabaseArticle {
  id: string;
  title: string;
  slug: string;
  dek: string;
  featured_image: string | null;
  reading_time: number;
  views: number;
  published_at: string;
  users?: Array<{
    id: string;
    name: string;
    image: string | null;
  }>;
  legal_sections?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

// GET /api/articles - Fetch published articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const sections = searchParams.get('sections'); // New parameter for multiple sections
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const exclude = searchParams.get('exclude'); // New parameter to exclude specific article IDs

    // Calculate offset from page
    const actualOffset = page > 1 ? (page - 1) * limit : offset;

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        featured_image,
        reading_time,
        views,
        published_at,
        users(
          id,
          name,
          image
        ),
        legal_sections(
          id,
          name,
          slug,
          color
        )
      `)
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .range(actualOffset, actualOffset + limit - 1);

    // Handle search
    if (search) {
      query = query.or(`title.ilike.%${search}%,dek.ilike.%${search}%`);
    }

    // Handle exclude parameter
    if (exclude) {
      const excludeIds = exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
    }

    // Handle single section filtering
    if (section) {
      // First get the section ID for the given slug
      const { data: sectionData } = await supabase
        .from('legal_sections')
        .select('id')
        .eq('slug', section)
        .single();
      
      if (sectionData) {
        query = query.eq('section_id', sectionData.id);
      }
    }

    // Handle multiple sections filtering
    if (sections) {
      const sectionSlugs = sections.split(',').map(s => s.trim());
      const { data: sectionData } = await supabase
        .from('legal_sections')
        .select('id')
        .in('slug', sectionSlugs);
      
      if (sectionData && sectionData.length > 0) {
        const sectionIds = sectionData.map(s => s.id);
        query = query.in('section_id', sectionIds);
      }
    }

    const { data: result, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // Transform the data to match expected format
    const articles = (result || []).map((article: SupabaseArticle) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      featuredImage: article.featured_image,
      readingTime: article.reading_time,
      views: article.views,
      publishedAt: article.published_at,
      author: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (article as any).users?.id || (article as any).author_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (article as any).users?.name || 'Unknown Author',
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
      }
    }));

    // Get total count for pagination
    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED');

    // Apply same filters for count
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,dek.ilike.%${search}%`);
    }
    if (section) {
      const { data: sectionData } = await supabase
        .from('legal_sections')
        .select('id')
        .eq('slug', section)
        .single();
      if (sectionData) {
        countQuery = countQuery.eq('section_id', sectionData.id);
      }
    }
    if (sections) {
      const sectionSlugs = sections.split(',').map(s => s.trim());
      const { data: sectionData } = await supabase
        .from('legal_sections')
        .select('id')
        .in('slug', sectionSlugs);
      if (sectionData && sectionData.length > 0) {
        const sectionIds = sectionData.map(s => s.id);
        countQuery = countQuery.in('section_id', sectionIds);
      }
    }

    const { count } = await countQuery;

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore
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
    console.log('ArticleAPI: Received article creation request:', JSON.stringify(body, null, 2));
    const { title, dek, body: bodyContent, sectionId, authorId, featuredImage, status, readingTime, tags, slug: customSlug, scheduledAt, publishedAt } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate author ID
    if (!authorId || typeof authorId !== 'string' || authorId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Author ID is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if author exists in the database
    try {
      const { data: author, error: authorError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authorId)
        .single();
      
      if (authorError || !author) {
        return NextResponse.json(
          { error: 'Invalid author ID. The specified author does not exist in the database.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('ArticleAPI: Error validating author:', error);
      return NextResponse.json(
        { error: 'Failed to validate author information' },
        { status: 500 }
      );
    }

    // Validate section ID
    if (!sectionId) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const sectionIdNumber = typeof sectionId === 'string' ? parseInt(sectionId, 10) : sectionId;
    if (isNaN(sectionIdNumber)) {
      return NextResponse.json(
        { error: 'Section ID must be a valid number' },
        { status: 400 }
      );
    }

    // Check if section exists in the database
    try {
      const { data: section, error: sectionError } = await supabase
        .from('legal_sections')
        .select('id')
        .eq('id', sectionIdNumber)
        .single();
      
      if (sectionError || !section) {
        return NextResponse.json(
          { error: 'Invalid section ID. The specified section does not exist in the database.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('ArticleAPI: Error validating section:', error);
      return NextResponse.json(
        { error: 'Failed to validate section information' },
        { status: 500 }
      );
    }

    // Improved content validation
    const isContentEmpty = (content: string) => {
      if (!content) return true;
      
      // Remove whitespace and check if empty
      const trimmed = content.trim();
      if (!trimmed) return true;
      
      // Check for various empty HTML patterns
      const emptyPatterns = [
        '',
        '<p><br></p>',
        '<p></p>',
        '<p> </p>',
        '<p>&nbsp;</p>',
        '<p><br></p>\n',
        '<p><br></p>\r\n',
        '<p></p>\n',
        '<p></p>\r\n'
      ];
      
      return emptyPatterns.includes(trimmed) || emptyPatterns.includes(content);
    };

    console.log('ArticleAPI: Content validation check:', {
      rawContent: bodyContent,
      isContentEmpty: isContentEmpty(bodyContent),
      status: status
    });

    // For IN_REVIEW and PUBLISHED statuses, body content is required
    // For DRAFT status, body can be empty
    if ((status === 'IN_REVIEW' || status === 'PUBLISHED') && isContentEmpty(bodyContent)) {
      return NextResponse.json(
        { error: 'Body content is required for review and published articles' },
        { status: 400 }
      );
    }

    // Use custom slug or generate from title
    const slug = customSlug && typeof customSlug === 'string' && customSlug.trim().length > 0 
      ? customSlug.trim()
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

    // Use provided reading time or calculate (rough estimate: 200 words per minute)
    const finalReadingTime = readingTime && typeof readingTime === 'number' && readingTime > 0 
      ? readingTime 
      : Math.ceil((bodyContent || '').split(/\s+/).filter((word: string) => word.length > 0).length / 200);

    // Handle tags - create tags if they don't exist and get tag IDs
    const tagIds: number[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        if (typeof tagName !== 'string' || tagName.trim().length === 0) {
          continue; // Skip invalid tags
        }
        
        const cleanTagName = tagName.trim();
        const tagSlug = cleanTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
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
              name: cleanTagName,
              slug: tagSlug,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!tagError && newTag) {
            tagIds.push(newTag.id);
          } else {
            console.error('ArticleAPI: Error creating tag:', tagError);
          }
        } else {
          tagIds.push(existingTag.id);
        }
      }
    }

    // Determine the correct status
    let articleStatus = status && typeof status === 'string' ? status.toUpperCase() : 'DRAFT';
    
    // Validate status
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'NEEDS_REVISIONS', 'APPROVED', 'PUBLISHED', 'SCHEDULED'];
    if (!validStatuses.includes(articleStatus)) {
      articleStatus = 'DRAFT'; // Default to draft if invalid status
    }
    
    // If scheduledAt is provided, status should be SCHEDULED
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      articleStatus = 'SCHEDULED';
    }

    // Prepare article data with consistent empty content handling
    const isEmptyContent = isContentEmpty(bodyContent);
    const articleData = {
      title: title.trim(),
      slug,
      dek: dek && typeof dek === 'string' ? dek.trim() : null,
      body: isEmptyContent ? '' : (bodyContent || ''), // Consistently handle empty content
      featured_image: featuredImage && typeof featuredImage === 'string' ? featuredImage : null,
      section_id: sectionIdNumber,
      author_id: authorId,
      reading_time: finalReadingTime,
      status: articleStatus,
      scheduled_at: scheduledAt && typeof scheduledAt === 'string' ? scheduledAt : null,
      published_at: publishedAt && typeof publishedAt === 'string' ? publishedAt : (articleStatus === 'PUBLISHED' ? new Date().toISOString() : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('ArticleAPI: Inserting article with data:', JSON.stringify(articleData, null, 2));

    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('ArticleAPI: Error creating article:', error);
      
      // Provide more specific error messages for common issues
      if (error.message.includes('foreign key constraint')) {
        if (error.message.includes('author_id')) {
          return NextResponse.json(
            { error: 'Failed to create article: The author ID does not exist in the users table. Please ensure you are logged in with a valid account.' },
            { status: 400 }
          );
        } else if (error.message.includes('section_id')) {
          return NextResponse.json(
            { error: 'Failed to create article: The section ID does not exist in the legal_sections table.' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { error: `Failed to create article: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('ArticleAPI: Successfully created article:', newArticle);

    // Create article-tag relationships
    if (tagIds.length > 0 && newArticle) {
      const articleTagRelations = tagIds.map(tagId => ({
        article_id: newArticle.id,
        tag_id: tagId
      }));

      const { error: tagsError } = await supabase
        .from('article_tags')
        .insert(articleTagRelations);

      if (tagsError) {
        console.error('ArticleAPI: Error creating article-tag relationships:', tagsError);
        // Don't fail the article creation, just log the error
      }
    }

    return NextResponse.json({ article: newArticle }, { status: 201 });
  } catch (error) {
    console.error('ArticleAPI: Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article. Please check the server logs for more details.' },
      { status: 500 }
    );
  }
}
