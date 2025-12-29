import { ITranslationService } from "./ITranslationService";
import { GoogleTranslationService } from "./GoogleTranslationService";
import { ReversoTranslationService } from "./ReversoTranslationService";
import { GeminiTranslationService } from "./GeminiTranslationService";

export type TranslationProvider = "google" | "reverso" | "gemini";

export class TranslationRegistry {
  private services: Record<TranslationProvider, ITranslationService>;

  constructor() {
    this.services = {
      google: new GoogleTranslationService(),
      reverso: new ReversoTranslationService(),
      gemini: new GeminiTranslationService(),
    };
  }

  getService(provider: TranslationProvider): ITranslationService {
    return this.services[provider] || this.services.google;
  }
}

export const translationRegistry = new TranslationRegistry();
