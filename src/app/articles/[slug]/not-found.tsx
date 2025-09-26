import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Article Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles">
              Browse Articles
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
