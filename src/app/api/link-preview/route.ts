import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract meta tags
    const title = extractMetaContent(html, ['og:title', 'twitter:title', 'title']);
    const description = extractMetaContent(html, ['og:description', 'twitter:description', 'description']);
    const image = extractMetaContent(html, ['og:image', 'twitter:image', 'image']);

    // If we found an image, make sure it's an absolute URL
    let imageUrl = image;
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        imageUrl = new URL(image, baseUrl.origin).href;
      } catch {
        imageUrl = null;
      }
    }

    return NextResponse.json({
      title: title || 'Untitled',
      description: description || '',
      image: imageUrl,
      url: url,
    });

  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link preview' },
      { status: 500 }
    );
  }
}

function extractMetaContent(html: string, properties: string[]): string | null {
  for (const property of properties) {
    // Try different meta tag formats
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return null;
}
