export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

class TranslationService {
  private static instance: TranslationService;

  // DeepL supported language codes
  private static readonly DEEPL_SUPPORTED_CODES = new Set([
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'th', 'vi', 'id', 'tr'
  ]);

  public static readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  ];

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return TranslationService.SUPPORTED_LANGUAGES.filter(lang => 
      TranslationService.DEEPL_SUPPORTED_CODES.has(lang.code)
    );
  }

  public getLanguageByCode(code: string): SupportedLanguage | undefined {
    return TranslationService.SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  public detectBrowserLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0];
    const supported = this.getLanguageByCode(langCode);
    return supported ? langCode : 'en';
  }

  // Fetch wrapper with 10-second timeout
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // Translate a single text via our API route
  public async translateText(text: string, target: string, source: string = 'auto'): Promise<string> {
    try {
      const res = await this.fetchWithTimeout('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target, source }),
      });
      if (!res.ok) {
        console.warn('TranslateText failed:', res.status);
        return text;
      }
      const data = await res.json();
      const out = typeof data?.translation === 'string' ? data.translation : '';
      return out && out.trim().length > 0 ? out : text;
    } catch (err) {
      console.warn('TranslateText error:', err);
      return text;
    }
  }

  // Translate an array of texts via our API route (chunked + sequential)
  public async translateBatch(texts: string[], target: string, source: string = 'auto'): Promise<string[]> {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const CHUNK_SIZE = 20; // keep requests small to avoid rate limits
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
      const chunk = texts.slice(i, i + CHUNK_SIZE);
      try {
        const res = await this.fetchWithTimeout('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: chunk, target, source }),
        });

        let translated: string[] = [];
        if (res.ok) {
          const data = await res.json();
          translated = Array.isArray(data?.translations) ? (data.translations as string[]) : [];
        }

        if (!translated.length) {
          // no translations returned; keep original texts
          for (let j = 0; j < chunk.length; j++) {
            results.push(chunk[j] ?? '');
          }
        } else {
          // ensure each entry has content; otherwise fallback to original
          for (let j = 0; j < chunk.length; j++) {
            const t = translated[j];
            const original = chunk[j] ?? '';
            results.push(t && typeof t === 'string' && t.trim().length > 0 ? t : original);
          }
        }
      } catch (err) {
        console.warn('TranslateBatch chunk error:', err);
        // push originals for this chunk on error
        for (let j = 0; j < chunk.length; j++) {
          results.push(chunk[j] ?? '');
        }
      }
    }

    return results;
  }

  // Translate text nodes inside an element, preserving HTML structure
  public async translateElementTextNodes(el: HTMLElement, target: string, source: string = 'auto'): Promise<void> {
    try {
      if (typeof window === 'undefined' || !el) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = (node as Text).parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'TITLE'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.textContent ?? '';
          return text.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      const nodes: Text[] = [];
      const texts: string[] = [];
      let current: Node | null;
      while ((current = walker.nextNode())) {
        nodes.push(current as Text);
        texts.push((current as Text).textContent ?? '');
      }

      if (texts.length === 0) return;

      const translated = await this.translateBatch(texts, target, source);
      translated.forEach((t, i) => {
        const node = nodes[i];
        if (!node) return;
        const original = texts[i] ?? '';
        node.textContent = t && t.trim().length > 0 ? t : original;
      });
    } catch (err) {
      console.warn('translateElementTextNodes error:', err);
    }
  }
}

export const translationService = TranslationService.getInstance();