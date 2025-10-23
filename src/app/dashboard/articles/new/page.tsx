'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send,
  Clock,
  User,
  Tag as TagIcon,
  BookOpen,
  ChevronDown,
  Plus,
  Globe,
  Calendar,
  CheckCircle
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

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  dek: string;
  body: string;
  sectionId: string;
  featuredImage: string;
  tags: string[];
  status: string;
  readingTime: number;
  scheduledAt?: string;
  isFeatured: boolean;
  isTopNews: boolean;
}

export default function NewArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    scheduledAt: '',
    isFeatured: false,
    isTopNews: false
  });

  const [readingTime, setReadingTime] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load sections and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectionsResponse, tagsResponse] = await Promise.all([
          fetch('/api/sections'),
          fetch('/api/tags')
        ]);

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          // Handle the API response format: { sections: [...] }
          const sectionsArray = sectionsData.sections || sectionsData;
          setSections(Array.isArray(sectionsArray) ? sectionsArray : []);
        } else {
          console.error('Failed to load sections:', sectionsResponse.status);
          setSections([]);
        }

        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          // Handle the API response format: { tags: [...] }
          const tagsArray = tagsData.tags || tagsData;
          setAvailableTags(Array.isArray(tagsArray) ? tagsArray : []);
        } else {
          console.error('Failed to load tags:', tagsResponse.status);
          setAvailableTags([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load form data');
        // Set empty arrays as fallback
        setSections([]);
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Calculate reading time
  useEffect(() => {
    if (formData.body) {
      const wordCount = formData.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
      const time = Math.ceil(wordCount / 200); // 200 words per minute
      setReadingTime(time);
    }
  }, [formData.body]);

  // Debug logging for form state
  useEffect(() => {
    console.log('=== FORM DATA DEBUG ===');
    console.log('Title:', {
      raw: formData.title,
      trimmed: formData.title.trim(),
      length: formData.title.trim().length,
      hasValue: !!formData.title.trim()
    });
    
    console.log('Body:', {
      raw: formData.body,
      trimmed: formData.body.trim(),
      length: formData.body.trim().length,
      hasValue: !!formData.body.trim()
    });
    
    console.log('Section ID:', {
      raw: formData.sectionId,
      length: formData.sectionId.length,
      hasValue: !!formData.sectionId
    });
    
    console.log('Button Conditions:', {
      saving: saving,
      hasTitle: !!formData.title.trim(),
      hasBody: !!formData.body.trim(),
      hasSection: !!formData.sectionId,
      overall: !saving && !!formData.title.trim() && !!formData.body.trim() && !!formData.sectionId
    });
    
    console.log('Session Info:', {
      status: status,
      user: session?.user,
      userRole: session?.user?.role
    });
    console.log('========================');
  }, [formData, saving, session, status]);

  const handleInputChange = (field: string, value: string | boolean) => {
    // Convert string 'true'/'false' to boolean for prominence fields
    let processedValue = value;
    if (field === 'isFeatured' || field === 'isTopNews') {
      processedValue = value === 'true' || value === true;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    console.log(`=== FIELD UPDATE ===`);
    console.log(`Field: ${field}`);
    console.log(`Value: ${processedValue}`);
    console.log(`Type: ${typeof processedValue}`);
    console.log(`====================`);
  };

  const handleBodyChange = (content: string) => {
    // Improved empty content detection
    const isEmpty = !content || 
      content.trim() === '' || 
      content === '<p><br></p>' || 
      content === '<p></p>' ||
      content === '<p> </p>' ||
      content === '<p>&nbsp;</p>' ||
      content === '<p><br></p>\n' ||
      content === '<p><br></p>\r\n' ||
      content === '<p></p>\n' ||
      content === '<p></p>\r\n';
      
    const cleanContent = isEmpty ? '' : content;
    setFormData(prev => ({ ...prev, body: cleanContent }));
    console.log('ArticlePage: Body content updated:', { 
      original: content, 
      clean: cleanContent, 
      isEmpty,
      formDataTitle: formData.title,
      formDataSection: formData.sectionId
    });
  };

  const handleFeaturedImageUpload = (result: any) => {
    console.log('Featured image upload result:', result);
    setFormData(prev => ({ ...prev, featuredImage: result.url }));
    setFeaturedImageUrl(result.url);
  };

  const handleFeaturedImageError = (error: string) => {
    console.error('Featured image upload error:', error);
    alert(`Failed to upload featured image: ${error}`);
  };

  const handleContentImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      console.log('Uploading content image:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Content image upload response:', {
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        const { data } = await response.json();
        console.log('Content image upload success:', data);
        return data.url;
      } else {
        const errorData = await response.json();
        console.error('Content image upload failed:', errorData);
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Content image upload failed:', error);
      throw error;
    }
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
    if (!session?.user?.id) {
        alert('You must be logged in to save an article.');
        return;
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
    } else if (status === 'SCHEDULED' && formData.scheduledAt) {
        const scheduledDate = new Date(formData.scheduledAt).toLocaleString();
        if (!confirm(`Are you sure you want to schedule this article for ${scheduledDate}?`)) {
            return;
        }
    }

    // Improved content validation function
    const isContentEmpty = (content: string) => {
      if (!content) return true;
      
      // Remove whitespace and check if empty
      const trimmed = content.trim();
      if (!trimmed) return true;
      
      // Check for various empty HTML patterns that the editor might produce
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

    // Validate required fields before saving
    // For DRAFT status, only title is required
    // For IN_REVIEW and PUBLISHED status, both title and content are required
    if (status !== 'DRAFT') {
        if (!formData.title.trim()) {
            alert('Please enter a title for the article.');
            return;
        }

        if (isContentEmpty(formData.body)) {
            alert('Please enter content for the article.');
            return;
        }

        if (!formData.sectionId) {
            alert('Please select a section for the article.');
            return;
        }
    }

    setSaving(true);
    setError(null);
    try {
        // Determine the correct status based on scheduling
        let articleStatus = status;
        if (status === 'SCHEDULED' && formData.scheduledAt) {
            articleStatus = 'SCHEDULED';
        } else if (status === 'PUBLISHED') {
            articleStatus = 'PUBLISHED';
        } else if (status === 'SCHEDULED' && !formData.scheduledAt) {
            // If scheduling is requested but no date is set, save as draft instead
            articleStatus = 'DRAFT';
            alert('No scheduled date set. Saving as draft instead.');
        }

        // Prepare data for the API call with correct parameter names
        const articleData = {
            title: formData.title.trim() || 'Untitled',
            dek: formData.dek,
            body: formData.body || '', // Send empty string instead of <p></p>
            sectionId: formData.sectionId ? Number(formData.sectionId) : 1, // Default to first section if none selected
            featuredImage: formData.featuredImage,
            status: articleStatus,
            readingTime: readingTime,
            tags: formData.tags,
            authorId: session.user.id,
            slug: formData.slug || 'untitled',
            scheduledAt: formData.scheduledAt || undefined,
            publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
            isFeatured: formData.isFeatured || false,
            isTopNews: formData.isTopNews || false
        };

        console.log('ArticlePage: Sending article data to API:', articleData);

        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData)
        });

        console.log('ArticlePage: API response status:', response.status);
        
        if (response.ok) {
            const responseData = await response.json();
            console.log('ArticlePage: API response data:', responseData);
            
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
            console.error('ArticlePage: API error response:', errorData);
            const errorMessage = errorData.error || `Failed to save article: ${response.status} ${response.statusText}`;
            
            // Provide more specific error messages
            if (errorMessage.includes('author ID')) {
                alert('Authentication error: Please make sure you are logged in with a valid account.');
            } else if (errorMessage.includes('section ID')) {
                alert('Invalid section: Please select a valid section for your article.');
            } else if (errorMessage.includes('Body content is required')) {
                alert('Content required: Please add content to your article before submitting for review or publishing.');
            } else {
                alert(errorMessage);
            }
            
            setError(errorMessage);
        }
    } catch (error) {
        console.error('ArticlePage: Error saving article:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save article. Please try again.';
        setError(errorMessage);
        alert('Network error: ' + errorMessage);
    } finally {
        setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>${formData.title || 'Article Preview'}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #1f2937; }
              .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${formData.title || 'Untitled Article'}</h1>
            <div class="meta">
              <p>${formData.dek || 'No description provided'}</p>
              <p>Reading time: ${readingTime} minutes</p>
            </div>
            <div>${formData.body || 'No content yet'}</div>
          </body>
        </html>
      `);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
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
                  Create New Article
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Create a new legal article
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  DRAFT
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Article</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create a new legal article with rich content and metadata
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  DRAFT
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
                <MediaUpload
                  onUpload={handleFeaturedImageUpload}
                  onError={handleFeaturedImageError}
                  userId={session?.user?.id || ''}
                  accept="image"
                  maxFiles={1}
                />
                {featuredImageUrl && (
                  <div className="mt-4">
                    <img
                      src={featuredImageUrl}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
                  Schedule Publication
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Optionally schedule this article for future publication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formData.scheduledAt && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Article will be published on: {new Date(formData.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
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
                      {Array.isArray(sections) && sections.map((section) => (
                        <option key={section.id} value={String(section.id)}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Slug */}
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

                  {/* Prominence Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Article Prominence
                    </label>
                    <div className="space-y-3">
                      {/* Featured Article */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked ? 'true' : 'false')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured Article
                        </label>
                      </div>

                      {/* Top News */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isTopNews"
                          checked={formData.isTopNews}
                          onChange={(e) => handleInputChange('isTopNews', e.target.checked ? 'true' : 'false')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isTopNews" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Top News
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Featured articles appear prominently on the homepage. Top news articles are highlighted in the news section.
                    </p>
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
                      {Array.isArray(sections) && sections.map((section) => (
                        <option key={section.id} value={String(section.id)}>
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
                          Select existing tag
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {showTagDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {Array.isArray(availableTags) && availableTags
                              .filter(tag => !formData.tags.includes(tag.name))
                              .map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => addTagFromDropdown(tag.name)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                >
                                  {tag.name}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add New Tag */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    Error: {error}
                  </div>
                )}
                <Button
                  onClick={() => handleSave('DRAFT')}
                  disabled={saving}
                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>

                
                <Button
                  onClick={() => handleSave('IN_REVIEW')}
                  disabled={saving}
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {saving ? 'Submitting...' : 'Submit for Review'}
                </Button>


                {/* Publish button - only visible to admins and editors */}
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
                  <>
                    <Button
                      onClick={() => handleSave('PUBLISHED')}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {saving ? 'Publishing...' : 'Publish Now'}
                    </Button>

                  </>
                )}

                {/* Schedule button - only visible to admins and editors */}
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
                  <>
                    <Button
                      onClick={() => handleSave('SCHEDULED')}
                      disabled={saving}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {saving ? 'Scheduling...' : formData.scheduledAt ? `Schedule for ${new Date(formData.scheduledAt).toLocaleString()}` : 'Schedule Publication'}
                    </Button>

                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
