
import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await fileManager.uploadFile(buffer, {
            mimeType: file.type,
            displayName: file.name,
        });

        let fileMeta = await fileManager.getFile(uploadResult.file.name);
        while (fileMeta.state === FileState.PROCESSING) {
            await new Promise((resolve) => setTimeout(resolve, 10000)); 
            fileMeta = await fileManager.getFile(uploadResult.file.name);
        }

        if (fileMeta.state === FileState.FAILED) {
            throw new Error('Video processing failed.');
        }

        return NextResponse.json({ fileUri: fileMeta.uri });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
