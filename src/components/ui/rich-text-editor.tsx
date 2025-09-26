'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import YouTube from '@tiptap/extension-youtube';
import { Node, mergeAttributes } from '@tiptap/core';
import { Button } from './button';
import { useState, useCallback, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Upload,
  ExternalLink,
  Loader2
} from 'lucide-react';

// Custom Image extension that tracks uploaded images for deletion
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-file-path': {
        default: null,
        parseHTML: element => element.getAttribute('data-file-path'),
        renderHTML: attributes => {
          if (!attributes['data-file-path']) {
            return {};
          }
          return {
            'data-file-path': attributes['data-file-path'],
          };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;
  userId?: string;
}

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Start writing your article...",
  onImageUpload,
  onVideoUpload,
  userId
}: RichTextEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isFetchingLink, setIsFetchingLink] = useState(false);

  // Store condition in variable
  const shouldShowImageUpload = !!(onImageUpload || userId);

  // Function to delete file from storage
  const deleteFileFromStorage = async (filePath: string) => {
    try {
      const response = await fetch(`/api/media/upload?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete file:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      YouTube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Handle deletion of images and videos when content changes
  useEffect(() => {
    if (!editor) return;

    const handleDelete = () => {
      const currentContent = editor.getHTML();
      const currentImages = currentContent.match(/<img[^>]+data-file-path="([^"]+)"/g) || [];
      const currentVideos = currentContent.match(/<video[^>]+data-file-path="([^"]+)"/g) || [];
      
      // Get all file paths from current content
      const currentFilePaths = new Set([
        ...currentImages.map(img => img.match(/data-file-path="([^"]+)"/)?.[1]).filter(Boolean),
        ...currentVideos.map(video => video.match(/data-file-path="([^"]+)"/)?.[1]).filter(Boolean)
      ]);

      // Compare with previous content to find deleted files
      const previousContent = content;
      const previousImages = previousContent.match(/<img[^>]+data-file-path="([^"]+)"/g) || [];
      const previousVideos = previousContent.match(/<video[^>]+data-file-path="([^"]+)"/g) || [];
      
      const previousFilePaths = new Set([
        ...previousImages.map(img => img.match(/data-file-path="([^"]+)"/)?.[1]).filter(Boolean),
        ...previousVideos.map(video => video.match(/data-file-path="([^"]+)"/)?.[1]).filter(Boolean)
      ]);

      // Find deleted files
      const deletedFiles = [...previousFilePaths].filter(path => !currentFilePaths.has(path));
      
      // Delete files from storage
      deletedFiles.forEach(filePath => {
        if (filePath) {
          deleteFileFromStorage(filePath);
        }
      });
    };

    // Listen for content changes
    editor.on('update', handleDelete);
    
    return () => {
      editor.off('update', handleDelete);
    };
  }, [editor, content, deleteFileFromStorage]);


  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = async () => {
    if (!onImageUpload && !userId) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        setIsUploading(true);
        try {
          let imageUrl: string;
          let filePath: string;
          if (onImageUpload) {
            imageUrl = await onImageUpload(file);
            // Extract file path from URL for tracking
            filePath = imageUrl.split('/').slice(-3).join('/'); // Get the path part
          } else {
            // Fallback to direct API upload
            const result = await uploadFileToAPI(file, 'image');
            imageUrl = result.url;
            filePath = result.path;
          }
          editor.chain().focus().insertContent(`
            <img src="${imageUrl}" data-file-path="${filePath}" class="rounded-lg max-w-full h-auto" />
          `).run();
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const uploadVideo = async () => {
    if (!onVideoUpload && !userId) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        setIsUploadingVideo(true);
        try {
          let videoUrl: string;
          let filePath: string;
          if (onVideoUpload) {
            videoUrl = await onVideoUpload(file);
            // Extract file path from URL for tracking
            filePath = videoUrl.split('/').slice(-3).join('/'); // Get the path part
          } else {
            // Fallback to direct API upload
            const result = await uploadFileToAPI(file, 'video');
            videoUrl = result.url;
            filePath = result.path;
          }
          // Insert video as HTML with file path tracking
          editor.chain().focus().insertContent(`
            <video controls class="max-w-full h-auto rounded-lg" data-file-path="${filePath}">
              <source src="${videoUrl}" type="${file.type}">
              Your browser does not support the video tag.
            </video>
          `).run();
        } catch (error) {
          console.error('Failed to upload video:', error);
          alert('Failed to upload video. Please try again.');
        } finally {
          setIsUploadingVideo(false);
        }
      }
    };
    input.click();
  };

  const uploadFileToAPI = async (file: File, type: 'image' | 'video'): Promise<{url: string, path: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const { data } = await response.json();
    return { url: data.url, path: data.path };
  };

  const addLink = async () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      // Validate URL
      try {
        new URL(url);
      } catch {
        alert('Please enter a valid URL');
        return;
      }

      // Check if it's a YouTube URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        editor.commands.setYoutubeVideo({ src: url });
        return;
      }

      // For other URLs, try to fetch link preview
      setIsFetchingLink(true);
      try {
        const linkPreview = await fetchLinkPreview(url);
        if (linkPreview) {
          // Insert rich link preview
          editor.chain().focus().insertContent(`
            <div class="link-preview border rounded-lg p-4 my-4 bg-gray-50">
              <div class="flex gap-4">
                ${linkPreview.image ? `<img src="${linkPreview.image}" alt="${linkPreview.title}" class="w-24 h-24 object-cover rounded" />` : ''}
                <div class="flex-1">
                  <h3 class="font-semibold text-lg mb-2">${linkPreview.title}</h3>
                  <p class="text-gray-600 text-sm mb-2">${linkPreview.description}</p>
                  <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    ${new URL(url).hostname}
                  </a>
                </div>
              </div>
            </div>
          `).run();
        } else {
          // Fallback to simple link
          editor.chain().focus().setLink({ href: url }).run();
        }
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
        // Fallback to simple link
        editor.chain().focus().setLink({ href: url }).run();
      } finally {
        setIsFetchingLink(false);
      }
    }
  };

  const fetchLinkPreview = async (url: string) => {
    try {
      // Use a CORS proxy or your own API endpoint
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Link preview fetch error:', error);
    }
    return null;
  };

  const addYouTubeVideo = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url && editor) {
      editor.commands.setYoutubeVideo({
        src: url,
      });
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : 'dark:text-gray-300 dark:hover:bg-gray-600'}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {shouldShowImageUpload && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={uploadImage}
            disabled={isUploading}
            className="dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="ml-1 text-xs dark:text-gray-300">Image</span>
          </Button>
        )}

        {(onVideoUpload || userId) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={uploadVideo}
            disabled={isUploadingVideo}
            className="dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {isUploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
            <span className="ml-1 text-xs dark:text-gray-300">Video</span>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          disabled={isFetchingLink}
          className="dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {isFetchingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
          <span className="ml-1 text-xs dark:text-gray-300">Link</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addYouTubeVideo}
          className="dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Video className="h-4 w-4" />
          <span className="ml-1 text-xs dark:text-gray-300">YouTube</span>
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px] max-h-[600px] overflow-y-auto dark:bg-gray-800">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none dark:prose-invert"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

