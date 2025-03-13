import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


export async function POST(req: NextRequest) {
    try {
        const { videoUrl, videoMimeType } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error('API key is not set in environment variables.');
            throw new Error('API key is missing.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: videoMimeType,
                    fileUri: videoUrl
                }
            },
            { text: "Describe a short summary of the video provided?" },
        ]);

        return NextResponse.json({ text: result.response.text() });
    } catch (error) {

        let errorMessage = 'Failed to process video';
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
