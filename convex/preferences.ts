import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { selectedModelValidator } from "./modelValidators";

// Get user preferences
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

// Set user preferences
export const setUserPreferences = mutation({
  args: {
    userId: v.string(),
    selectedModel: selectedModelValidator,
  },
  handler: async (ctx, args) => {
    const existingPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existingPreferences) {
      await ctx.db.patch(existingPreferences._id, {
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

// Update selected model only
export const updateSelectedModel = mutation({
  args: {
    userId: v.string(),
    selectedModel: selectedModelValidator,
  },
  handler: async (ctx, args) => {
    const existingPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existingPreferences) {
      // Update existing preferences
      await ctx.db.patch(existingPreferences._id, {
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    } else {
      // Create new preferences
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        selectedModel: args.selectedModel,
        lastUsed: now,
      });
    }
  },
}); 
