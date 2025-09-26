'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AsyncAvatarProps {
  fallbackAvatar: string | null;
  avatarPath?: string | null;
  authorName: string;
  className?: string;
}

export function AsyncAvatar({ fallbackAvatar, avatarPath, authorName, className = "w-12 h-12 rounded-full" }: AsyncAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processAvatar = async () => {
      if (!avatarPath) {
        setAvatarUrl(null);
        setIsLoading(false);
        return;
      }

      try {
        // Import the client-side storage utils
        const { getImageDisplayUrl } = await import('@/lib/client-storage-utils');
        const processedUrl = await getImageDisplayUrl(avatarPath);
        setAvatarUrl(processedUrl);
        setIsLoading(false);
      } catch (error) {
        console.warn('Avatar processing failed:', error);
        setAvatarUrl(null);
        setIsLoading(false);
      }
    };

    processAvatar();
  }, [avatarPath]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`} />
    );
  }

  return (
    <Image
      src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff&size=48`}
      alt={`${authorName} avatar`}
      width={48}
      height={48}
      className={className}
      onError={() => setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff&size=48`)}
    />
  );
}
