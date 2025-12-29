import { useReaderSettings } from "../hooks/useReaderSettings";
import { translationRegistry } from "./translation/TranslationRegistry";

interface TranslationResult {
  text: string;
  dictionary?: any | null;
}

class TranslationService {
  private cache: Record<string, TranslationResult> = {};

  async translate(text: string, to?: string, context?: string): Promise<TranslationResult> {
    if (!text) {
      throw new Error("No text provided");
    }

    // Get current provider and L2 language from settings
    const provider = useReaderSettings.getState().translationProvider;
    const l2Language = useReaderSettings.getState().l2Language || "en-GB";
    const targetLanguage = to || l2Language;

    const cacheKey = `${provider}:${text.trim().toLowerCase()}:${targetLanguage}`;

    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Add a slight delay to prevent flickering
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const service = translationRegistry.getService(provider);
      // Defaulting 'from' to 'auto' for better language detection
      // The service will handle 'auto' appropriately
      const result = await service.translate(text, targetLanguage, "auto", context);

      this.cache[cacheKey] = { text: result.text, dictionary: result.dictionary };
      return this.cache[cacheKey];
    } catch (error: any) {
      console.error(`Translation Service Error (${provider}):`, error);
      throw new Error(error.message || "Unknown translation error");
    }
  }

  getCached(text: string, to: string = "fr"): TranslationResult | null {
    const provider = useReaderSettings.getState().translationProvider;
    const cacheKey = `${provider}:${text.trim().toLowerCase()}:${to}`;
    return this.cache[cacheKey] || null;
  }
}

export const translationService = new TranslationService();
