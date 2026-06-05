"use client";

import { useState, useEffect } from "react";
import { Brain, Eye, FileText } from "lucide-react";
import { models } from "@/lib/models";
import { ProviderIcon } from "@/components/ProviderIcon";

const providerLabels: Record<string, string> = {
  openai: "OpenAI",
  google: "Google",
  anthropic: "Anthropic",
  xai: "Grok",
};

export function ModelsSection() {
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [visibleModels, setVisibleModels] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-model-index') || '0');
            setVisibleModels((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index];
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-model-index]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selectedProvider]);

  const providers = Array.from(new Set(models.map(m => m.provider)));
  const filteredModels = selectedProvider === "all" 
    ? models 
    : models.filter(m => m.provider === selectedProvider);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-[#A7A7A7] mb-6">
            Choose your AI
          </h2>
          <p className="text-xl text-[#5D5D5D] max-w-2xl mx-auto">
            Access the world&apos;s most advanced AI models from multiple providers
          </p>
        </div>

        {/* Provider filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedProvider("all")}
            className={`
              px-6 py-3 rounded-[20px] border transition-all duration-200
              ${selectedProvider === "all"
                ? "bg-[#151515] border-[#A7A7A7] text-[#A7A7A7]"
                : "bg-[#0A0A0A] border-[#2C2C2C] text-[#5D5D5D] hover:border-[#5D5D5D]"
              }
            `}
          >
            All Models
          </button>
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`
                px-6 py-3 rounded-[20px] border transition-all duration-200 flex items-center gap-2
                ${selectedProvider === provider
                  ? "bg-[#151515] border-[#A7A7A7] text-[#A7A7A7]"
                  : "bg-[#0A0A0A] border-[#2C2C2C] text-[#5D5D5D] hover:border-[#5D5D5D]"
                }
              `}
            >
              <ProviderIcon provider={provider} size={20} className="w-5 h-5" inverted />
              {providerLabels[provider]}
            </button>
          ))}
        </div>

        {/* Models grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model, index) => {
            const isVisible = visibleModels.includes(index);
            return (
              <div
                key={model.id}
                data-model-index={index}
                className={`
                  group relative p-6 rounded-[20px] border border-[#2C2C2C] bg-[#151515]
                  transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  hover:border-[#A7A7A7] hover:bg-[#1A1A1A] hover:shadow-xl
                  cursor-pointer
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[20px] bg-[#0A0A0A] border border-[#2C2C2C] flex items-center justify-center">
                      <ProviderIcon provider={model.provider} size={24} className="w-6 h-6" inverted />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#A7A7A7] group-hover:text-white transition-colors">
                        {model.name}
                      </h3>
                      <p className="text-xs text-[#5D5D5D]">{providerLabels[model.provider]}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#5D5D5D] mb-4 group-hover:text-[#A7A7A7] transition-colors">
                  {model.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {model.isReasoningModel && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <Brain className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400">Reasoning</span>
                    </div>
                  )}
                  {model.supportsVision && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <Eye className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Vision</span>
                    </div>
                  )}
                  {model.supportsFileUpload && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <FileText className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400">Files</span>
                    </div>
                  )}
                  {model.supportsWebSearch && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-xs text-yellow-400">Web Search</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {model.maxTokens && (
                  <div className="pt-4 border-t border-[#2C2C2C]">
                    <div className="text-xs text-[#5D5D5D]">
                      Max tokens: <span className="text-[#A7A7A7] font-medium">
                        {model.maxTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-transparent via-transparent to-[#2C2C2C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

