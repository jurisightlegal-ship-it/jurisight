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
    if (!avatarUrlPromise) {
      setAvatarUrl(fallbackAvatar);
      setIsLoading(false);
      return;
    }

    avatarUrlPromise
      .then((processedUrl) => {
        setAvatarUrl(processedUrl);
        setIsLoading(false);
      })
      .catch(() => {
        setAvatarUrl(fallbackAvatar);
        setIsLoading(false);
      });
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
