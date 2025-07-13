"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { models, AIModel } from "@/lib/models";
import Image from "next/image";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  className?: string;
}

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai':
      return "/OpenAI.svg";
    case 'google':
      return "/Gemini.svg";
    case 'anthropic':
      return "/Anthropic.svg";
    case 'xai':
      return "/Xai.svg";
    default:
      return null;
  }
};

export function ModelSelector({ selectedModel, onModelChange, className = "" }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const providerLabels = {
    openai: "OpenAI",
    google: "Google",
    anthropic: "Anthropic",
    xai: "xAI",
  };

  const handleModelSelect = (model: AIModel) => {
    onModelChange(model);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 text-sm font-medium hover:bg-muted/50 justify-between min-w-[120px]"
      >
        <div className="flex items-center gap-2">
          {getProviderIcon(selectedModel.provider) && (
            <Image
              src={getProviderIcon(selectedModel.provider)!}
              alt={selectedModel.provider}
              width={16}
              height={16}
              className="w-4 h-4"
            />
          )}
          <span>{selectedModel.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50">
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(groupedModels).map(([provider, providerModels]) => (
                <div key={provider} className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                    {getProviderIcon(provider) && (
                      <Image
                        src={getProviderIcon(provider)!}
                        alt={provider}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    )}
                    {providerLabels[provider as keyof typeof providerLabels]}
                  </div>
                  {providerModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-md text-left transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                      {selectedModel.id === model.id && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 