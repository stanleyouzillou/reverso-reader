import { ITranslationService, TranslationResult } from "./ITranslationService";

export class ReversoTranslationService implements ITranslationService {
  private langMap: Record<string, string> = {
    fr: "French",
    en: "English",
    ru: "Russian",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pl: "Polish",
    nl: "Dutch",
    pt: "Portuguese",
    ja: "Japanese",
    zh: "Chinese",
    ar: "Arabic",
    tr: "Turkish",
    he: "Hebrew",
  };

  async translate(
    text: string,
    to: string = "fr",
    from: string = "en",
    context?: string
  ): Promise<TranslationResult> {
    const targetLang = this.langMap[to.toLowerCase()] || to;
    const sourceLang = this.langMap[from.toLowerCase()] || from;

    try {
      const res = await fetch("/api/reverso/translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: sourceLang, to: targetLang }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Reverso Translation failed: ${res.statusText} ${
            errorData.error || ""
          }`
        );
      }

      const data = await res.json();
      // Reverso returns .translations array. We take the first one.
      const translatedText =
        data.translations && data.translations.length > 0
          ? data.translations[0]
          : "";

      return {
        text: translatedText,
        context: data.context, // Preserve context if available
      };
    } catch (error: any) {
      console.error("Reverso Service Error:", error);
      throw error;
    }
  }
}
