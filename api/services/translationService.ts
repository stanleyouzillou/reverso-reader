import { TranslationServiceClient } from "@google-cloud/translate";
import NodeCache from "node-cache";
import path from "path";
import fs from "fs";

// Initialize Google Cloud Translation client
let projectId = process.env.GOOGLE_PROJECT_ID?.replace(/['"]/g, "");
let translationClient: TranslationServiceClient | null = null;

// Handle GOOGLE_APPLICATION_CREDENTIALS being either a file path or the JSON content itself
const getTranslationClient = () => {
  if (translationClient) return translationClient;

  // Refresh projectId in case it wasn't available at module load
  if (!projectId) {
    projectId = process.env.GOOGLE_PROJECT_ID?.replace(/['"]/g, "");
  }

  const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS?.replace(
    /['"]/g,
    ""
  );

  console.log("Initializing Translation Service:", {
    projectId,
    hasCredentials: !!credentialsEnv,
    credentialsType: credentialsEnv
      ? credentialsEnv.trim().startsWith("{") ||
        credentialsEnv.trim().startsWith("[")
        ? "JSON"
        : "path"
      : "none",
  });

  if (credentialsEnv) {
    const trimmedCredentials = credentialsEnv.trim();
    if (
      trimmedCredentials.startsWith("{") ||
      trimmedCredentials.startsWith("[")
    ) {
      try {
        const credentials = JSON.parse(trimmedCredentials);
        if (credentials.project_id && !projectId) {
          projectId = credentials.project_id;
        }
        console.log(
          "Using JSON credentials for Google Translate. Project ID:",
          projectId
        );
        translationClient = new TranslationServiceClient({
          credentials,
          projectId: projectId || undefined,
        });
        return translationClient;
      } catch (e) {
        console.error(
          "Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON:",
          e
        );
      }
    } else {
      // It's a file path
      try {
        const absolutePath = path.isAbsolute(trimmedCredentials)
          ? trimmedCredentials
          : path.resolve(process.cwd(), trimmedCredentials);

        if (!fs.existsSync(absolutePath)) {
          console.warn("Credentials file not found. Falling back to ADC.");
          // Don't return here, let it fall back to ADC
        } else {
          console.log("Using credentials file for Google Translate");
          translationClient = new TranslationServiceClient({
            keyFilename: absolutePath,
            projectId: projectId || undefined,
          });
          return translationClient;
        }
      } catch (e) {
        console.error(
          "Failed to initialize Google Translate with file path:",
          e
        );
      }
    }
  }

  // Default fallback (uses default ADC)
  console.log(
    "Using default Application Default Credentials (ADC). Project ID:",
    projectId
  );
  translationClient = new TranslationServiceClient({
    projectId: projectId || undefined,
  });
  return translationClient;
};

// Initialize cache for storing translations (1 hour TTL by default)
const translationCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

interface TranslationResult {
  translation: string | string[];
  dictionary: any | null;
}

/**
 * Normalizes language codes to be compatible with Google Cloud Translation API
 */
function normalizeLanguageCode(code: string): string {
  if (!code || code === "auto") return "auto";
  return code.split(/[-_]/)[0].toLowerCase();
}

/**
 * Translates text using Google Cloud Translation API (v3)
 */
export async function translateText(
  text: string | string[],
  targetLanguage: string = "fr",
  sourceLanguage: string = "auto"
): Promise<TranslationResult> {
  // Normalize language codes (Google v3 prefers BCP-47, e.g., 'en' instead of 'en-GB' for simple cases)
  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  const normalizedSource = normalizeLanguageCode(sourceLanguage);

  const cacheKey = `${
    Array.isArray(text) ? text.join("|") : text
  }|${normalizedTarget}|${normalizedSource}`.toLowerCase();

  // Determine if input is a single word (for dictionary lookup)
  const isSingleWord = typeof text === "string" && !text.includes(" ");

  // Check if translation is already in cache
  const cachedResult = translationCache.get<TranslationResult>(cacheKey);
  if (cachedResult) {
    console.log(`Cache hit for key: ${cacheKey}`);
    // If it's a single word, also try to get dictionary data from cache
    if (isSingleWord) {
      const dictCacheKey = `dict_${text}_${normalizedTarget}`;
      const cachedDict = translationCache.get<any>(dictCacheKey);
      return {
        translation: cachedResult.translation,
        dictionary: cachedDict || null,
      };
    }
    return cachedResult;
  }

  // Prevent "Target language can't be equal to source language" error
  if (normalizedSource !== "auto" && normalizedSource === normalizedTarget) {
    console.log(
      `[Backend] Source and target languages are identical (${normalizedSource}). Skipping API call for text: "${text.slice(
        0,
        20
      )}..."`
    );
    return {
      translation: text,
      dictionary: null,
    };
  }

  console.log(
    `[Backend] Cache miss for key: ${cacheKey}, making API call with:`,
    {
      text: text.slice(0, 20) + (text.length > 20 ? "..." : ""),
      source: normalizedSource,
      target: normalizedTarget,
    }
  );

  try {
    const client = getTranslationClient();

    // Final check for projectId - try to get it from the client if it's still missing
    if (!projectId) {
      // If we still don't have projectId, try to see if the client has it
      projectId = (client as any).projectId || (client as any).project_id;
    }

    if (!projectId) {
      throw new Error(
        "GOOGLE_PROJECT_ID is not set. Please ensure GOOGLE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS (with project_id) is configured."
      );
    }

    const parent = `projects/${projectId}/locations/global`;
    console.log(`Making Google Translate request to parent: ${parent}`);

    // Prepare the request for Google Cloud Translation API
    const request: any = {
      parent,
      contents: Array.isArray(text) ? text : [text],
      mimeType: "text/plain",
      targetLanguageCode: normalizedTarget,
    };

    // Only add source language if it's not 'auto'
    if (normalizedSource !== "auto") {
      request.sourceLanguageCode = normalizedSource;
    }

    // Perform the translation
    const [response] = await client.translateText(request);

    // Extract translations from response
    const translations =
      response.translations?.map((translation) => translation.translatedText) ||
      [];
    const translationText = Array.isArray(text)
      ? translations // Return as array if input was array
      : translations[0] || "";

    // Prepare result object
    let result: TranslationResult = {
      translation: translationText,
      dictionary: null,
    };

    // If input is a single word, fetch dictionary data in parallel
    if (isSingleWord && typeof text === "string") {
      try {
        const dictionaryData = await getDictionaryData(text, normalizedTarget);
        if (dictionaryData) {
          result.dictionary = dictionaryData;
          // Cache dictionary data separately
          const dictCacheKey = `dict_${text}_${normalizedTarget}`;
          translationCache.set(dictCacheKey, dictionaryData);
        }
      } catch (e) {
        console.warn("Failed to fetch dictionary data:", e);
      }
    }

    // Cache the translation result
    translationCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Translation API error:", error);
    throw error;
  }
}

/**
 * Fetches dictionary data for a given word
 * @param word - The word to look up
 * @param targetLanguageCode - The target language for the dictionary (optional)
 * @returns Promise resolving to dictionary data or null if not found
 */
export async function getDictionaryData(
  word: string,
  targetLanguageCode?: string
): Promise<any> {
  try {
    // Dictionary API supported languages
    const supportedLangs = [
      "en",
      "hi",
      "es",
      "fr",
      "ja",
      "ru",
      "de",
      "it",
      "ko",
      "pt-BR",
      "ar",
      "tr",
    ];
    const lang =
      targetLanguageCode && supportedLangs.includes(targetLanguageCode)
        ? targetLanguageCode
        : "en";

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${encodeURIComponent(
        word
      )}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Word "${word}" not found in dictionary`);
        return null;
      }
      throw new Error(
        `Dictionary API error: ${response.status} ${response.statusText}`
      );
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
    hitRate: stats.hits / (stats.hits + stats.misses) || 0,
  };
}
