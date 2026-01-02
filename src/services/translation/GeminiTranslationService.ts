import { ITranslationService, TranslationResult } from "./ITranslationService";
import { normalizeLanguageCode } from "../../lib/utils";

export class GeminiTranslationService implements ITranslationService {
  async translate(
    text: string,
    to: string,
    from: string = "auto",
    context?: string
  ): Promise<TranslationResult> {
    const normalizedTo = normalizeLanguageCode(to);
    const normalizedFrom = normalizeLanguageCode(from);

    // Placeholder for Gemini implementation
    // This would likely call a backend endpoint wrapping Google Generative AI
    console.warn(
      "Gemini translation not implemented yet, falling back to mock"
    );

    // In a real implementation, we would construct a prompt like:
    // `Translate this phrase as it appears in context: "${context}". Phrase: "${text}"`

    return { text: `[Gemini] ${text} (${normalizedTo})` };
  }
}
