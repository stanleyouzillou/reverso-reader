import { ITranslationService, TranslationResult } from "./ITranslationService";
import { normalizeLanguageCode } from "../../lib/utils";

export class GoogleTranslationService implements ITranslationService {
  async translate(
    text: string,
    to: string,
    from: string = "auto",
    context?: string
  ): Promise<TranslationResult> {
    try {
      // Only send the 'from' parameter if it's not 'auto' to avoid API errors
      // Also normalize the language code to just the language part if it includes a country code
      const normalizedTo = normalizeLanguageCode(to);
      const requestBody: { text: string; to: string; from?: string } = {
        text,
        to: normalizedTo,
      };

      if (from !== "auto") {
        requestBody.from = normalizeLanguageCode(from);
      }

      console.log(`[GoogleTranslationService] Sending request:`, {
        text,
        to: normalizedTo,
        from: from !== "auto" ? normalizeLanguageCode(from) : "auto",
        requestBody,
      });

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        let errorDetails = res.statusText;
        try {
          const errorData = await res.json();
          errorDetails = errorData.details || errorData.error || res.statusText;
        } catch (e) {
          // Fallback to statusText if JSON parsing fails
        }
        throw new Error(`Translation failed: ${errorDetails}`);
      }

      const data = await res.json();
      return {
        text: Array.isArray(data.translation)
          ? data.translation.join(" ")
          : data.translation || "",
        dictionary: data.dictionary,
      };
    } catch (error: any) {
      console.error("Google Translation Service Error:", error);
      throw new Error(error.message || "Unknown translation error");
    }
  }
}
