'use client';

interface ArticlePageClientProps {
  children: React.ReactNode;
}

export function ArticlePageClient({ children }: ArticlePageClientProps) {
  // Remove all delays and hydration checks for instant rendering
  return <div>{children}</div>;
}
