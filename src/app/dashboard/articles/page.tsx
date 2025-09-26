'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Clock,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';

interface Article {
  id: number;
  title: string;
  slug: string;
  dek: string;
  body: string;
  featuredImage: string | null;
  status: string;
  readingTime: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  NEEDS_REVISIONS: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  NEEDS_REVISIONS: 'Needs Revisions',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
};

export default function ArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState<number | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/dashboard/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setPagination(data.pagination || pagination);
      } else {
        console.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, sortBy, sortOrder, searchTerm, setPagination]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleStatusChange = async (articleId: number, newStatus: string) => {
    // Show confirmation for important status changes
    const importantStatuses = ['PUBLISHED', 'DRAFT', 'SCHEDULED'];
    const statusLabels = {
      DRAFT: 'Draft',
      IN_REVIEW: 'In Review',
      NEEDS_REVISIONS: 'Needs Revisions',
      APPROVED: 'Approved',
      PUBLISHED: 'Published',
    };

    if (importantStatuses.includes(newStatus)) {
      let confirmMessage = '';
      if (newStatus === 'PUBLISHED') {
        confirmMessage = 'Are you sure you want to publish this article? It will be visible to all users.';
      } else if (newStatus === 'SCHEDULED') {
        confirmMessage = 'Are you sure you want to schedule this article? It will be published at the scheduled time.';
      } else {
        confirmMessage = 'Are you sure you want to change this article back to draft? It will no longer be visible to users.';
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/dashboard/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchArticles();
        setShowActions(null);
        // Show success message
        const statusLabel = statusLabels[newStatus as keyof typeof statusLabels];
        alert(`Article status changed to ${statusLabel} successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update article status');
      }
    } catch (error) {
      console.error('Error updating article status:', error);
      alert('Failed to update article status');
    }
  };

  const handleDelete = async (articleId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/articles/${articleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchArticles();
        setShowActions(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canEdit = (article: Article) => {
    if (session?.user?.role === 'ADMIN') return true;
    if (session?.user?.role === 'EDITOR') return true;
    
    // Contributors cannot edit published articles
    if (session?.user?.role === 'CONTRIBUTOR' && article.status === 'PUBLISHED') {
      return false;
    }
    
    return article.author.id === session?.user?.id;
  };

  const canDelete = (article: Article) => {
    if (session?.user?.role === 'ADMIN') return true;
    return article.author.id === session?.user?.id && article.status === 'DRAFT';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">Status: {status}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile Layout */}
            <div className="flex items-center space-x-2 sm:hidden flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="h-8 w-8 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {session?.user?.role === 'CONTRIBUTOR' ? 'My Articles' : 'All Articles'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {pagination.total} articles
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log('New Article clicked - Role:', session?.user?.role, 'Status:', status);
                  router.push('/dashboard/articles/new');
                }}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Article</span>
              </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard')}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Dashboard</span>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {session?.user?.role === 'CONTRIBUTOR' ? 'My Articles' : 'All Articles'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {pagination.total} articles
                </div>
                <Button
                  onClick={() => {
                    console.log('New Article clicked - Role:', session?.user?.role, 'Status:', status);
                    router.push('/dashboard/articles/new');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* Search and Filters */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">All Statuses</option>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="created_at">Created Date</option>
                      <option value="updated_at">Updated Date</option>
                      <option value="title">Title</option>
                      <option value="views">Views</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Articles List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Start by creating your first article'}
              </p>
              <Button 
                onClick={() => {
                  console.log('Create Article clicked - Role:', session?.user?.role, 'Status:', status);
                  console.log('Router object:', router);
                  console.log('Attempting navigation to dashboard with post form...');
                  
                  // Try router.push first with parameter to open post form
                  if (router && typeof router.push === 'function') {
                    try {
                      router.push('/dashboard?openPostForm=true');
                      console.log('Router navigation sent with openPostForm parameter');
                    } catch (error) {
                      console.error('Router navigation error:', error);
                      // Fallback to window.location
                      console.log('Falling back to window.location');
                      window.location.href = '/dashboard?openPostForm=true';
                    }
                  } else {
                    console.log('Router not available, using window.location');
                    window.location.href = '/dashboard?openPostForm=true';
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Featured Image */}
                        {article.featuredImage && (
                          <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0">
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Article Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                              {article.title}
                            </h3>
                            <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0 sm:ml-4">
                              <Badge className={statusColors[article.status as keyof typeof statusColors]}>
                                {statusLabels[article.status as keyof typeof statusLabels]}
                              </Badge>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowActions(showActions === article.id ? null : article.id)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                                
                                {/* Actions Dropdown */}
                                {showActions === article.id && (
                                  <div className="absolute right-0 top-8 sm:right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-[160px] max-w-[calc(100vw-2rem)]">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          router.push(`/articles/${article.slug}`);
                                          setShowActions(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                      </button>
                                      
                                      {canEdit(article) && (
                                        <button
                                          onClick={() => {
                                            // Always use the dedicated edit page for all articles
                                            router.push(`/dashboard/articles/${article.id}/edit`);
                                            setShowActions(null);
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </button>
                                      )}

                                      {/* Status Change Options - Only for Editors and Admins */}
                                      {canEdit(article) && (session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') && (
                                        <>
                                          <div className="border-t border-gray-100 my-1"></div>
                                          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Change Status
                                          </div>
                                          <div className="px-4 py-1 text-xs text-gray-400">
                                            Current: {statusLabels[article.status as keyof typeof statusLabels]}
                                          </div>
                                          {Object.entries(statusLabels).map(([value, label]) => (
                                            value !== article.status && (
                                              <button
                                                key={value}
                                                onClick={() => {
                                                  handleStatusChange(article.id, value);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                                                  value === 'PUBLISHED' ? 'text-green-700' :
                                                  value === 'APPROVED' ? 'text-blue-700' :
                                                  value === 'NEEDS_REVISIONS' ? 'text-orange-700' :
                                                  value === 'IN_REVIEW' ? 'text-yellow-700' :
                                                  'text-gray-700'
                                                }`}
                                              >
                                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                                  value === 'PUBLISHED' ? 'bg-green-500' :
                                                  value === 'APPROVED' ? 'bg-blue-500' :
                                                  value === 'NEEDS_REVISIONS' ? 'bg-orange-500' :
                                                  value === 'IN_REVIEW' ? 'bg-yellow-500' :
                                                  'bg-gray-500'
                                                }`}></div>
                                                {label}
                                              </button>
                                            )
                                          ))}
                                        </>
                                      )}

                                      {canDelete(article) && (
                                        <>
                                          <div className="border-t border-gray-100 my-1"></div>
                                          <button
                                            onClick={() => {
                                              handleDelete(article.id);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {article.dek && (
                            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{article.dek}</p>
                          )}

                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{article.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{article.section.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{article.readingTime} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 flex-shrink-0" />
                              <span>{article.views} views</span>
                            </div>
                            <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{formatDate(article.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} articles
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
