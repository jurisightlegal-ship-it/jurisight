import { NextResponse } from 'next/server';

// Allowed origins for CORS
const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
]);

function getCorsOrigin(origin?: string | null): string {
  if (!origin) return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return allowedOrigins.has(origin) ? origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
}

function corsHeaders(origin?: string | null) {
  const allowOrigin = getCorsOrigin(origin);
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  } as Record<string, string>;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

// DeepL supported languages (target languages)
const DEEPL_SUPPORTED_LANGUAGES = new Set([
  'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR', 'HU', 'ID', 'IT', 
  'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 
  'TR', 'UK', 'ZH'
]);



// DeepL API translation function
async function translateWithDeepL(texts: string[], targetLang: string, sourceLang?: string): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DeepL API key not configured');
  }

  // Determine the correct endpoint based on API key type
  // Free API keys end with ':fx', Pro keys don't
  const isFreeKey = apiKey.endsWith(':fx');
  const baseUrl = isFreeKey ? 'https://api-free.deepl.com' : 'https://api.deepl.com';

  const requestBody = {
    text: texts,
    target_lang: targetLang.toUpperCase(),
    ...(sourceLang && sourceLang !== 'auto' && { source_lang: sourceLang.toUpperCase() })
  };

  const response = await fetch(`${baseUrl}/v2/translate`, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[DeepL API] Error ${response.status}:`, errorText);
    throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.translations.map((t: any) => t.text);
}

// Translation function that only uses DeepL for supported languages
async function translateTexts(texts: string[], targetLang: string, sourceLang?: string): Promise<string[]> {
  const upperTargetLang = targetLang.toUpperCase();
  
  // Check if DeepL API key is configured and target language is supported
  if (process.env.DEEPL_API_KEY && DEEPL_SUPPORTED_LANGUAGES.has(upperTargetLang)) {
    try {
      console.log(`[Translation] Using DeepL API for ${targetLang}`);
      return await translateWithDeepL(texts, targetLang, sourceLang);
    } catch (error) {
      console.error('[Translation] DeepL failed, returning original texts:', error);
      return texts; // Return original texts if DeepL fails
    }
  }
  
  // Return original texts for unsupported languages
  console.log(`[Translation] Language ${targetLang} not supported by DeepL, returning original texts`);
  return texts;
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    const body = await req.json();
    const { text, texts, target, source = 'auto' } = body || {};

    if (!target || (!text && (!texts || texts.length === 0))) {
      return NextResponse.json(
        { error: 'Invalid request: provide `target` and either `text` or `texts`.' },
        { status: 400, headers }
      );
    }

    // Single text translation
    if (text && (!texts || texts.length === 0)) {
      try {
        const translations = await translateTexts([text], target, source);
        return NextResponse.json({ translation: translations[0] }, { status: 200, headers });
      } catch (error) {
        console.error('[api/translate] Single translation failed:', error);
        // Fallback to original text if translation fails
        return NextResponse.json({ translation: text }, { status: 200, headers });
      }
    }

    // Batch translation
    const toTranslate: string[] = Array.isArray(texts) ? texts : [];
    if (toTranslate.length === 0) {
      return NextResponse.json({ translations: [] }, { status: 200, headers });
    }

    try {
      const translations = await translateTexts(toTranslate, target, source);
      return NextResponse.json({ translations }, { status: 200, headers });
    } catch (error) {
      console.error('[api/translate] Batch translation failed:', error);
      // Fallback to original texts if translation fails
      return NextResponse.json({ translations: toTranslate }, { status: 200, headers });
    }
  } catch (error) {
    console.error('[api/translate] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500, headers }
    );
  }
}