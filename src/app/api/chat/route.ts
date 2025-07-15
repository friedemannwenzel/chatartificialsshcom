import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { getModelById } from '@/lib/models';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size?: number;
  }>;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
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

async function convertImageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

async function messageToGeminiParts(message: ChatMessage): Promise<Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>> {
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  
  // Handle text content (remove markdown images since we'll handle attachments separately)
  let textContent = message.content;
  if (message.attachments && message.attachments.length > 0) {
    // Remove markdown images from text content
    textContent = textContent.replace(imageRegex, '').trim();
  }
  
  if (textContent) {
    parts.push({ text: textContent });
  }
  
  // Handle attachments
  if (message.attachments && message.attachments.length > 0) {
    for (const attachment of message.attachments) {
      const isImage = attachment.type?.startsWith("image/") || 
        (!attachment.type && [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].some(ext => 
          attachment.name.toLowerCase().endsWith(ext)
        ));
      
      if (isImage) {
        try {
          const base64Data = await convertImageToBase64(attachment.url);
          const mimeType = attachment.type || 'image/jpeg';
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        } catch (error) {
          console.error('Failed to process image attachment:', error);
          // Add as text fallback
          parts.push({ text: `[Image: ${attachment.name}]` });
        }
      } else {
        // Non-image files as text reference
        parts.push({ text: `[File: ${attachment.name}](${attachment.url})` });
      }
    }
  }
  
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

        const modelInfo = getModelById(model);
        const isReasoningModel = modelInfo?.isReasoningModel || model.startsWith('o1') || model.startsWith('o4');
        const supportsThinkingStream = modelInfo?.supportsThinkingStream || false;
        const isGrokModel = model.startsWith('grok');
        
        if (isReasoningModel) {
          if (supportsThinkingStream) {
            const streamConfig: OpenAI.Chat.ChatCompletionCreateParams & { stream: true; stream_options?: { include_usage?: boolean } } = {
              model,
              messages: openaiMessages,
              stream: true,
              ...(isGrokModel && {
                reasoning_effort: "medium"  // Grok-specific parameter
              }),
              stream_options: { include_usage: true },
            };

            try {
              const stream = await client.chat.completions.create(streamConfig);

              const readableStream = new ReadableStream({
                async start(controller) {
                  try {
                    for await (const chunk of stream) {
                      const delta = chunk.choices[0]?.delta;
                      
                      if (delta?.content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
                      }
                      
                      // Handle different reasoning formats
                      if ((delta as unknown as { reasoning?: string })?.reasoning) {
                        // OpenAI o1 style reasoning
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: (delta as unknown as { reasoning: string }).reasoning })}\n\n`));
                      }
                      
                      if (isGrokModel && (chunk as unknown as { reasoning?: string })?.reasoning) {
                        // Grok style reasoning
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: (chunk as unknown as { reasoning: string }).reasoning })}\n\n`));
                      }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                  } catch (streamError) {
                    console.error(`${providerName} reasoning streaming error:`, streamError);
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
          } else {
            const config: OpenAI.Chat.ChatCompletionCreateParams = {
              model,
              messages: openaiMessages,
              ...(isGrokModel && {
                reasoning_effort: "medium"
              }),
            };
            
            try {
              const response = await client.chat.completions.create(config) as OpenAI.Chat.ChatCompletion;
              const content = response.choices[0]?.message?.content || '';
              const reasoning = (response.choices[0]?.message as unknown as { reasoning?: string })?.reasoning || '';
              
              const stream = new ReadableStream({
                start(controller) {
                  if (reasoning) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: reasoning })}\n\n`));
                  }
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
          
          const geminiMessages: GeminiMessage[] = [];
          
          // Process messages and handle attachments
          for (const msg of messages.filter((msg: ChatMessage) => msg.role !== 'system')) {
            const parts = await messageToGeminiParts(msg);
            geminiMessages.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: parts,
            });
          }

          // Handle system messages by prepending to first user message
          const systemMessages = messages.filter((msg: ChatMessage) => msg.role === 'system');
          if (systemMessages.length > 0 && geminiMessages.length > 0) {
            const systemContent = systemMessages.map((msg: ChatMessage) => msg.content).join('\n\n');
            const firstUserIndex = geminiMessages.findIndex((msg: GeminiMessage) => msg.role === 'user');
            if (firstUserIndex !== -1) {
              const firstTextPart = geminiMessages[firstUserIndex].parts.find(part => 'text' in part);
              if (firstTextPart && 'text' in firstTextPart) {
                firstTextPart.text = systemContent + '\n\n' + firstTextPart.text;
              } else {
                geminiMessages[firstUserIndex].parts.unshift({ text: systemContent });
              }
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