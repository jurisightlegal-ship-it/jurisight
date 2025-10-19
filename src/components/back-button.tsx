'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/articles')}
      className="flex items-center"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Articles
    </Button>
  );
}
