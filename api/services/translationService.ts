import { TranslationServiceClient } from '@google-cloud/translate';
import NodeCache from 'node-cache';

// Initialize Google Cloud Translation client with Application Default Credentials
const translationClient = new TranslationServiceClient();

// Initialize cache for storing translations (1 hour TTL by default)
const translationCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

interface TranslationResult {
  translation: string | string[];
  dictionary: any | null;
}

/**
 * Translates text using Google Cloud Translation API
 * @param text - Text to translate (single string or array of strings)
 * @param targetLanguage - Target language code (default: 'en')
 * @param sourceLanguage - Source language code (default: 'auto')
 * @returns Promise resolving to TranslationResult
 */
export async function translateText(
  text: string | string[],
  targetLanguage: string = 'en',
  sourceLanguage: string = 'auto'
): Promise<TranslationResult> {
  // Determine if input is a single word (for dictionary lookup)
  const isSingleWord = typeof text === 'string' && !text.includes(' ') && text.trim().split(/\s+/).length === 1;

  // Create cache key based on input text and target language
  const cacheKey = Array.isArray(text)
    ? `${text.join('|')}|${targetLanguage}|${sourceLanguage}`
    : `${text}|${targetLanguage}|${sourceLanguage}`;

  // Check if translation is already in cache
  const cachedResult = translationCache.get<TranslationResult>(cacheKey);
  if (cachedResult) {
    console.log(`Cache hit for key: ${cacheKey}`);
    // If it's a single word, also try to get dictionary data from cache
    if (isSingleWord) {
      const dictCacheKey = `dict_${text}_${targetLanguage}`;
      const cachedDict = translationCache.get<any>(dictCacheKey);
      return {
        translation: cachedResult.translation,
        dictionary: cachedDict || null
      };
    }
    return cachedResult;
  }

  console.log(`Cache miss for key: ${cacheKey}, making API call...`);

  try {
    // Prepare the request for Google Cloud Translation API
    // Don't include source language if it's 'auto' to let the API auto-detect
    const request: any = {
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      contents: Array.isArray(text) ? text : [text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      targetLanguageCode: targetLanguage,
    };

    // Only add source language if it's not 'auto'
    if (sourceLanguage !== 'auto') {
      request.sourceLanguageCode = sourceLanguage;
    }

    // Perform the translation
    const [response] = await translationClient.translateText(request);

    // Extract translations from response
    const translations = response.translations?.map(translation => translation.translatedText) || [];
    const translationText = Array.isArray(text)
      ? translations  // Return as array if input was array
      : translations[0] || '';

    // Prepare result object
    let result: TranslationResult = {
      translation: translationText,
      dictionary: null
    };

    // If input is a single word, fetch dictionary data in parallel
    if (isSingleWord && typeof text === 'string') {
      try {
        const dictionaryData = await getDictionaryData(text);
        result.dictionary = dictionaryData;

        // Cache the dictionary data separately with a longer TTL
        const dictCacheKey = `dict_${text}_${targetLanguage}`;
        translationCache.set(dictCacheKey, dictionaryData, 7200); // 2 hours TTL
      } catch (dictError) {
        console.warn(`Dictionary lookup failed for word "${text}":`, dictError);
        // Continue without dictionary data
      }
    }

    // Cache the translation result
    translationCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

/**
 * Fetches dictionary data for a given word
 * @param word - The word to look up
 * @returns Promise resolving to dictionary data or null if not found
 */
export async function getDictionaryData(word: string): Promise<any> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Word "${word}" not found in dictionary`);
        return null;
      }
      throw new Error(`Dictionary API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Return the first entry if it's an array
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error(`Error fetching dictionary data for "${word}":`, error);
    throw error;
  }
}

/**
 * Clears the translation cache
 */
export function clearCache(): void {
  translationCache.flushAll();
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): { keys: number; hitRate: number } {
  const stats = translationCache.getStats();
  return {
    keys: translationCache.keys().length,
    hitRate: stats.hits / (stats.hits + stats.misses) || 0
  };
}