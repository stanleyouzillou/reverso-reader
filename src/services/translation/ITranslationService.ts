export interface TranslationResult {
  text: string;
  context?: any;
}

export interface ITranslationService {
  translate(text: string, to?: string, from?: string, context?: string): Promise<TranslationResult>;
}
