import { ITranslationService } from "./ITranslationService";
import { GoogleTranslationService } from "./GoogleTranslationService";
import { GeminiTranslationService } from "./GeminiTranslationService";

export type TranslationProvider = "google" | "gemini";

export class TranslationRegistry {
  private services: Record<TranslationProvider, ITranslationService>;

  constructor() {
    this.services = {
      google: new GoogleTranslationService(),
      gemini: new GeminiTranslationService(),
    };
  }

  getService(provider: TranslationProvider): ITranslationService {
    return this.services[provider] || this.services.google;
  }
}

export const translationRegistry = new TranslationRegistry();
