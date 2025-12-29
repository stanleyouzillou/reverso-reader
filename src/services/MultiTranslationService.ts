import { translationRegistry } from "./translation/TranslationRegistry";

interface TranslationResult {
  text: string;
}

interface MultiTranslationResult {
  translations: string[];
  error?: string;
}

export class MultiTranslationService {
  private cache: Record<string, string[]> = {};

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
      return { translations: this.cache[cacheKey] };
    }

    try {
      // Get translations from multiple providers
      const providers = ['google', 'reverso', 'gemini'];
      const results: string[] = [];
      
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
        } catch (error) {
          console.error(`Error with ${provider} translation:`, error);
          // Continue with other providers
        }
      }

      // Cache the results
      this.cache[cacheKey] = results;
      
      return { translations: results };
    } catch (error: any) {
      console.error('MultiTranslation Service Error:', error);
      return { translations: [], error: error.message || "Unknown translation error" };
    }
  }

  getCachedTranslations(text: string, to: string = "fr"): string[] | null {
    const cacheKey = `multi:${text.trim().toLowerCase()}:${to}`;
    return this.cache[cacheKey] || null;
  }
}

export const multiTranslationService = new MultiTranslationService();