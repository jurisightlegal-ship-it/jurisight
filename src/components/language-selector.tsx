'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Globe, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translationService, SupportedLanguage } from '@/lib/translation-service';
import { LanguageStorage } from '@/lib/language-storage';

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showFlags?: boolean;
  disabled?: boolean;
}

export function LanguageSelector({
  onLanguageChange,
  className = '',
  variant = 'default',
  showFlags = true,
  disabled = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Always start with English as default
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{
    horizontal: 'left' | 'right' | 'center';
    vertical: 'bottom' | 'top';
  }>({ horizontal: 'left', vertical: 'bottom' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const supportedLanguages = translationService.getSupportedLanguages();

  // Filter languages based on search term
  const filteredLanguages = supportedLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current language info
  const currentLangInfo = supportedLanguages.find(lang => lang.code === currentLanguage);

  useEffect(() => {
    // Initialize default language to English for new users
    LanguageStorage.initializeDefaultLanguage();
    
    // Load saved language preference
    const savedLanguage = LanguageStorage.getLanguagePreference();
    setCurrentLanguage(savedLanguage);

    // Listen for language changes from other components
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.languageCode);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLanguageChange as EventListener);
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      };
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    // Calculate dropdown position based on available space
    const calculatePosition = () => {
      if (triggerRef.current && typeof window !== 'undefined') {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 384; // 24rem in pixels (max-h-96)
        const margin = 16; // 1rem margin from viewport edges

        // Always center horizontally over the trigger button
        const horizontal: 'left' | 'right' | 'center' = 'center';

        // Vertical positioning with viewport boundary detection
        let vertical: 'bottom' | 'top' = 'bottom';
        const spaceBelow = viewportHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        
        if (spaceBelow >= dropdownHeight) {
          vertical = 'bottom';
        } else if (spaceAbove >= dropdownHeight) {
          vertical = 'top';
        } else {
          // Not enough space in either direction, choose the one with more space
          vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';
        }

        setDropdownPosition({ horizontal, vertical });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculatePosition();
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage || disabled) return;

    setIsLoading(true);
    try {
      // Save language preference
      LanguageStorage.setLanguagePreference(languageCode);
      setCurrentLanguage(languageCode);
      
      // Call callback if provided
      if (onLanguageChange) {
        await onLanguageChange(languageCode);
      }

      // Close dropdown
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, languageCode?: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (languageCode) {
        handleLanguageSelect(languageCode);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const renderTriggerButton = () => {
    const baseClasses = "relative inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    // Ensure minimum 48x48px touch target for mobile accessibility
    const mobileMinSize = "min-h-[48px] min-w-[48px] sm:min-h-[auto] sm:min-w-[auto]";
    
    if (variant === 'icon-only') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={`${baseClasses} ${mobileMinSize} w-12 h-12 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Current language: ${currentLangInfo?.name || 'Unknown'}. Click to change language.`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : showFlags && currentLangInfo?.flag ? (
            <span className="text-lg" role="img" aria-label={currentLangInfo.name}>
              {currentLangInfo.flag}
            </span>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={`${baseClasses} ${mobileMinSize} px-3 py-3 sm:py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Current language: ${currentLangInfo?.name || 'Unknown'}. Click to change language.`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showFlags && currentLangInfo?.flag && (
                <span className="text-sm mr-2" role="img" aria-label={currentLangInfo.name}>
                  {currentLangInfo.flag}
                </span>
              )}
              <span className="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </Button>
      );
    }

    // Default variant
    return (
      <Button
        variant="outline"
        className={`${baseClasses} px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-label={`Current language: ${currentLangInfo?.name || 'English'}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <>
            {showFlags && currentLangInfo?.flag && (
              <span className="mr-3" role="img" aria-label={currentLangInfo.name}>
                {currentLangInfo.flag}
              </span>
            )}
            <span className="font-medium">{currentLangInfo?.name || 'English'}</span>
            <ChevronDown className={`ml-3 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div ref={triggerRef}>
        {renderTriggerButton()}
      </div>

      {isOpen && (
        <div 
          className={`
            absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg max-h-96 overflow-hidden
            transition-all duration-300 ease-out
            animate-in fade-in-0 zoom-in-95
            ${dropdownPosition.vertical === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
            right-0
            ${typeof window !== 'undefined' && window.innerWidth < 768 
              ? 'w-[calc(100vw-2rem)] min-w-[280px]' 
              : 'w-80 max-w-[calc(100vw-2rem)]'}
          `}
          style={{
            maxHeight: typeof window !== 'undefined' && window.innerHeight < 600 
              ? `${Math.min(300, window.innerHeight - 100)}px` 
              : 'calc(100vh - 8rem)'
          }}
          role="listbox"
          aria-label="Language selection"
          aria-expanded={isOpen}
          aria-multiselectable={false}
        >
          {/* Search input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              aria-label="Search languages"
            />
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto" role="listbox" aria-label="Language options">
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No languages found
              </div>
            ) : (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  className={`w-full px-4 py-4 sm:py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between group min-h-[48px] ${
                    language.code === currentLanguage ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                  onKeyDown={(e) => handleKeyDown(e, language.code)}
                  role="option"
                  aria-selected={language.code === currentLanguage}
                  aria-label={`Select ${language.name} (${language.nativeName})`}
                >
                  <div className="flex items-center min-w-0">
                    {showFlags && (
                      <span className="mr-3 text-lg flex-shrink-0" role="img" aria-label={language.name}>
                        {language.flag}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {language.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {language.nativeName}
                      </div>
                    </div>
                  </div>
                  {language.code === currentLanguage && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>


        </div>
      )}
    </div>
  );
}

export default LanguageSelector;