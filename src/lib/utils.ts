import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tokenize(text: string): string[] {
  // Split text into tokens: words, punctuation, whitespace
  // Keep everything so we can reconstruct the text perfectly
  return text.split(/([a-zA-Z0-9'’\u00C0-\u00FF]+)/).filter(Boolean);
}

export const isWord = (token: string) => /^[a-zA-Z0-9'’\u00C0-\u00FF]+$/.test(token);

export function splitSentences(text: string): string[] {
  try {
    // Use Intl.Segmenter if available (modern browsers/Node)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'sentence' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(segmenter.segment(text)).map((s: any) => s.segment.trim()).filter(Boolean);
  } catch (e) {
    // Fallback for older environments
    return text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map(s => s.trim()) || [text];
  }
}
