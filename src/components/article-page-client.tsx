'use client';

interface ArticlePageClientProps {
  children: React.ReactNode;
}

export function ArticlePageClient({ children }: ArticlePageClientProps) {
  // Remove all preloader logic for instant clickability
  return <div>{children}</div>;
}
