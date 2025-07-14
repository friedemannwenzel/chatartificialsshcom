import { mutation } from "./_generated/server";

export const removeThemeFromUserPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const allPreferences = await ctx.db.query("userPreferences").collect();
    
    for (const pref of allPreferences) {
      if ('theme' in pref) {
        const { theme, ...cleanPref } = pref as any;
        await ctx.db.replace(pref._id, {
          userId: cleanPref.userId,
          selectedModel: cleanPref.selectedModel,
          lastUsed: cleanPref.lastUsed,
        });
      }
    }
    
    return `Cleaned up ${allPreferences.filter(p => 'theme' in p).length} records`;
  },
}); 