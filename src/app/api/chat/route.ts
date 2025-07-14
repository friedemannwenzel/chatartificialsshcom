import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface APIError {
  status?: number;
  message?: string;
  error?: string;
}

interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  groundingSupports?: unknown[];
  webSearchQueries?: unknown[];
  searchEntryPoint?: unknown;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const xaiClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

function markdownToOpenAIParts(md: string): Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> {
  const parts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [];
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
  if (parts.length === 0) return [{ type: 'text', text: md }];
  return parts;
}

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      model = 'gemini-2.0-flash',
      webSearch = false,
      skipRateLimit = false,
    } = await req.json();

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

    let rateLimitIncremented = false;

    if (!skipRateLimit) {
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
      rateLimitIncremented = true;
    }

    const isOpenAI = model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o4');
    const isGemini = model.startsWith('gemini');
    const isXAI = model.startsWith('grok');
    
    if (!isOpenAI && !isGemini && !isXAI) {
      return NextResponse.json({ error: 'Only OpenAI, Gemini, and xAI models are supported' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    try {
      if (isOpenAI || isXAI) {
        const client = isXAI ? xaiClient : openai;
        const providerName = isXAI ? 'xAI' : 'OpenAI';
        
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg: ChatMessage): OpenAI.Chat.ChatCompletionMessageParam => {
          if (msg.role === 'user') {
            return {
              role: 'user',
              content: markdownToOpenAIParts(msg.content),
            };
          }
          if (msg.role === 'assistant') {
            return {
              role: 'assistant',
              content: msg.content,
            };
          }
          return {
            role: 'system',
            content: msg.content,
          };
        });

        const isO1Model = model.startsWith('o1');
        
        if (isO1Model) {
          const config: OpenAI.Chat.ChatCompletionCreateParams = {
            model,
            messages: openaiMessages,
          };
          
          try {
            const response = await client.chat.completions.create(config);
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
          } catch (apiError) {
            console.error(`${providerName} API error:`, apiError);
            await rollbackRateLimit(req, rateLimitIncremented);
            
            const errorMessage = getProviderErrorMessage(apiError as APIError, providerName);
            return NextResponse.json({ error: errorMessage }, { status: 503 });
          }
        }

        const streamConfig: OpenAI.Chat.ChatCompletionCreateParams & { stream: true } = {
          model,
          messages: openaiMessages,
          stream: true,
        };

        try {
          const stream = await client.chat.completions.create(streamConfig);

          const readableStream = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of stream) {
                  const content = chunk.choices[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (streamError) {
                console.error(`${providerName} streaming error:`, streamError);
                controller.error(streamError);
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
        } catch (apiError) {
          console.error(`${providerName} API error:`, apiError);
          await rollbackRateLimit(req, rateLimitIncremented);
          
          const errorMessage = getProviderErrorMessage(apiError as APIError, providerName);
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        }
      }

      if (isGemini) {
        const isGemini15 = model.startsWith('gemini-1.5');
        const toolKey = isGemini15 ? 'googleSearchRetrieval' : 'googleSearch';

        const modelConfig = { 
          model,
          ...(webSearch && {
            tools: [{ [toolKey]: {} }]
          })
        };

        try {
          const geminiModel = genAI.getGenerativeModel(modelConfig);
          
          const geminiMessages: GeminiMessage[] = messages
            .filter((msg: ChatMessage) => msg.role !== 'system')
            .map((msg: ChatMessage) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            }));

          const systemMessages = messages.filter((msg: ChatMessage) => msg.role === 'system');
          if (systemMessages.length > 0 && geminiMessages.length > 0) {
            const systemContent = systemMessages.map((msg: ChatMessage) => msg.content).join('\n\n');
            const firstUserIndex = geminiMessages.findIndex((msg: GeminiMessage) => msg.role === 'user');
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
                let groundingMetadata: GroundingMetadata | null = null;

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
                    groundingMetadata = candidates[0].groundingMetadata as GroundingMetadata;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      groundingMetadata: {
                        groundingChunks: groundingMetadata.groundingChunks || [],
                        groundingSupports: groundingMetadata.groundingSupports || [],
                        webSearchQueries: groundingMetadata.webSearchQueries || [],
                        searchEntryPoint: groundingMetadata.searchEntryPoint
                      }
                    })}\n\n`));
                  }

                  const candidateWithAttributions = candidates[0] as typeof candidates[0] & {
                    groundingAttributions?: Array<{
                      web?: {
                        uri: string;
                        title: string;
                      };
                    }>;
                  };

                  if (candidateWithAttributions.groundingAttributions) {
                    const attributions = candidateWithAttributions.groundingAttributions;
                    const convertedMetadata: GroundingMetadata = {
                      groundingChunks: attributions.map((attr) => ({
                        web: attr.web ? {
                          uri: attr.web.uri,
                          title: attr.web.title
                        } : undefined
                      })).filter((chunk): chunk is { web: { uri: string; title: string } } => !!chunk.web),
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
              } catch (streamError) {
                console.error('Gemini streaming error:', streamError);
                controller.error(streamError);
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
        } catch (apiError) {
          console.error('Gemini API error:', apiError);
          await rollbackRateLimit(req, rateLimitIncremented);
          
          const errorMessage = getProviderErrorMessage(apiError as APIError, 'Google Gemini');
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        }
      }
    } catch (unexpectedError) {
      console.error('Unexpected error in chat processing:', unexpectedError);
      await rollbackRateLimit(req, rateLimitIncremented);
      return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
    }

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

async function rollbackRateLimit(req: NextRequest, wasIncremented: boolean) {
  if (!wasIncremented) return;
  
  try {
    await fetch(`${req.nextUrl.origin}/api/rate-limit`, {
      method: 'DELETE',
      headers: {
        Authorization: req.headers.get('Authorization') || '',
        Cookie: req.headers.get('Cookie') || '',
      },
    });
  } catch (rollbackError) {
    console.error('Failed to rollback rate limit:', rollbackError);
  }
}

function getProviderErrorMessage(error: APIError, providerName: string): string {
  if (error?.status === 403) {
    if (providerName === 'xAI') {
      return 'xAI API access denied. Please check your credits and API key at https://console.x.ai/';
    }
    return `${providerName} API access denied. Please check your API key and account status.`;
  }
  
  if (error?.status === 429) {
    return `${providerName} rate limit exceeded. Please try again in a moment.`;
  }
  
  if (error?.status === 401) {
    return `${providerName} authentication failed. Please check your API key.`;
  }
  
  if (error?.status && error.status >= 500) {
    return `${providerName} service is temporarily unavailable. Please try again later.`;
  }
  
  if (error?.message?.includes('credits')) {
    return `Insufficient ${providerName} credits. Please check your account balance.`;
  }
  
  return `${providerName} request failed. Please try again.`;
} 