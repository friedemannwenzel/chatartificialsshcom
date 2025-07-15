"use client";

import { useState } from "react";
import { Globe, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface GroundingSupport {
  segment: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
  groundingChunkIndices: number[];
  confidenceScores: number[];
}

interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports: GroundingSupport[];
  webSearchQueries: string[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

interface SearchGroundingDetailsProps {
  groundingMetadata: GroundingMetadata;
}

export function SearchGroundingDetails({ groundingMetadata }: SearchGroundingDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!groundingMetadata || !groundingMetadata.groundingChunks || groundingMetadata.groundingChunks.length === 0) {
    return null;
  }

  const webSources = groundingMetadata.groundingChunks
    .filter(chunk => chunk && chunk.web)
    .map(chunk => chunk.web!)
    .filter((source, index, self) => 
      index === self.findIndex(s => s.uri === source.uri)
    );

  if (webSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            {isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Globe className="w-3 h-3" />
            Search Grounding Details
            <Badge variant="secondary" className="text-xs ml-1">
              {webSources.length}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Search Queries:
              </span>
              <div className="flex flex-wrap gap-1">
                {groundingMetadata.webSearchQueries.map((query, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Sources ({webSources.length}):
              </div>
              {webSources.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5 min-w-[1.5rem]">
                    [{index + 1}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate group-hover:text-blue-900 dark:group-hover:text-blue-100">
                      {source.title}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      {source.uri}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </a>
              ))}
              {groundingMetadata.searchEntryPoint?.renderedContent && (
                <div
                  className="mt-3"
                  dangerouslySetInnerHTML={{ __html: groundingMetadata.searchEntryPoint.renderedContent }}
                />
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
} 