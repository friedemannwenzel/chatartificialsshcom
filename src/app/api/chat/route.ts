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

    // Only support Gemini models
    if (!model.startsWith('gemini')) {
      return NextResponse.json(
        { error: 'Only Gemini models are supported' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    // Configure Gemini model with proper tools for web search
    const modelConfig: any = { 
      model,
      // Add tools for web search if enabled
      ...(webSearch && {
        tools: [{ googleSearch: {} }]
      })
    };

    const geminiModel = genAI.getGenerativeModel(modelConfig);
    
    // Convert OpenAI format to Gemini format
    const geminiMessages = messages
      .filter((msg: ChatMessage) => msg.role !== 'system')
      .map((msg: ChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Handle system messages by prepending to first user message
    const systemMessages = messages.filter((msg: ChatMessage) => msg.role === 'system');
    if (systemMessages.length > 0 && geminiMessages.length > 0) {
      const systemContent = systemMessages.map((msg: ChatMessage) => msg.content).join('\n\n');
      const firstUserIndex = geminiMessages.findIndex((msg: any) => msg.role === 'user');
      if (firstUserIndex !== -1) {
        geminiMessages[firstUserIndex].parts[0].text = 
          systemContent + '\n\n' + geminiMessages[firstUserIndex].parts[0].text;
      }
    }

    // Use generateContentStream for both regular and web search requests
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

          // Get the final response to extract grounding metadata
          const finalResponse = await result.response;
          const candidates = finalResponse.candidates;
          
          if (candidates && candidates[0]) {
            console.log('Full candidate response:', JSON.stringify(candidates[0], null, 2));
            
            // Check for grounding metadata
            if (candidates[0].groundingMetadata) {
              groundingMetadata = candidates[0].groundingMetadata;
              
              console.log('Grounding metadata found:', JSON.stringify(groundingMetadata, null, 2));
              
              // Send grounding metadata as a separate event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                groundingMetadata: {
                  groundingChunks: groundingMetadata.groundingChunks || [],
                  groundingSupports: groundingMetadata.groundingSupports || [],
                  webSearchQueries: groundingMetadata.webSearchQueries || [],
                  searchEntryPoint: groundingMetadata.searchEntryPoint
                }
              })}\n\n`));
            }

            // Also check for grounding attributions (alternative structure)
            if (candidates[0].groundingAttributions) {
              const attributions = candidates[0].groundingAttributions;
              console.log('Grounding attributions found:', JSON.stringify(attributions, null, 2));
              
              // Convert attributions to our expected format
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