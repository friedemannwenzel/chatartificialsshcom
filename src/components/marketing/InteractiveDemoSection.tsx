"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUp, Globe, Brain, Paperclip, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { MessageContent } from "@/components/MessageContent";

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai':
      return "/OpenAI.svg";
    case 'google':
      return "/Gemini.svg";
    case 'anthropic':
      return "/Anthropic.svg";
    case 'xai':
      return "/Grok_dark.svg";
    default:
      return null;
  }
};

// Hardcoded real AI response
const assistantResponse = `Quantum computing is a revolutionary computing paradigm that leverages the principles of quantum mechanics to process information in fundamentally different ways than classical computers.

**The Core Concept:**

Instead of using classical bits (which are either 0 or 1), quantum computers use quantum bits, or "qubits." Qubits can exist in a superposition state, meaning they can be both 0 and 1 simultaneously. This allows quantum computers to explore many possible solutions at once.

**Key Quantum Phenomena:**

1. **Superposition**: A qubit can be in multiple states at the same time, exponentially increasing computational possibilities.

2. **Entanglement**: Qubits can be linked together in such a way that the state of one instantly affects the state of another, regardless of distance.

3. **Quantum Interference**: Quantum states can constructively or destructively interfere, amplifying correct answers while canceling out incorrect ones.

**Why It Matters:**

Quantum computers excel at problems that are intractable for classical computers, such as:
- Factoring large numbers (important for cryptography)
- Simulating quantum systems (useful for drug discovery and materials science)
- Optimizing complex systems (logistics, financial modeling)
- Machine learning acceleration

**Current State:**

While quantum computers show great promise, they're still in early stages. Current quantum computers are prone to errors and require extremely cold temperatures and isolation from environmental interference. However, companies like IBM, Google, and others are making rapid progress toward practical quantum computing.`;

const thinkingText = "The user wants a simple explanation of quantum computing. I should break down complex concepts into digestible parts, use analogies where helpful, and structure the response clearly with key concepts highlighted. I'll explain superposition, entanglement, and practical applications.";

