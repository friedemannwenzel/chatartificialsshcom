"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, ArrowUp, Globe, Brain, Paperclip } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
}

const demoMessages: Message[] = [
  {
    role: "user",
    content: "Explain quantum computing in simple terms",
  },
  {
    role: "assistant",
    content: "Quantum computing uses quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously, allowing quantum computers to explore many possibilities at once.\n\n**Key concepts:**\n- **Superposition**: Qubits can be in multiple states at the same time\n- **Entanglement**: Qubits can be correlated in ways classical bits cannot\n- **Interference**: Quantum states can amplify correct answers and cancel wrong ones\n\nThis makes quantum computers potentially much faster for certain problems like factoring large numbers or simulating quantum systems.",
    thinking: "The user wants a simple explanation of quantum computing. I should break down complex concepts into digestible parts, use analogies where helpful, and structure the response clearly with key concepts highlighted.",
  },
];

export function InteractiveDemoSection() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startDemo = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentMessageIndex(0);
    setStreamedContent("");
    setShowThinking(false);
    setIsStreaming(false);

    // Show user message
    setTimeout(() => {
      setIsStreaming(true);
      setShowThinking(true);
      
      // Stream thinking
      const thinkingText = demoMessages[0].thinking || "";
      let thinkingIndex = 0;
      const thinkingInterval = setInterval(() => {
        if (thinkingIndex < thinkingText.length) {
          setStreamedContent(thinkingText.slice(0, thinkingIndex + 1));
          thinkingIndex++;
        } else {
          clearInterval(thinkingInterval);
          setTimeout(() => {
            setShowThinking(false);
            setStreamedContent("");
            
            // Stream assistant response
            const responseText = demoMessages[0].content;
            let responseIndex = 0;
            const responseInterval = setInterval(() => {
              if (responseIndex < responseText.length) {
                setStreamedContent(responseText.slice(0, responseIndex + 1));
                responseIndex++;
              } else {
                clearInterval(responseInterval);
                setIsStreaming(false);
                setTimeout(() => {
                  setIsPlaying(false);
                }, 2000);
              }
            }, 15);
          }, 1000);
        }
      }, 30);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <section id="demo" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-[#A7A7A7] mb-6">
            See it in action
          </h2>
          <p className="text-xl text-[#5D5D5D] max-w-2xl mx-auto mb-8">
            Experience the power of AI chat with real-time streaming and reasoning
          </p>
          <button
            onClick={startDemo}
            disabled={isPlaying}
            className={`
              px-8 py-4 rounded-[20px] border border-[#2C2C2C] bg-[#151515] text-[#A7A7A7]
              hover:bg-[#2C2C2C] hover:border-[#A7A7A7] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isPlaying ? '' : 'hover:scale-105'}
            `}
          >
            {isPlaying ? "Playing demo..." : "Play Demo"}
          </button>
        </div>

        {/* Demo chat interface */}
        <div className="relative">
          {/* Chat container */}
          <div className="bg-[#151515] border border-[#2C2C2C] rounded-[20px] overflow-hidden shadow-2xl">
            {/* Chat header */}
            <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#A7A7A7]">Demo Chat</div>
                  <div className="text-xs text-[#5D5D5D]">Gemini 2.5 Flash</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-[#5D5D5D]">Online</span>
              </div>
            </div>

            {/* Messages area */}
            <div className="p-6 space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-[#2C2C2C] text-[#A7A7A7] px-4 py-3 rounded-[20px] max-w-[80%]">
                  {demoMessages[0].content.split('\n')[0]}
                </div>
              </div>

              {/* Thinking indicator */}
              {showThinking && (
                <div className="flex justify-start">
                  <div className="bg-[#151515] border border-[#2C2C2C] rounded-[20px] p-4 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Thinking</span>
                    </div>
                    <div className="text-sm text-[#5D5D5D] whitespace-pre-wrap">
                      {streamedContent}
                      <span className="animate-pulse">▊</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assistant message */}
              {!showThinking && streamedContent && (
                <div className="flex justify-start">
                  <div className="text-[#A7A7A7] max-w-[80%] prose prose-sm dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-outside ml-6 space-y-1 mb-3">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {streamedContent}
                    </ReactMarkdown>
                    <span className="animate-pulse">▊</span>
                  </div>
                </div>
              )}

              {/* Static assistant message when done */}
              {!isPlaying && !showThinking && !streamedContent && (
                <div className="flex justify-start">
                  <div className="text-[#A7A7A7] max-w-[80%] prose prose-sm dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-outside ml-6 space-y-1 mb-3">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {demoMessages[0].content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-[#2C2C2C] bg-[#151515]">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-[#2C2C2C] rounded-[20px]">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-[#A7A7A7] placeholder:text-[#5D5D5D] outline-none text-sm"
                    disabled
                  />
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-[#151515] rounded-lg transition-colors" title="Web Search">
                      <Globe className="w-4 h-4 text-[#5D5D5D]" />
                    </button>
                    <button className="p-1.5 hover:bg-[#151515] rounded-lg transition-colors" title="Attach File">
                      <Paperclip className="w-4 h-4 text-[#5D5D5D]" />
                    </button>
                  </div>
                </div>
                <button className="w-10 h-10 flex items-center justify-center bg-[#151515] border border-[#2C2C2C] rounded-full hover:bg-[#2C2C2C] transition-colors">
                  <ArrowUp className="w-4 h-4 text-[#A7A7A7]" />
                </button>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 bg-[#151515] border border-[#2C2C2C] rounded-[20px] px-4 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#A7A7A7]">Streaming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

