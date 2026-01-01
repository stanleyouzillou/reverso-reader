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
    from: string = "en",
    context?: string
  ): Promise<MultiTranslationResult> {
    if (!text) {
      return { translations: [], error: "No text provided" };
    }

    // Create cache key for multiple translations
    const cacheKey = `multi:${text.trim().toLowerCase()}:${to}:${from}`;

    if (this.cache[cacheKey]) {
      return {
        translations: this.cache[cacheKey].translations,
        dictionary: this.cache[cacheKey].dictionary,
      };
    }

    try {
      // Get translations from Google provider
      const results: string[] = [];
      let dictionaryData: any | null = null;

      try {
        const service = translationRegistry.getService("google");
        const result = await service.translate(text, to, from, context);
        if (result.text && !results.includes(result.text)) {
          results.push(result.text);
        }
        if (result.dictionary && !dictionaryData) {
          dictionaryData = result.dictionary;
        }
      } catch (error) {
        console.error(`Error with google translation:`, error);
      }

      console.log(`Translations for "${text}":`, results);
      const multiResult = {
        translations: results.slice(0, 3),
        dictionary: dictionaryData,
      };

      // Cache the results
      this.cache[cacheKey] = multiResult;

      return multiResult;
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
    to: string = "fr",
    from: string = "en"
  ): { translations: string[]; dictionary?: any | null } | null {
    const cacheKey = `multi:${text.trim().toLowerCase()}:${to}:${from}`;
    return this.cache[cacheKey] || null;
  }
}

export const multiTranslationService = new MultiTranslationService();
