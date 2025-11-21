"use client";

import { Globe, Brain, FileText, Zap, Code, Search, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  {
    icon: Brain,
    title: "Reasoning Models",
    description: "Watch AI think through complex problems with reasoning models that show their thought process.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Globe,
    title: "Web Search",
    description: "Get real-time information from the web. Ask questions and get answers backed by current data.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: FileText,
    title: "File Attachments",
    description: "Upload images, documents, and files. AI can see, read, and analyze your content.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Streaming responses that appear in real-time. No waiting, just instant results.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Code,
    title: "Code Highlighting",
    description: "Beautiful syntax highlighting for code blocks. Copy code with a single click.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Search,
    title: "Search Grounding",
    description: "See exactly where AI found information with source citations and confidence scores.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

export function FeaturesSection() {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleFeatures((prev) => {
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

    const elements = document.querySelectorAll('[data-feature-index]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-[#2C2C2C] mb-6">
            <Sparkles className="w-4 h-4 text-[#A7A7A7]" />
            <span className="text-sm text-[#A7A7A7]">Features</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#A7A7A7] mb-6">
            Everything you need
          </h2>
          <p className="text-xl text-[#5D5D5D] max-w-2xl mx-auto">
            Powerful features that make AI chat feel natural and effortless
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleFeatures.includes(index);

            return (
              <div
                key={index}
                data-feature-index={index}
                className={`
                  group relative p-6 rounded-[20px] border border-[#2C2C2C] bg-[#151515]
                  transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  hover:border-[#A7A7A7] hover:bg-[#1A1A1A] hover:shadow-xl
                  cursor-pointer
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${feature.bgColor} rounded-[20px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#A7A7A7] mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#5D5D5D] text-sm leading-relaxed group-hover:text-[#A7A7A7] transition-colors">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-[#A7A7A7]" />
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-transparent via-transparent to-[#2C2C2C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

