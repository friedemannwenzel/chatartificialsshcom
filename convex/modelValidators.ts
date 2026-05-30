import { v } from "convex/values";

export const reasoningEffortValidator = v.union(
  v.literal("minimal"),
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("xhigh"),
);

export const selectedModelValidator = v.object({
  id: v.string(),
  name: v.string(),
  provider: v.string(),
  description: v.string(),
  maxTokens: v.optional(v.float64()),
  supportsStreaming: v.boolean(),
  supportsWebSearch: v.optional(v.boolean()),
  capabilities: v.optional(v.array(v.string())),
  isReasoningModel: v.optional(v.boolean()),
  supportsVision: v.optional(v.boolean()),
  supportsFileUpload: v.optional(v.boolean()),
  supportsThinkingStream: v.optional(v.boolean()),
  supportsReasoningEffort: v.optional(v.boolean()),
  defaultReasoningEffort: v.optional(reasoningEffortValidator),
});
