import { NextRequest, NextResponse } from 'next/server';
import { getImageDisplayUrl } from '@/lib/storage-utils';

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json();
    
    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    const signedUrl = await getImageDisplayUrl(imagePath);
    
    return NextResponse.json({
      success: true,
      signedUrl
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
