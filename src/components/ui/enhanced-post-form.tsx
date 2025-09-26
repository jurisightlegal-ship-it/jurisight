'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { RichTextEditor } from './rich-text-editor';
import { MediaUpload } from './media-upload';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { 
  Save, 
  Eye, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Settings,
  Tag,
  Clock,
  User,
  ChevronDown,
  Plus
} from 'lucide-react';
import { MediaUploadService, UploadResult } from '@/lib/media-upload';

interface Section {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

interface ArticleData {
  title: string;
  dek: string;
  body: string;
  sectionId: string;
  featuredImage: string;
  status: string;
  readingTime: number;
  tags: string[];
  slug: string;
}

interface EnhancedPostFormProps {
  onSubmit: (articleData: ArticleData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<ArticleData>;
  editingArticleId?: string | null;
}

export const EnhancedPostForm = ({
  onSubmit,
  onClose,
  isSubmitting = false,
  initialData,
  editingArticleId
}: EnhancedPostFormProps) => {
  const { data: session, status } = useSession();
  const [sections, setSections] = useState<Section[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Prevent contributors from accessing restricted tabs
  const handleTabChange = (value: string) => {
    if (session?.user?.role === 'CONTRIBUTOR' && (value === 'settings' || value === 'metadata')) {
      return; // Don't allow contributors to access these tabs
    }
    setActiveTab(value);
  };
  
  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    dek: initialData?.dek || '',
    body: initialData?.body || '',
    sectionId: initialData?.sectionId || '',
    featuredImage: initialData?.featuredImage || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'DRAFT'
  });

  const [newTag, setNewTag] = useState('');
  const [readingTime, setReadingTime] = useState(0);

