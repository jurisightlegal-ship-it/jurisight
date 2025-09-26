'use client';

import { memo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, User, ArrowRight } from 'lucide-react';

interface OptimizedArticleCardProps {
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
  onImageLoad?: () => void;
}

export const OptimizedArticleCard = memo(function OptimizedArticleCard({
  article,
  avatarUrl,
  onImageLoad,
}: OptimizedArticleCardProps) {
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
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
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad?.();
  };

  return (
    <Card 
      ref={cardRef}
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Featured Image */}
      {article.featuredImage && isInView && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <div className="absolute top-4 left-4">
            <Badge
              className="text-xs px-3 py-1 backdrop-blur-sm"
              style={{
                backgroundColor: `${article.section.color}20`,
                color: article.section.color,
                border: `1px solid ${article.section.color}40`
              }}
            >
              {article.section.name}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {article.dek && (
          <p className="text-gray-600 mb-4 line-clamp-3">{article.dek}</p>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={article.author.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{article.author.name}</p>
            <p className="text-xs text-gray-500">{formatDate(article.publishedAt)}</p>
          </div>
        </div>

        {/* Article Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readingTime} min
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
          asChild
        >
          <Link href={`/articles/${article.slug}`}>
            Read Article
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
});
