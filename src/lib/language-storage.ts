/**
 * Language Storage Utility
 * Handles language preference storage using localStorage and cookies
 */

export interface LanguagePreference {
  code: string;
  name: string;
  timestamp: number;
}

export class LanguageStorage {
  private static readonly STORAGE_KEY = 'jurisight_language_preference';
  private static readonly COOKIE_NAME = 'jurisight_lang';
  private static readonly COOKIE_EXPIRY_DAYS = 365;

  /**
   * Get current language preference
   * Always defaults to English ('en') for new users
   */
  public static getLanguagePreference(): string {
    // Try localStorage first
    const localStorageValue = this.getFromLocalStorage();
    if (localStorageValue) {
      return localStorageValue;
    }

    // Fallback to cookie
    const cookieValue = this.getFromCookie();
    if (cookieValue) {
      // Sync to localStorage
      this.setLanguagePreference(cookieValue);
      return cookieValue;
    }

    // Always default to English for new users
    // This ensures content is displayed in English by default
    return 'en';
  }

  /**
   * Set language preference
   */
  public static setLanguagePreference(languageCode: string): void {
    const preference: LanguagePreference = {
      code: languageCode,
      name: this.getLanguageName(languageCode),
      timestamp: Date.now(),
    };

    // Save to localStorage
    this.saveToLocalStorage(preference);

    // Save to cookie for server-side access
    this.saveToCookie(languageCode);

    // Dispatch custom event for components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { languageCode, preference }
      }));
    }
  }

  /**
   * Get language preference from localStorage
   */
  private static getFromLocalStorage(): string | null {
    try {
      if (typeof window === 'undefined') return null;

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const preference: LanguagePreference = JSON.parse(stored);
      
      // Check if preference is not too old (optional validation)
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (Date.now() - preference.timestamp > maxAge) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return preference.code;
    } catch (error) {
      console.warn('Failed to read language preference from localStorage:', error);
      return null;
    }
  }

  /**
   * Save language preference to localStorage
   */
  private static saveToLocalStorage(preference: LanguagePreference): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.warn('Failed to save language preference to localStorage:', error);
    }
  }

  /**
   * Get language preference from cookie
   */
  private static getFromCookie(): string | null {
    try {
      if (typeof document === 'undefined') return null;

      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.COOKIE_NAME) {
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to read language preference from cookie:', error);
      return null;
    }
  }

  /**
   * Save language preference to cookie
   */
  private static saveToCookie(languageCode: string): void {
    try {
      if (typeof document === 'undefined') return;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);

      const cookieValue = [
        `${this.COOKIE_NAME}=${encodeURIComponent(languageCode)}`,
        `expires=${expiryDate.toUTCString()}`,
        'path=/',
        'SameSite=Lax'
      ].join('; ');

      document.cookie = cookieValue;
    } catch (error) {
      console.warn('Failed to save language preference to cookie:', error);
    }
  }

  /**
   * Clear language preference
   */
  public static clearLanguagePreference(): void {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }

      // Clear cookie
      if (typeof document !== 'undefined') {
        document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Dispatch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { languageCode: 'en', preference: null }
        }));
      }
    } catch (error) {
      console.warn('Failed to clear language preference:', error);
    }
  }

  /**
   * Get language name by code (basic mapping)
   */
  private static getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'te': 'Telugu',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'or': 'Odia',
      'as': 'Assamese',
      'ur': 'Urdu',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'sw': 'Swahili',
      'tr': 'Turkish',
    };

    return languageNames[code] || code.toUpperCase();
  }

  /**
   * Initialize language preference to English if none exists
   * This ensures new users always start with English content
   */
  public static initializeDefaultLanguage(): void {
    if (!this.hasStoredPreference()) {
      this.setLanguagePreference('en');
    }
  }

  /**
   * Check if language preference exists
   */
  public static hasLanguagePreference(): boolean {
    return this.getLanguagePreference() !== 'en' || 
           this.getFromLocalStorage() !== null || 
           this.getFromCookie() !== null;
  }

  /**
   * Check if there's any stored preference (localStorage or cookie)
   */
  private static hasStoredPreference(): boolean {
    return this.getFromLocalStorage() !== null || this.getFromCookie() !== null;
  }

  /**
   * Get language preference with metadata
   */
  public static getLanguagePreferenceWithMetadata(): LanguagePreference | null {
    try {
      if (typeof window === 'undefined') return null;

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to get language preference metadata:', error);
      return null;
    }
  }

  /**
   * Migrate old language preferences (if any)
   */
  public static migrateOldPreferences(): void {
    try {
      // Check for any old language storage keys and migrate them
      if (typeof window === 'undefined') return;

      const oldKeys = ['language', 'lang', 'locale'];
      for (const oldKey of oldKeys) {
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue && !localStorage.getItem(this.STORAGE_KEY)) {
          this.setLanguagePreference(oldValue);
          localStorage.removeItem(oldKey);
          break;
        }
      }
    } catch (error) {
      console.warn('Failed to migrate old language preferences:', error);
    }
  }
}

/**
 * React hook for language preference
 */
export function useLanguagePreference() {
  if (typeof window === 'undefined') {
    return {
      language: 'en',
      setLanguage: () => {},
      clearLanguage: () => {},
      hasPreference: false,
    };
  }

  const [language, setLanguageState] = useState(LanguageStorage.getLanguagePreference());

  useEffect(() => {
    // Migrate old preferences on mount
    LanguageStorage.migrateOldPreferences();

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguageState(event.detail.languageCode);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const setLanguage = (languageCode: string) => {
    LanguageStorage.setLanguagePreference(languageCode);
  };

  const clearLanguage = () => {
    LanguageStorage.clearLanguagePreference();
  };

  return {
    language,
    setLanguage,
    clearLanguage,
    hasPreference: LanguageStorage.hasLanguagePreference(),
  };
}

// Import React hooks
import { useState, useEffect } from 'react';