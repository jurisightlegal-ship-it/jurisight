import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create a default client for static methods
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create authenticated client for user operations
const createAuthenticatedClient = (accessToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class MediaUploadService {
  private static readonly BUCKET_NAME = 'article-media';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/mov',
    'video/avi'
  ];

  /**
   * Upload an image file to Supabase storage
   */
  static async uploadImage(file: File, userId: string, accessToken: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, 'images', this.ALLOWED_IMAGE_TYPES, accessToken);
  }

  /**
   * Upload a video file to Supabase storage
   */
  static async uploadVideo(file: File, userId: string, accessToken: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, 'videos', this.ALLOWED_VIDEO_TYPES, accessToken);
  }

  /**
   * Generic file upload method
   */
  private static async uploadFile(
    file: File, 
    userId: string, 
    folder: string, 
    allowedTypes: string[],
    accessToken: string
  ): Promise<UploadResult> {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum size: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${userId}/${fileName}`;

    try {
      // Create authenticated client
      const supabase = createAuthenticatedClient(accessToken);
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Media delete error:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for a file (for private files)
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Signed URL error:', error);
      throw error;
    }
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(file: File, maxWidth?: number, maxHeight?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (maxWidth && img.width > maxWidth) {
          reject(new Error(`Image width ${img.width}px exceeds maximum ${maxWidth}px`));
          return;
        }
        
        if (maxHeight && img.height > maxHeight) {
          reject(new Error(`Image height ${img.height}px exceeds maximum ${maxHeight}px`));
          return;
        }
        
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Invalid image file'));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Resize image before upload (client-side)
   */
  static resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, quality);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

