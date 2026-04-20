import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { stat, readFile } from 'fs/promises';
import { lookup } from 'mime-types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug.join('/');
    const filePath = join(process.cwd(), 'public', 'uploads', slug);

    // Zapobiega path traversal
    if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        return new NextResponse('Not found', { status: 404 });
      }
    } catch (e: any) {
      return new NextResponse('Not found', { status: 404 });
    }

    const fileContent = await readFile(filePath);
    
    // Ustal mime typ na podstawie rozszerzenia
    const mimeType = lookup(filePath) || 'application/octet-stream';

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
