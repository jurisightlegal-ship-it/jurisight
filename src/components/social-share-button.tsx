'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Link as LinkIcon,
  Check,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface SocialShareButtonProps {
  title: string;
  url: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

export function SocialShareButton({ 
  title, 
  url, 
  description = '', 
  hashtags = [],
  className = ''
}: SocialShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Encode URL and text for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = hashtags.length > 0 ? `%20${hashtags.map(tag => `%23${tag}`).join('%20')}` : '';

  // Social media sharing URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${encodedHashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Open share dialog
  const openShare = (platform: keyof typeof shareUrls) => {
    const shareUrl = shareUrls[platform];
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };


  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Desktop Share Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Share this article on social media"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => openShare('twitter')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openShare('twitter');
              }
            }}
          >
            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => openShare('facebook')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openShare('facebook');
              }
            }}
          >
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Share on Facebook
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => openShare('linkedin')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openShare('linkedin');
              }
            }}
          >
            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
            Share on LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => openShare('whatsapp')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openShare('whatsapp');
              }
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
            Share on WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={copyToClipboard}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyToClipboard();
              }
            }}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-green-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Individual social share buttons for inline use
export function TwitterShareButton({ title, url, hashtags = [] }: { title: string; url: string; hashtags?: string[] }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedHashtags = hashtags.length > 0 ? `%20${hashtags.map(tag => `%23${tag}`).join('%20')}` : '';

  const handleClick = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${encodedHashtags}`,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-blue-400 hover:text-blue-500 hover:border-blue-300"
      aria-label={`Share "${title}" on Twitter`}
    >
      <Twitter className="h-4 w-4" />
      <span className="hidden sm:inline">Twitter</span>
    </Button>
  );
}

export function FacebookShareButton({ url, title }: { url: string; title?: string }) {
  const encodedUrl = encodeURIComponent(url);

  const handleClick = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:border-blue-300"
      aria-label={title ? `Share "${title}" on Facebook` : 'Share on Facebook'}
    >
      <Facebook className="h-4 w-4" />
      <span className="hidden sm:inline">Facebook</span>
    </Button>
  );
}

export function LinkedInShareButton({ url, title }: { url: string; title?: string }) {
  const encodedUrl = encodeURIComponent(url);

  const handleClick = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-blue-700 hover:text-blue-800 hover:border-blue-300"
      aria-label={title ? `Share "${title}" on LinkedIn` : 'Share on LinkedIn'}
    >
      <Linkedin className="h-4 w-4" />
      <span className="hidden sm:inline">LinkedIn</span>
    </Button>
  );
}

export function WhatsAppShareButton({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleClick = () => {
    window.open(
      `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-green-500 hover:text-green-600 hover:border-green-300"
      aria-label={`Share "${title}" on WhatsApp`}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </Button>
  );
}
