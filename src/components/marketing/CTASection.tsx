"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function CTASection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#151515] to-[#0A0A0A]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-[#2C2C2C] mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Sparkles className="w-4 h-4 text-[#A7A7A7]" />
          <span className="text-sm text-[#A7A7A7]">Ready to get started?</span>
        </div>

        {/* Heading */}
        <h2 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[#A7A7A7] via-white to-[#A7A7A7] bg-clip-text text-transparent transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Start chatting with AI today
        </h2>

        {/* Description */}
        <p className={`text-xl text-[#5D5D5D] mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Join thousands of users who are already experiencing the future of AI chat. 
          It&apos;s free to get started.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <SignInButton mode="modal">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-[20px] bg-[#151515] hover:bg-[#2C2C2C] border border-[#2C2C2C] text-[#A7A7A7] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-xl group"
            >
              <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </SignInButton>
        </div>

        {/* Features list */}
        <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-[20px] bg-[#151515] border border-[#2C2C2C] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-[#A7A7A7]" />
            </div>
            <h3 className="text-lg font-semibold text-[#A7A7A7] mb-2">Unlimited Chats</h3>
            <p className="text-sm text-[#5D5D5D]">Chat as much as you want</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-[20px] bg-[#151515] border border-[#2C2C2C] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-[#A7A7A7]" />
            </div>
            <h3 className="text-lg font-semibold text-[#A7A7A7] mb-2">All Models</h3>
            <p className="text-sm text-[#5D5D5D]">Access to 15+ AI models</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-[20px] bg-[#151515] border border-[#2C2C2C] flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-[#A7A7A7]" />
            </div>
            <h3 className="text-lg font-semibold text-[#A7A7A7] mb-2">No Credit Card</h3>
            <p className="text-sm text-[#5D5D5D]">Start immediately</p>
          </div>
        </div>
      </div>
    </section>
  );
}

