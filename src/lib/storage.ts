import { AIModel, models } from './models';

export interface UserPreferences {
  selectedModel: AIModel;
}

export interface CloudSyncOptions {
  userId: string;
  updateCloudPreferences?: (userId: string, preferences: UserPreferences) => Promise<void>;
  getCloudPreferences?: (userId: string) => Promise<UserPreferences | null>;
}

class Storage {
  private readonly SELECTED_MODEL_KEY = 'selectedModel';
  private readonly PENDING_INITIAL_KEY_PREFIX = 'pendingInitialMessage:';

  getSelectedModel(): AIModel {
    if (typeof window === 'undefined') {
      return models[0];
    }
    
    try {
      const stored = localStorage.getItem(this.SELECTED_MODEL_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const foundModel = models.find(m => m.id === parsed.id);
        if (foundModel) {
          return foundModel;
        }
      }
    } catch (error) {
      console.error('Error loading selected model:', error);
    }
    
    return models[0];
  }

  setSelectedModel(model: AIModel, cloudSync?: CloudSyncOptions): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.SELECTED_MODEL_KEY, JSON.stringify(model));
      
      if (cloudSync?.updateCloudPreferences) {
        const preferences: UserPreferences = {
          selectedModel: model,
        };
        cloudSync.updateCloudPreferences(cloudSync.userId, preferences).catch(console.error);
      }
    } catch (error) {
      console.error('Error saving selected model:', error);
    }
  }

  setPendingInitialMessage(
    chatId: string,
    payload: {
      content: string;
      model: AIModel;
      webSearch?: boolean;
      attachments?: Array<{ url: string; name: string; type: string; size?: number }>
    }
  ): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        this.PENDING_INITIAL_KEY_PREFIX + chatId,
        JSON.stringify(payload)
      );
    } catch (error) {
      console.error('Error saving pending initial message:', error);
    }
  }

  consumePendingInitialMessage(chatId: string): {
    content: string;
    model: AIModel;
    webSearch?: boolean;
    attachments?: Array<{ url: string; name: string; type: string; size?: number }>
  } | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = this.PENDING_INITIAL_KEY_PREFIX + chatId;
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      localStorage.removeItem(key);
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      console.error('Error loading pending initial message:', error);
      return null;
    }
  }

  async loadFromCloud(cloudSync: CloudSyncOptions): Promise<UserPreferences> {
    const localPreferences: UserPreferences = {
      selectedModel: this.getSelectedModel(),
    };

    if (!cloudSync.getCloudPreferences) {
      return localPreferences;
    }

    try {
      const cloudPreferences = await cloudSync.getCloudPreferences(cloudSync.userId);
      if (cloudPreferences) {
        return cloudPreferences;
      }
    } catch (error) {
      console.error('Error loading preferences from cloud:', error);
    }

    return localPreferences;
  }

  async syncToCloud(cloudSync: CloudSyncOptions): Promise<void> {
    if (!cloudSync.updateCloudPreferences) return;

    try {
      const preferences: UserPreferences = {
        selectedModel: this.getSelectedModel(),
      };
      await cloudSync.updateCloudPreferences(cloudSync.userId, preferences);
    } catch (error) {
      console.error('Error syncing preferences to cloud:', error);
    }
  }
}

export const storage = new Storage(); 