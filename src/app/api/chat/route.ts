import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { getModelById } from '@/lib/models';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

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

type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
type ResponseInputMessage = {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: Array<
    | { type: 'input_text'; text: string }
    | { type: 'input_image'; image_url: string; detail?: 'auto' }
    | { type: 'input_file'; file_url: string; filename: string }
  >;
};

// Reuse clients across requests (module-level singletons)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const xaiClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const STREAM_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Connection': 'keep-alive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

function getRateLimitServerSecret() {
  const secret = process.env.RATE_LIMIT_SERVER_SECRET;
  if (!secret) {
    throw new Error('Missing RATE_LIMIT_SERVER_SECRET');
  }
  return secret;
}

function hasValidUsageLimitPassword(password: unknown) {
  const configuredPassword = process.env.USAGE_LIMIT_PASSWORD;
  if (typeof password !== 'string' || password.length === 0 || !configuredPassword) {
    return false;
  }

  const passwordBuffer = Buffer.from(password);
  const configuredBuffer = Buffer.from(configuredPassword);
  return passwordBuffer.length === configuredBuffer.length && timingSafeEqual(passwordBuffer, configuredBuffer);
}

// Use a function to create fresh regex each time (global regex has mutable lastIndex)
function getImageRegex() {
  return /!\[[^\]]*\]\(([^)]+)\)/g;
}

function markdownToOpenAIParts(md: string): Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> {
  const parts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [];
  const regex = getImageRegex();
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(md)) !== null) {
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

type ChatAttachment = NonNullable<ChatMessage['attachments']>[number];

function isImageAttachment(attachment: ChatAttachment) {
  return attachment.type?.startsWith("image/") ||
    (!attachment.type && [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].some(ext =>
      attachment.name.toLowerCase().endsWith(ext)
    ));
}

function messageToOpenAIResponseInput(message: ChatMessage): ResponseInputMessage {
  const content: ResponseInputMessage['content'] = [];
  const imageUrls = new Set<string>();
  let textContent = message.content;
  const regex = getImageRegex();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(message.content)) !== null) {
    imageUrls.add(match[1]);
  }

  if (message.attachments?.length) {
    textContent = textContent.replace(getImageRegex(), '').trim();
  }

  if (textContent) {
    content.push({ type: 'input_text', text: textContent });
  }

  for (const url of imageUrls) {
    content.push({ type: 'input_image', image_url: url, detail: 'auto' });
  }

  if (message.attachments?.length) {
    for (const attachment of message.attachments) {
      if (isImageAttachment(attachment)) {
        if (!imageUrls.has(attachment.url)) {
          content.push({ type: 'input_image', image_url: attachment.url, detail: 'auto' });
        }
      } else {
        content.push({ type: 'input_file', file_url: attachment.url, filename: attachment.name });
      }
    }
  }

  if (content.length === 0) {
    content.push({ type: 'input_text', text: '' });
  }

  return {
    role: message.role === 'system' ? 'developer' : message.role,
    content,
  };
}

function extractDeltaText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(extractDeltaText).join('');
  }
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return extractDeltaText(object.text ?? object.content ?? object.delta ?? object.value);
  }
  return '';
}

function extractGrokReasoning(delta: unknown, chunk?: unknown): string {
  const sources = [delta, chunk];
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    const object = source as Record<string, unknown>;
    const text = extractDeltaText(
      object.reasoning_content ??
      object.reasoning ??
      object.reasoning_delta ??
      object.thinking ??
      object.thinking_delta
    );
    if (text) return text;
  }
  return '';
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

  let textContent = message.content;
  if (message.attachments && message.attachments.length > 0) {
    textContent = textContent.replace(getImageRegex(), '').trim();
  }

  if (textContent) {
    parts.push({ text: textContent });
  }

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
          parts.push({ text: `[Image: ${attachment.name}]` });
        }
      } else {
        parts.push({ text: `[File: ${attachment.name}](${attachment.url})` });
      }
    }
  }

  return parts;
}

