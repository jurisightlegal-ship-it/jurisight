'use client';

import { memo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface UltraFastCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    dek: string;
    featuredImage: string | null;
    readingTime: number;
    views: number;
    publishedAt: string;
    author: {
      id: string;
      name: string;
      avatar: string | null;
    };
    section: {
      id: number;
      name: string;
      slug: string;
      color: string;
    };
  };
  avatarUrl?: string | null;
}

export const UltraFastCard = memo(function UltraFastCard({
  article,
  avatarUrl,
}: UltraFastCardProps) {
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Ultra-fast intersection observer
  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load earlier
        threshold: 0.01, // Trigger immediately
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={cardRef}
      className="group overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-white rounded-lg border border-gray-200"
    >
      {/* Featured Image with ultra-fast loading */}
      {article.featuredImage && isInView && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            quality={75} // Reduced quality for speed
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <div className="absolute top-3 left-3">
            <span 
              className="text-xs px-2 py-1 rounded-full backdrop-blur-sm text-white font-medium"
              style={{
                backgroundColor: `${article.section.color}CC`,
              }}
            >
              {article.section.name}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {article.dek && (
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{article.dek}</p>
        )}

        {/* Author Info - simplified */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={article.author.name}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{article.author.name}</p>
            <p className="text-xs text-gray-500">{formatDate(article.publishedAt)}</p>
          </div>
        </div>

        {/* Article Meta - simplified */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{article.readingTime} min read</span>
          <span>{article.views} views</span>
        </div>

        <Link 
          href={`/articles/${article.slug}`}
          className="block w-full text-center py-2 px-4 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-sm font-medium rounded transition-all duration-200"
        >
          Read Article →
        </Link>
      </div>
    </div>
  );
});
