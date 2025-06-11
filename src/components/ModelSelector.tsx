"use client";

import { useState } from "react";
import { Check, ChevronDown, Zap, Brain, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { AI_MODELS, AIModel } from "@/lib/models";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const getModelIcon = (model: AIModel) => {
  if (model.provider === 'google') {
    return <Sparkles className="w-4 h-4" />;
  }
  if (model.id.includes('4o')) {
    return <Eye className="w-4 h-4" />;
  }
  if (model.id.includes('mini')) {
    return <Zap className="w-4 h-4" />;
  }
  return <Brain className="w-4 h-4" />;
};

const getProviderColor = (provider: string) => {
  switch (provider) {
    case 'openai':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'google':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            {getModelIcon(selectedModel)}
            <span className="truncate">{selectedModel.name}</span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getProviderColor(selectedModel.provider)}`}
            >
              {selectedModel.provider.toUpperCase()}
            </Badge>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup heading="OpenAI Models">
              {AI_MODELS.filter(model => model.provider === 'openai').map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onModelChange(model);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model)}
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        selectedModel.id === model.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Google Models">
              {AI_MODELS.filter(model => model.provider === 'google').map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onModelChange(model);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model)}
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        selectedModel.id === model.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 