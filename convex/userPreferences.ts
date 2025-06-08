import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return preferences;
  },
});

export const updateThemePreference = mutation({
  args: {
    userId: v.string(),
    themeId: v.string(),
    syncAcrossDevices: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        themeId: args.themeId,
        syncAcrossDevices: args.syncAcrossDevices ?? existing.syncAcrossDevices ?? false,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        themeId: args.themeId,
        syncAcrossDevices: args.syncAcrossDevices ?? false,
        updatedAt: now,
      });
    }
  },
});

export const updateSyncSetting = mutation({
  args: {
    userId: v.string(),
    syncAcrossDevices: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        syncAcrossDevices: args.syncAcrossDevices,
        updatedAt: now,
      });
    } else {
      // If no preferences exist, create with default theme and sync setting
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        themeId: "default",
        syncAcrossDevices: args.syncAcrossDevices,
        updatedAt: now,
      });
    }
  },
}); 