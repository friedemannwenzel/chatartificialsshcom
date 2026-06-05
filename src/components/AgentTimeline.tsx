"use client";

import { useState, useEffect, useRef, type ComponentType } from "react";
import {
  Brain,
  Globe,
  Search,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GroundingChunk {
  web?: { uri: string; title: string };
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: unknown[];
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent: string };
}

interface AgentTimelineProps {
  /** Persisted reasoning text from a saved assistant message. */
  reasoningContent?: string;
  /** Live reasoning text while the model is thinking. */
  liveReasoning?: string;
  /** True while the model is actively reasoning. */
  reasoningActive?: boolean;
  /** True while a web search is in flight. */
  searchActive?: boolean;
  /** Grounding/search results (persisted or streamed). */
  groundingMetadata?: GroundingMetadata | null;
}

/** Counts up whole seconds while `active` is true; resets when it flips off. */
function useElapsed(active?: boolean) {
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startedAt.current = null;
      return;
    }
    startedAt.current = Date.now();
    setSeconds(0);
    const id = setInterval(() => {
      if (startedAt.current) {
        setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  return seconds;
}

interface AgentStepProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  meta?: string;
  active?: boolean;
  hasContent?: boolean;
  children?: React.ReactNode;
}

function AgentStep({
  icon: Icon,
  label,
  meta,
  active = false,
  hasContent = false,
  children,
}: AgentStepProps) {
  const [open, setOpen] = useState(false);
  // While the step is active it stays expanded to reveal the live stream;
  // once it settles it collapses back to whatever the user chose.
  const expanded = (open || active) && hasContent;

  return (
    <div className="relative animate-step-in">
      {/* node sitting on the timeline rail */}
      <span
        className={cn(
          "absolute left-1 top-[7px] z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-app",
          active ? "border-line-strong animate-node-pulse" : "border-line"
        )}
      >
        <Icon className={cn("h-3 w-3", active ? "text-ink" : "text-faint")} />
      </span>

      <button
        type="button"
        onClick={() => hasContent && setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-2 py-1.5 pl-9 pr-1 text-left",
          hasContent ? "hover:cursor-pointer" : "cursor-default"
        )}
      >
        <span
          className={cn(
            "text-[13px] font-medium tracking-tight",
            active ? "text-shimmer" : "text-dim group-hover:text-body"
          )}
        >
          {label}
        </span>
        {meta && <span className="text-xs text-faint tabular-nums">{meta}</span>}
        {hasContent && (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-faint transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
        )}
        {active && !hasContent && (
          <Loader2 className="h-3 w-3 animate-spin text-dim" />
        )}
      </button>

      {expanded && <div className="animate-reveal pb-2 pl-9 pr-1">{children}</div>}
    </div>
  );
}

export function AgentTimeline({
  reasoningContent,
  liveReasoning,
  reasoningActive = false,
  searchActive = false,
  groundingMetadata,
}: AgentTimelineProps) {
  const elapsed = useElapsed(reasoningActive);

  const reasoningText = liveReasoning ?? reasoningContent ?? "";
  const showReasoning = reasoningActive || reasoningText.length > 0;

  const webSources = (groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk?.web)
    .filter((web): web is { uri: string; title: string } => Boolean(web))
    .filter(
      (source, index, self) =>
        index === self.findIndex((s) => s.uri === source.uri)
    );
  const queries = groundingMetadata?.webSearchQueries ?? [];
  const showSearch = searchActive || webSources.length > 0;

  if (!showReasoning && !showSearch) return null;

  const stepCount = (showSearch ? 1 : 0) + (showReasoning ? 1 : 0);

  return (
    <div className="relative my-2 w-full max-w-[680px]">
      {/* the vertical rail connecting the nodes */}
      {stepCount > 1 && (
        <span className="absolute left-[14px] top-4 bottom-4 w-px -translate-x-1/2 bg-line" />
      )}

      {showSearch && (
        <AgentStep
          icon={Globe}
          label={searchActive ? "Searching the web" : "Searched the web"}
          meta={
            !searchActive && webSources.length > 0
              ? `${webSources.length} source${webSources.length === 1 ? "" : "s"}`
              : undefined
          }
          active={searchActive}
          hasContent={webSources.length > 0 || queries.length > 0}
        >
          <div className="space-y-3 rounded-xl border border-line bg-panel/60 p-3">
            {queries.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {queries.map((query, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-2.5 py-1 text-xs text-dim"
                  >
                    <Search className="h-3 w-3 text-faint" />
                    {query}
                  </span>
                ))}
              </div>
            )}
            {webSources.length > 0 && (
              <div className="space-y-0.5">
                {webSources.map((source, index) => {
                  let host = source.uri;
                  try {
                    host = new URL(source.uri).hostname.replace(/^www\./, "");
                  } catch {
                    /* keep raw uri */
                  }
                  return (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-elevated"
                    >
                      <span className="mt-0.5 min-w-[1.25rem] font-mono text-xs text-faint">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-body group-hover:text-ink">
                          {source.title || host}
                        </span>
                        <span className="block truncate text-xs text-faint">
                          {host}
                        </span>
                      </span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </AgentStep>
      )}

      {showReasoning && (
        <AgentStep
          icon={Brain}
          label={reasoningActive ? "Thinking" : "Thought process"}
          meta={reasoningActive && elapsed > 0 ? `${elapsed}s` : undefined}
          active={reasoningActive}
          hasContent={reasoningText.length > 0}
        >
          <div className="max-h-[360px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-panel/60 px-3.5 py-3 text-[13px] leading-6 text-dim">
            {reasoningText}
          </div>
        </AgentStep>
      )}
    </div>
  );
}
