# DeepL API Setup Guide

This guide explains how to set up the DeepL API for translation services in your Jurisight application.

## Overview

The application uses DeepL API exclusively for high-quality translations. DeepL offers a free tier with 500,000 characters per month, making it suitable for most applications. For languages not supported by DeepL, the application will return the original text unchanged.

## Getting Started

### 1. Create a DeepL Account

1. Visit [DeepL API](https://www.deepl.com/pro-api)
2. Sign up for a DeepL account
3. Choose the **DeepL API Free** plan for up to 500,000 characters per month

### 2. Get Your API Key

1. After registration, go to your [DeepL Account](https://www.deepl.com/account/summary)
2. Navigate to the "API" section
3. Copy your authentication key

**Important Notes:**
- Free API keys end with `:fx`
- Pro API keys don't have this suffix
- The application automatically detects the key type and uses the correct endpoint

### 3. Configure Environment Variables

Add your DeepL API key to your `.env.local` file:

```bash
# DeepL Translation API
DEEPL_API_KEY=your_deepl_api_key_here
```

**Example:**
```bash
# For Free API
DEEPL_API_KEY=12345678-1234-1234-1234-123456789012:fx

# For Pro API
DEEPL_API_KEY=12345678-1234-1234-1234-123456789012
```

### 4. Restart Your Application

After adding the API key, restart your development server:

```bash
npm run dev
# or
pnpm dev
```

## API Endpoints

The application automatically uses the correct DeepL endpoint based on your API key:

- **Free API**: `https://api-free.deepl.com/v2/translate`
- **Pro API**: `https://api.deepl.com/v2/translate`

## Supported Languages

⚠️ **Important Limitation**: The application only uses DeepL API for translation. DeepL does **NOT** support Hindi translation, which is a significant limitation for legal content in India. For unsupported languages, the application will return the original text unchanged.

DeepL supports translation to the following languages:
- Arabic (AR)
- Bulgarian (BG)
- Chinese (ZH, ZH-HANS, ZH-HANT)
- Czech (CS)
- Danish (DA)
- Dutch (NL)
- English (EN-GB, EN-US)
- Estonian (ET)
- Finnish (FI)
- French (FR)
- German (DE)
- Greek (EL)
- Hebrew (HE) - *Next-gen models only*
- Hungarian (HU)
- Indonesian (ID)
- Italian (IT)
- Japanese (JA)
- Korean (KO)
- Latvian (LV)
- Lithuanian (LT)
- Norwegian (NB)
- Polish (PL)
- Portuguese (PT-BR, PT-PT)
- Romanian (RO)
- Russian (RU)
- Slovak (SK)
- Slovenian (SL)
- Spanish (ES, ES-419)
- Swedish (SV)
- Thai (TH) - *Next-gen models only*
- Turkish (TR)
- Ukrainian (UK)
- Vietnamese (VI) - *Next-gen models only*

### Alternative Solutions for Hindi Translation

Since DeepL doesn't support Hindi, consider these alternatives:

1. **Google Translate API** - Supports Hindi and many Indian languages
2. **Azure Translator** - Microsoft's translation service with Hindi support
3. **AWS Translate** - Amazon's translation service
4. **LibreTranslate** - Open-source, self-hosted solution with Hindi support
5. **MyMemory API** - Free tier available with Hindi support

## Testing the Integration

### Single Translation Test (Supported Language - Spanish)

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Supreme Court", "target": "es"}'
```

Expected response:
```json
{"translation": "Tribunal Supremo"}
```

### Single Translation Test (Unsupported Language - Hindi)

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Supreme Court", "target": "hi"}'
```

Expected response (returns original text):
```json
{"translation": "Supreme Court"}
```

### Batch Translation Test (Supported Language - French)

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Supreme Court", "High Court", "District Court"], "target": "fr"}'
```

Expected response:
```json
{"translations": ["Cour suprême", "Haute Cour", "Tribunal d'instance"]}
```

### Batch Translation Test (Unsupported Language - Hindi)

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Supreme Court", "High Court", "District Court"], "target": "hi"}'
```

Expected response (returns original texts):
```json
{"translations": ["Supreme Court", "High Court", "District Court"]}
```

## Fallback Behavior

The application handles unsupported languages and errors gracefully:

### For Unsupported Languages
- Languages not supported by DeepL (like Hindi) will return the original text unchanged
- A console log will indicate that the language is not supported

### For API Errors or Missing Configuration
- If the DeepL API key is not configured, the application returns the original text
- If the DeepL API fails or returns an error, the application returns the original text
- No errors will be thrown to the user
- Console logs will indicate the specific issue

## Rate Limits and Quotas

### Free Tier
- **500,000 characters per month**
- No access to next-generation language models
- Data is stored temporarily for algorithm improvement

### Pro Tier
- **Unlimited characters** (pay-per-use)
- Access to next-generation language models
- Maximum data security (immediate deletion)
- Monthly cost control limits available

## Best Practices

1. **Monitor Usage**: Keep track of your character usage in the DeepL dashboard
2. **Error Handling**: The application includes automatic fallback to original text
3. **Security**: Never commit your API key to version control
4. **Testing**: Test translations with your specific legal terminology

## Troubleshooting

### Common Issues

1. **"DeepL API key not configured"**
   - Ensure `DEEPL_API_KEY` is set in `.env.local`
   - Restart your development server

2. **"DeepL API error: 403 Forbidden"**
   - Check if your API key is correct
   - Verify you haven't exceeded your quota

3. **"DeepL API error: 456 Quota Exceeded"**
   - You've reached your monthly character limit
   - Upgrade to Pro or wait for next month

4. **Translations not appearing**
   - Check browser console for errors
   - Verify the target language is supported
   - Test the API endpoint directly with curl

### Getting Help

- [DeepL API Documentation](https://developers.deepl.com/docs)
- [DeepL Support](https://support.deepl.com/)
- [DeepL Developer Community](https://discord.gg/deepl)

## Migration from Other Services

If you were previously using other translation services:
1. Add your DeepL API key to `.env.local`
2. Restart the application
3. The DeepL integration will automatically take over
4. Test with a few translations to ensure everything works

The application is designed to gracefully handle the transition and will fall back to returning original text if any issues occur.