'use client';

// Defer importing Quill on the client to avoid SSR "document is not defined"
import 'quill/dist/quill.snow.css';
import { Button } from './button';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
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
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Minus,
  Hash,
  BarChart3,
  Plus,
  Minus as MinusIcon
} from 'lucide-react';
import './rich-text-editor.css';

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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any | null>(null);
  const previousHtmlRef = useRef<string>(content || '');

  const shouldShowImageUpload = !!(onImageUpload || userId);

  const deleteFileFromStorage = useCallback(async (filePath: string) => {
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
  }, []);

  const uploadFileToAPI = async (file: File, type: 'image' | 'video'): Promise<{ url: string; path: string } > => {
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

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'code'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: async () => {
          if (!quillRef.current) return;
          if (!onImageUpload && !userId) {
            alert('Image upload not configured properly');
            return;
          }
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsUploading(true);
            try {
              let imageUrl: string;
              let filePath: string;
              if (onImageUpload) {
                imageUrl = await onImageUpload(file);
                // Extract path from URL (last 3 parts)
                const urlParts = imageUrl.split('/');
                filePath = urlParts.slice(-3).join('/');
              } else {
                const result = await uploadFileToAPI(file, 'image');
                imageUrl = result.url;
                filePath = result.path;
              }
              const quill = quillRef.current;
              const range = quill?.getSelection(true);
              if (range) {
                // Insert HTML so we can keep data-file-path attribute
                quill?.clipboard.dangerouslyPasteHTML(range.index, `<img src="${imageUrl}" data-file-path="${filePath}" class="rounded-lg max-w-full h-auto" />`);
                quill?.setSelection(range.index + 1, 0);
              }
            } catch (err) {
              console.error('Failed to upload image:', err);
              alert('Failed to upload image. Please try again.');
            } finally {
              setIsUploading(false);
            }
          };
          input.click();
        },
        video: async () => {
          if (!quillRef.current) return;
    if (!onVideoUpload && !userId) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
        setIsUploadingVideo(true);
        try {
          let videoUrl: string;
          let filePath: string;
          if (onVideoUpload) {
            videoUrl = await onVideoUpload(file);
                filePath = videoUrl.split('/').slice(-3).join('/');
          } else {
            const result = await uploadFileToAPI(file, 'video');
            videoUrl = result.url;
            filePath = result.path;
          }
              const quill = quillRef.current;
              const range = quill?.getSelection(true);
              if (range) {
                quill?.clipboard.dangerouslyPasteHTML(range.index, `
            <video controls class="max-w-full h-auto rounded-lg" data-file-path="${filePath}">
              <source src="${videoUrl}" type="${file.type}">
            </video>
                `);
                quill?.setSelection(range.index + 1, 0);
              }
            } catch (err) {
              console.error('Failed to upload video:', err);
          alert('Failed to upload video. Please try again.');
        } finally {
          setIsUploadingVideo(false);
            }
          };
          input.click();
        },
        document: async () => {
          if (!quillRef.current) return;
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsUploading(true);
            try {
              const result = await uploadFileToAPI(file, 'document' as any);
              const url = result.url;
              const fileName = file.name;
              const quill = quillRef.current;
              const range = quill?.getSelection(true);
              const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${fileName}</a>`;
              if (range) {
                quill?.clipboard.dangerouslyPasteHTML(range.index, linkHtml);
                quill?.setSelection(range.index + 1, 0);
              }
            } catch (err) {
              console.error('Failed to upload document:', err);
              alert('Failed to upload document. Please try again.');
            } finally {
              setIsUploading(false);
            }
          };
          input.click();
        }
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [onImageUpload, onVideoUpload, userId]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    let isMounted = true;
    (async () => {
      const { default: Quill } = await import('quill');
      if (!isMounted) return;
      const quill = new Quill(editorRef.current as HTMLElement, {
        theme: 'snow',
        placeholder,
        modules
      });
      quillRef.current = quill;

      // Initialize with existing HTML
      if (content) {
        quill.clipboard.dangerouslyPasteHTML(0, content);
        previousHtmlRef.current = content;
      } else {
        previousHtmlRef.current = quill.root.innerHTML;
      }

      const handleTextChange = () => {
        const html = quill.root.innerHTML;
        const isEmpty = !html ||
          html.trim() === '' ||
          html === '<p><br></p>' ||
          html === '<p></p>' ||
          html === '<p> </p>' ||
          html === '<p>&nbsp;</p>' ||
          html === '<p><br></p>\n' ||
          html === '<p><br></p>\r\n' ||
          html === '<p></p>\n' ||
          html === '<p></p>\r\n' ||
          html === '<p><br></p>\n<p><br></p>' ||
          html === '<p></p>\n<p></p>';
        const cleanContent = isEmpty ? '' : html;
        onChange(cleanContent);
        previousHtmlRef.current = cleanContent;
      };

      quill.on('text-change', handleTextChange);

      // Set initial content reference
      const initialContent = content || '';
      const isEmpty = !initialContent ||
        initialContent.trim() === '' ||
        initialContent === '<p><br></p>' ||
        initialContent === '<p></p>' ||
        initialContent === '<p> </p>' ||
        initialContent === '<p>&nbsp;</p>' ||
        initialContent === '<p><br></p>\n' ||
        initialContent === '<p><br></p>\r\n' ||
        initialContent === '<p></p>\n' ||
        initialContent === '<p></p>\r\n';
      previousHtmlRef.current = isEmpty ? '' : initialContent;

      // Store handler on ref for proper cleanup
      (quill as any).__rt_handleTextChange = handleTextChange;
    })();
    return () => {
      isMounted = false;
      const quill = quillRef.current as any;
      if (quill && quill.__rt_handleTextChange) {
        quill.off('text-change', quill.__rt_handleTextChange);
        delete quill.__rt_handleTextChange;
      }
    };
  }, []);

  // Keep external content prop in sync when it changes from outside (e.g. loading article)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    
    // More comprehensive empty content detection for the content prop
    const isEmpty = !content || 
      content.trim() === '' || 
      content === '<p><br></p>' || 
      content === '<p></p>' ||
      content === '<p> </p>' ||
      content === '<p>&nbsp;</p>' ||
      content === '<p><br></p>\n' ||
      content === '<p><br></p>\r\n' ||
      content === '<p></p>\n' ||
      content === '<p></p>\r\n' ||
      content === '<p><br></p>\n<p><br></p>' ||
      content === '<p></p>\n<p></p>';
    
    const cleanContent = isEmpty ? '' : content;
    const current = quill.root.innerHTML;
    
    console.log('RichTextEditor: Syncing external content', {
      externalContent: content,
      cleanContent,
      currentEditorContent: current,
      isEmpty,
      needsUpdate: cleanContent !== undefined && cleanContent !== current
    });
    
    // Only update if content has actually changed to prevent infinite loops
    if (cleanContent !== undefined && cleanContent !== current) {
      // Update the editor content
      quill.clipboard.dangerouslyPasteHTML(0, cleanContent || '');
      previousHtmlRef.current = cleanContent || '';
    }
  }, [content]); // Remove onChange from dependencies to prevent loop

  const addHorizontalRule = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
    quill.clipboard.dangerouslyPasteHTML(range.index, '<hr class="my-8 border-t border-gray-300 dark:border-gray-600" />');
    quill.setSelection(range.index + 1, 0);
  };

  const addLink = async () => {
    const quill = quillRef.current;
    if (!quill) return;
    const url = window.prompt('Enter URL:');
    if (!url) return;
      try {
        new URL(url);
      } catch {
        alert('Please enter a valid URL');
        return;
      }
    // Simple: apply link format to current selection
    const range = quill.getSelection(true);
    if (range && range.length > 0) {
      quill.format('link', url);
        } else {
      quill.clipboard.dangerouslyPasteHTML(range ? range.index : 0, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
  };

  if (!modules) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700">
        <div className="flex gap-1">
          <Button data-testid="btn-h1" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('header', 1)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Heading1 className="h-4 w-4" /></Button>
          <Button data-testid="btn-h2" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('header', 2)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Heading2 className="h-4 w-4" /></Button>
          <Button data-testid="btn-h3" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('header', 3)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Heading3 className="h-4 w-4" /></Button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <div className="flex gap-1">
          <Button data-testid="btn-bold" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('bold', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Bold className="h-4 w-4" /></Button>
          <Button data-testid="btn-italic" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('italic', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Italic className="h-4 w-4" /></Button>
          <Button data-testid="btn-underline" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('underline', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><UnderlineIcon className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('strike', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Hash className="h-4 w-4" /></Button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <div className="flex gap-1">
          <Button data-testid="btn-list-bullet" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('list', 'bullet')} className="dark:text-gray-300 dark:hover:bg-gray-600"><List className="h-4 w-4" /></Button>
          <Button data-testid="btn-list-ordered" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('list', 'ordered')} className="dark:text-gray-300 dark:hover:bg-gray-600"><ListOrdered className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('blockquote', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Quote className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('code-block', true)} className="dark:text-gray-300 dark:hover:bg-gray-600"><Code className="h-4 w-4" /></Button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <div className="flex gap-1">
          <Button data-testid="btn-align-left" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('align', '')} className="dark:text-gray-300 dark:hover:bg-gray-600"><AlignLeft className="h-4 w-4" /></Button>
          <Button data-testid="btn-align-center" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('align', 'center')} className="dark:text-gray-300 dark:hover:bg-gray-600"><AlignCenter className="h-4 w-4" /></Button>
          <Button data-testid="btn-align-right" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('align', 'right')} className="dark:text-gray-300 dark:hover:bg-gray-600"><AlignRight className="h-4 w-4" /></Button>
          <Button data-testid="btn-align-justify" type="button" variant="ghost" size="sm" onClick={() => quillRef.current?.format('align', 'justify')} className="dark:text-gray-300 dark:hover:bg-gray-600"><AlignJustify className="h-4 w-4" /></Button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <div className="flex gap-1">
          <Button data-testid="btn-hr" type="button" variant="ghost" size="sm" onClick={addHorizontalRule} className="dark:text-gray-300 dark:hover:bg-gray-600"><Minus className="h-4 w-4" /></Button>
          <Button data-testid="btn-link" type="button" variant="ghost" size="sm" onClick={addLink} disabled={isFetchingLink} className="dark:text-gray-300 dark:hover:bg-gray-600"><LinkIcon className="h-4 w-4" /></Button>
          <Button data-testid="btn-image-upload" type="button" variant="ghost" size="sm" onClick={() => (modules.toolbar.handlers as any).image?.()} disabled={isUploading} className="dark:text-gray-300 dark:hover:bg-gray-600">{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}<span className="ml-1 text-xs dark:text-gray-300">Image</span></Button>
          <Button data-testid="btn-video-upload" type="button" variant="ghost" size="sm" onClick={() => (modules.toolbar.handlers as any).video?.()} disabled={isUploadingVideo} className="dark:text-gray-300 dark:hover:bg-gray-600">{isUploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}<span className="ml-1 text-xs dark:text-gray-300">Video</span></Button>
          <Button data-testid="btn-document-upload" type="button" variant="ghost" size="sm" onClick={() => (modules.toolbar.handlers as any).document?.()} disabled={isUploading} className="dark:text-gray-300 dark:hover:bg-gray-600">{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}<span className="ml-1 text-xs dark:text-gray-300">Document</span></Button>
        </div>

        <div className="ml-auto flex items-center text-xs text-gray-500 dark:text-gray-400">
          <BarChart3 className="h-3 w-3 mr-1" />
          {/* Quill does not expose char count by default; compute from HTML text */}
          {(quillRef.current?.getText().length ?? 0)} characters
        </div>
      </div>

      <div className="min-h-[300px] max-h:[600px] overflow-y-auto dark:bg-gray-800">
        <div ref={editorRef} className="focus:outline-none min-h-[200px]" />
      </div>
    </div>
  );
};

