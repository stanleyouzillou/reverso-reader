export interface TranslationResult {
  text: string;
  context?: any;
  dictionary?: any | null;
}

export interface ITranslationService {
  translate(text: string, to?: string, from?: string, context?: string): Promise<TranslationResult>;
}
