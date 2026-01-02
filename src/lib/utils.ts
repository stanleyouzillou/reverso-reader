import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function normalizeLanguageCode(code: string): string {
  if (!code || code === "auto") return "auto";
  // Convert 'en-GB' or 'en_GB' to 'en'
  return code.split(/[-_]/)[0].toLowerCase();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tokenize(text: string): string[] {
  // Split text into tokens: words (including Unicode letters and numbers), and everything else
  // Using Unicode property escapes (\p{L} for letters, \p{N} for numbers)
  // This ensures we catch words in any language and keep punctuation/whitespace separate.
  return text.split(/([\p{L}\p{N}'’]+)/u).filter(Boolean);
}

export const isWord = (token: string) => /^[\p{L}\p{N}'’]+$/u.test(token);

export function splitSentences(text: string): string[] {
  try {
    // Use Intl.Segmenter if available (modern browsers/Node)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segmenter = new (Intl as any).Segmenter("en", {
      granularity: "sentence",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Note: We don't trim here to preserve the exact character offsets for TTS
    return Array.from(segmenter.segment(text))
      .map((s: any) => s.segment)
      .filter(Boolean);
  } catch (e) {
    // Fallback for older environments
    // Match sentence and trailing whitespace
    return text.match(/[^.!?]+[.!?]+(\s*)/g) || [text];
  }
}
