import { useReaderSettings } from "../hooks/useReaderSettings";
import { translationRegistry } from "./translation/TranslationRegistry";

interface TranslationResult {
  text: string;
  dictionary?: any | null;
}

class TranslationService {
  private cache: Record<string, TranslationResult> = {};
  private readonly LS_CACHE_PREFIX = "trans_";
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  async translate(text: string, to?: string, context?: string): Promise<TranslationResult> {
    if (!text) {
      throw new Error("No text provided");
    }

    // Get current provider and L2 language from settings
    const provider = useReaderSettings.getState().translationProvider;
    const l2Language = useReaderSettings.getState().l2Language || "fr";
    const targetLanguage = to || l2Language;

    // Check if this is a chunk translation (multiple words)
    const selectedWords = text.trim().split(/\s+/);
    const isChunkTranslation = selectedWords.length > 1;

    // Create cache key using the format "word1_word2_word3"
    const slug = text.trim().toLowerCase().replace(/\s+/g, '_');
    const cacheKey = `${provider}:${slug}:${targetLanguage}`;
    const lsCacheKey = `${this.LS_CACHE_PREFIX}${provider}_${slug}_${targetLanguage}`;

    // 1. Check in-memory cache
    if (!isChunkTranslation && this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // 2. Check LocalStorage cache
    if (!isChunkTranslation) {
      try {
        const cached = localStorage.getItem(lsCacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < this.CACHE_TTL) {
            console.log(`LocalStorage hit for translation: ${text}`);
            this.cache[cacheKey] = data; // Sync back to memory
            return data;
          }
        }
      } catch (e) {
        console.warn("Failed to read from translation LocalStorage:", e);
      }
    }

    // Add a slight delay to prevent flickering
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const service = translationRegistry.getService(provider);
      const result = await service.translate(text, targetLanguage, "auto", context);

      const translationResult = { text: result.text, dictionary: result.dictionary };

      // Only cache single-word translations
      if (!isChunkTranslation) {
        this.cache[cacheKey] = translationResult;
        
        // Save to LocalStorage
        try {
          localStorage.setItem(
            lsCacheKey,
            JSON.stringify({
              data: translationResult,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          console.warn("Failed to save translation to LocalStorage:", e);
        }
      }

      return translationResult;
    } catch (error: any) {
      console.error(`Translation Service Error (${provider}):`, error);
      throw new Error(error.message || "Unknown translation error");
    }
  }

  getCached(text: string, to: string = "fr"): TranslationResult | null {
    const provider = useReaderSettings.getState().translationProvider;
    const slug = text.trim().toLowerCase().replace(/\s+/g, '_');
    const cacheKey = `${provider}:${slug}:${to}`;
    const lsCacheKey = `${this.LS_CACHE_PREFIX}${provider}_${slug}_${to}`;
    
    // Check memory
    if (this.cache[cacheKey]) return this.cache[cacheKey];
    
    // Check LocalStorage (synchronous check)
    try {
      const cached = localStorage.getItem(lsCacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_TTL) {
          this.cache[cacheKey] = data; // Sync to memory
          return data;
        }
      }
    } catch (e) {}

    return null;
  }
}

export const translationService = new TranslationService();
