import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

type UserPreferenceWithTheme = Doc<"userPreferences"> & { theme?: unknown };

export const removeThemeFromUserPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const allPreferences = await ctx.db.query("userPreferences").collect();
    
    for (const pref of allPreferences) {
      if ('theme' in pref) {
        const { theme: _theme, ...cleanPref } = pref as UserPreferenceWithTheme;
        void _theme;
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