function messageToAnthropicContent(message: ChatMessage): Anthropic.MessageCreateParams['messages'][0]['content'] {
  const regex = getImageRegex();
  const hasImages = regex.test(message.content);

  if (!hasImages && (!message.attachments || message.attachments.length === 0)) {
    return message.content;
  }

  const parts: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [];
  const imageRegex = getImageRegex();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(message.content)) !== null) {
    const [fullMatch, url] = match;
    const { index } = match;
    if (index! > lastIndex) {
      const text = message.content.slice(lastIndex, index).trim();
      if (text) parts.push({ type: 'text', text });
    }
    parts.push({
      type: 'image',
      source: { type: 'url', url },
    });
    lastIndex = index! + fullMatch.length;
  }

  if (lastIndex < message.content.length) {
    const text = message.content.slice(lastIndex).trim();
    if (text) parts.push({ type: 'text', text });
  }

  if (message.attachments) {
    for (const attachment of message.attachments) {
      const isImage = attachment.type?.startsWith("image/") ||
        (!attachment.type && [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].some(ext =>
          attachment.name.toLowerCase().endsWith(ext)
        ));
      if (isImage) {
        parts.push({
          type: 'image',
          source: { type: 'url', url: attachment.url },
        });
      }
    }
  }

  if (parts.length === 0) return message.content;
  return parts;
}

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      model = 'gemini-2.0-flash',
      webSearch = false,
      usageLimitPassword,
      reasoningEffort,
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
    const hasUsageLimitPassword = typeof usageLimitPassword === 'string' && usageLimitPassword.length > 0;
    const isUsageLimitPasswordValid = hasValidUsageLimitPassword(usageLimitPassword);

    if (hasUsageLimitPassword && !isUsageLimitPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid usage password.' },
        { status: 401 }
      );
    }

    if (!isUsageLimitPasswordValid) {
      try {
        await convex.mutation(api.rateLimiting.incrementMessageCount, {
          userId,
          serverSecret: getRateLimitServerSecret(),
        });
        rateLimitIncremented = true;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('Rate limit exceeded')) {
          throw error;
        }

        const rateLimit = await convex.query(api.rateLimiting.checkRateLimit, { userId });
        const resetDate = new Date(rateLimit.resetDate).toLocaleDateString();
        return NextResponse.json(
          { error: `Rate limit exceeded. You have used ${rateLimit.currentCount}/${rateLimit.limit} messages this week. Your limit resets on ${resetDate}.` },
          { status: 429 }
        );
      }
    }

    const isOpenAI = model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o4') || model.startsWith('gpt-5');
    const isGemini = model.startsWith('gemini');
    const isXAI = model.startsWith('grok');
    const isAnthropic = model.startsWith('claude');

    if (!isOpenAI && !isGemini && !isXAI && !isAnthropic) {
      return NextResponse.json({ error: 'Unsupported model provider' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    try {
      // ── Anthropic (Claude) ──
      if (isAnthropic) {
        const systemMessages = messages.filter((msg: ChatMessage) => msg.role === 'system');
        const systemPrompt = systemMessages.length > 0
          ? systemMessages.map((msg: ChatMessage) => msg.content).join('\n\n')
          : undefined;

        const anthropicMessages: Anthropic.MessageCreateParams['messages'] = messages
          .filter((msg: ChatMessage) => msg.role !== 'system')
          .map((msg: ChatMessage) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.role === 'user' ? messageToAnthropicContent(msg) : msg.content,
          }));

        try {
          const stream = anthropicClient.messages.stream({
            model,
            max_tokens: 8192,
            messages: anthropicMessages,
            ...(systemPrompt && { system: systemPrompt }),
          });

          const readableStream = new ReadableStream({
            async start(controller) {
              try {
                for await (const event of stream) {
                  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (streamError) {
                console.error('Anthropic streaming error:', streamError);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            },
          });

          return new Response(readableStream, { headers: STREAM_HEADERS });
        } catch (apiError) {
          console.error('Anthropic API error:', apiError);
          await rollbackRateLimit(rateLimitIncremented, userId);
          const errorMessage = getProviderErrorMessage(apiError as APIError, 'Anthropic');
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        }
      }

      // ── OpenAI / xAI ──
      if (isOpenAI || isXAI) {
        const client = isXAI ? xaiClient : openai;
        const providerName = isXAI ? 'xAI' : 'OpenAI';
        const modelInfo = getModelById(model);
        const requestedReasoningEffort = (reasoningEffort || modelInfo?.defaultReasoningEffort || 'medium') as ReasoningEffort;
        const chatReasoningEffort = requestedReasoningEffort === 'minimal' ? 'low' : requestedReasoningEffort;

        if (isOpenAI) {
          const input = messages.map((msg: ChatMessage) => messageToOpenAIResponseInput(msg));
          const supportsReasoning = modelInfo?.supportsReasoningEffort || model.startsWith('o') || model.startsWith('gpt-5');
          const responseConfig: Record<string, unknown> = {
            model,
            input,
            stream: true,
            store: false,
            ...(supportsReasoning && {
              reasoning: {
                effort: requestedReasoningEffort,
                summary: 'auto',
              },
            }),
            ...(webSearch && {
              tools: [{ type: 'web_search_preview' }],
            }),
          };

          try {
            const stream = await openai.responses.create(responseConfig as unknown as OpenAI.Responses.ResponseCreateParamsStreaming);

            const readableStream = new ReadableStream({
              async start(controller) {
                try {
                  for await (const event of stream as AsyncIterable<Record<string, unknown>>) {
                    const type = event.type;
                    if (
                      typeof type === 'string' &&
                      (type.includes('web_search') || type.includes('web_search_call'))
                    ) {
                      const status = type.endsWith('.completed') ? 'completed' : 'searching';
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ searchStatus: status })}\n\n`));
                    }
                    if (type === 'response.output_text.delta') {
                      const content = extractDeltaText(event.delta);
                      if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                    if (
                      type === 'response.reasoning_summary_text.delta' ||
                      type === 'response.reasoning_text.delta'
                    ) {
                      const thinking = extractDeltaText(event.delta);
                      if (thinking) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking })}\n\n`));
                    }
                    if (type === 'response.failed' || type === 'error') {
                      const error = event.error as { message?: string } | undefined;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error?.message || 'OpenAI response failed' })}\n\n`));
                    }
                  }
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                } catch (streamError) {
                  console.error('OpenAI Responses streaming error:', streamError);
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                }
              },
            });

            return new Response(readableStream, { headers: STREAM_HEADERS });
          } catch (apiError) {
            console.error('OpenAI Responses API error:', apiError);
            await rollbackRateLimit(rateLimitIncremented, userId);
            const errorMessage = getProviderErrorMessage(apiError as APIError, 'OpenAI');
            return NextResponse.json({ error: errorMessage }, { status: 503 });
          }
        }

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

        const isReasoningModel = modelInfo?.isReasoningModel || model.startsWith('o1') || model.startsWith('o4');
        const supportsThinkingStream = modelInfo?.supportsThinkingStream || false;
        const supportsReasoningEffort = !!modelInfo?.supportsReasoningEffort;

        if (isReasoningModel) {
          if (supportsThinkingStream) {
            const streamConfig = {
              model,
              messages: openaiMessages,
              stream: true,
              ...(supportsReasoningEffort && {
                reasoning_effort: chatReasoningEffort,
                reasoning: { effort: requestedReasoningEffort }
              }),
              stream_options: { include_usage: true },
            } as OpenAI.Chat.ChatCompletionCreateParamsStreaming & { stream_options?: { include_usage?: boolean } };

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

                      const reasoning = extractGrokReasoning(delta, chunk);
                      if (reasoning) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: reasoning })}\n\n`));
                      }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                  } catch (streamError) {
                    console.error(`${providerName} reasoning streaming error:`, streamError);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                  }
                },
              });

              return new Response(readableStream, { headers: STREAM_HEADERS });
            } catch (apiError) {
              console.error(`${providerName} API error:`, apiError);
              await rollbackRateLimit(rateLimitIncremented, userId);

              const errorMessage = getProviderErrorMessage(apiError as APIError, providerName);
              return NextResponse.json({ error: errorMessage }, { status: 503 });
            }
          } else {
            const config = {
              model,
              messages: openaiMessages,
              ...(supportsReasoningEffort && {
                reasoning_effort: chatReasoningEffort,
                reasoning: { effort: requestedReasoningEffort }
              }),
            } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming;

            try {
              const response = await client.chat.completions.create(config) as OpenAI.Chat.ChatCompletion;
              const content = response.choices[0]?.message?.content || '';
              const reasoning = extractGrokReasoning(response.choices[0]?.message);

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

              return new Response(stream, { headers: STREAM_HEADERS });
            } catch (apiError) {
              console.error(`${providerName} API error:`, apiError);
              await rollbackRateLimit(rateLimitIncremented, userId);

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
                  const delta = chunk.choices[0]?.delta;
                  const content = extractDeltaText(delta?.content);
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                  const reasoning = extractGrokReasoning(delta, chunk);
                  if (reasoning) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: reasoning })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (streamError) {
                console.error(`${providerName} streaming error:`, streamError);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            },
          });

          return new Response(readableStream, { headers: STREAM_HEADERS });
        } catch (apiError) {
          console.error(`${providerName} API error:`, apiError);
          await rollbackRateLimit(rateLimitIncremented, userId);

          const errorMessage = getProviderErrorMessage(apiError as APIError, providerName);
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        }
      }

      // ── Gemini ──
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

          for (const msg of messages.filter((msg: ChatMessage) => msg.role !== 'system')) {
            const parts = await messageToGeminiParts(msg);
            geminiMessages.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: parts,
            });
          }

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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            },
          });

          return new Response(stream, { headers: STREAM_HEADERS });
        } catch (apiError) {
          console.error('Gemini API error:', apiError);
          await rollbackRateLimit(rateLimitIncremented, userId);

          const errorMessage = getProviderErrorMessage(apiError as APIError, 'Google Gemini');
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        }
      }
    } catch (unexpectedError) {
      console.error('Unexpected error in chat processing:', unexpectedError);
      await rollbackRateLimit(rateLimitIncremented, userId);
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

async function rollbackRateLimit(wasIncremented: boolean, userId: string) {
  if (!wasIncremented) return;
  try {
    await convex.mutation(api.rateLimiting.decrementMessageCount, {
      userId,
      serverSecret: getRateLimitServerSecret(),
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
