import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// On client side, use anon key; on server side, prefer service role key
const supabaseKey = typeof window === 'undefined' 
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple in-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expiry: number }>();

/**
 * Get the display URL for an image
 * Uses cached signed URLs for better performance
 * If it's already a full URL, return as-is
 */
export async function getImageDisplayUrl(imagePath: string | null | undefined): Promise<string | null> {
  if (!imagePath) return null;

  // If it's already a full URL (external URL), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Check cache first
  const cached = urlCache.get(imagePath);
  if (cached && cached.expiry > Date.now()) {
    return cached.url;
  }

  // If it's a Supabase storage path, generate a signed URL
  if (imagePath.startsWith('avatars/') || imagePath.startsWith('images/')) {
    try {
      // Determine bucket based on path
      const bucket = imagePath.startsWith('avatars/') ? 'jurisightlegal' : 'article-media';
      
      // Create signed URL with long expiry (1 year)
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(imagePath, 60 * 60 * 24 * 365);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      // Cache the URL for 1 hour
      urlCache.set(imagePath, {
        url: data.signedUrl,
        expiry: Date.now() + (60 * 60 * 1000) // 1 hour cache
      });

      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }

  return imagePath;
}

/**
 * Check if an image path is a Supabase storage path
 */
export function isSupabaseStoragePath(imagePath: string | null | undefined): boolean {
  return !!(imagePath && imagePath.startsWith('avatars/'));
}

/**
 * Check if an image path is a base64 data URL
 */
export function isBase64DataUrl(imagePath: string | null | undefined): boolean {
  return !!(imagePath && imagePath.startsWith('data:'));
}

/**
 * Clean up orphaned image references by removing image paths that don't exist in storage
 */
export async function cleanupOrphanedImages(userId: string, imagePath: string): Promise<string | null> {
  if (!imagePath || !imagePath.startsWith('avatars/')) {
    return imagePath;
  }

  try {
    // Check if file exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('jurisightlegal')
      .list('avatars', {
        search: imagePath.split('/').pop()
      });

    if (fileError) {
      console.error('Error checking file existence for cleanup:', fileError);
      return null;
    }

    // If file doesn't exist, return null to clear the reference
    if (!fileData || fileData.length === 0) {
      console.warn(`Cleaning up orphaned image reference: ${imagePath} for user: ${userId}`);
      return null;
    }

    return imagePath;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return null;
  }
}
