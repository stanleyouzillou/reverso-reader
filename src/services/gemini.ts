export interface GeminiDefinitionResponse {
  word: string;
  pronunciation: string; // "yoo-BIK-wi-tus" format
  partOfSpeech: string;
  definitions: {
    senseLabel: string;
    meaning: string;
    example: string;
    translations: string[];
  }[];
  usageExamples: {
    sentence: string;
    translation: string;
  }[];
}

// Monitoring and Metrics System
export interface LLMMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  fallbackToMock: number;
  averageResponseTime: number;
  lastError: string | null;
  cacheHits: number;
}

const metrics: LLMMetrics = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  fallbackToMock: 0,
  averageResponseTime: 0,
  lastError: null,
  cacheHits: 0,
};

export const getLLMMetrics = () => ({ ...metrics });

export async function fetchDefinition(
  word: string,
  sourceSentence: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<GeminiDefinitionResponse> {
  const startTime = Date.now();
  metrics.totalCalls++;

  const cacheKey = `def_${word.toLowerCase()}_${sourceLanguage}_${targetLanguage}`;
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Check LocalStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log(`[Gemini Service] Cache hit for: ${word}`);
        metrics.cacheHits++;
        return data;
      }
    }
  } catch (e) {
    console.warn("[Gemini Service] Failed to read from definition cache:", e);
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log(`[Gemini Service] API Key present: ${!!apiKey}`);

  if (!apiKey) {
    const errorMsg = "VITE_GEMINI_API_KEY not set in .env.";
    console.error(`[Gemini Service] ${errorMsg} Falling back to mock data.`);
    metrics.fallbackToMock++;
    metrics.lastError = errorMsg;
    return getMockDefinition(word);
  }

  const prompt = `Word: ${word}
Source sentence: "${sourceSentence}"
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

Generate a detailed definition card for the word "${word}" based on its context in the source sentence.

Requirements for the response:
- pronunciation: Provide a simplified phonetic pronunciation using a syllabic style with capitals for the stressed syllable. For example, for "ubiquitous" use "yoo-BIK-wi-tus", for "rebellion" use "ri-BEL-yuhn", for "apple" use "AP-uhl". Ensure it accurately reflects the pronunciation of "${word}".
- partOfSpeech: The grammatical category of the word (e.g., "noun", "verb", "adjective").
- definitions: 2-4 definitions ordered by frequency, each with:
  - senseLabel: 1-3 word context tag (e.g., "commonality", "weather")
  - meaning: Clear explanation in source language
  - example: Natural 10-20 word sentence in source language
  - translations: 3-4 target language equivalents (single words/short phrases)
- usageExamples: 4 additional usageExamples showing the word in varied contexts, each with:
  - sentence: A natural sentence using the word
  - translation: Accurate translation in the target language`;

  try {
    console.log(`[Gemini Service] Fetching definition for: ${word}...`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                word: { type: "string" },
                pronunciation: { type: "string" },
                partOfSpeech: { type: "string" },
                definitions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      senseLabel: { type: "string" },
                      meaning: { type: "string" },
                      example: { type: "string" },
                      translations: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: [
                      "senseLabel",
                      "meaning",
                      "example",
                      "translations",
                    ],
                  },
                },
                usageExamples: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sentence: { type: "string" },
                      translation: { type: "string" },
                    },
                    required: ["sentence", "translation"],
                  },
                },
              },
              required: [
                "word",
                "pronunciation",
                "partOfSpeech",
                "definitions",
                "usageExamples",
              ],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Fallback to default error message if JSON parsing fails
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      data.candidates.length === 0 ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      data.candidates[0].content.parts.length === 0
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(text);

    // Update metrics
    const duration = Date.now() - startTime;
    metrics.successfulCalls++;
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.successfulCalls - 1) + duration) /
      metrics.successfulCalls;

    console.log(
      `[Gemini Service] Successfully fetched definition for: ${word} (${duration}ms)`
    );

    // Save to LocalStorage cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("[Gemini Service] Failed to save to definition cache:", e);
    }

    return result;
  } catch (error: any) {
    metrics.failedCalls++;
    metrics.fallbackToMock++;
    metrics.lastError = error.message;
    console.error(
      `[Gemini Service] Error fetching definition for "${word}":`,
      error.message
    );
    return getMockDefinition(word);
  }
}

function getMockDefinition(word: string): GeminiDefinitionResponse {
  return {
    word: word,
    pronunciation:
      word.toLowerCase() === "ubiquitous"
        ? "yoo-BIK-wi-tus"
        : `${word.split("").join("-").toUpperCase()}`, // Fallback mock pronunciation
    partOfSpeech: "noun",
    definitions: [
      {
        senseLabel: "definition",
        meaning: `Definition for ${word} (Mock Data)`,
        example: `This is a mock example sentence for the word ${word}.`,
        translations: ["traduction"],
      },
    ],
    usageExamples: [
      {
        sentence: `Example usage of ${word}.`,
        translation: `Exemple d'utilisation de ${word}.`,
      },
    ],
  };
}
