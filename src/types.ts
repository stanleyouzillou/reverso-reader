export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum WordStatus {
  Unknown = 'unknown',
  Learning = 'learning',
  Known = 'known',
}

export interface VocabItem {
  word: string;
  translation: string;
  level: CEFRLevel;
  status: WordStatus;
  context?: string;
  timestamp?: number;
}

export interface ArticleMetadata {
  level: CEFRLevel;
  wordCount: number;
  estimatedMinutes: number;
  keyVocab: VocabItem[];
  expressions: string[];
}

export interface Article {
  title: string;
  l1_title: string;
  categories: string[];
  content: string;
  l1_content: string;
  metadata: ArticleMetadata;
}

export type ReadingMode = 'clean' | 'learning' | 'dual';

export interface Selection {
  start: number; // Token index
  end: number;   // Token index
  text: string;
  translation: string | null;
  loading: boolean;
}

export interface TranslatedSpan {
  start: number;
  end: number;
  translation: string;
}

export type SidebarMode = 'dictionary' | 'vocabulary' | 'ai';
