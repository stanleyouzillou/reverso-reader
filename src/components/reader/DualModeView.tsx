import React, { useState, useEffect, useMemo } from "react";
import { cn, tokenize, isWord } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleMetadata } from "../../types";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { useStore } from "../../store/useStore";

interface DualModeViewProps {
  dualModeOption: "sentences" | "hover" | "interleaved" | "sync";
  readingMode: "scrolling" | "page";
  pairedSentences: { l2: string; l1: string }[];
  paragraphs: string[];
  l1Paragraphs: string[];
  hoveredSentenceIndex: number | null;
  setHoveredSentenceIndex: (index: number | null) => void;
  visibleTranslations: Set<number>;
  setVisibleTranslations: (indices: Set<number>) => void;
  activeSentenceIdx?: number | null; // Added prop for audio highlighting
  activeWordIdx?: number;
  onPlaySentence?: (index: number) => void;
  sentenceToParagraphMap?: number[];
  metadata: ArticleMetadata;
  mode?: "clean" | "learning" | "dual";
  isPaused?: boolean;
  renderToken?: (
    token: string,
    index: number,
    isKaraoke?: boolean
  ) => React.ReactNode;
  tokenToSentenceMap?: number[];
  allTokens?: string[];
}

export const DualModeView: React.FC<DualModeViewProps> = ({
  dualModeOption,
  readingMode,
  pairedSentences,
  paragraphs,
  l1Paragraphs,
  hoveredSentenceIndex,
  setHoveredSentenceIndex,
  visibleTranslations,
  setVisibleTranslations,
  activeSentenceIdx,
  activeWordIdx = -1,
  onPlaySentence,
  sentenceToParagraphMap,
  metadata,
  mode,
  isPaused = true,
  renderToken,
  tokenToSentenceMap,
  allTokens,
}) => {
  const { translationMode, showHintsEnabled, minimalistSettings } =
    useReaderSettings();
  const { highlightedWords, hoveredSentenceIdx, setHoveredSentenceIdx } =
    useStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<{
    source: "l1" | "l2";
    sentenceIdx: number;
    wordIdx: number;
    wordCount: number;
  } | null>(null);

  // Calculate starting token index for each sentence
  const sentenceTokenOffsets = useMemo(() => {
    if (!tokenToSentenceMap) return [];
    const offsets: number[] = [];
    let currentSentence = -1;
    for (let i = 0; i < tokenToSentenceMap.length; i++) {
      if (tokenToSentenceMap[i] !== currentSentence) {
        currentSentence = tokenToSentenceMap[i];
        offsets[currentSentence] = i;
      }
    }
    return offsets;
  }, [tokenToSentenceMap]);

  // Reset page when mode changes
  useEffect(() => {
    setCurrentPage(0);
  }, [dualModeOption, readingMode]);

  // Determine items to show based on pagination
  const itemsPerPage = dualModeOption === "hover" ? 1 : 5; // 1 paragraph or 5 sentences per page

  const currentItems = useMemo(() => {
    if (readingMode === "scrolling") return null; // Show all in scrolling mode

    const items = dualModeOption === "hover" ? paragraphs : pairedSentences;
    const start = currentPage * itemsPerPage;
    return {
      items: items.slice(start, start + itemsPerPage),
      startIndex: start,
      totalPages: Math.ceil(items.length / itemsPerPage),
    };
  }, [
    readingMode,
    currentPage,
    dualModeOption,
    paragraphs,
    pairedSentences,
    itemsPerPage,
  ]);

  const getL2Tokens = (sentenceIdx: number, fallbackText: string): string[] => {
    if (allTokens && tokenToSentenceMap) {
      const sentenceStartIdx = sentenceTokenOffsets[sentenceIdx];
      if (sentenceStartIdx !== undefined) {
        let sentenceEndIdx = sentenceStartIdx;
        while (
          sentenceEndIdx < tokenToSentenceMap.length &&
          tokenToSentenceMap[sentenceEndIdx] === sentenceIdx
        ) {
          sentenceEndIdx++;
        }
        return allTokens.slice(sentenceStartIdx, sentenceEndIdx);
      }
    }
    return tokenize(fallbackText);
  };

  const renderL1Sentence = (sentence: string, sentenceIdx: number) => {
    const tokens = tokenize(sentence);
    const wordTokens = tokens.filter(isWord);
    let wordCount = 0;

    const isSentenceHovered =
      translationMode !== "minimalist" && hoveredSentenceIdx === sentenceIdx;

    return (
      <span
        className={cn(
          "transition-colors duration-200",
          isSentenceHovered &&
            "bg-blue-100/50 dark:bg-blue-900/30 rounded px-1 -mx-1",
          activeSentenceIdx === sentenceIdx &&
            "bg-slate-200 dark:bg-slate-800 rounded px-1 -mx-1"
        )}
      >
        {tokens.map((token, idx) => {
          if (!isWord(token)) return <span key={idx}>{token}</span>;
          const currentWordIdx = wordCount++;

          return (
            <span
              key={idx}
              className={cn(
                "cursor-pointer hover:text-blue-600 hover:font-bold transition-all"
              )}
              onMouseEnter={() => {
                setHoveredWord({
                  source: "l1",
                  sentenceIdx,
                  wordIdx: currentWordIdx,
                  wordCount: wordTokens.length,
                });
                setHoveredSentenceIdx(sentenceIdx);
              }}
              onMouseLeave={() => {
                setHoveredWord(null);
                setHoveredSentenceIdx(null);
              }}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  const renderL2Tokens = (sentenceIdx: number, tokens: string[]) => {
    if (renderToken) {
      const startOffset = sentenceTokenOffsets[sentenceIdx] || 0;
      let currentCharCount = 0;

      return (
        <span
          className={cn(
            "transition-colors duration-200",
            translationMode !== "minimalist" &&
              hoveredSentenceIdx === sentenceIdx &&
              "bg-blue-100/50 dark:bg-blue-900/30 rounded px-1 -mx-1",
            activeSentenceIdx === sentenceIdx &&
              "bg-slate-200 dark:bg-slate-800 rounded px-1 -mx-1"
          )}
        >
          {tokens.map((token, idx) => {
            const globalIdx = startOffset + idx;
            const tokenLen = token.length;

            const isKaraoke =
              activeSentenceIdx === sentenceIdx &&
              activeWordIdx !== undefined &&
              activeWordIdx !== -1 &&
              activeWordIdx >= currentCharCount &&
              activeWordIdx < currentCharCount + tokenLen;

            currentCharCount += tokenLen;

            return renderToken(token, globalIdx, isKaraoke);
          })}
        </span>
      );
    }

    const wordTokens = tokens.filter(isWord);
    let wordCount = 0;
    let charCount = 0;

    const isSentenceHovered = translationMode !== "minimalist" && hoveredSentenceIdx === sentenceIdx;

    return (
      <span
        className={cn(
          "transition-colors duration-200",
          isSentenceHovered &&
            "bg-blue-100/50 dark:bg-blue-900/30 rounded px-1 -mx-1",
          activeSentenceIdx === sentenceIdx &&
            "bg-slate-200 dark:bg-slate-800 rounded px-1 -mx-1"
        )}
      >
        {tokens.map((token, idx) => {
          const tokenLen = token.length;
          const isWordToken = isWord(token);

          // Karaoke Highlight
          const isKaraokeWord =
            activeSentenceIdx === sentenceIdx &&
            activeWordIdx !== undefined &&
            activeWordIdx !== -1 &&
            activeWordIdx >= charCount &&
            activeWordIdx < charCount + tokenLen;

          charCount += tokenLen;

          if (!isWordToken)
            return (
              <span
                key={idx}
                className={cn(isKaraokeWord ? "bg-yellow-400" : "")}
              >
                {token}
              </span>
            );
          const currentWordIdx = wordCount++;

          const normalizedToken = token.toLowerCase().trim();
          const keyVocab = metadata.keyVocab.find(
            (v) => v.word.toLowerCase() === normalizedToken
          );
          const isHinted =
            showHintsEnabled &&
            (highlightedWords.includes(normalizedToken) || !!keyVocab);

          return (
            <span
              key={idx}
              className={cn(
                "transition-colors duration-200 cursor-pointer hover:text-blue-900 hover:font-bold",
                isKaraokeWord
                  ? "bg-yellow-400 text-slate-900 rounded px-0.5"
                  : "",
                isHinted && "hint-underline"
              )}
              onMouseEnter={() => {
                setHoveredWord({
                  source: "l2",
                  sentenceIdx,
                  wordIdx: currentWordIdx,
                  wordCount: wordTokens.length,
                });
                setHoveredSentenceIdx(sentenceIdx);
              }}
              onMouseLeave={() => {
                setHoveredWord(null);
                setHoveredSentenceIdx(null);
              }}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  const renderPaginationFrame = (children: React.ReactNode) => {
    if (readingMode === "scrolling") {
      return (
        <div className="w-full mx-auto mt-[3rem] space-y-[1rem]">
          {children}
          {dualModeOption === "hover" && (
            <p className="text-center text-[0.75rem] text-slate-400 mt-[2rem]">
              Hover to reveal translation, Click to keep open
            </p>
          )}
        </div>
      );
    }

    if (!currentItems) return null;

    const { totalPages } = currentItems;

    return (
      <div className="flex flex-col w-full">
        {/* 1. Page Number Top */}
        <div className="text-center font-serif text-slate-400 text-[0.875rem] mb-[2rem] font-medium uppercase tracking-widest">
          Page {currentPage + 1} / {totalPages}
        </div>

        <div className="flex items-start gap-[1rem] sm:gap-[2rem]">
          {/* 2. Left Arrow (Desktop) */}
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-[8rem]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-[0.75rem] rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronLeft size="2rem" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">{children}</div>

          {/* 3. Right Arrow (Desktop) */}
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-[8rem]">
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="p-[0.75rem] rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronRight size="2rem" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Sub-Mode Rendering Logic ---

  if (dualModeOption === "sentences") {
    const visibleSentences =
      readingMode === "page" && currentItems
        ? (currentItems.items as typeof pairedSentences)
        : pairedSentences;
    const startIndex =
      readingMode === "page" && currentItems ? currentItems.startIndex : 0;

    return renderPaginationFrame(
      <div className="flex flex-col gap-0 mt-4">
        {visibleSentences.map((pair, idx) => {
          const actualIdx = startIndex + idx;
          const l2Tokens = getL2Tokens(actualIdx, pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-[1rem] py-[0.5rem] border-b border-slate-50 dark:border-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 group cursor-pointer",
                isPlaying ? "bg-slate-200/50 dark:bg-slate-800/50" : ""
              )}
              onClick={() => onPlaySentence?.(actualIdx)}
              onMouseEnter={() => setHoveredSentenceIndex(actualIdx)}
              onMouseLeave={() => setHoveredSentenceIndex(null)}
            >
              <div
                className={cn(
                  "text-slate-800 dark:text-slate-200 text-left",
                  translationMode !== "minimalist" && (hoveredSentenceIndex === actualIdx ||
                    hoveredSentenceIdx === actualIdx)
                    ? "text-blue-900 dark:text-blue-400"
                    : ""
                )}
              >
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div
                className={cn(
                  "text-slate-500 dark:text-slate-400 text-left",
                  translationMode !== "minimalist" && (hoveredSentenceIndex === actualIdx ||
                    hoveredSentenceIdx === actualIdx)
                    ? "text-blue-700 dark:text-blue-300"
                    : ""
                )}
              >
                {renderL1Sentence(pair.l1, actualIdx)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (dualModeOption === "sync") {
    const visibleSentences =
      readingMode === "page" && currentItems
        ? (currentItems.items as typeof pairedSentences)
        : pairedSentences;
    const startIndex =
      readingMode === "page" && currentItems ? currentItems.startIndex : 0;

    return renderPaginationFrame(
      <div className="flex flex-col gap-4 mt-4">
        {visibleSentences.map((pair, idx) => {
          const actualIdx = startIndex + idx;
          const l2Tokens = getL2Tokens(actualIdx, pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "grid grid-cols-2 gap-4 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors group cursor-pointer",
                isPlaying ? "bg-slate-200/50 dark:bg-slate-800/50" : ""
              )}
              onClick={() => onPlaySentence?.(actualIdx)}
            >
              <div className="text-slate-800 dark:text-slate-200 text-left">
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-left">
                {renderL1Sentence(pair.l1, actualIdx)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (dualModeOption === "hover") {
    const visibleParagraphs =
      readingMode === "page" && currentItems
        ? (currentItems.items as string[])
        : paragraphs;
    const startIndex =
      readingMode === "page" && currentItems ? currentItems.startIndex : 0;

    return renderPaginationFrame(
      <div className="flex flex-col gap-4">
        {visibleParagraphs.map((para, idx) => {
          const actualIdx = startIndex + idx;
          // Find all sentences belonging to this paragraph
          // We can use sentenceToParagraphMap if available, or just filter pairedSentences (less efficient but safe)
          const sentencesInPara = pairedSentences
            .map((pair, globalIdx) => ({ ...pair, globalIdx }))
            .filter((_, globalIdx) =>
              sentenceToParagraphMap
                ? sentenceToParagraphMap[globalIdx] === actualIdx
                : false
            );

          // If map is missing (edge case), fallback to paragraph rendering (but highlighting won't work well)
          // Actually, we should have the map.

          // Skip empty paragraphs
          if (!para.trim()) return null;

          const isPlayingParagraph =
            activeSentenceIdx !== undefined &&
            activeSentenceIdx !== null &&
            sentenceToParagraphMap &&
            sentenceToParagraphMap[activeSentenceIdx] === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`paragraph-${actualIdx}`}
              className={cn(
                "relative mb-4 group cursor-pointer p-2 rounded transition-colors"
                // isPlayingParagraph ? "bg-yellow-100" : "" // Removed paragraph highlight in favor of sentence highlight
              )}
              onMouseEnter={() => setHoveredSentenceIndex(actualIdx)}
              onMouseLeave={() => setHoveredSentenceIndex(null)}
            >
              {/* L2 Content (Sentences flowing inline) */}
              <p className="text-slate-800 dark:text-slate-200 text-left transition-colors duration-200">
                {sentencesInPara.length > 0 ? (
                  sentencesInPara.map((s) => {
                    const isSentActive = activeSentenceIdx === s.globalIdx;
                    const l2Tokens = getL2Tokens(s.globalIdx, s.l2);

                    return (
                      <span
                        key={s.globalIdx}
                        className={cn(
                          "transition-colors duration-200 rounded px-1",
                          isSentActive
                            ? "bg-slate-200 dark:bg-slate-800"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        )}
                      >
                        {renderL2Tokens(s.globalIdx, l2Tokens)}
                      </span>
                    );
                  })
                ) : (
                  // Fallback if no sentences mapped
                  <span
                    onClick={() => {
                      const next = new Set(visibleTranslations);
                      if (next.has(actualIdx)) next.delete(actualIdx);
                      else next.add(actualIdx);
                      setVisibleTranslations(next);
                    }}
                  >
                    {para}
                  </span>
                )}
              </p>

              {/* L1 Content (Hidden/Popup) */}
              <div
                className={cn(
                  "text-base text-slate-600 italic bg-blue-50/50 rounded-lg transition-all duration-300 overflow-hidden cursor-pointer",
                  visibleTranslations.has(actualIdx)
                    ? "max-h-[32rem] opacity-100 p-4 mt-2"
                    : "max-h-0 opacity-0 p-0 mt-0 group-hover:max-h-[32rem] group-hover:opacity-100 group-hover:p-4 group-hover:mt-2"
                )}
                onClick={() => {
                  // Toggle logic repeated
                  const next = new Set(visibleTranslations);
                  if (next.has(actualIdx)) next.delete(actualIdx);
                  else next.add(actualIdx);
                  setVisibleTranslations(next);
                }}
              >
                {sentencesInPara.length > 0
                  ? sentencesInPara.map((s) => (
                      <span key={s.globalIdx}>
                        {renderL1Sentence(s.l1, s.globalIdx)}
                        <span className="select-none">&nbsp;</span>
                      </span>
                    ))
                  : renderL1Sentence(l1Paragraphs[actualIdx] || "", actualIdx)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (dualModeOption === "interleaved") {
    const visibleSentences =
      readingMode === "page" && currentItems
        ? (currentItems.items as typeof pairedSentences)
        : pairedSentences;
    const startIndex =
      readingMode === "page" && currentItems ? currentItems.startIndex : 0;

    return renderPaginationFrame(
      <div className="flex flex-col gap-2">
        {visibleSentences.map((pair, idx) => {
          const actualIdx = startIndex + idx;
          const l2Tokens = getL2Tokens(actualIdx, pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "mb-1 group p-3 rounded-lg transition-colors",
                isPlaying ? "bg-slate-200/50 dark:bg-slate-800/50" : ""
              )}
              onMouseEnter={() => setHoveredSentenceIndex(actualIdx)}
              onMouseLeave={() => setHoveredSentenceIndex(null)}
            >
              <div
                className={cn(
                  "text-xl text-slate-900 dark:text-white text-left mb-1 transition-colors",
                  hoveredSentenceIndex === actualIdx
                    ? "text-blue-900 dark:text-blue-400"
                    : ""
                )}
              >
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div
                className={cn(
                  "font-sans text-sm text-indigo-600 dark:text-indigo-400 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900 italic mb-2 transition-colors",
                  hoveredSentenceIndex === actualIdx
                    ? "text-indigo-800 dark:text-indigo-300 border-indigo-400 dark:border-indigo-700"
                    : ""
                )}
              >
                {renderL1Sentence(pair.l1, actualIdx)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
