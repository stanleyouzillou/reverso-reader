import React from "react";
import { cn } from "../../lib/utils";

interface VocabContextSentenceProps {
  sentence: string;
  word: string;
  className?: string;
}

export const VocabContextSentence: React.FC<VocabContextSentenceProps> = ({
  sentence,
  word,
  className,
}) => {
  if (!sentence) return null;

  // Function to extract focused context: 2 words before, target, 2 words after
  const getFocusedContext = (text: string, target: string) => {
    if (!target) return text;

    // Split by whitespace but keep track of original words
    const words = text.trim().split(/\s+/);

    // Find the index of the word that contains the target (case-insensitive)
    const targetIdx = words.findIndex((w) => {
      const cleanWord = w
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const cleanTarget = target
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      return cleanWord === cleanTarget || cleanWord.includes(cleanTarget);
    });

    if (targetIdx === -1) return text;

    const start = Math.max(0, targetIdx - 2);
    const end = Math.min(words.length - 1, targetIdx + 2);

    const contextWords = words.slice(start, end + 1);
    let result = contextWords.join(" ");

    // Add ellipses if truncated
    if (start > 0) result = "... " + result;
    if (end < words.length - 1) result = result + " ...";

    return result;
  };

  // Function to highlight the word in the sentence
  const highlightWord = (text: string, target: string) => {
    if (!target) return text;

    // Create a regex to find the word, case insensitive
    const regex = new RegExp(`(${target})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.toLowerCase() === target.toLowerCase()) {
        return (
          <span
            key={i}
            className={cn(
              "px-1 py-0.5 rounded font-semibold transition-all duration-300",
              "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
              "inline-block animate-in fade-in duration-500"
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const focusedContext = getFocusedContext(sentence, word);

  return (
    <div
      key={`${word}-${sentence.substring(0, 10)}`}
      className={cn(
        "overflow-hidden py-1",
        className,
        "animate-in fade-in slide-in-from-left-2 duration-500"
      )}
    >
      <p
        className={cn(
          "text-sm text-slate-600 dark:text-slate-400 leading-relaxed block w-full italic"
        )}
        title={sentence} // Show full sentence on hover
      >
        "{highlightWord(focusedContext, word)}"
      </p>
    </div>
  );
};
