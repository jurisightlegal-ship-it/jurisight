'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  User, 
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevisionNote {
  id: number;
  comment: string;
  created_at: string;
  editor: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ArticleWithNotes {
  article: {
    id: number;
    title: string;
    slug: string;
    status: string;
    author_id: string;
  };
  notes: RevisionNote[];
}

interface RevisionNotesCardProps {
  className?: string;
}

export default function RevisionNotesCard({ className = '' }: RevisionNotesCardProps) {
  const [revisionNotes, setRevisionNotes] = useState<ArticleWithNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchRevisionNotes();
  }, []);

  const fetchRevisionNotes = async () => {
    try {
      const response = await fetch('/api/dashboard/revision-notes');
      if (response.ok) {
        const data = await response.json();
        setRevisionNotes(data.revisionNotes || []);
      }
    } catch (error) {
      console.error('Error fetching revision notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArticleExpansion = (articleId: number) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      NEEDS_REVISIONS: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: Clock },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (revisionNotes.length === 0) {
    return (
      <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center dark:text-white">
            <MessageSquare className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
            Revision Notes
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            Feedback from editors on your articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No revision notes yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              You&apos;ll see feedback from editors here when they review your articles
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between dark:text-white">
          <span className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
            Revision Notes
            <Badge className="ml-2 bg-orange-100 text-orange-800 border-0">
              {revisionNotes.length}
            </Badge>
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => router.push('/dashboard/articles')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Feedback from editors on your articles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revisionNotes.map(({ article, notes }) => (
            <div key={article.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {article.title}
                  </h4>
                  <div className="flex items-center mt-1 space-x-2">
                    {getStatusBadge(article.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArticleExpansion(article.id)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {expandedArticles.has(article.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedArticles.has(article.id) && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {note.editor.name || note.editor.email}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {note.comment}
                      </p>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/articles/${article.id}/edit`)}
                      className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Edit Article
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
