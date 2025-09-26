/**
 * Client-side storage utilities that use server-side API for signed URL generation
 */

// Simple in-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expiry: number }>();

/**
 * Get the display URL for an image (client-side version)
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

  // If it's a Supabase storage path, get signed URL from server
  if (imagePath.startsWith('avatars/') || imagePath.startsWith('images/')) {
    try {
      const response = await fetch('/api/images/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath }),
      });

      if (!response.ok) {
        console.error('Failed to get signed URL:', response.statusText);
        return null;
      }

      const data = await response.json();
      
      // Cache the URL for 1 hour
      urlCache.set(imagePath, {
        url: data.signedUrl,
        expiry: Date.now() + (60 * 60 * 1000) // 1 hour cache
      });

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }

  return imagePath;
}
