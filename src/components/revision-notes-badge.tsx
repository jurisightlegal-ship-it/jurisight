'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

interface RevisionNotesBadgeProps {
  className?: string;
}

export default function RevisionNotesBadge({ className = '' }: RevisionNotesBadgeProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisionNotesCount();
  }, []);

  const fetchRevisionNotesCount = async () => {
    try {
      const response = await fetch('/api/dashboard/revision-notes');
      if (response.ok) {
        const data = await response.json();
        setCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching revision notes count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (count === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <Badge 
        className="absolute -top-2 -right-2 bg-orange-500 text-white border-0 min-w-[20px] h-5 flex items-center justify-center text-xs"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </div>
  );
}
