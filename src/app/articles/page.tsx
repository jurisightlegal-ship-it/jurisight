import { Suspense } from 'react';
import ArticlesListClient from '@/components/articles-list-client';

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jurisight-royal"></div></div>}>
      <ArticlesListClient />
    </Suspense>
  );
}
