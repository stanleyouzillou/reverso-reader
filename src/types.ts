export enum CEFRLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum WordStatus {
  Unknown = "unknown",
  Learning = "learning",
  Known = "known",
}

export interface VocabItem {
  word: string;
  translation: string;
  level: CEFRLevel;
  status: WordStatus;
  context?: string;
  position?: number;
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

export type ReadingMode = "clean" | "learning" | "dual";

export interface Selection {
  start: number; // Token index
  end: number; // Token index
  clickedIndex: number; // The specific token index that was clicked
  text: string;
  translation: string | null;
  loading: boolean;
  isChunkActive: boolean;
  sentenceId: number | null;
  version: number;
}

export interface TranslatedSpan {
  start: number;
  end: number;
  translation: string;
  isChunkActive?: boolean;
}

export type SidebarMode = "dictionary" | "vocabulary" | "ai";
