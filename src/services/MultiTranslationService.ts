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
      // Get translations from multiple providers
      const providers: TranslationProvider[] = ["google", "reverso"];
      const results: string[] = [];
      let dictionaryData: any | null = null;

      // Try each provider and collect unique translations
      for (const provider of providers) {
        try {
          const service = translationRegistry.getService(provider);

          // Special handling for Reverso to get multiple translations if possible
          if (provider === "reverso") {
            const res = await fetch("/api/reverso/translation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text,
                from: from === "en" ? "English" : from,
                to: to === "fr" ? "French" : to,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.translations && Array.isArray(data.translations)) {
                data.translations.forEach((t: string) => {
                  if (t && !results.includes(t)) {
                    results.push(t);
                  }
                });
              }
            }
          } else {
            const result = await service.translate(text, to, from, context);
            if (result.text && !results.includes(result.text)) {
              results.push(result.text);
            }
            if (result.dictionary && !dictionaryData) {
              dictionaryData = result.dictionary;
            }
          }
        } catch (error) {
          console.error(`Error with ${provider} translation:`, error);
        }
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
