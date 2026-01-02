import {
  translationRegistry,
  type TranslationProvider,
} from "./translation/TranslationRegistry";
import { normalizeLanguageCode } from "../lib/utils";

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
    to: string,
    from: string = "auto",
    context?: string
  ): Promise<MultiTranslationResult> {
    if (!text) {
      return { translations: [], error: "No text provided" };
    }

    // Create cache key for multiple translations
    // Include context hash if available for context-aware caching
    const normalizedTo = normalizeLanguageCode(to);
    const normalizedFrom = normalizeLanguageCode(from);
    const contextId = context
      ? `:${context.length}_${context.slice(0, 10)}`
      : "";
    const cacheKey = `multi:${text
      .trim()
      .toLowerCase()}:${normalizedTo}:${normalizedFrom}${contextId}`;

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

      console.log(`[MultiTranslationService] Fetching translations:`, {
        text,
        to: normalizedTo,
        from: normalizedFrom,
        context: context ? context.slice(0, 20) : "none",
        cacheKey,
      });

      try {
        const service = translationRegistry.getService("google");
        const result = await service.translate(
          text,
          normalizedTo,
          normalizedFrom,
          context
        );
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
    to: string,
    from: string = "auto",
    context?: string
  ): { translations: string[]; dictionary?: any | null } | null {
    const normalizedTo = normalizeLanguageCode(to);
    const normalizedFrom = normalizeLanguageCode(from);
    const contextId = context
      ? `:${context.length}_${context.slice(0, 10)}`
      : "";
    const cacheKey = `multi:${text
      .trim()
      .toLowerCase()}:${normalizedTo}:${normalizedFrom}${contextId}`;
    return this.cache[cacheKey] || null;
  }

  cacheTranslation(
    text: string,
    to: string = "fr",
    from: string = "en",
    translation: string,
    context?: string
  ): void {
    const normalizedTo = normalizeLanguageCode(to);
    const normalizedFrom = normalizeLanguageCode(from);
    const contextId = context
      ? `:${context.length}_${context.slice(0, 10)}`
      : "";
    const cacheKey = `multi:${text
      .trim()
      .toLowerCase()}:${normalizedTo}:${normalizedFrom}${contextId}`;

    // If there's already a cached entry, add the new translation to it
    if (this.cache[cacheKey]) {
      if (!this.cache[cacheKey].translations.includes(translation)) {
        this.cache[cacheKey].translations.push(translation);
      }
    } else {
      // Otherwise create a new cache entry
      this.cache[cacheKey] = {
        translations: [translation],
      };
    }
  }
}

export const multiTranslationService = new MultiTranslationService();
