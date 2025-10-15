import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/revalidate
// Body: { slug?: string, extraPaths?: string[] }
export async function POST(request: NextRequest) {
  try {
    // Authorization: either a valid session with role EDITOR/ADMIN or a matching API key header
    const session = await getServerSession(authOptions);
    const isPrivilegedUser = Boolean(session?.user && (session.user.role === 'ADMIN' || session.user.role === 'EDITOR'));

    const headerKey = request.headers.get('x-api-key');
    const hasValidHeaderKey = headerKey && process.env.REVALIDATE_SECRET && headerKey === process.env.REVALIDATE_SECRET;

    if (!isPrivilegedUser && !hasValidHeaderKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, extraPaths } = await request.json().catch(() => ({ slug: undefined, extraPaths: undefined }));

    // Core paths to revalidate
    const paths: string[] = [
      '/',
      '/articles',
      '/sitemap.xml',
    ];

    if (slug) {
      paths.push(`/articles/${slug}`);
    }

    if (Array.isArray(extraPaths)) {
      for (const p of extraPaths) {
        if (typeof p === 'string' && p.startsWith('/')) paths.push(p);
      }
    }

    // Deduplicate
    const uniquePaths = Array.from(new Set(paths));

    for (const p of uniquePaths) {
      revalidatePath(p);
    }

    return NextResponse.json({ revalidated: true, paths: uniquePaths });
  } catch (error) {
    console.error('Error in revalidate endpoint:', error);
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}


