import { Article } from "../types";
import { tokenize, splitSentences } from "../lib/utils";

export interface ProcessedArticle {
  paragraphs: string[];
  l1Paragraphs: string[];
  pairedSentences: { l2: string; l1: string }[];
  sentenceToParagraphMap: number[]; // Maps sentence index -> paragraph index
  tokenToSentenceMap: number[]; // Maps token index -> sentence index
  paragraphTokens: string[][];
  allTokens: string[];
  metadata: Article["metadata"];
  title: string;
  l1_title: string;
  categories: string[];
}

class ArticleService {
  process(article: Article): ProcessedArticle {
    const paragraphs = article.content.split("\n");
    const l1Paragraphs = article.l1_content.split("\n");

    // 1. Process Dual Mode Sentence Pairs
    const pairedSentences: { l2: string; l1: string }[] = [];
    const sentenceToParagraphMap: number[] = [];
    const tokenToSentenceMap: number[] = [];

    paragraphs.forEach((para, i) => {
      const l2Sentences = splitSentences(para);
      const l1Sentences = splitSentences(l1Paragraphs[i] || "");

      // Mapping Logic
      // 1. Tokenize the paragraph (L2)
      const pTokens = tokenize(para);

      // 2. Map tokens to sentences
      let currentSentIdxInPara = 0;
      let accumulatedText = "";

      // Start index of sentences for this paragraph in the global list
      const globalSentStartIdx = pairedSentences.length;

      pTokens.forEach((token) => {
        // Assign current token to the current sentence
        // If we ran out of sentences, assign to the last one
        const targetSentIdx =
          globalSentStartIdx +
          Math.min(currentSentIdxInPara, l2Sentences.length - 1);
        tokenToSentenceMap.push(targetSentIdx);

        accumulatedText += token;

        // Check if we completed the current sentence
        if (currentSentIdxInPara < l2Sentences.length) {
          const targetSent = l2Sentences[currentSentIdxInPara];
          // Check if accumulated text *ends with* the sentence (handling potential prefixes if logic is loose)
          // Or better: check if accumulated text *contains* the target sentence.
          // Since we build up, contains is safe.
          // Note: targetSent is trimmed.
          if (accumulatedText.includes(targetSent)) {
            // We found the sentence.
            // But we might have consumed extra punctuation or whitespace if tokenize splits differently?
            // Actually, if we just found it, we are good.
            // Reset for next sentence
            accumulatedText = "";
            currentSentIdxInPara++;
          }
        }
      });

      const maxLen = Math.max(l2Sentences.length, l1Sentences.length);
      for (let j = 0; j < maxLen; j++) {
        pairedSentences.push({
          l2: l2Sentences[j] || "",
          l1: l1Sentences[j] || "",
        });
        sentenceToParagraphMap.push(i);
      }
    });

    // 2. Tokenize Paragraphs
    const paragraphTokens = paragraphs.map((p) => tokenize(p));

    // 3. Flatten for Global Indexing
    const allTokens = paragraphTokens.flat();

    return {
      paragraphs,
      l1Paragraphs,
      pairedSentences,
      sentenceToParagraphMap,
      tokenToSentenceMap,
      paragraphTokens,
      allTokens,
      metadata: article.metadata,
      title: article.title,
      l1_title: article.l1_title,
      categories: article.categories,
    };
  }

  getContext(
    allTokens: string[],
    start: number,
    end: number,
    window: number = 10
  ): string {
    const s = Math.max(0, start - window);
    const e = Math.min(allTokens.length, end + window);
    return allTokens.slice(s, e).join("").trim();
  }
}

export const articleService = new ArticleService();