  // Fetch sections and tags on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/sections');
        if (response.ok) {
          const data = await response.json();
          setSections(data.sections || []);
        }
      } catch (error) {
        console.error('Failed to fetch sections:', error);
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
        console.error('Failed to fetch tags:', error);
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

  // Fetch article data for editing
  useEffect(() => {
    const fetchArticleData = async () => {
      if (editingArticleId) {
        try {
          const response = await fetch(`/api/dashboard/articles/${editingArticleId}`);
          if (response.ok) {
            const data = await response.json();
            const article = data.article;
            
            // Populate form with article data
            setFormData({
              title: article.title || '',
              slug: article.slug || '',
              dek: article.dek || '',
              body: article.body || '',
              sectionId: article.section?.id?.toString() || '',
              featuredImage: article.featuredImage || '',
              tags: article.tags || [],
              status: article.status || 'DRAFT'
            });
            
            // Set reading time
            setReadingTime(article.readingTime || 0);
          }
        } catch (error) {
          console.error('Error fetching article data:', error);
        }
      }
    };

    fetchArticleData();
  }, [editingArticleId]);

  // Calculate reading time when content changes
  useEffect(() => {
    const calculateReadingTime = () => {
      const wordsPerMinute = 200;
      const text = formData.body.replace(/<[^>]*>/g, ''); // Strip HTML
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
    if (formData.title && !initialData?.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, initialData?.slug]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Check if session is still loading
    if (status === 'loading') {
      throw new Error('Please wait for authentication to complete');
    }
    
    if (!session?.user?.id) {
      throw new Error('Please sign in to upload images');
    }

    // Get access token from session
    const accessToken = (session as { id: string; name: string; slug: string; color: string; }).accessToken;
    if (!accessToken) {
      throw new Error('Authentication token not available. Please sign in again.');
    }

    try {
      const result = await MediaUploadService.uploadImage(file, session.user.id, accessToken);
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    // Check if session is still loading
    if (status === 'loading') {
      throw new Error('Please wait for authentication to complete');
    }
    
    if (!session?.user?.id) {
      throw new Error('Please sign in to upload videos');
    }

    // Get access token from session
    const accessToken = (session as { id: string; name: string; slug: string; color: string; }).accessToken;
    if (!accessToken) {
      throw new Error('Authentication token not available. Please sign in again.');
    }

    try {
      const result = await MediaUploadService.uploadVideo(file, session.user.id, accessToken);
      return result.url;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  };

  const handleFeaturedImageUpload = (result: UploadResult) => {
    setFormData(prev => ({ ...prev, featuredImage: result.url }));
  };

  const addTag = () => {
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

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (status: string = 'DRAFT') => {
    // Restrict contributors to only DRAFT status
    if (session?.user?.role === 'CONTRIBUTOR' && status !== 'DRAFT') {
      console.warn('Contributors can only submit DRAFT articles');
      return;
    }

    const articleData: ArticleData = {
      ...formData,
      status,
      readingTime
    };

    // If editing, include the article ID
    if (editingArticleId) {
      (articleData as { id: string; name: string; slug: string; color: string; }).id = editingArticleId;
    }

    await onSubmit(articleData);
  };

  const handlePreview = () => {
    // Open preview in new tab/modal
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      // Get section name
      const selectedSection = sections.find(s => s.id.toString() === formData.sectionId);
      const sectionName = selectedSection?.name || 'No section selected';
      const sectionColor = selectedSection?.color || '#6B7280';
      
      // Get current user info
      const authorName = session?.user?.name || 'Current User';
      const authorRole = session?.user?.role || 'USER';
      
      // Format tags
      const tagsHtml = formData.tags.length > 0 
        ? `<div class="tags">
             <strong>Tags:</strong> 
             ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
           </div>`
        : '<div class="tags"><strong>Tags:</strong> None</div>';
      
      // Admin/Editor details
      const adminDetails = (session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') 
        ? `
          <div class="admin-details">
            <h3>Article Details (Admin/Editor View)</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Status:</strong> 
                <span class="status status-${formData.status.toLowerCase().replace('_', '-')}">${formData.status.replace('_', ' ')}</span>
              </div>
              <div class="detail-item">
                <strong>Section:</strong> 
                <span class="section" style="color: ${sectionColor}">${sectionName}</span>
              </div>
              <div class="detail-item">
                <strong>Slug:</strong> <code>${formData.slug}</code>
              </div>
              <div class="detail-item">
                <strong>Reading Time:</strong> ${readingTime} minutes
              </div>
              <div class="detail-item">
                <strong>Word Count:</strong> ${formData.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words
              </div>
              <div class="detail-item">
                <strong>Author:</strong> ${authorName} (${authorRole})
              </div>
              <div class="detail-item">
                <strong>Created:</strong> ${new Date().toLocaleString()}
              </div>
            </div>
            ${tagsHtml}
          </div>
        `
        : '';

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
              .admin-details {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1.5rem;
                margin: 2rem;
              }
              .admin-details h3 {
                margin: 0 0 1rem 0;
                color: #1e293b;
                font-size: 1.25rem;
              }
              .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
              }
              .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
              }
              .detail-item strong {
                color: #64748b;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .status {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
              }
              .status-draft { background: #fef3c7; color: #92400e; }
              .status-in-review { background: #dbeafe; color: #1e40af; }
              .status-needs-revisions { background: #fed7d7; color: #c53030; }
              .status-approved { background: #d1fae5; color: #065f46; }
              .status-published { background: #dcfce7; color: #166534; }
              .section {
                font-weight: 600;
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
              code {
                background: #f1f5f9;
                padding: 0.125rem 0.25rem;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.875rem;
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
              
              ${adminDetails}
            </div>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Article' : 'Create New Article'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {readingTime > 0 && `${readingTime} min read • `}
              {formData.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!formData.title || !formData.body}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            
            {/* Tab Headers */}
            <TabsList className={`grid w-full ${session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN' ? 'grid-cols-4' : 'grid-cols-2'} bg-gray-50 m-6 mb-0`}>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Media
              </TabsTrigger>
              {(session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') && (
                <>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    SEO & Tags
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              
              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Title */}
                    <div>
                      <Label htmlFor="title" className="text-lg font-semibold">
                        Article Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter a compelling title..."
                        className="text-lg mt-2"
                        required
                      />
                    </div>

                    {/* Dek/Subtitle */}
                    <div>
                      <Label htmlFor="dek" className="text-base font-medium">
                        Subtitle/Dek
                      </Label>
                      <Input
                        id="dek"
                        value={formData.dek}
                        onChange={(e) => handleInputChange('dek', e.target.value)}
                        placeholder="Brief description or subtitle..."
                        className="mt-2"
                      />
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        Article Content *
                      </Label>
                      <RichTextEditor
                        content={formData.body}
                        onChange={(content) => handleInputChange('body', content)}
                        onImageUpload={status === 'loading' ? undefined : handleImageUpload}
                        onVideoUpload={status === 'loading' ? undefined : handleVideoUpload}
                        userId={session?.user?.id}
                        placeholder="Write your article here..."
                      />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Article Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Reading Time:</span>
                          <span className="font-medium">{readingTime} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Word Count:</span>
                          <span className="font-medium">
                            {formData.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Status:</span>
                          <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {formData.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Legal Section</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <select
                          value={formData.sectionId}
                          onChange={(e) => handleInputChange('sectionId', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select a section...</option>
                          {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                              {section.name}
                            </option>
                          ))}
                        </select>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                
                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formData.featuredImage ? (
                      <div className="space-y-4">
                        <img
                          src={formData.featuredImage}
                          alt="Featured"
                          className="w-full max-w-md h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleInputChange('featuredImage', '')}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <MediaUpload
                        onUpload={handleFeaturedImageUpload}
                        userId={session?.user?.id || ''}
                        accept="image"
                        maxFiles={1}
                        showPreview={false}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Content Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaUpload
                      onUpload={() => {}} // Handled in editor
                      userId={session?.user?.id || ''}
                      accept="both"
                      maxFiles={10}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab - Only for Editors and Admins */}
              {(session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') && (
                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* URL Slug */}
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="article-url-slug"
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        jurisight.com/articles/{formData.slug}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <Label htmlFor="status">Publication Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      >
                        <option value="DRAFT">Draft</option>
        {session?.user?.role && !['CONTRIBUTOR'].includes(session.user.role) && (
          <>
            <option value="IN_REVIEW">In Review</option>
            <option value="NEEDS_REVISIONS">Needs Revisions</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </>
        )}
                      </select>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Metadata Tab - Only for Editors and Admins */}
              {(session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') && (
                <TabsContent value="metadata" className="space-y-6">
                  
                  {/* Tags */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Current Tags */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeTag(tag)}
                            >
                              {tag} ×
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
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a new tag..."
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} disabled={!newTag.trim()}>
                          Add New
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Author: {session?.user?.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSubmitting || !formData.title || !formData.body}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            {/* Submit for Review button - Only for Editors and Admins */}
            {(session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN') && (
              <Button
                onClick={() => handleSubmit('IN_REVIEW')}
                disabled={isSubmitting || !formData.title || !formData.body || !formData.sectionId}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
