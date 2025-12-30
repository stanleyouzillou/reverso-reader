import {
  translationRegistry,
  type TranslationProvider,
} from "./translation/TranslationRegistry";

interface TranslationResult {
  text: string;
  dictionary?: any | null;
}

interface MultiTranslationResult {
  translations: string[];
  dictionary?: any | null;
  error?: string;
}

export class MultiTranslationService {
  private cache: Record<
    string,
    { translations: string[]; dictionary?: any | null }
  > = {};

  async getMultipleTranslations(
    text: string,
    to: string = "fr",
    context?: string
  ): Promise<MultiTranslationResult> {
    if (!text) {
      return { translations: [], error: "No text provided" };
    }

    // Create cache key for multiple translations
    const cacheKey = `multi:${text.trim().toLowerCase()}:${to}`;

    if (this.cache[cacheKey]) {
      return {
        translations: this.cache[cacheKey].translations,
        dictionary: this.cache[cacheKey].dictionary,
      };
    }

    try {
      // Get translations from multiple providers
      const providers: TranslationProvider[] = ["google", "reverso", "gemini"];
      const results: string[] = [];
      let dictionaryData: any | null = null;

      // Add a slight delay to prevent flickering
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Try each provider and collect unique translations
      for (const provider of providers) {
        try {
          const service = translationRegistry.getService(provider);
          const result = await service.translate(text, to, "en", context);

          // Only add unique translations
          if (result.text && !results.includes(result.text)) {
            results.push(result.text);
          }

          // Store dictionary data if available (e.g. from Google)
          if (result.dictionary && !dictionaryData) {
            dictionaryData = result.dictionary;
          }
        } catch (error) {
          console.error(`Error with ${provider} translation:`, error);
          // Continue with other providers
        }
      }

      // Cache the results
      this.cache[cacheKey] = {
        translations: results,
        dictionary: dictionaryData,
      };

      return {
        translations: results,
        dictionary: dictionaryData,
      };
    } catch (error: any) {
      console.error("MultiTranslation Service Error:", error);
      return {
        translations: [],
        error: error.message || "Unknown translation error",
      };
    }
  }

  getCachedTranslations(
    text: string,
    to: string = "fr"
  ): { translations: string[]; dictionary?: any | null } | null {
    const cacheKey = `multi:${text.trim().toLowerCase()}:${to}`;
    return this.cache[cacheKey] || null;
  }
}

export const multiTranslationService = new MultiTranslationService();
