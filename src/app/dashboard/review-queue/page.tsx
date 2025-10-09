'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  User,
  Calendar,
  BookOpen,
  Edit,
  X
} from 'lucide-react';
import { useUserUpdates } from '@/lib/user-updates';
import '../../articles/[slug]/article-content.css';

interface ReviewArticle {
  id: number;
  title: string;
  slug: string;
  dek: string;
  body: string;
  status: string;
  views: number;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
}

export default function ReviewQueue() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<ReviewArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ReviewArticle | null>(null);
  const [revisionNotesModal, setRevisionNotesModal] = useState<{ isOpen: boolean; articleId: number | null; notes: string }>({
    isOpen: false,
    articleId: null,
    notes: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'EDITOR' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const fetchReviewQueue = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-articles?status=REVIEW_QUEUE&limit=50');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (articleId: number) => {
    router.push(`/dashboard/articles/${articleId}/edit`);
  };

  useEffect(() => {
    if (session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') {
      fetchReviewQueue();
    }
  }, [session]);

  // Listen for user data updates (when coming back from user management)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session && (session.user?.role === 'EDITOR' || session.user?.role === 'ADMIN')) {
        // Refresh data when page becomes visible (user returns from another tab)
        fetchReviewQueue();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  // Listen for user updates from other components
  useUserUpdates((userId, userData) => {
    // Update review queue articles to reflect new user names
    setArticles(currentArticles => 
      currentArticles.map(article => 
        article.author.id === userId 
          ? { ...article, author: { ...article.author, name: userData.name || null } }
          : article
      )
    );
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'EDITOR' && session.user?.role !== 'ADMIN')) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      NEEDS_REVISIONS: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      SCHEDULED: { color: 'bg-purple-100 text-purple-800', icon: Calendar },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.IN_REVIEW;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleApprove = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articles.find(a => a.id === articleId)?.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.ok) {
        setArticles(articles.map(a => a.id === articleId ? { ...a, status: 'APPROVED' } : a));
      }
    } catch (error) {
      console.error('Error approving article:', error);
    }
  };

  const handleRequestRevisions = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articles.find(a => a.id === articleId)?.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'NEEDS_REVISIONS' })
      });
      
      if (response.ok) {
        setArticles(articles.map(a => a.id === articleId ? { ...a, status: 'NEEDS_REVISIONS' } : a));
      }
    } catch (error) {
      console.error('Error requesting revisions:', error);
    }
  };

  const handlePublish = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articles.find(a => a.id === articleId)?.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });
      
      if (response.ok) {
        setArticles(articles.filter(a => a.id !== articleId));
      }
    } catch (error) {
      console.error('Error publishing article:', error);
    }
  };

  const handleSendRevisionNotes = (articleId: number) => {
    setRevisionNotesModal({
      isOpen: true,
      articleId,
      notes: ''
    });
  };

  const handleSubmitRevisionNotes = async () => {
    if (!revisionNotesModal.articleId || !revisionNotesModal.notes.trim()) {
      alert('Please enter revision notes');
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/articles/${revisionNotesModal.articleId}/revision-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: revisionNotesModal.notes,
          editorId: session?.user?.id 
        })
      });

      if (response.ok) {
        alert('Revision notes sent successfully!');
        setRevisionNotesModal({ isOpen: false, articleId: null, notes: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send revision notes');
      }
    } catch (error) {
      console.error('Error sending revision notes:', error);
      alert('Failed to send revision notes');
    }
  };

  const handleCloseRevisionNotes = () => {
    setRevisionNotesModal({ isOpen: false, articleId: null, notes: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 sm:py-0 sm:h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-2 sm:mr-4 text-sm sm:text-base"
              >
                ← <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-jurisight-navy">Review Queue</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm sm:text-base text-gray-700">
                {articles.length} articles pending review
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {articles.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl text-jurisight-navy mb-2 line-clamp-2">
                          {article.title}
                        </CardTitle>
                        {article.dek && (
                          <CardDescription className="text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                            {article.dek}
                          </CardDescription>
                        )}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{article.author.name || article.author.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{article.readingTime} min read</span>
                          </div>
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: article.section.color }}
                            ></div>
                            <span>{article.section.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center justify-center sm:justify-start">
                          {getStatusBadge(article.status)}
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(article.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedArticle(article)}
                            className="text-gray-600 border-gray-200 hover:bg-gray-50 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                        Submitted {new Date(article.createdAt).toLocaleString()}
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                        {article.status === 'NEEDS_REVISIONS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendRevisionNotes(article.id)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">Send Revision Notes</span>
                            <span className="xs:hidden">Notes</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestRevisions(article.id)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                        >
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">Request Revisions</span>
                          <span className="xs:hidden">Revisions</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(article.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublish(article.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Publish
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles in review</h3>
              <p className="text-gray-500">All articles have been reviewed or there are no pending submissions.</p>
            </div>
          )}
        </div>
      </main>

      {/* Article Preview Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-jurisight-navy pr-2">
                  {selectedArticle.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
              <div className="article-content max-w-none text-sm sm:text-base">
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(selectedArticle.id)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Article
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArticle(null)}
                    className="text-sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRequestRevisions(selectedArticle.id)}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Request Revisions
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedArticle.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handlePublish(selectedArticle.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Notes Modal */}
      {revisionNotesModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Send Revision Notes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseRevisionNotes}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Revision Notes
                </label>
                <textarea
                  value={revisionNotesModal.notes}
                  onChange={(e) => setRevisionNotesModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter detailed revision notes for the author..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  rows={6}
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseRevisionNotes}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRevisionNotes}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  Send Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
