"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#151515] via-[#0A0A0A] to-[#151515]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-[#2C2C2C] mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Sparkles className="w-4 h-4 text-[#A7A7A7]" />
          <span className="text-sm text-[#A7A7A7]">The ultimate AI chat experience</span>
        </div>

        {/* Main heading */}
        <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-[#A7A7A7] via-white to-[#A7A7A7] bg-clip-text text-transparent transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          ArtificialSSH Chat
        </h1>

        {/* Subheading */}
        <p className={`text-xl md:text-2xl text-[#5D5D5D] mb-4 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Chat with the world&apos;s most advanced AI models. 
          <span className="text-[#A7A7A7]"> Fast, intelligent, and beautifully designed.</span>
        </p>

        <p className={`text-lg text-[#5D5D5D] mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Multiple providers, web search, file attachments, and reasoning models—all in one place.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <SignInButton mode="modal">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-[20px] bg-[#151515] hover:bg-[#2C2C2C] border border-[#2C2C2C] text-[#A7A7A7] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </SignInButton>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-14 px-8 text-lg rounded-[20px] border-[#2C2C2C] text-[#A7A7A7] hover:bg-[#151515] hover:border-[#A7A7A7] transition-all duration-200 hover:scale-105"
            onClick={() => {
              document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Zap className="w-5 h-5 mr-2" />
            See it in action
          </Button>
        </div>

        {/* Stats */}
        <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#A7A7A7] mb-2">15+</div>
            <div className="text-sm text-[#5D5D5D]">AI Models</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#A7A7A7] mb-2">4</div>
            <div className="text-sm text-[#5D5D5D]">Providers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#A7A7A7] mb-2">∞</div>
            <div className="text-sm text-[#5D5D5D]">Possibilities</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#2C2C2C] rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-[#A7A7A7] rounded-full" />
        </div>
      </div>
    </section>
  );
}

