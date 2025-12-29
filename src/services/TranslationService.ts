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

    // Check if this is a chunk translation (multiple words)
    const selectedWords = text.trim().split(/\s+/);
    const isChunkTranslation = selectedWords.length > 1;

    // Create cache key using the format "word1_word2_word3" as specified in requirements
    // Replace spaces with underscores to create the key format
    const cacheKey = `${provider}:${text.trim().toLowerCase().replace(/\s+/g, '_')}:${targetLanguage}`;

    // Skip cache for chunk translations (2+ words)
    if (!isChunkTranslation && this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Add a slight delay to prevent flickering
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const service = translationRegistry.getService(provider);
      // Defaulting 'from' to 'auto' for better language detection
      // The service will handle 'auto' appropriately
      const result = await service.translate(text, targetLanguage, "auto", context);

      // Only cache single-word translations
      if (!isChunkTranslation) {
        this.cache[cacheKey] = { text: result.text, dictionary: result.dictionary };
      }

      return { text: result.text, dictionary: result.dictionary };
    } catch (error: any) {
      console.error(`Translation Service Error (${provider}):`, error);
      throw new Error(error.message || "Unknown translation error");
    }
  }

  getCached(text: string, to: string = "fr"): TranslationResult | null {
    const provider = useReaderSettings.getState().translationProvider;
    // Create cache key using the format "word1_word2_word3" as specified in requirements
    // Replace spaces with underscores to create the key format
    const cacheKey = `${provider}:${text.trim().toLowerCase().replace(/\s+/g, '_')}:${to}`;
    return this.cache[cacheKey] || null;
  }
}

export const translationService = new TranslationService();
