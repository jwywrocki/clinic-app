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
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path to the public/uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await ensureDirExists(uploadsDir);

    const filename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = join(uploadsDir, filename);
    const publicPath = `/uploads/${filename}`;

    try {
        await writeFile(filePath, buffer);
        console.log(`File uploaded to ${filePath}`);
        return NextResponse.json({ success: true, filePath: publicPath });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ success: false, error: 'Error saving file' }, { status: 500 });
    }
}
