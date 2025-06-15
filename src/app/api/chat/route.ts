import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@clerk/nextjs/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface GroundingSupport {
  segment: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const { messages, model = 'gemini-2.0-flash', webSearch = false } = await req.json();

    if (!model.startsWith('gemini')) {
      return NextResponse.json(
        { error: 'Only Gemini models are supported' },
        { status: 400 }
      );
    }

    const isGemini15 = model.startsWith('gemini-1.5');
    const toolKey = isGemini15 ? 'googleSearchRetrieval' : 'googleSearch';

    const encoder = new TextEncoder();

    const modelConfig: any = { 
      model,
      ...(webSearch && {
        tools: [{ [toolKey]: {} }]
      })
    };

    const geminiModel = genAI.getGenerativeModel(modelConfig);
    
    const geminiMessages = messages
      .filter((msg: ChatMessage) => msg.role !== 'system')
      .map((msg: ChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const systemMessages = messages.filter((msg: ChatMessage) => msg.role === 'system');
    if (systemMessages.length > 0 && geminiMessages.length > 0) {
      const systemContent = systemMessages.map((msg: ChatMessage) => msg.content).join('\n\n');
      const firstUserIndex = geminiMessages.findIndex((msg: any) => msg.role === 'user');
      if (firstUserIndex !== -1) {
        geminiMessages[firstUserIndex].parts[0].text = 
          systemContent + '\n\n' + geminiMessages[firstUserIndex].parts[0].text;
      }
    }

    const result = await geminiModel.generateContentStream({
      contents: geminiMessages
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          let groundingMetadata: any = null;

          for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          const finalResponse = await result.response;
          const candidates = finalResponse.candidates;
          
          if (candidates && candidates[0]) {
            if (candidates[0].groundingMetadata) {
              groundingMetadata = candidates[0].groundingMetadata;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                groundingMetadata: {
                  groundingChunks: groundingMetadata.groundingChunks || [],
                  groundingSupports: groundingMetadata.groundingSupports || [],
                  webSearchQueries: groundingMetadata.webSearchQueries || [],
                  searchEntryPoint: groundingMetadata.searchEntryPoint
                }
              })}\n\n`));
            }

            if (candidates[0].groundingAttributions) {
              const attributions = candidates[0].groundingAttributions;
              const convertedMetadata = {
                groundingChunks: attributions.map((attr: any) => ({
                  web: attr.web ? {
                    uri: attr.web.uri,
                    title: attr.web.title
                  } : undefined
                })).filter((chunk: any) => chunk.web),
                groundingSupports: [],
                webSearchQueries: [],
                searchEntryPoint: undefined
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                groundingMetadata: convertedMetadata
              })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Gemini streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
} 