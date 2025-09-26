'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Film, FileText } from 'lucide-react';
import { Button } from './button';
import { UploadResult } from '@/lib/media-upload';

interface MediaUploadProps {
  onUpload: (result: UploadResult) => void;
  onError?: (error: string) => void;
  userId: string;
  accept?: 'image' | 'video' | 'both';
  maxFiles?: number;
  showPreview?: boolean;
  className?: string;
}

interface PreviewFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded?: UploadResult;
  error?: string;
}

export const MediaUpload = ({
  onUpload,
  onError,
  userId,
  accept = 'both',
  maxFiles = 5,
  showPreview = true,
  className = ''
}: MediaUploadProps) => {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'both':
      default:
        return 'image/*,video/*';
    }
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles: PreviewFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check if we've reached max files
      if (files.length + newFiles.length >= maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (accept === 'image' && !isImage) {
        onError?.(`Only image files are allowed`);
        continue;
      }
      
      if (accept === 'video' && !isVideo) {
        onError?.(`Only video files are allowed`);
        continue;
      }
      
      if (accept === 'both' && !isImage && !isVideo) {
        onError?.(`Only image and video files are allowed`);
        continue;
      }

      // Create preview
      const preview = isImage ? URL.createObjectURL(file) : '';
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        uploading: false
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-upload files immediately
    newFiles.forEach(file => {
      uploadFile(file);
    });
  }, [files.length, maxFiles, accept, onError]);

  const uploadFile = async (fileItem: PreviewFile) => {
    setFiles(prev => 
      prev.map(f => f.id === fileItem.id ? { ...f, uploading: true, error: undefined } : f)
    );

    try {
      // Use API endpoint instead of direct service call
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('type', fileItem.file.type.startsWith('image/') ? 'image' : 'video');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { data: result } = await response.json();

      setFiles(prev => 
        prev.map(f => f.id === fileItem.id ? { ...f, uploading: false, uploaded: result } : f)
      );

      onUpload(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => 
        prev.map(f => f.id === fileItem.id ? { ...f, uploading: false, error: errorMessage } : f)
      );
      onError?.(errorMessage);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {accept === 'image' && 'Upload images (JPG, PNG, GIF, WebP)'}
          {accept === 'video' && 'Upload videos (MP4, WebM, MOV, AVI)'}
          {accept === 'both' && 'Upload images or videos'}
        </p>
        <p className="text-xs text-gray-400">
          Maximum file size: 10MB • Maximum {maxFiles} files
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={getAcceptedTypes()}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((fileItem) => (
            <div key={fileItem.id} className="relative border rounded-lg p-3 bg-white shadow-sm">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {fileItem.file.type.startsWith('image/') ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : fileItem.file.type.startsWith('video/') ? (
                  <Film className="h-8 w-8 text-gray-400" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileItem.file.size)}
                </p>

                {/* Status */}
                {fileItem.error && (
                  <p className="text-xs text-red-600">{fileItem.error}</p>
                )}
                
                {fileItem.uploaded && (
                  <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!fileItem.uploaded && !fileItem.uploading && (
                    <Button
                      size="sm"
                      onClick={() => uploadFile(fileItem)}
                      className="flex-1"
                    >
                      Upload
                    </Button>
                  )}
                  
                  {fileItem.uploading && (
                    <Button size="sm" disabled className="flex-1">
                      Uploading...
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(fileItem.id)}
                    className="p-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

