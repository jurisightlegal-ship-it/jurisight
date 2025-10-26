'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import AnimatedBackgroundWrapper from '@/components/animated-background-wrapper';
import HeroHeader from '@/components/hero-header';
import { NewsletterCTA } from '@/components/newsletter-signup';
import { MagazineBanner } from '@/components/magazine-banner';
import { 
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  dek: string;
  featuredImage: string | null;
  readingTime: number;
  views: number;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
}

export default function ArticlesListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string | null>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ARTICLES_PER_PAGE = 12;

  const fetchArticles = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }
      
      const offset = reset ? 0 : (currentPage + 1) * ARTICLES_PER_PAGE;
      const params = new URLSearchParams({
        limit: ARTICLES_PER_PAGE.toString(),
        offset: offset.toString()
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        const newArticles = data.articles || [];
        
        // Check if there are more articles
        setHasMore(newArticles.length === ARTICLES_PER_PAGE);
        
        if (reset) {
          setArticles(newArticles);
          setCurrentPage(0);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
          setCurrentPage(prev => prev + 1);
        }
        
        // Process avatar URLs for new articles
        const avatarPromises = newArticles.map(async (article: Article) => {
          if (article.author.avatar) {
            try {
              const processedUrl = await getImageDisplayUrl(article.author.avatar);
              return { id: article.author.id, url: processedUrl };
            } catch (error) {
              console.error('Error processing avatar URL:', error);
              return { id: article.author.id, url: null };
            }
          }
          return { id: article.author.id, url: null };
        });
        
        const avatarResults = await Promise.all(avatarPromises);
        const avatarMap: Record<string, string | null> = {};
        avatarResults.forEach(({ id, url }) => {
          avatarMap[id] = url;
        });
        
        if (reset) {
          setAvatarUrls(avatarMap);
        } else {
          setAvatarUrls(prev => ({ ...prev, ...avatarMap }));
        }
      } else {
        console.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchArticles(false);
    }
  };

  // Initialize searchTerm from URL query (supports `search` and `query`)
  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('query') || '';
    if (q && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  // Fetch articles whenever searchTerm changes
  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchArticles(true);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Sync URL with current search term for sharable state
    if (searchTerm.trim().length > 0) {
      router.replace(`/articles?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.replace(`/articles`);
    }
    setCurrentPage(0);
    setHasMore(true);
    fetchArticles(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* Magazine Banner */}
      <div className="relative z-20">
        <MagazineBanner />
      </div>

      {/* Compact Hero Wrapper */}
      <div className="relative min-h-[180px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedBackgroundWrapper />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="relative flex min-h-[180px] items-center justify-center py-0 sm:py-1">
            <HeroHeader />
          </div>
        </div>
      </div>

      {/* All Articles Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Articles</h2>
            <p className="text-lg text-gray-600">Discover our latest legal insights and analysis</p>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'No published articles available yet'}
                </p>
                {searchTerm && (
                  <Button onClick={() => {
                    setSearchTerm('');
                    fetchArticles();
                  }}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative aspect-video overflow-hidden">
                      {article.featuredImage ? (
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-jurisight-navy via-jurisight-royal to-jurisight-teal flex items-center justify-center">
                          <div className="text-white text-lg font-semibold">
                            {article.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      {article.section && (
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: article.section.color }}
                          >
                            {article.section.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-black mb-3 line-clamp-2 group-hover:text-jurisight-navy transition-colors">
                        {article.title}
                      </h3>
                      {article.dek && (
                        <p className="text-black/70 text-sm mb-4 line-clamp-3">
                          {article.dek}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-black/50">
                        <div className="flex items-center gap-4">
                          {article.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readingTime} min read</span>
                            </div>
                          )}
                        </div>
                        {article.author?.name && (
                          <div className="flex items-center gap-2">
                            {avatarUrls[article.author.id] ? (
                              <Image
                                src={avatarUrls[article.author.id]!}
                                alt={article.author.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-jurisight-navy rounded-full flex items-center justify-center text-white text-xs">
                                {article.author.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{article.author.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Loading More Skeletons */}
          {loadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <Card key={`loading-${i}`} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && articles.length > 0 && (
            <div className="text-center mt-12">
              {hasMore ? (
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      Load More Articles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-gray-500 font-medium">
                  No more articles to load
                </p>
              )}
            </div>
          )}

          {/* Articles Count */}
          {!loading && articles.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
                {!hasMore && ` (all articles loaded)`}
              </p>
            </div>
          )}
        </div>
      </section>

      <NewsletterCTA
        title="Stay Updated with Legal Insights"
        description="Get the latest legal analysis, court judgments, and expert commentary delivered to your inbox."
        gradient="from-blue-600 to-purple-600"
        textColor="text-blue-100"
        buttonColor="text-blue-600"
        variant="premium"
        badgeText="Free Legal Newsletter"
      />

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
