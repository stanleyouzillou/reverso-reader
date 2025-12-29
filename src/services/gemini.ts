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
}

export async function fetchDefinition(
  word: string,
  sourceSentence: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<GeminiDefinitionResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY not set in .env. Falling back to mock data.");
    return getMockDefinition(word);
  }

  const prompt = `Word: ${word}
Source sentence: "${sourceSentence}"
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

Generate a detailed definition card with:

- Simplified pronunciation (CAP-itals for stress, e.g., yoo-BIK-wi-tus)
- Part of speech
- 2-4 definitions ordered by frequency, each with:

  - senseLabel: 1-3 word context tag (e.g., "commonality", "weather")
  - meaning: Clear explanation in source language
  - example: Natural 10-20 word sentence in source language
  - translations: 3-4 target language equivalents (single words/short phrases)`;

  try {
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
                      translations: { type: "array", items: { type: "string" } },
                    },
                    required: ["senseLabel", "meaning", "example", "translations"],
                  },
                },
              },
              required: ["word", "pronunciation", "partOfSpeech", "definitions"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching definition from Gemini:", error);
    return getMockDefinition(word);
  }
}

function getMockDefinition(word: string): GeminiDefinitionResponse {
  return {
    word: word,
    pronunciation: "yoo-BIK-wi-tus",
    partOfSpeech: "adjective",
    definitions: [
      {
        senseLabel: "commonality",
        meaning: "present, appearing, or found everywhere",
        example: "Social media platforms are ubiquitous among teenagers.",
        translations: ["omniprésent", "répandu", "courant"],
      },
      {
        senseLabel: "omnipresent",
        meaning: "being present everywhere at the same time",
        example: "Smartphones have become ubiquitous in modern society.",
        translations: ["omniprésent", "partout"],
      },
    ],
  };
}
