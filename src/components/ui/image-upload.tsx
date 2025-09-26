'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  userId?: string;
  className?: string;
}

export function ImageUpload({ currentImage, onImageChange, userId, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreviewUrl(currentImage || '');
  }, [currentImage]);

  // Resolve image URL when previewUrl changes
  useEffect(() => {
    const resolveImageUrl = async () => {
      if (previewUrl) {
        try {
          // If it's already a full URL (like blob URLs from file input), use it directly
          if (previewUrl.startsWith('blob:') || previewUrl.startsWith('http')) {
            setResolvedPreviewUrl(previewUrl);
          } else {
            // If it's a storage path, resolve it to a signed URL
            const resolvedUrl = await getImageDisplayUrl(previewUrl);
            setResolvedPreviewUrl(resolvedUrl || '');
          }
        } catch (error) {
          console.error('Error resolving image URL in ImageUpload:', error);
          setResolvedPreviewUrl('');
        }
      } else {
        setResolvedPreviewUrl('');
      }
    };

    resolveImageUrl();
  }, [previewUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Show preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (userId) formData.append('userId', userId);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onImageChange(result.imageUrl);
      setPreviewUrl(result.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(currentImage || '');
    } finally {
      setIsUploading(false);
      // Clean up the preview URL
      if (preview !== previewUrl) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {resolvedPreviewUrl ? (
                  <Image
                    src={resolvedPreviewUrl}
                    alt="Avatar preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error in ImageUpload:', e);
                      setResolvedPreviewUrl('');
                    }}
                  />
                ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Remove button */}
          {resolvedPreviewUrl && !isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full sm:w-auto"
              id="avatar-upload-button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {resolvedPreviewUrl ? 'Change Avatar' : 'Upload Avatar'}
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              JPEG, PNG, or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-upload-input"
      />
    </div>
  );
}
