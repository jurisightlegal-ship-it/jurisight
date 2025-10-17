'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Tag as TagIcon,
  BookOpen,
  ChevronDown,
  Plus,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaUpload } from '@/components/ui/media-upload';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';

interface Section {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

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
  isFeatured: boolean;
  isTopNews: boolean;
  featuredAt: string | null;
  topNewsAt: string | null;
  scheduledAt: string | null;
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
  tags: string[];
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    dek: '',
    body: '',
    sectionId: '',
    featuredImage: '',
    tags: [] as string[],
    status: 'DRAFT',
    isFeatured: false,
    isTopNews: false,
    scheduledAt: ''
  });

  const [readingTime, setReadingTime] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [scheduledDateError, setScheduledDateError] = useState<string | null>(null);

  // Get article ID from params
  useEffect(() => {
    const getArticleId = async () => {
      try {
        const resolvedParams = await params;
        console.log('Edit page - Article ID from params:', resolvedParams.id);
        setArticleId(resolvedParams.id);
      } catch (error) {
        console.error('Error getting article ID from params:', error);
        setError('Invalid article ID');
      }
    };
    getArticleId();
  }, [params]);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId || !session?.user?.id) {
        console.log('Edit page - Missing articleId or session:', { articleId, sessionUserId: session?.user?.id });
        setLoading(false);
        return;
      }

      console.log('Edit page - Fetching article:', articleId);
      try {
        const response = await fetch(`/api/dashboard/articles/${articleId}`);
        console.log('Edit page - API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Edit page - API response data:', data);
          console.log('Edit page - Full API response:', JSON.stringify(data, null, 2));
          
          if (!data || !data.article) {
            setError('Article not found or invalid response from server');
            setLoading(false);
            return;
          }
          
          const articleData = data.article;
          console.log('Edit page - Article data received:', articleData);
          console.log('Edit page - Article featured image specifically:', articleData.featuredImage);
          
          // Check if user can edit this article
          const isAuthor = articleData.author.id === session.user.id;
          const isAdmin = session.user.role === 'ADMIN';
          const isEditor = session.user.role === 'EDITOR';
          const isContributor = session.user.role === 'CONTRIBUTOR';

          // Permission checks
          if (!isAuthor && !isAdmin && !isEditor) {
            setError('You do not have permission to edit this article');
            setLoading(false);
            return;
          }

          // Contributors can only edit their own articles
          if (isContributor && !isAuthor) {
            setError('You can only edit your own articles');
            setLoading(false);
            return;
          }

          // Check if article data is valid
          if (!articleData || !articleData.id) {
            setError('Invalid article data received');
            setLoading(false);
            return;
          }

          // Status-based editing restrictions
          const allowedStatuses = ['DRAFT', 'NEEDS_REVISIONS'];
          const articleStatus = articleData.status || 'DRAFT'; // Default to DRAFT if status is undefined
          
          console.log('Edit page - Article status:', articleStatus, 'User role:', session.user.role);
          
          // Admins and Editors can edit articles in any status
          if (isAdmin || isEditor) {
            // No status restrictions for admins and editors
            console.log('Edit page - Admin/Editor access granted');
          } else {
            // Authors and contributors can only edit DRAFT and NEEDS_REVISIONS articles
            if (!allowedStatuses.includes(articleStatus)) {
              setError(`This article cannot be edited in its current status (${articleStatus}). Only DRAFT and NEEDS_REVISIONS articles can be edited.`);
              setLoading(false);
              return;
            }
            console.log('Edit page - Author/Contributor access granted for status:', articleStatus);
          }

          setArticle(articleData);
          setFormData({
            title: articleData.title || '',
            slug: articleData.slug || '',
            dek: articleData.dek || '',
            body: articleData.body || '',
            sectionId: articleData.section?.id?.toString() || '',
            featuredImage: articleData.featuredImage || '',
            tags: articleData.tags || [],
            status: articleData.status || 'DRAFT',
            isFeatured: articleData.isFeatured || false,
            isTopNews: articleData.isTopNews || false,
            scheduledAt: articleData.scheduledAt || ''
          });
          setReadingTime(articleData.readingTime || 0);

          // Process featured image URL if it exists
          console.log('Article featured image:', articleData.featuredImage);
          if (articleData.featuredImage) {
            console.log('Processing featured image URL...');
            processFeaturedImageUrl(articleData.featuredImage);
          } else {
            console.log('No featured image found for this article');
          }
        } else {
          const errorData = await response.json();
          console.error('Edit page - API error:', errorData);
          if (response.status === 404) {
            setError('Article not found. This article may have been deleted or you may not have permission to edit it.');
          } else if (response.status === 401) {
            setError('Authentication required. Please log in again.');
          } else if (response.status === 403) {
            setError('You do not have permission to edit this article.');
          } else {
            setError(errorData.error || 'Failed to load article');
          }
        }
      } catch (err) {
        console.error('Edit page - Error fetching article:', err);
        setError('Failed to load article. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, session?.user?.id]);

  // Fetch sections and tags
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/sections');
        if (response.ok) {
          const data = await response.json();
          setSections(data.sections || []);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchSections();
    fetchTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTagDropdown) {
        const target = event.target as Element;
        if (!target.closest('.tag-dropdown-container')) {
          setShowTagDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagDropdown]);

  // Calculate reading time when content changes
  useEffect(() => {
    const calculateReadingTime = () => {
      const wordsPerMinute = 200;
      const text = (formData.body || '').replace(/<[^>]*>/g, ''); // Strip HTML
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(minutes);
    };

    if (formData.body) {
      calculateReadingTime();
    }
  }, [formData.body]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateScheduledDate = (scheduledAt: string): string | null => {
    if (!scheduledAt) return null;
    
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return 'Scheduled date must be in the future';
    }
    
    // Check if scheduled date is more than 1 year in the future
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (scheduledDate > oneYearFromNow) {
      return 'Scheduled date cannot be more than 1 year in the future';
    }
    
    return null;
  };

  const handleBodyChange = (content: string) => {
    setFormData(prev => ({ ...prev, body: content }));
  };

  const handleContentImageUpload = async (file: File): Promise<string> => {
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      // Upload to API
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { data: result } = await response.json();
      
      // Handle both string URL and UploadResult object
      const url = typeof result === 'string' ? result : result.url;
      
      return url;
    } catch (error) {
      console.error('Content image upload error:', error);
      throw error;
    }
  };

  const processFeaturedImageUrl = async (imagePath: string) => {
    try {
      console.log('Processing featured image URL:', imagePath);
      if (imagePath.startsWith('http')) {
        // Already a full URL
        console.log('Image is already a full URL, using directly');
        setFeaturedImageUrl(imagePath);
      } else {
        // Supabase storage path, get signed URL
        console.log('Image is a storage path, getting signed URL');
        const processedUrl = await getImageDisplayUrl(imagePath);
        console.log('Processed URL:', processedUrl);
        setFeaturedImageUrl(processedUrl);
      }
    } catch (error) {
      console.error('Error processing featured image URL:', error);
      // Fallback: Don't set a URL if processing fails
      setFeaturedImageUrl(null);
    }
  };

  const handleFeaturedImageUpload = (result: { url: string } | string) => {
    // Handle both string URL and UploadResult object
    const url = typeof result === 'string' ? result : result.url;
    
    setFormData(prev => ({ ...prev, featuredImage: url }));
    setFeaturedImageUrl(url);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const addTagFromDropdown = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (status: string = 'DRAFT') => {
    if (!session?.user?.id || !articleId) return;

    // Validate scheduled date if provided
    if (formData.scheduledAt) {
      const error = validateScheduledDate(formData.scheduledAt);
      if (error) {
        setScheduledDateError(error);
        alert(`Cannot save: ${error}`);
        return;
      }
    }

    // For SCHEDULED status, ensure scheduledAt is provided
    if (status === 'SCHEDULED' && !formData.scheduledAt) {
      alert('Please set a scheduled date and time before scheduling the article.');
      return;
    }

    // Add confirmation dialogs for important actions
    if (status === 'PUBLISHED') {
      if (!confirm('Are you sure you want to publish this article? It will be visible to all users immediately.')) {
        return;
      }
    } else if (status === 'SCHEDULED') {
      const scheduledDate = new Date(formData.scheduledAt).toLocaleString();
      if (!confirm(`Are you sure you want to schedule this article for ${scheduledDate}?`)) {
        return;
      }
    }

    setSaving(true);
    try {
      // Determine the correct status based on scheduling
      let articleStatus = status;
      if (status === 'SCHEDULED' && formData.scheduledAt) {
        articleStatus = 'SCHEDULED';
      } else if (status === 'PUBLISHED') {
        articleStatus = 'PUBLISHED';
      }

      // Prepare data based on user role
      const updateData: any = {
        title: formData.title,
        dek: formData.dek,
        body: formData.body,
        sectionId: parseInt(formData.sectionId, 10), // Convert to number
        featuredImage: formData.featuredImage,
        status: articleStatus,
        readingTime,
        isFeatured: formData.isFeatured,
        isTopNews: formData.isTopNews,
        scheduledAt: formData.scheduledAt || null
      };

      // Set timestamps for featured and top news
      if (formData.isFeatured && !article?.isFeatured) {
        updateData.featuredAt = new Date().toISOString();
      }
      if (formData.isTopNews && !article?.isTopNews) {
        updateData.topNewsAt = new Date().toISOString();
      }

      // Only include tags and slug for non-contributors
      if (session?.user?.role !== 'CONTRIBUTOR') {
        updateData.tags = formData.tags;
        updateData.slug = formData.slug;
      }

      console.log('Sending update data:', updateData);

      const response = await fetch(`/api/dashboard/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        let successMessage = '';
        switch (articleStatus) {
          case 'DRAFT':
            successMessage = 'Article saved as draft!';
            break;
          case 'IN_REVIEW':
            successMessage = 'Article submitted for review!';
            break;
          case 'PUBLISHED':
            successMessage = 'Article published successfully!';
            break;
          case 'SCHEDULED':
            successMessage = `Article scheduled for ${new Date(formData.scheduledAt).toLocaleString()}!`;
            break;
          default:
            successMessage = 'Article saved successfully!';
        }
        alert(successMessage);
        router.push('/dashboard/articles');
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        alert(errorData.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const selectedSection = sections.find(s => s.id.toString() === formData.sectionId);
      const sectionName = selectedSection?.name || 'No section selected';
      const sectionColor = selectedSection?.color || '#6B7280';
      
      const tagsHtml = formData.tags.length > 0 
        ? `<div class="tags">
             <strong>Tags:</strong> 
             ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
           </div>`
        : '<div class="tags"><strong>Tags:</strong> None</div>';

      previewWindow.document.write(`
        <html>
          <head>
            <title>Preview: ${formData.title}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                max-width: 1000px; 
                margin: 0 auto; 
                padding: 2rem; 
                background: #f9fafb;
              }
              .preview-container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header { 
                border-bottom: 1px solid #e5e7eb; 
                padding: 2rem; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .title { 
                font-size: 2.5rem; 
                font-weight: bold; 
                margin-bottom: 0.5rem; 
                line-height: 1.2;
              }
              .meta { 
                color: rgba(255,255,255,0.9); 
                font-size: 1rem; 
                margin-bottom: 1rem;
              }
              .section-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                background: rgba(255,255,255,0.2);
                color: white;
              }
              .content { 
                padding: 2rem;
                line-height: 1.7; 
                font-size: 1.1rem;
              }
              .tags {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e2e8f0;
              }
              .tag {
                display: inline-block;
                background: #e2e8f0;
                color: #475569;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.875rem;
                margin-right: 0.5rem;
                margin-bottom: 0.25rem;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                border-radius: 0.5rem; 
                margin: 1rem 0; 
              }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <div class="header">
                <h1 class="title">${formData.title}</h1>
                <p class="meta">${formData.dek}</p>
                <div class="section-badge" style="background-color: ${sectionColor}20; color: ${sectionColor};">
                  ${sectionName}
                </div>
              </div>
              
              ${formData.featuredImage ? `<img src="${formData.featuredImage}" alt="Featured image" style="width: 100%; max-height: 400px; object-fit: cover;" />` : ''}
              
              <div class="content">
                ${formData.body}
              </div>
              
              <div style="padding: 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                <h3>Article Details</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                  <div>
                    <strong>Status:</strong> 
                    <span style="display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: #fef3c7; color: #92400e;">${(formData.status || 'DRAFT').replace('_', ' ')}</span>
                  </div>
                  <div><strong>Reading Time:</strong> ${readingTime} minutes</div>
                  <div><strong>Word Count:</strong> ${(formData.body || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words</div>
                  <div><strong>Author:</strong> ${session?.user?.name || 'Current User'}</div>
                </div>
                ${tagsHtml}
              </div>
            </div>
          </body>
        </html>
      `);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading edit page...</p>
          {articleId && <p className="text-sm text-gray-500">Article ID: {articleId}</p>}
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
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
                onClick={() => router.push('/dashboard/articles')}
                className="h-8 w-8 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Articles</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Edit Article
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {article.status === 'NEEDS_REVISIONS' 
                    ? 'Needs revisions based on feedback'
                    : 'Edit your article draft'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={article.status === 'NEEDS_REVISIONS' ? 'destructive' : 'secondary'}
                  className="flex items-center gap-1 text-xs"
                >
                  {article.status === 'NEEDS_REVISIONS' ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {(article.status || 'DRAFT').replace('_', ' ')}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreview}
                  disabled={!formData.title || !formData.body}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Preview</span>
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard/articles')}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Articles</span>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Article</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {article.status === 'NEEDS_REVISIONS' 
                      ? 'This article needs revisions based on feedback'
                      : 'Edit your article draft'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <Badge 
                  variant={article.status === 'NEEDS_REVISIONS' ? 'destructive' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {article.status === 'NEEDS_REVISIONS' ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {(article.status || 'DRAFT').replace('_', ' ')}
                </Badge>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!formData.title || !formData.body}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Article Title</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter article title..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal text-xl font-semibold dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.dek}
                  onChange={(e) => handleInputChange('dek', e.target.value)}
                  placeholder="Enter article description..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Article Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.body}
                  onChange={handleBodyChange}
                  onImageUpload={handleContentImageUpload}
                  userId={session?.user?.id}
                />
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featuredImage ? (
                  <div className="space-y-4">
                    {featuredImageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={featuredImageUrl}
                          alt="Featured image"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                          onLoad={() => {
                            console.log('Image loaded successfully:', featuredImageUrl);
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', featuredImageUrl);
                            // Hide the image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="text-xs text-blue-600">
                          Image URL: {featuredImageUrl}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jurisight-royal mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading image...</p>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Image path: {formData.featuredImage}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleInputChange('featuredImage', '');
                        setFeaturedImageUrl(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <MediaUpload
                    onUpload={handleFeaturedImageUpload}
                    userId={session.user.id}
                    accept="image"
                    maxFiles={1}
                    showPreview={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Details - Hidden for Contributors */}
            {session?.user?.role !== 'CONTRIBUTOR' && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Article Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section
                    </label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) => handleInputChange('sectionId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select a section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="article-url-slug"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Reading Time & Word Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reading Time
                      </label>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {readingTime} min
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Word Count
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(formData.body || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words
                      </div>
                    </div>
                  </div>

                  {/* Featured Article & Top News */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                          className="h-4 w-4 text-jurisight-royal focus:ring-jurisight-royal border-gray-300 rounded"
                        />
                        <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                          Featured Article
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isTopNews"
                          checked={formData.isTopNews}
                          onChange={(e) => handleInputChange('isTopNews', e.target.checked)}
                          className="h-4 w-4 text-jurisight-royal focus:ring-jurisight-royal border-gray-300 rounded"
                        />
                        <label htmlFor="isTopNews" className="ml-2 text-sm font-medium text-gray-700">
                          Top News
                        </label>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Featured articles appear prominently on the homepage. Top news articles are highlighted in the news section.
                    </div>
                  </div>

                  {/* Schedule Article */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-jurisight-royal" />
                      <label className="text-sm font-medium text-gray-700">
                        Schedule Publication
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Publication Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              // Convert to ISO string for storage
                              const date = new Date(value);
                              const isoString = date.toISOString();
                              handleInputChange('scheduledAt', isoString);
                              
                              // Validate the scheduled date
                              const error = validateScheduledDate(isoString);
                              setScheduledDateError(error);
                            } else {
                              handleInputChange('scheduledAt', '');
                              setScheduledDateError(null);
                            }
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                            scheduledDateError 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-jurisight-royal'
                          }`}
                        />
                        {scheduledDateError && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {scheduledDateError}
                          </p>
                        )}
                      </div>
                      
                      {formData.scheduledAt && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            Scheduled for: {new Date(formData.scheduledAt).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleInputChange('scheduledAt', '')}
                            className="text-red-500 hover:text-red-700 text-xs underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Leave empty to publish immediately. Scheduled articles will be published automatically at the specified time.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Selection for Contributors - Simplified */}
            {session?.user?.role === 'CONTRIBUTOR' && (
              <Card>
                <CardHeader>
                  <CardTitle>Article Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) => handleInputChange('sectionId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                    >
                      <option value="">Select a section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the appropriate section for your article
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags - Hidden for Contributors */}
            {session?.user?.role !== 'CONTRIBUTOR' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Current Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <TagIcon className="h-3 w-3" />
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Tag from Existing Tags */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1 tag-dropdown-container">
                        <Button
                          variant="outline"
                          onClick={() => setShowTagDropdown(!showTagDropdown)}
                          className="w-full justify-between"
                        >
                          <span>Select from existing tags</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        {showTagDropdown && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {availableTags
                              .filter(tag => !formData.tags.includes(tag.name))
                              .map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => addTagFromDropdown(tag.name)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-medium">{tag.name}</div>
                                    {tag.description && (
                                      <div className="text-sm text-gray-500">{tag.description}</div>
                                    )}
                                  </div>
                                  <Plus className="h-4 w-4 text-gray-400" />
                                </button>
                              ))}
                            {availableTags.filter(tag => !formData.tags.includes(tag.name)).length === 0 && (
                              <div className="px-3 py-2 text-gray-500 text-sm">
                                All available tags are already added
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add New Tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a new tag..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                    />
                    <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                      Add New
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleSave('DRAFT')}
                  disabled={saving || !formData.title || !formData.body || !formData.sectionId}
                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                
                <Button
                  onClick={() => handleSave('IN_REVIEW')}
                  disabled={saving || !formData.title || !formData.body || !formData.sectionId}
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {saving ? 'Submitting...' : 'Submit for Review'}
                </Button>

                {/* Publish button - only visible to admins and editors */}
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
                  <Button
                    onClick={() => handleSave('PUBLISHED')}
                    disabled={saving || !formData.title || !formData.body || !formData.sectionId}
                    className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {saving ? 'Publishing...' : 'Publish Now'}
                  </Button>
                )}

                {/* Schedule button - only visible to admins and editors */}
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
                  <Button
                    onClick={() => handleSave('SCHEDULED')}
                    disabled={saving || !formData.title || !formData.body || !formData.sectionId || !formData.scheduledAt}
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-700"
                    title={!formData.scheduledAt ? 'Please set a scheduled date and time first' : ''}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {saving ? 'Scheduling...' : !formData.scheduledAt ? 'Schedule (Set Date First)' : 'Schedule Publication'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
