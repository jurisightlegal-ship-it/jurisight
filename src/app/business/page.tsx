'use client';

import { useEffect, useState, Suspense } from 'react';
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
import { 
  Search, 
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Building2,
  TrendingUp,
  Briefcase,
  FileText
} from 'lucide-react';

interface BusinessArticle {
  id: number;
  title: string;
  slug: string;
  dek: string;
  featured_image: string | null;
  reading_time: number;
  views: number;
  published_at: string;
  created_at: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  tags: {
    id: number;
    name: string;
    slug: string;
    color: string;
  }[];
}

function BusinessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<BusinessArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchBusinessArticles = async (pageNum = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...(search && { search }),
        sections: 'business,corporate' // Filter for business and corporate sections
      });

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setArticles(data.articles || []);
        } else {
          setArticles(prev => [...prev, ...(data.articles || [])]);
        }
        setHasMore(data.hasMore || false);
      } else {
        console.error('Error fetching business articles:', data.error);
      }
    } catch (error) {
      console.error('Error fetching business articles:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBusinessArticles(1, searchTerm);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBusinessArticles(1, searchTerm);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchBusinessArticles(nextPage, searchTerm);
  };

  const getSectionIcon = (sectionSlug: string) => {
    switch (sectionSlug) {
      case 'business':
        return <Building2 className="h-4 w-4" />;
      case 'corporate':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSectionGradient = (sectionSlug: string) => {
    switch (sectionSlug) {
      case 'business':
        return 'from-emerald-500 to-teal-600';
      case 'corporate':
        return 'from-cyan-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <ShaderAnimation />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Business & Corporate Law
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Navigate the complex world of business law with expert insights, 
              corporate regulations, and commercial legal guidance.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search business articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg"
                >
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Business Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Law Categories</h2>
              <p className="text-lg text-gray-600">Explore different aspects of business and corporate law</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Law */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Business Law</h3>
                      <p className="text-gray-600">General business regulations and practices</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Comprehensive coverage of business law including contracts, 
                    partnerships, sole proprietorships, and business formation.
                  </p>
                  <Button 
                    variant="outline" 
                    className="group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300"
                  >
                    Explore Articles
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Corporate Law */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Corporate Law</h3>
                      <p className="text-gray-600">Corporate governance and regulations</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    In-depth analysis of corporate law including company formation, 
                    governance, mergers, acquisitions, and regulatory compliance.
                  </p>
                  <Button 
                    variant="outline" 
                    className="group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 transition-all duration-300"
                  >
                    Explore Articles
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Latest Business Articles</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Updated regularly</span>
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Business Articles Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No articles found matching "${searchTerm}"`
                    : 'No business articles have been published yet.'
                  }
                </p>
                {searchTerm && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      fetchBusinessArticles(1, '');
                    }}
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => (
                    <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {article.featured_image ? (
                          <Image
                            src={getImageDisplayUrl(article.featured_image)}
                            alt={article.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge 
                            className={`bg-gradient-to-r ${getSectionGradient(article.section.slug)} text-white border-0 shadow-lg`}
                          >
                            {getSectionIcon(article.section.slug)}
                            <span className="ml-1">{article.section.name}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {article.title}
                        </h3>
                        
                        {article.dek && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.dek}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(article.published_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.reading_time} min read</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            <span>{article.views} views</span>
                          </div>
                          
                          <Link href={`/articles/${article.slug}`}>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white group-hover:shadow-lg transition-all duration-300"
                            >
                              Read More
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        'Load More Articles'
                      )}
                    </Button>
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
              </>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <NewsletterCTA
          title="Stay Updated with Business Law"
          description="Get the latest business law insights, corporate regulations, and commercial legal analysis delivered to your inbox."
          gradient="from-emerald-600 to-teal-600"
          textColor="text-emerald-100"
          buttonColor="text-emerald-600"
          variant="premium"
          badgeText="Business Law Updates"
        />

        <div className="relative z-20">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function BusinessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    }>
      <BusinessPageContent />
    </Suspense>
  );
}
