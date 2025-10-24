'use client';

import { useEffect, useState, useRef } from 'react';
import { SimplePreloader } from '@/components/ui/simple-preloader';
import { useClarity } from '@/hooks/use-clarity';
import { useLanguagePreference } from '@/lib/language-storage';
import { translationService } from "@/lib/translation-service";

interface ArticlePageClientProps {
  children: React.ReactNode;
  articleId?: number;
  articleTitle?: string;
  articleSection?: string;
}

export function ArticlePageClient({ children, articleId, articleTitle, articleSection }: ArticlePageClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [originalHtml, setOriginalHtml] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const originalHtmlRef = useRef<string | null>(null);
  const lastLangRef = useRef<string | null>(null);
  const { trackEvent, setCustomTag } = useClarity();
  const { language } = useLanguagePreference();

  useEffect(() => {
    setIsMounted(true);
    
    // Capture original article HTML once mounted
    const el = typeof document !== 'undefined' ? (document.querySelector('.article-content') as HTMLElement | null) : null;
    if (el && !originalHtml) {
      setOriginalHtml(el.innerHTML);
    }
    
    // Show preloader for at least 5ms to ensure it's visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5);
    
    return () => clearTimeout(timer);
  }, [originalHtml]);

  // Apply translation when language changes (hook-based)
  useEffect(() => {
    if (!isMounted) return;
    const el = typeof document !== 'undefined' ? (document.querySelector('.article-content') as HTMLElement | null) : null;
    if (!el) return;

    // Preserve original HTML once
    if (!originalHtmlRef.current) {
      originalHtmlRef.current = el.innerHTML;
    }

    const run = async () => {
      setIsTranslating(true);
      try {
        if (language === "en") {
          el.innerHTML = originalHtmlRef.current || el.innerHTML;
          return;
        }
        // Translate only text nodes to preserve tags/markup
        await translationService.translateElementTextNodes(el, language);
      } catch (err) {
        // Fallback to original content on error
        el.innerHTML = originalHtmlRef.current || el.innerHTML;
        console.warn("Article translation failed:", err);
      } finally {
        setIsTranslating(false);
      }
    };

    // Avoid duplicate work if we already handled this language via event listener
    if (lastLangRef.current !== language) {
      lastLangRef.current = language;
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Also listen directly to the global languageChanged event for robustness
  useEffect(() => {
    if (!isMounted) return;
    const handler = (evt: Event) => {
      const e = evt as CustomEvent;
      const langCode = e?.detail?.languageCode as string | undefined;
      if (!langCode) return;

      const el = typeof document !== 'undefined' ? (document.querySelector('.article-content') as HTMLElement | null) : null;
      if (!el) return;

      if (!originalHtmlRef.current) {
        originalHtmlRef.current = el.innerHTML;
      }

      const apply = async () => {
        setIsTranslating(true);
        try {
          if (langCode === 'en') {
            el.innerHTML = originalHtmlRef.current || el.innerHTML;
          } else {
            await translationService.translateElementTextNodes(el, langCode);
          }
        } catch (err) {
          el.innerHTML = originalHtmlRef.current || el.innerHTML;
          console.warn('Article translation failed (event):', err);
        } finally {
          setIsTranslating(false);
        }
      };

      // Prevent double-translation if hook already executed for same language
      if (lastLangRef.current !== langCode) {
        lastLangRef.current = langCode;
        apply();
      }
    };

    window.addEventListener('languageChanged', handler as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handler as EventListener);
    };
  }, [isMounted]);

  // Track article view when component mounts
  useEffect(() => {
    if (isMounted && articleId) {
      // Set custom tags for this article
      if (articleTitle) {
        setCustomTag('articleTitle', articleTitle);
      }
      if (articleSection) {
        setCustomTag('articleSection', articleSection);
      }
      
      // Track article view event
      trackEvent('article_view');

      console.log('Clarity: Article view tracked', { articleId, articleTitle, articleSection });
    }
  }, [isMounted, articleId, articleTitle, articleSection, trackEvent, setCustomTag]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <SimplePreloader isLoading={true}>
        {children}
      </SimplePreloader>
    );
  }

  return (
    <SimplePreloader isLoading={isLoading}>
      {children}
    </SimplePreloader>
  );
}