export function InteractiveDemoSection() {
  const [streamedContent, setStreamedContent] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [attachments] = useState([
    { url: "#", name: "diagram.png", type: "image/png" },
  ]);
  const selectedModel = { provider: "google", name: "Gemini 2.5 Flash" };
  const sectionRef = useRef<HTMLDivElement>(null);

  const startDemo = useCallback(() => {
    if (hasPlayed) return;
    setHasPlayed(true);
    setStreamedContent("");
    setShowThinking(false);

    // Show user message, then start thinking
    setTimeout(() => {
      setShowThinking(true);
      
      // Stream thinking
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
            let responseIndex = 0;
            const responseInterval = setInterval(() => {
              if (responseIndex < assistantResponse.length) {
                setStreamedContent(assistantResponse.slice(0, responseIndex + 1));
                responseIndex++;
              } else {
                clearInterval(responseInterval);
              }
            }, 15);
          }, 1000);
        }
      }, 30);
    }, 500);
  }, [hasPlayed]);

  // Auto-play when section comes into view
  useEffect(() => {
    if (hasPlayed || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayed) {
            startDemo();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasPlayed, startDemo]);

  return (
    <section id="demo" ref={sectionRef} className="py-32 px-6 relative overflow-hidden">
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
        </div>

        {/* macOS Window - Simple style */}
        <div className="relative">
          {/* Window chrome */}
          <div className="bg-[#2C2C2C] rounded-t-[12px] px-4 py-3 flex items-center gap-2 border-t border-l border-r border-[#2C2C2C]">
            {/* Traffic lights */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <div className="w-3 h-3 rounded-full bg-[#28CA42] border border-[#1AAB29]" />
            </div>
            {/* Window title */}
            <div className="flex-1 text-center">
              <span className="text-xs text-[#5D5D5D] font-medium">ArtificialSSH Chat</span>
            </div>
            {/* Spacer for symmetry */}
            <div className="w-[52px]" />
          </div>

          {/* Chat container - Fixed height */}
          <div className="bg-background border-l border-r border-b border-[#2C2C2C] rounded-b-[12px] overflow-hidden shadow-2xl h-[600px] flex flex-col">
            {/* Messages area */}
            <div className="flex flex-col h-full relative flex-1 overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pb-40">
                  <div className="space-y-4 max-w-4xl py-4 mx-auto pt-6">
                    {/* User message */}
                    <div className="flex flex-col items-end">
                      <div className="rounded-[20px] py-3 relative group flex items-center justify-center bg-[#2C2C2C] text-[#A7A7A7] px-4">
                        <p className="text-base text-[#A7A7A7]">Explain quantum computing in simple terms</p>
                      </div>
                    </div>

                    {/* Thinking indicator */}
                    {showThinking && (
                      <div className="flex flex-col items-start">
                        <div className="rounded-[20px] pt-3 relative group flex items-center justify-start text-[#A7A7A7] max-w-[80%]">
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-3 text-blue-400">
                              <Brain className="w-4 h-4" />
                              <span className="text-sm font-medium">Thinking</span>
                            </div>
                            <div className="text-sm text-[#5D5D5D] bg-[#0A0A0A] p-3 rounded-[15px] border border-[#2C2C2C]/50 whitespace-pre-wrap break-words">
                              {streamedContent}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assistant message - exact match to real app */}
                    {!showThinking && streamedContent && (
                      <div className="flex flex-col items-start">
                        <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                          <MessageContent content={streamedContent} />
                        </div>
                      </div>
                    )}

                    {/* Static assistant message when done */}
                    {hasPlayed && !showThinking && !streamedContent && (
                      <div className="flex flex-col items-start">
                        <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                          <MessageContent content={assistantResponse} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input area container - matches real app structure */}
              <div className="absolute bottom-0 max-w-4xl mx-auto left-0 right-0">
                {/* Attachments bar - above input bar, separate row */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 py-2 px-6">
                    {attachments.map((file, index) => (
                      <div
                        key={`attachment-${index}`}
                        className="flex items-center gap-2 bg-[#151515] rounded-[20px] px-3 py-3 text-xs border border-[#2C2C2C] shadow-none group hover:cursor-pointer text-[#A7A7A7]"
                      >
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate max-w-32 font-medium">{file.name}</span>
                        <button
                          className="h-4 w-4 p-0 ml-1 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                          tabIndex={-1}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Input Bar - exact match */}
                <div className="relative w-full bg-[#151515] rounded-t-[20px] border-t border-l border-r border-[#2C2C2C] flex flex-col">
                  {/* Textarea */}
                  <div className="w-full px-3 py-1">
                    <Textarea
                      value=""
                      placeholder="Type your message..."
                      disabled
                      className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base text-[#A7A7A7] placeholder:text-muted-foreground px-0"
                      rows={1}
                      style={{
                        background: "transparent",
                        boxShadow: "none",
                        fontSize: "1rem",
                        paddingLeft: 0,
                        paddingRight: 0,
                      }}
                    />
                  </div>
                  <div className="flex items-center w-full px-3 py-1 gap-2">
                    {/* Model Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        className="flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-full border border-[#A7A7A7] bg-[#151515] hover:bg-[#2C2C2C] focus:outline-none transition hover:cursor-pointer text-[#A7A7A7]"
                        style={{ minWidth: 0 }}
                      >
                        {getProviderIcon(selectedModel.provider) && (
                          <Image
                            src={getProviderIcon(selectedModel.provider)!}
                            alt={selectedModel.provider}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="truncate max-w-[100px]">{selectedModel.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Web Search Toggle */}
                    <button
                      type="button"
                      className="flex items-center gap-1 h-8 px-3 text-xs rounded-full border border-[#A7A7A7] bg-[#151515] transition hover:cursor-pointer text-[#A7A7A7]"
                    >
                      <Globe className="w-4 h-4" />
                      Search
                    </button>

                    {/* Upload Button */}
                    <div className="border rounded-[20px] transition-all duration-200 p-2 flex items-center justify-center border-[#A7A7A7] text-[#A7A7A7] hover:bg-[#2C2C2C] hover:cursor-pointer">
                      <Paperclip className="w-4 h-4" />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Send Button */}
                    <button
                      type="button"
                      className="flex items-center justify-center h-8 w-8 rounded-full border border-[#A7A7A7] bg-[#151515] hover:bg-[#2C2C2C] transition p-0 hover:cursor-pointer text-[#A7A7A7]"
                      style={{ marginRight: 0 }}
                    >
                      <ArrowUp className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
