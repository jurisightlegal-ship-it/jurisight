'use client';

import { useCallback } from 'react';

// Declare global clarity object
declare global {
  interface Window {
    clarity: any;
  }
}

export function useClarity() {
  const setUserId = useCallback((userId: string) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('set', 'userId', userId);
      }
    } catch (error) {
      console.error('Failed to set Clarity user ID:', error);
    }
  }, []);

  const setCustomTag = useCallback((key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('set', key, value);
      }
    } catch (error) {
      console.error('Failed to set Clarity custom tag:', error);
    }
  }, []);

  const trackEvent = useCallback((eventName: string) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('event', eventName);
      }
    } catch (error) {
      console.error('Failed to track Clarity event:', error);
    }
  }, []);

  const identify = useCallback((userId: string, sessionId?: string, pageId?: string, friendlyName?: string) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('identify', userId, sessionId, pageId, friendlyName);
      }
    } catch (error) {
      console.error('Failed to identify user in Clarity:', error);
    }
  }, []);

  const consent = useCallback((consent: boolean) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('consent', consent);
      }
    } catch (error) {
      console.error('Failed to set Clarity consent:', error);
    }
  }, []);

  const upgrade = useCallback((reason: string) => {
    try {
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('upgrade', reason);
      }
    } catch (error) {
      console.error('Failed to upgrade Clarity session:', error);
    }
  }, []);

  return {
    setUserId,
    setCustomTag,
    trackEvent,
    identify,
    consent,
    upgrade,
  };
}

export default useClarity;
