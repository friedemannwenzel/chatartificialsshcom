"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const providers = [
  {
    name: "OpenAI",
    logo: "/OpenAI.svg",
    description: "GPT-5, GPT-4o, and more",
  },
  {
    name: "Google",
    logo: "/Gemini.svg",
    description: "Gemini 2.5 Flash and variants",
  },
  {
    name: "Anthropic",
    logo: "/Anthropic.svg",
    description: "Claude models",
  },
  {
    name: "Grok",
    logo: "/Grok_dark.svg",
    description: "Grok 4 Fast and Grok 3 Mini",
  },
];

export function PoweredBySection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-[#5D5D5D] uppercase tracking-wider mb-4">
            Powered by
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#A7A7A7] mb-4">
            World's Leading AI Labs
          </h2>
          <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto">
            Access the most advanced AI models from industry leaders
          </p>
        </div>

        {/* Provider logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {providers.map((provider, index) => (
            <div
              key={provider.name}
              className={`
                flex flex-col items-center justify-center p-6 rounded-[20px] border border-[#2C2C2C] bg-[#151515]
                transition-all duration-700 ease-out hover:border-[#A7A7A7] hover:bg-[#1A1A1A]
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={80}
                  height={80}
                  className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#A7A7A7] mb-1">
                {provider.name}
              </h3>
              <p className="text-xs text-[#5D5D5D] text-center">
                {provider.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

