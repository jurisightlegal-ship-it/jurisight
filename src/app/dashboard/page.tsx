'use client';

import { useSession, signOut, getSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit3,
  Plus,
  BarChart3,
  UserCheck,
  BookOpen,
  PenTool,
  Tag,
  Settings,
  Calendar,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { TagsManagement } from '@/components/ui/tags-management';
import { SectionsManagement } from '@/components/ui/sections-management';
import { useUserUpdates } from '@/lib/user-updates';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import RevisionNotesCard from '@/components/revision-notes-card';
import RevisionNotesBadge from '@/components/revision-notes-badge';

interface DashboardStats {
  articles: {
    total: number;
    published: number;
    inReview: number;
    draft: number;
  };
  users: {
    total: number;
    active: number;
    contributors: number;
    editors: number;
    admins: number;
  };
  engagement: {
    totalViews: number;
  };
  newsletter: {
    total: number;
    active: number;
    inactive: number;
    recent: number;
  };
}

interface RecentArticle {
  id: number;
  title: string;
  slug: string;
  dek: string;
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserIsActive, setCurrentUserIsActive] = useState<boolean | null>(null);
  const [currentUserImage, setCurrentUserImage] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [showTagsManagement, setShowTagsManagement] = useState(false);
  const [showSectionsManagement, setShowSectionsManagement] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // refreshUserData function removed to prevent infinite reload loop
  // User data will be updated through normal state management

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsResponse, articlesResponse, userResponse, newsletterStatsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-articles?limit=5'),
        session?.user?.id ? fetch(`/api/dashboard/users/${session.user.id}`) : Promise.resolve(null),
        session?.user?.role === 'ADMIN' ? fetch('/api/dashboard/newsletter-stats') : Promise.resolve(null)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch newsletter stats for admin users
      if (newsletterStatsResponse && newsletterStatsResponse.ok) {
        const newsletterStats = await newsletterStatsResponse.json();
        setStats(prevStats => ({
          ...prevStats,
          newsletter: newsletterStats
        }));
      }

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setRecentArticles(articlesData.articles);
      }

      // Update current user data from fresh data
      if (userResponse && userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          if (userData.user.name) {
            console.log('Updating user name from fresh data:', userData.user.name);
            setCurrentUserName(userData.user.name);
          }
          if (userData.user.isActive !== undefined) {
            console.log('Updating user status from fresh data:', userData.user.isActive);
            setCurrentUserIsActive(userData.user.isActive);
          }
          if (userData.user.image) {
            console.log('Updating user image from fresh data:', userData.user.image);
            setCurrentUserImage(userData.user.image);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session) {
      // Initialize current user data from session
      console.log('Session data:', { 
        userId: session.user?.id, 
        userName: session.user?.name,
        userEmail: session.user?.email,
        userIsActive: session.user?.isActive,
        userImage: session.user?.image
      });
      setCurrentUserName(session.user?.name || null);
      setCurrentUserIsActive(session.user?.isActive ?? null);
      setCurrentUserImage(session.user?.image || null);
      fetchDashboardData();
      
      // Also refresh user data immediately to get latest name
      if (session.user?.id) {
        fetch(`/api/dashboard/users/${session.user.id}`)
          .then(response => response.json())
          .then(data => {
            if (data.user?.name) {
              console.log('Initial user data fetch - name:', data.user.name);
              setCurrentUserName(data.user.name);
            }
            if (data.user?.isActive !== undefined) {
              console.log('Initial user status fetch - isActive:', data.user.isActive);
              setCurrentUserIsActive(data.user.isActive);
            }
          })
          .catch(error => console.error('Initial user fetch error:', error));
      }
    }
  }, [session, fetchDashboardData]);

  // Page visibility refresh removed to prevent infinite reload loop
  // Data will be fetched once on component mount

  // Listen for storage events (when user is updated from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userUpdated' && e.newValue) {
        const updatedUser = JSON.parse(e.newValue);
        if (updatedUser.id === session?.user?.id) {
          console.log('Storage event: updating current user name to:', updatedUser.name);
          setCurrentUserName(updatedUser.name);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session]);

  // Listen for user updates from other components
  const handleUserUpdate = useCallback((userId: string, userData: { name?: string; isActive?: boolean; role?: string; email?: string; bio?: string; image?: string; linkedinUrl?: string; personalEmail?: string }) => {
    console.log('Dashboard received user update:', { userId, userData, currentUserId: session?.user?.id });
    
    // Update current user data if it's the logged-in user
    if (session?.user?.id === userId) {
      if (userData.name) {
        console.log('Updating current user name to:', userData.name);
        setCurrentUserName(userData.name);
      }
      if (userData.isActive !== undefined) {
        console.log('Updating current user status to:', userData.isActive);
        setCurrentUserIsActive(userData.isActive);
      }
      if (userData.image !== undefined) {
        console.log('Updating current user image to:', userData.image);
        setCurrentUserImage(userData.image);
      }
      
      // User data updated successfully
      console.log('User data updated in local state');
    }
    
    // Update recent articles to reflect new user names
    setRecentArticles(currentArticles => 
      currentArticles.map(article => 
        article.author.id === userId 
          ? { ...article, author: { ...article.author, name: userData.name || null } }
          : article
      )
    );
  }, [session?.user?.id]);

  useUserUpdates(handleUserUpdate);

  // Force session refresh removed to prevent infinite reload loop
  // Session is already managed by NextAuth.js

  // Session validation removed to prevent infinite reload loop
  // The session is already validated by NextAuth.js

  // Periodic refresh removed to prevent infinite reload loop
  // User data will be refreshed when needed through user interactions

  // Resolve image URL when currentUserImage changes
  useEffect(() => {
    const resolveImageUrl = async () => {
      if (currentUserImage) {
        try {
          const resolvedUrl = await getImageDisplayUrl(currentUserImage);
          setResolvedImageUrl(resolvedUrl);
        } catch (error) {
          console.error('Error resolving image URL:', error);
          setResolvedImageUrl(null);
        }
      } else {
        setResolvedImageUrl(null);
      }
    };

    resolveImageUrl();
  }, [currentUserImage]);

  // Check for URL parameter to open post form modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openPostForm = urlParams.get('openPostForm');
    const editArticle = urlParams.get('editArticle');
    
    if (openPostForm === 'true') {
      console.log('URL parameter detected: openPostForm=true, redirecting to new article page');
      router.push('/dashboard/articles/new');
      
      // Clean up the URL parameter without causing a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    if (editArticle) {
      console.log('URL parameter detected: editArticle=', editArticle, 'redirecting to edit article page');
      router.push(`/dashboard/articles/${editArticle}/edit`);
      
      // Clean up the URL parameter without causing a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Edit3 },
      IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      NEEDS_REVISIONS: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // forceSessionRefresh function removed to prevent infinite reload loop
  // Session management is handled by NextAuth.js

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-jurisight-navy dark:text-white">Jurisight</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              {/* Revision Notes Badge - only for contributors */}
              {session.user?.role === 'CONTRIBUTOR' && (
                <RevisionNotesBadge />
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-jurisight-navy text-jurisight-navy hover:bg-jurisight-navy hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-jurisight-navy dark:text-white mb-2">
                  Welcome back, {(currentUserName || session.user?.name)?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {session.user?.role === 'CONTRIBUTOR' && 'Create and manage your legal articles.'}
                  {session.user?.role === 'EDITOR' && 'Review and manage articles from contributors.'}
                  {session.user?.role === 'ADMIN' && 'Manage the entire Jurisight platform.'}
                </p>
              </div>
              
              {/* Live Clock Component */}
              <div className="flex justify-end lg:justify-start">
                {/* Desktop Clock */}
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border shadow-sm dark:border-gray-700">
                  <Calendar className="h-5 w-5 text-jurisight-navy dark:text-white" />
                  <div className="text-sm">
                    <div className="font-medium text-jurisight-navy dark:text-white">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-mono text-lg">
                      {currentTime.toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Clock */}
                <div className="sm:hidden flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border dark:border-gray-700">
                  <Clock className="h-4 w-4 text-jurisight-navy dark:text-white" />
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-300">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Article Card - Prominent CTA */}
          {(session.user?.role === 'CONTRIBUTOR' || session.user?.role === 'EDITOR' || session.user?.role === 'ADMIN') && (currentUserIsActive !== false) && (
            <Card className="mb-8 bg-gradient-to-r from-jurisight-lime to-jurisight-teal border-0 shadow-lg dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-white/20 dark:bg-gray-600/20 rounded-lg flex-shrink-0">
                      <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-jurisight-navy dark:text-white" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-jurisight-navy dark:text-white leading-tight">
                        Ready to Share Your Legal Insights?
                      </h3>
                      <p className="text-sm sm:text-base text-jurisight-navy/80 dark:text-gray-300 mt-1">
                        Create a new article and contribute to the legal community.
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <Button 
                      size="lg"
                      className="w-full sm:w-auto bg-jurisight-navy text-black hover:bg-jurisight-navy/90 px-6 sm:px-8 text-sm sm:text-base dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      onClick={() => {
                        console.log('Post Article clicked - Role:', session.user?.role);
                        router.push('/dashboard/articles/new');
                      }}
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Post Article
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-jurisight-royal/10 dark:bg-jurisight-royal/20 rounded-lg">
                      <FileText className="h-6 w-6 text-jurisight-royal dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Articles</p>
                      <p className="text-2xl font-bold text-jurisight-navy dark:text-white">{stats.articles.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Published</p>
                      <p className="text-2xl font-bold text-jurisight-navy dark:text-white">{stats.articles.published}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Review</p>
                      <p className="text-2xl font-bold text-jurisight-navy dark:text-white">{stats.articles.inReview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Views</p>
                      <p className="text-2xl font-bold text-jurisight-navy dark:text-white">{stats.engagement.totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Stats - Only for Admin */}
              {session.user?.role === 'ADMIN' && stats.newsletter && (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Newsletter Subscribers</p>
                        <p className="text-2xl font-bold text-jurisight-navy dark:text-white">{stats.newsletter.total}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.newsletter.active} active • {stats.newsletter.recent} this week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center dark:text-white">
                    <BarChart3 className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(session.user?.role === 'CONTRIBUTOR' || session.user?.role === 'EDITOR' || session.user?.role === 'ADMIN') && (currentUserIsActive !== false) && (
                    <Button 
                      className="w-full bg-jurisight-lime text-jurisight-navy hover:bg-jurisight-lime-dark dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      onClick={() => {
                        console.log('Create New Article clicked - Role:', session.user?.role);
                        router.push('/dashboard/articles/new');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Article
                    </Button>
                  )}

                  {session.user?.role === 'EDITOR' && (
                    <Button 
                      className="w-full bg-jurisight-teal text-black hover:bg-jurisight-teal-dark dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      onClick={() => router.push('/dashboard/review-queue')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Review Queue ({stats?.articles.inReview || 0})
                    </Button>
                  )}

                  {session.user?.role === 'ADMIN' && (
                    <>
                      <Button 
                        className="w-full bg-jurisight-royal text-black hover:bg-jurisight-royal-dark dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => router.push('/dashboard/users')}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                      <Button 
                        className="w-full bg-jurisight-teal text-black hover:bg-jurisight-teal-dark dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => router.push('/dashboard/review-queue')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Queue
                      </Button>
                      <Button 
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:text-white dark:hover:bg-purple-600"
                        onClick={() => router.push('/dashboard/newsletter')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Newsletter Subscribers
                      </Button>
                    </>
                  )}

                  {(session.user?.role === 'ADMIN' || session.user?.role === 'EDITOR') && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setShowTagsManagement(true)}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Manage Tags
                      </Button>
                      
                      {session.user?.role === 'ADMIN' && (
                        <Button 
                          variant="outline" 
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setShowSectionsManagement(true)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Sections
                        </Button>
                      )}
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => router.push('/dashboard/articles')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {session?.user?.role === 'CONTRIBUTOR' ? 'My Articles' : 'All Articles'}
                  </Button>

                  {/* Revision Notes Button - only for contributors */}
                  {session?.user?.role === 'CONTRIBUTOR' && (
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-700"
                      onClick={() => {
                        // Scroll to revision notes card
                        const element = document.querySelector('[data-revision-notes]');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Revision Notes
                    </Button>
                  )}

                  {/* Content Calendar - only visible to admins and editors */}
                  {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => router.push('/dashboard/calendar')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Content Calendar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Revision Notes Card - only for contributors */}
              {session.user?.role === 'CONTRIBUTOR' && (
                <div data-revision-notes>
                  <RevisionNotesCard className="mb-6" />
                </div>
              )}

              {/* Profile Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Profile</CardTitle>
                  <CardDescription className="dark:text-gray-300">Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-jurisight-royal/10 dark:bg-jurisight-royal/20 rounded-full flex items-center justify-center overflow-hidden">
                        {resolvedImageUrl ? (
                          <Image
                            src={resolvedImageUrl}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              setResolvedImageUrl(null);
                            }}
                          />
                        ) : (
                          <span className="text-jurisight-royal dark:text-blue-400 font-semibold">
                            {(currentUserName || session.user?.name)?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{currentUserName || session.user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t dark:border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Role:</span>
                        <Badge className="bg-jurisight-royal/10 text-jurisight-royal border-0 dark:bg-jurisight-royal/20 dark:text-blue-400">
                          {session.user?.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (currentUserIsActive ?? session.user?.isActive)
                            ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' 
                            : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            (currentUserIsActive ?? session.user?.isActive) ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {(currentUserIsActive ?? session.user?.isActive) ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <div className="lg:col-span-2">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between dark:text-white">
                    <span className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
                      Recent Articles
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => router.push('/dashboard/articles')}
                    >
                      View All
                    </Button>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    {session.user?.role === 'CONTRIBUTOR' ? 'Your recent articles' : 'Latest articles from all contributors'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentArticles.length > 0 ? (
                    <div className="space-y-4">
                      {recentArticles.map((article) => (
                        <div 
                          key={article.id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => router.push(`/articles/${article.slug}`)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-jurisight-navy dark:text-white mb-1 line-clamp-2">
                                {article.title}
                              </h3>
                              {article.dek && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                  {article.dek}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>By {article.author.name || article.author.email}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{article.readingTime} min read</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{article.views} views</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: article.section.color }}
                                  ></div>
                                  {article.section.name}
                                </span>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
                              {getStatusBadge(article.status)}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/articles/${article.slug}`);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No articles yet. Start creating content!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>


      {/* Tags Management Modal */}
      {showTagsManagement && (
        <TagsManagement
          onClose={() => setShowTagsManagement(false)}
        />
      )}

      {/* Sections Management Modal */}
      {showSectionsManagement && (
        <SectionsManagement
          onClose={() => setShowSectionsManagement(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Made with ❤️ by{' '}
              <a
                href="https://aplucid.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jurisight-royal hover:text-jurisight-royal-light dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Aplucid AI
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
