'use client';

import { useCallback } from 'react';
import clarity from '@microsoft/clarity';

export function useClarity() {
  const setUserId = useCallback((userId: string) => {
    try {
      clarity.setTag('userId', userId);
    } catch (error) {
      console.error('Failed to set Clarity user ID:', error);
    }
  }, []);

  const setCustomTag = useCallback((key: string, value: string) => {
    try {
      clarity.setTag(key, value);
    } catch (error) {
      console.error('Failed to set Clarity custom tag:', error);
    }
  }, []);

  const trackEvent = useCallback((eventName: string) => {
    try {
      clarity.event(eventName);
    } catch (error) {
      console.error('Failed to track Clarity event:', error);
    }
  }, []);

  const identify = useCallback((userId: string, sessionId?: string, pageId?: string, friendlyName?: string) => {
    try {
      clarity.identify(userId, sessionId, pageId, friendlyName);
    } catch (error) {
      console.error('Failed to identify user in Clarity:', error);
    }
  }, []);

  const consent = useCallback((consent: boolean) => {
    try {
      clarity.consent(consent);
    } catch (error) {
      console.error('Failed to set Clarity consent:', error);
    }
  }, []);

  const upgrade = useCallback((reason: string) => {
    try {
      clarity.upgrade(reason);
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
