'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Mail, 
  User, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

interface CommentSectionProps {
  articleId: number;
  articleTitle: string;
}

export function CommentSection({ articleId, articleTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Check if user is subscribed to newsletter
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const email = localStorage.getItem('newsletter_email');
        if (email) {
          const response = await fetch('/api/newsletter/check-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsSubscribed(data.isSubscribed);
          } else {
            setIsSubscribed(false);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/comments?articleId=${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();
  }, [articleId]);

  const handleNewsletterSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: subscriptionEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('newsletter_email', subscriptionEmail);
        setIsSubscribed(true);
        setSubscriptionMessage('Successfully subscribed! You can now comment.');
        setShowCommentForm(true);
      } else {
        setSubscriptionMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscriptionMessage('An error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          name: formData.name,
          email: formData.email,
          content: formData.content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments(prev => [data.comment, ...prev]);
        setFormData({ name: '', email: '', content: '' });
        setShowCommentForm(false);
      } else {
        alert(data.error || 'Failed to submit comment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Comments</h3>
        <Badge variant="secondary" className="ml-2">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </Badge>
      </div>

      {/* Newsletter Subscription Required */}
      {!isSubscribed && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Mail className="h-5 w-5" />
              Subscribe to Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              To participate in the discussion, please subscribe to our newsletter. 
              This helps us maintain a quality community and keep you updated with the latest legal insights.
            </p>
            
            <form onSubmit={handleNewsletterSubscription} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={subscriptionEmail}
                  onChange={(e) => setSubscriptionEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
              
              {subscriptionMessage && (
                <div className={`flex items-center gap-2 text-sm ${
                  subscriptionMessage.includes('Successfully') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {subscriptionMessage.includes('Successfully') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {subscriptionMessage}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comment Form */}
      {isSubscribed && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Add a Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCommentForm ? (
              <Button 
                onClick={() => setShowCommentForm(true)}
                className="w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Write a Comment
              </Button>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment *
                  </label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    placeholder="Share your thoughts on this article..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCommentForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{comment.name}</span>
                    {comment.isApproved && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
