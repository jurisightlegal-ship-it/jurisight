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
    scheduledAt: ''
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBodyChange = (content: string) => {
    setFormData(prev => ({ ...prev, body: content }));
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
    if (!session?.user?.id) return;

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

    setSaving(true);
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
      }

      // Prepare data for the API call with correct parameter names
      const articleData = {
        title: formData.title,
        dek: formData.dek,
        bodyContent: formData.body,
        sectionId: Number(formData.sectionId),
        featuredImage: formData.featuredImage,
        status: articleStatus,
        readingTime: readingTime,
        tags: formData.tags,
        authorId: session.user.id,
        slug: formData.slug,
        scheduledAt: formData.scheduledAt || undefined,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined
      };

      console.log('Sending article data:', articleData);

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      console.log('API response status:', response.status);
      const responseData = await response.json();
      console.log('API response data:', responseData);

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
        console.error('API error response:', responseData);
        alert(responseData.error || `Failed to save article: ${response.status}`);
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
                        <option key={section.id} value={section.id}>
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
                    disabled={saving || !formData.title || !formData.body || !formData.sectionId}
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {saving ? 'Scheduling...' : formData.scheduledAt ? `Schedule for ${new Date(formData.scheduledAt).toLocaleString()}` : 'Schedule Publication'}
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
