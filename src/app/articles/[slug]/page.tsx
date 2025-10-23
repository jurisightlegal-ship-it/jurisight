import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/back-button';
import { ArticlePageClient } from '@/components/article-page-client';
import { AsyncAvatar } from '@/components/async-avatar';
import { SocialShareButton } from '@/components/social-share-button';
import { MagazineBanner } from '@/components/magazine-banner';
import { RecentArticlesSection } from '@/components/recent-articles-section';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase-db';
import { getImageDisplayUrl } from '@/lib/storage-utils';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  BookOpen,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import './article-content.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  dek: string;
  body: string;
  featuredImage: string | null;
  readingTime: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    bio: string | null;
    avatar: string | null;
    linkedinUrl: string | null;
  };
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
  };
  caseCitations: Array<{
    id: number;
    case_name: string;
    citation: string;
    url?: string;
  }>;
  sourceLinks: Array<{
    id: number;
    title: string;
    url: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Fetch article data for metadata
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        featured_image,
        published_at,
        created_at,
        users(
          id,
          name,
          bio,
          image
        ),
        legal_sections(
          id,
          name,
          slug,
          color,
          description
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !article) {
      return {
        title: 'Article Not Found | Jurisight',
        description: 'The article you are looking for could not be found.',
      };
    }

    const authorName = (article as { users?: { name?: string } }).users?.name || 'Unknown Author';
    const sectionName = (article as { legal_sections?: { name?: string } }).legal_sections?.name || 'Legal';
    const publishedDate = article.published_at || article.created_at;
    const featuredImage = article.featured_image;

    // Create meta description
    const metaDescription = article.dek || 
      `Read "${article.title}" by ${authorName} on ${sectionName}. Published on ${new Date(publishedDate).toLocaleDateString()}.`;

    // Create Open Graph image URL
    let ogImage: string;
    if (featuredImage) {
      if (featuredImage.startsWith('http')) {
        // Already a full URL
        ogImage = featuredImage;
      } else {
        // Supabase storage path - get signed URL using storage utils
        try {
          const processedUrl = await getImageDisplayUrl(featuredImage);
          if (processedUrl) {
            ogImage = processedUrl;
          } else {
            // Fallback to static OG image if processing fails
            ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/Jurisight.png`;
          }
        } catch (error) {
          console.error('Error getting featured image URL:', error);
          // Fallback to static OG image
          ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/Jurisight.png`;
        }
      }
    } else {
      // No featured image, use static OG image
      ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/Jurisight.png`;
    }

    return {
      title: `${article.title} | Jurisight`,
      description: metaDescription,
      keywords: [
        'legal',
        'law',
        'jurisprudence',
        'legal analysis',
        sectionName.toLowerCase(),
        authorName.toLowerCase(),
        'India legal system',
        'legal education'
      ],
      authors: [{ name: authorName }],
      openGraph: {
        title: article.title,
        description: metaDescription,
        type: 'article',
        publishedTime: publishedDate,
        authors: [authorName],
        tags: [sectionName],
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        siteName: 'Jurisight',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: metaDescription,
        images: [ogImage],
        creator: '@jurisight',
        site: '@jurisight',
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/articles/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article | Jurisight',
      description: 'Read legal articles and analysis on Jurisight.',
    };
  }
}

// Server-side data fetching
async function getArticle(slug: string): Promise<Article | null> {
  try {
    // Fetch article with related data
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        dek,
        body,
        featured_image,
        reading_time,
        views,
        published_at,
        created_at,
        updated_at,
        users(
          id,
          name,
          bio,
          image,
          linkedin_url
        ),
        legal_sections(
          id,
          name,
          slug,
          color,
          description
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !article) {
      return null;
    }

    // Fetch case citations and source links in parallel
    const [citationsResult, sourcesResult] = await Promise.all([
      supabase
        .from('case_citations')
        .select('*')
        .eq('article_id', article.id),
      supabase
        .from('source_links')
        .select('*')
        .eq('article_id', article.id)
    ]);

    const citations = citationsResult.data || [];
    const sources = sourcesResult.data || [];

    // Increment view count asynchronously (don't wait for it)
    supabase
      .from('articles')
      .update({ 
        views: (article.views || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id)
      .then(() => {}) // Fire and forget
      .catch(() => {}); // Ignore errors

    // Transform the data to match expected format
    const transformedArticle: Article = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      body: article.body,
      featuredImage: article.featured_image,
      readingTime: article.reading_time,
      views: (article.views || 0) + 1,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        id: (article as any).users?.id || (article as any).author_id || '',
        name: (article as any).users?.name || 'Unknown Author',
        bio: (article as any).users?.bio || null,
        avatar: (article as any).users?.image || null,
        linkedinUrl: (article as any).users?.linkedin_url || null,
      },
      section: {
        id: (article as any).legal_sections?.id || (article as any).section_id || 0,
        name: (article as any).legal_sections?.name || 'Unknown Section',
        slug: (article as any).legal_sections?.slug || 'unknown',
        color: (article as any).legal_sections?.color || '#6B7280',
        description: (article as any).legal_sections?.description || null,
      },
      caseCitations: citations,
      sourceLinks: sources,
    };

    return transformedArticle;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}


export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Pass raw avatar path to client component for processing
  const avatarPath = article.author.avatar;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to decode HTML entities
  const decodeHtmlEntities = (html: string) => {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  return (
    <ArticlePageClient>
      <MagazineBanner />
      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <BackButton />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.readingTime} min read
                  </div>
                </div>
                <SocialShareButton
                  title={article.title}
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/articles/${article.slug}`}
                  description={article.dek || ''}
                  hashtags={['Jurisight', 'Legal', article.section.name]}
                  className="hidden sm:flex"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden">
            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem]">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <CardContent className="p-8 xl:p-12 2xl:p-16">
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <Badge 
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit max-w-full"
                    style={{ 
                      backgroundColor: `${article.section.color}20`,
                      color: article.section.color,
                      border: `1px solid ${article.section.color}40`
                    }}
                  >
                    <span className="truncate">{article.section.name}</span>
                  </Badge>
                  {article.publishedAt && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      Published {formatDate(article.publishedAt)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl 2xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {article.dek && (
                  <p className="text-lg xl:text-xl 2xl:text-xl text-gray-600 mb-6 leading-relaxed">
                    {article.dek}
                  </p>
                )}

                {/* Social Share Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-800">Share this article</span>
                      </div>
                      <SocialShareButton
                        title={article.title}
                        url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/articles/${article.slug}`}
                        description={article.dek || ''}
                        hashtags={['Jurisight', 'Legal', article.section.name]}
                        className="w-fit"
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right italic">
                      Help others discover valuable legal insights
                    </div>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <AsyncAvatar
                      fallbackAvatar={avatarPath}
                      avatarPath={avatarPath}
                      authorName={article.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{article.author.name}</p>
                      {article.author.linkedinUrl && (
                        <a
                          href={article.author.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View LinkedIn profile"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <div 
                className="article-content max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: decodeHtmlEntities(article.body)
                }}
                style={{
                  // Ensure videos and other rich content are properly styled
                  '--tw-prose-video': 'theme(colors.gray.900)',
                } as React.CSSProperties}
              />

              {/* Case Citations */}
              {article.caseCitations && article.caseCitations.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg xl:text-xl 2xl:text-xl font-semibold text-gray-900 mb-4">Case Citations</h3>
                  <div className="space-y-3">
                    {article.caseCitations.map((citation) => (
                      <div key={citation.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{citation.case_name}</p>
                          <p className="text-sm text-gray-600">{citation.citation}</p>
                          {citation.url && (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                            >
                              View Source
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Links */}
              {article.sourceLinks && article.sourceLinks.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg xl:text-xl 2xl:text-xl font-semibold text-gray-900 mb-4">Sources</h3>
                  <div className="space-y-2">
                    {article.sourceLinks.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-900 hover:text-blue-600">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Social Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg xl:text-xl 2xl:text-xl font-semibold text-gray-900 mb-2">
                    Found this article helpful?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share it with your network and help others discover valuable legal insights.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <SocialShareButton
                      title={article.title}
                      url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/articles/${article.slug}`}
                      description={article.dek || ''}
                      hashtags={['Jurisight', 'Legal', article.section.name]}
                    />
                    <div className="text-sm text-gray-500">
                      Spread legal knowledge across India
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Articles Section */}
          <RecentArticlesSection 
            currentArticleId={article.id}
            currentSectionId={article.section.id}
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ArticlePageClient>
  );
}