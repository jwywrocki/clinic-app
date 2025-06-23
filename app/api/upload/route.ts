import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { stat, mkdir } from 'fs/promises';

// Helper function to ensure directory exists
async function ensureDirExists(dirPath: string) {
    try {
        await stat(dirPath);
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            await mkdir(dirPath, { recursive: true });
        } else {
            throw e;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define the path to the public/uploads directory
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        await ensureDirExists(uploadsDir);

        // Special handling for favicon
        if (type === 'favicon') {
            // For favicon, save to public directory as favicon.ico
            const faviconPath = join(process.cwd(), 'public', 'favicon.ico');
            await writeFile(faviconPath, buffer);

            return NextResponse.json({
                success: true,
                url: '/favicon.ico',
                filePath: '/favicon.ico',
                filename: 'favicon.ico',
                size: file.size,
                type: file.type,
            });
        }

        // Regular file upload
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;
        const filePath = join(uploadsDir, filename);
        const publicPath = `/uploads/${filename}`;

        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: publicPath,
            filePath: publicPath,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }
}
