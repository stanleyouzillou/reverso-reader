import { useReaderSettings } from "../hooks/useReaderSettings";
import { translationRegistry } from "./translation/TranslationRegistry";

interface TranslationResult {
  text: string;
}

class TranslationService {
  private cache: Record<string, string> = {};

  async translate(text: string, to: string = "fr", context?: string): Promise<TranslationResult> {
    if (!text) {
      throw new Error("No text provided");
    }

    // Get current provider from settings
    const provider = useReaderSettings.getState().translationProvider;
    const cacheKey = `${provider}:${text.trim().toLowerCase()}:${to}`;

    if (this.cache[cacheKey]) {
      return { text: this.cache[cacheKey] };
    }

    // Add a slight delay to prevent flickering
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const service = translationRegistry.getService(provider);
      // Defaulting 'from' to 'en' for now as per previous implementation logic
      // In a real app, 'from' should probably come from the article metadata
      const result = await service.translate(text, to, "en", context);

      this.cache[cacheKey] = result.text;
      return { text: result.text };
    } catch (error: any) {
      console.error(`Translation Service Error (${provider}):`, error);
      throw new Error(error.message || "Unknown translation error");
    }
  }

  getCached(text: string, to: string = "fr"): string | null {
    const provider = useReaderSettings.getState().translationProvider;
    const cacheKey = `${provider}:${text.trim().toLowerCase()}:${to}`;
    return this.cache[cacheKey] || null;
  }
}

export const translationService = new TranslationService();
