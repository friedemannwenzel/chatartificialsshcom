import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome to T3 Chat</h1>
              <p className="text-muted-foreground">
                Start a conversation with AI and unlock new possibilities.
              </p>
            </div>

            <div className="grid gap-4 text-left">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">AI-Powered Conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with advanced language models for any task
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Real-time Responses</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant, streaming responses to your questions
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Click the + button in the sidebar to start a new conversation
            </p>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2">T3 Chat</h1>
              <p className="text-muted-foreground text-lg">
                The ultimate AI chat experience
              </p>
            </div>

            <SignInButton mode="modal">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </SignInButton>

            <p className="text-sm text-muted-foreground mt-4">
              Sign in to start chatting with AI
            </p>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
