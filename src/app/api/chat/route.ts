import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';


interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}





const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// helper to split markdown into text/image parts for OpenAI vision models
const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

function markdownToOpenAIParts(md: string): ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: Array<any> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = imageRegex.exec(md)) !== null) {
    const [fullMatch, url] = match;
    const { index } = match;
    if (index! > lastIndex) {
      const textSegment = md.slice(lastIndex, index);
      if (textSegment.trim()) parts.push({ type: 'text', text: textSegment });
    }
    parts.push({ type: 'image_url', image_url: { url } });
    lastIndex = index! + fullMatch.length;
  }
  if (lastIndex < md.length) {
    const textRemainder = md.slice(lastIndex);
    if (textRemainder.trim()) parts.push({ type: 'text', text: textRemainder });
  }
  // fallback to entire text part if nothing parsed
  if (parts.length === 0) return [{ type: 'text', text: md }];
  return parts;
}

export async function POST(req: NextRequest) {
  try {
    // Parse body early to inspect skipRateLimit flag
    const {
      messages,
      model = 'gemini-2.0-flash',
      webSearch = false,
      skipRateLimit = false,
    } = await req.json();

    // Authenticate user (still required for all requests)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
          } }
      );
    }

    // Only perform rate-limit checks and increments for *real* chat completions.
    if (!skipRateLimit) {
      // Check rate limit before processing the message
      const rateLimitResponse = await fetch(`${req.nextUrl.origin}/api/rate-limit`, {
        method: 'GET',
        headers: {
          Authorization: req.headers.get('Authorization') || '',
          Cookie: req.headers.get('Cookie') || '',
        },
      });

      if (!rateLimitResponse.ok) {
        return NextResponse.json({ error: 'Rate limit check failed' }, { status: 500 });
      }

      const rateLimit = await rateLimitResponse.json();
      if (!rateLimit.canSendMessage) {
        const resetDate = new Date(rateLimit.resetDate).toLocaleDateString();
        return NextResponse.json(
          { error: `Rate limit exceeded. You have used ${rateLimit.currentCount}/${rateLimit.limit} messages this week. Your limit resets on ${resetDate}.` },
          { status: 429 }
        );
      }

      // Increment message count
      const incrementResponse = await fetch(`${req.nextUrl.origin}/api/rate-limit`, {
        method: 'POST',
        headers: {
          Authorization: req.headers.get('Authorization') || '',
          Cookie: req.headers.get('Cookie') || '',
        },
      });

      if (!incrementResponse.ok) {
        return NextResponse.json({ error: 'Failed to update rate limit' }, { status: 500 });
      }
    }

    // Validate model/provider after rate-limit logic
    const isOpenAI = model.startsWith('gpt') || model.startsWith('o1');
    const isGemini = model.startsWith('gemini');
    if (!isOpenAI && !isGemini) {
      return NextResponse.json({ error: 'Only OpenAI and Gemini models are supported' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    // Handle OpenAI models
    if (isOpenAI) {
      const openaiMessages = messages.map((msg: ChatMessage) => {
        if (msg.role === 'user') {
          return {
            role: 'user',
            content: markdownToOpenAIParts(msg.content),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
        }
        // assistant or system
        return {
          role: msg.role,
          content: msg.content,
        };
      });

      const isO1Model = model.startsWith('o1');
      if (isO1Model) {
        // O1 models don't support streaming
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config: any = {
          model,
          messages: openaiMessages,
        };
        
        const response = await openai.chat.completions.create(config);
        const content = response.choices[0]?.message?.content || '';
        
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
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
      }

      // Regular streaming for other OpenAI models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streamConfig: any = {
        model,
        messages: openaiMessages,
        stream: true,
      };

      const stream = await openai.chat.completions.create(streamConfig);

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for await (const chunk of stream as any) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('OpenAI streaming error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
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
    }

    // Handle Gemini models (existing logic)
    const isGemini15 = model.startsWith('gemini-1.5');
    const toolKey = isGemini15 ? 'googleSearchRetrieval' : 'googleSearch';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let groundingMetadata: any = null;

          for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((candidates[0] as any).groundingAttributions) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const attributions = (candidates[0] as any).groundingAttributions;
              const convertedMetadata = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                groundingChunks: attributions.map((attr: any) => ({
                  web: attr.web ? {
                    uri: attr.web.uri,
                    title: attr.web.title
                  } : undefined
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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