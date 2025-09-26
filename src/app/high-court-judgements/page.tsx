'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { NewsletterCTA } from '@/components/newsletter-signup';
import { useAPILoading } from '@/hooks/use-loading';
import { 
  Search, 
  BookOpen,
  Calendar,
  Clock,
  User,
  Eye,
  ArrowRight,
  Building2,
  CalendarDays
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

export default function HighCourtJudgementsPage() {
  const router = useRouter();
  const { fetchWithLoading } = useAPILoading();
  
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
        offset: offset.toString(),
        section: 'high-court-judgements' // Filter for High Court judgements
      });
      if (searchTerm) params.append('search', searchTerm);

      const data = await fetchWithLoading<{articles: Article[]}>(
        `/api/articles?${params}`,
        {},
        {
          message: reset ? 'Loading High Court judgements...' : 'Loading more judgements...',
          showProgress: false
        }
      );
      
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

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchArticles(true);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setHasMore(true);
    fetchArticles(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-screen Shader Animation Background */}
      <div className="fixed inset-0 z-0">
        <ShaderAnimation />
      </div>
      
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-10"></div>
      
      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6">
            <Building2 className="h-4 w-4" />
            High Court Judgements
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            High Court
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Judgements</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore significant High Court decisions, state-level legal precedents, and regional jurisprudence that shape the legal landscape across India.
          </p>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Main search container */}
              <div className="relative bg-white/15 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl" style={{ zIndex: 25 }}>
                <div className="flex items-center relative" style={{ zIndex: 30 }}>
                  {/* Search icon */}
                  <div className="pl-6 pr-4">
                    <Search className="h-6 w-6 text-white/80 group-hover:text-white transition-colors duration-200" />
                  </div>
                  
                  {/* Input field */}
                  <input
                    type="text"
                    placeholder="Search High Court judgements, cases, or legal topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white/60 text-lg py-6 pr-4 focus:ring-0 focus:outline-none w-full"
                    style={{ zIndex: 30 }}
                  />
                  
                  {/* Search button */}
                  <Button
                    type="submit"
                    className="m-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ zIndex: 20 }}></div>
            </div>
            
            {/* Search suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['State Laws', 'Regional Cases', 'Civil Matters', 'Criminal Appeals', 'Constitutional Petitions'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchTerm(suggestion)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white text-sm rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>

        </div>
      </section>

      {/* High Court Judgements Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">High Court Judgements</h2>
            <p className="text-lg text-gray-600">Significant decisions and legal precedents from High Courts across India</p>
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
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No High Court judgements found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'No High Court judgements available yet'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Featured Image */}
                  {article.featuredImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className="text-xs px-3 py-1 backdrop-blur-sm"
                          style={{ 
                            backgroundColor: `${article.section.color}20`,
                            color: article.section.color,
                            border: `1px solid ${article.section.color}40`
                          }}
                        >
                          High Court
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-green-600 via-blue-600 to-indigo-600 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-white" />
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className="text-xs px-3 py-1 backdrop-blur-sm bg-white/20 text-white border-white/40"
                        >
                          High Court
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    {article.dek && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.dek}</p>
                    )}

                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {avatarUrls[article.author.id] ? (
                          <Image
                            src={avatarUrls[article.author.id]!}
                            alt={article.author.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{article.author.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(article.publishedAt)}</p>
                      </div>
                    </div>

                    {/* Article Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.readingTime} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300"
                      onClick={() => router.push(`/articles/${article.slug}`)}
                    >
                      Read Judgement
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
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
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      Load More Judgements
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-gray-500 font-medium">
                  No more judgements to load
                </p>
              )}
            </div>
          )}

          {/* Articles Count */}
          {!loading && articles.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Showing {articles.length} judgement{articles.length !== 1 ? 's' : ''}
                {!hasMore && ` (all judgements loaded)`}
              </p>
            </div>
          )}
        </div>
      </section>

      <NewsletterCTA
        title="Stay Updated with High Court Decisions"
        description="Get the latest High Court judgements, regional legal precedents, and state-level legal analysis delivered to your inbox."
        gradient="from-green-600 to-blue-600"
        textColor="text-green-100"
        buttonColor="text-green-600"
        variant="premium"
        badgeText="High Court Updates"
      />

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
