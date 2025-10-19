import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' | 'video' | 'document'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Use service role key for server-side uploads
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
    const allowedDocumentTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size: ${maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Determine folder and validate type
    let folder: string;
    let allowedTypes: string[];
    
    if (type === 'image' || file.type.startsWith('image/')) {
      folder = 'images';
      allowedTypes = allowedImageTypes;
    } else if (type === 'video' || file.type.startsWith('video/')) {
      folder = 'videos';
      allowedTypes = allowedVideoTypes;
    } else if (type === 'document' || allowedDocumentTypes.includes(file.type)) {
      folder = 'documents';
      allowedTypes = allowedDocumentTypes;
    } else {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // MIME-type fallback for documents: some browsers provide empty or generic types.
    if (folder === 'documents') {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const mimeOk = !!file.type && allowedTypes.includes(file.type);
      const extOk = ['pdf', 'doc', 'docx'].includes(ext);
      if (!mimeOk && !extOk) {
        return NextResponse.json(
          { error: `Invalid document type. Allowed: pdf, doc, docx`, received: { name: file.name, type: file.type, size: file.size } },
          { status: 400 }
        );
      }
      // Set correct content type for documents
      if (!file.type && ext === 'pdf') {
        Object.defineProperty(file, 'type', { value: 'application/pdf', writable: false });
      } else if (!file.type && ext === 'doc') {
        Object.defineProperty(file, 'type', { value: 'application/msword', writable: false });
      } else if (!file.type && ext === 'docx') {
        Object.defineProperty(file, 'type', { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', writable: false });
      }
    } else {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${session.user.id}/${fileName}`;

    // Choose bucket per type (workaround: some buckets reject non-image mime types)
    const bucket = folder === 'documents' ? 'jurisightlegal' : 'article-media';

    // Upload to Supabase storage (omit explicit contentType to avoid mime restrictions)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const result = {
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      type: file.type
    };

    return NextResponse.json({ 
      success: true, 
      data: result 
    }, { status: 200 });

  } catch (error) {
    console.error('Media upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      );
    }

    // Verify user owns the file (path should contain user ID)
    if (!filePath.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Use service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete from Supabase storage
    const { error: deleteError } = await supabase.storage
      .from('article-media')
      .remove([filePath]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: `Delete failed: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Media delete error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

