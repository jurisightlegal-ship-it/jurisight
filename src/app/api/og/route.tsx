import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return a simple static response
    // This will be replaced with proper OG image generation once the issue is resolved
    return new Response('OG Image API - Under Maintenance', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}