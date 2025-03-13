
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { processedText, question } = body;

    if (!processedText || !question) {
      return NextResponse.json({ error: 'Processed text and question are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `This is the processed result of the video - ${processedText}\nUser question: ${question}.\n Give appropriate answer to user's question.
    Important Note - Do not give answers to any random questions. If the question is not related to the provided processed result text above, then tell this to user with appropriate reply.`;

    const result = await model.generateContent(prompt);

    if (result && result.response) {
      const answer = result.response.text();
      return NextResponse.json({ answer }, { status: 200 });
    } else {
      throw new Error('Failed to get response from model');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to process the question' }, { status: 500 });
  }
};
