import { AIModel, models } from './models';

export interface UserPreferences {
  selectedModel: AIModel;
  theme: string;
}

export interface CloudSyncOptions {
  userId: string;
  updateCloudPreferences?: (userId: string, preferences: UserPreferences) => Promise<void>;
  getCloudPreferences?: (userId: string) => Promise<UserPreferences | null>;
}

class Storage {
  private readonly SELECTED_MODEL_KEY = 'selectedModel';
  private readonly THEME_KEY = 'theme';

  getSelectedModel(): AIModel {
    if (typeof window === 'undefined') {
      return models[0]; // Default to first model on server
    }
    
    try {
      const stored = localStorage.getItem(this.SELECTED_MODEL_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that the stored model still exists in our models array
        const foundModel = models.find(m => m.id === parsed.id);
        if (foundModel) {
          return foundModel;
        }
      }
    } catch (error) {
      console.error('Error loading selected model:', error);
    }
    
    return models[0]; // Default to first model
  }

  setSelectedModel(model: AIModel, cloudSync?: CloudSyncOptions): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.SELECTED_MODEL_KEY, JSON.stringify(model));
      
      // Sync to cloud if available
      if (cloudSync?.updateCloudPreferences) {
        const preferences: UserPreferences = {
          selectedModel: model,
          theme: this.getTheme(),
        };
        cloudSync.updateCloudPreferences(cloudSync.userId, preferences).catch(console.error);
      }
    } catch (error) {
      console.error('Error saving selected model:', error);
    }
  }

  getTheme(): string {
    if (typeof window === 'undefined') return 'default';
    
    try {
      return localStorage.getItem(this.THEME_KEY) || 'default';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'default';
    }
  }

  setTheme(theme: string, cloudSync?: CloudSyncOptions): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.THEME_KEY, theme);
      
      // Sync to cloud if available
      if (cloudSync?.updateCloudPreferences) {
        const preferences: UserPreferences = {
          selectedModel: this.getSelectedModel(),
          theme,
        };
        cloudSync.updateCloudPreferences(cloudSync.userId, preferences).catch(console.error);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  async loadFromCloud(cloudSync: CloudSyncOptions): Promise<UserPreferences> {
    const localPreferences: UserPreferences = {
      selectedModel: this.getSelectedModel(),
      theme: this.getTheme(),
    };

    if (!cloudSync.getCloudPreferences) {
      return localPreferences;
    }

    try {
      const cloudPreferences = await cloudSync.getCloudPreferences(cloudSync.userId);
      
      if (cloudPreferences) {
        // Merge preferences, preferring cloud data
        const mergedPreferences: UserPreferences = {
          selectedModel: cloudPreferences.selectedModel || localPreferences.selectedModel,
          theme: cloudPreferences.theme || localPreferences.theme,
        };

        // Update local storage with merged preferences
        this.setSelectedModel(mergedPreferences.selectedModel);
        this.setTheme(mergedPreferences.theme);

        return mergedPreferences;
      }
    } catch (error) {
      console.error('Error loading cloud preferences:', error);
    }

    return localPreferences;
  }

  async syncToCloud(cloudSync: CloudSyncOptions): Promise<void> {
    if (!cloudSync.updateCloudPreferences) return;

    try {
      const preferences: UserPreferences = {
        selectedModel: this.getSelectedModel(),
        theme: this.getTheme(),
      };

      await cloudSync.updateCloudPreferences(cloudSync.userId, preferences);
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    }
  }
}

export const storage = new Storage(); 