'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AsyncAvatarProps {
  fallbackAvatar: string | null;
  avatarUrlPromise?: Promise<string | null>;
  authorName: string;
  className?: string;
}

export function AsyncAvatar({ fallbackAvatar, avatarUrlPromise, authorName, className = "w-12 h-12 rounded-full" }: AsyncAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(fallbackAvatar);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle case where avatarUrlPromise is undefined or null
    if (!avatarUrlPromise || typeof avatarUrlPromise.then !== 'function') {
      setAvatarUrl(fallbackAvatar);
      setIsLoading(false);
      return;
    }

    // Ensure we have a valid promise before calling .then()
    try {
      avatarUrlPromise
        .then((processedUrl) => {
          setAvatarUrl(processedUrl);
          setIsLoading(false);
        })
        .catch((error) => {
          console.warn('Avatar processing failed:', error);
          setAvatarUrl(fallbackAvatar);
          setIsLoading(false);
        });
    } catch (error) {
      console.warn('Invalid promise for avatar processing:', error);
      setAvatarUrl(fallbackAvatar);
      setIsLoading(false);
    }
  }, [avatarUrlPromise, fallbackAvatar]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`} />
    );
  }

  return (
    <Image
      src={avatarUrl || '/default-avatar.png'}
      alt={`${authorName} avatar`}
      width={48}
      height={48}
      className={className}
      onError={() => setAvatarUrl('/default-avatar.png')}
    />
  );
}
