"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Lazy-load icons to optimize performance
const XBrandIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.Facebook })));
const LinkedinIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.Linkedin })));
const WhatsappIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.MessageCircle })));
const CopyIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.Copy })));
const CheckIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.Check })));
const ShareIcon = React.lazy(() => import("lucide-react").then(m => ({ default: m.Share2 })));

interface ShareCardProps {
  title: string;
  url: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

// Build platform share URLs
function buildShareUrls({ title, url, description, hashtags = [] }: { title: string; url: string; description?: string; hashtags?: string[] }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");
  const encodedHashtags = hashtags.length > 0 ? `%20${hashtags.map(tag => `%23${tag}`).join('%20')}` : '';

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${encodedHashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  } as const;
}

export default function ShareCard({ title, url, description = "", hashtags = [], className = "" }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const shareUrls = useMemo(() => buildShareUrls({ title, url, description, hashtags }), [title, url, description, hashtags]);

  useEffect(() => {
    // Intersection Observer to trigger sequential reveal only when visible
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  // Framer Motion variants for sequential reveal
  const containerVariants = {
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  return (
    <Card
      ref={containerRef as any}
      className={`group relative overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl ${className}`}
      aria-label="Share this article"
      data-testid="share-card"
    >
      {/* Constant gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-100 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />

      <CardHeader className="items-center relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
          Spread legal Awareness
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs text-gray-600 text-center">
          Share this article
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <AnimatePresence>
          <motion.div
            className="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : undefined}
          >
            {/* X (formerly Twitter) */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-300 transition-transform duration-200"
                onClick={() => openShare(shareUrls.twitter)}
                aria-label={`Share \"${title}\" on Twitter`}
                data-testid="share-twitter"
              >
                <Suspense fallback={<span className="h-4 w-4" />}>
                  <XBrandIcon className="h-4 w-4 text-white" />
                </Suspense>
                <span className="sr-only">Twitter</span>
              </Button>
            </motion.div>

            {/* Facebook */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-300 transition-transform duration-200"
                onClick={() => openShare(shareUrls.facebook)}
                aria-label={`Share \"${title}\" on Facebook`}
                data-testid="share-facebook"
              >
                <Suspense fallback={<span className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}>
                  <FacebookIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </Suspense>
                <span className="sr-only">Facebook</span>
              </Button>
            </motion.div>

            {/* LinkedIn */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-300 transition-transform duration-200"
                onClick={() => openShare(shareUrls.linkedin)}
                aria-label={`Share \"${title}\" on LinkedIn`}
                data-testid="share-linkedin"
              >
                <Suspense fallback={<span className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}>
                  <LinkedinIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </Suspense>
                <span className="sr-only">LinkedIn</span>
              </Button>
            </motion.div>

            {/* WhatsApp */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gradient-to-b from-green-500 to-green-600 text-white shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-green-300 transition-transform duration-200"
                onClick={() => openShare(shareUrls.whatsapp)}
                aria-label={`Share \"${title}\" on WhatsApp`}
                data-testid="share-whatsapp"
              >
                <Suspense fallback={<span className="h-4 w-4" />}>
                  <WhatsappIcon className="h-4 w-4 text-white" />
                </Suspense>
                <span className="sr-only">WhatsApp</span>
              </Button>
            </motion.div>

            {/* Copy Link */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="rounded-full h-8 w-8 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-300 transition-transform duration-200"
                onClick={copyToClipboard}
                aria-label="Copy article link"
                data-testid="share-copy"
                data-copied={copied ? 'true' : 'false'}
              >
                <Suspense fallback={<span className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}>
                  {copied ? (
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  ) : (
                    <CopyIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  )}
                </Suspense>
                <span className="sr-only">Copy link</span>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
