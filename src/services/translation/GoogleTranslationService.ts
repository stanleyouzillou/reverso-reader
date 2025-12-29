import { ITranslationService, TranslationResult } from "./ITranslationService";

export class GoogleTranslationService implements ITranslationService {
  async translate(
    text: string,
    to: string = "fr",
    from: string = "en",
    context?: string
  ): Promise<TranslationResult> {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, to, from }),
      });

      if (!res.ok) {
        throw new Error(`Translation failed: ${res.statusText}`);
      }

      const data = await res.json();
      return { text: data.text };
    } catch (error: any) {
      console.error("Google Translation Service Error:", error);
      throw new Error(error.message || "Unknown translation error");
    }
  }
}
