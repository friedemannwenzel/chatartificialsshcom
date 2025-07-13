import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return preferences;
  },
});

export const setUserPreferences = mutation({
  args: {
    userId: v.string(),
    selectedModel: v.object({
      id: v.string(),
      name: v.string(),
      provider: v.string(),
      description: v.string(),
      maxTokens: v.optional(v.number()),
      supportsStreaming: v.boolean(),
      supportsWebSearch: v.optional(v.boolean()),
      capabilities: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    }
  },
});

export const updateSelectedModel = mutation({
  args: {
    userId: v.string(),
    selectedModel: v.object({
      id: v.string(),
      name: v.string(),
      provider: v.string(),
      description: v.string(),
      maxTokens: v.optional(v.number()),
      supportsStreaming: v.boolean(),
      supportsWebSearch: v.optional(v.boolean()),
      capabilities: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    }
  },
}); 