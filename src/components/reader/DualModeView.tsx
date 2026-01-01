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
}) => {
  const { showHintsEnabled } = useReaderSettings();
  const { highlightedWords, hoveredSentenceIdx, setHoveredSentenceIdx } =
    useStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<{
    source: "l1" | "l2";
    sentenceIdx: number;
    wordIdx: number;
    wordCount: number;
  } | null>(null);

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

  const renderL1Sentence = (sentence: string, sentenceIdx: number) => {
    const tokens = tokenize(sentence);
    const wordTokens = tokens.filter(isWord);
    let wordCount = 0;

    const isSentenceHovered = hoveredSentenceIdx === sentenceIdx;

    return (
      <span
        className={cn(
          "transition-colors duration-200",
          isSentenceHovered &&
            mode !== "learning" &&
            "bg-blue-100/50 dark:bg-blue-900/30 rounded px-1 -mx-1"
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
    const wordTokens = tokens.filter(isWord);
    let wordCount = 0;
    let charCount = 0;

    const isSentenceHovered = hoveredSentenceIdx === sentenceIdx;

    return (
      <span
        className={cn(
          "transition-colors duration-200",
          isSentenceHovered &&
            mode !== "learning" &&
            "bg-blue-100/50 dark:bg-blue-900/30 rounded px-1 -mx-1"
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
        <div className="w-full mx-auto mt-12 space-y-4">
          {children}
          {dualModeOption === "hover" && (
            <p className="text-center text-xs text-slate-400 mt-8">
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
        <div className="text-center font-serif text-slate-400 text-sm mb-8 font-medium uppercase tracking-widest">
          Page {currentPage + 1} / {totalPages}
        </div>

        <div className="flex items-start gap-8">
          {/* 2. Left Arrow (Desktop) */}
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-32">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-3 rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronLeft size={32} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">{children}</div>

          {/* 3. Right Arrow (Desktop) */}
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-32">
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="p-3 rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronRight size={32} />
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
          const l2Tokens = tokenize(pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "grid grid-cols-2 gap-4 py-2 border-b border-slate-50 dark:border-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer",
                isPlaying && mode !== "learning"
                  ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                  : ""
              )}
              onClick={() => onPlaySentence?.(actualIdx)}
              onMouseEnter={() => setHoveredSentenceIndex(actualIdx)}
              onMouseLeave={() => setHoveredSentenceIndex(null)}
            >
              <div
                className={cn(
                  "leading-relaxed text-slate-800 dark:text-slate-200 text-left transition-colors",
                  hoveredSentenceIndex === actualIdx ||
                    hoveredSentenceIdx === actualIdx
                    ? "text-blue-900 dark:text-blue-400"
                    : ""
                )}
              >
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div
                className={cn(
                  "leading-relaxed text-slate-500 dark:text-slate-400 text-left transition-colors",
                  hoveredSentenceIndex === actualIdx ||
                    hoveredSentenceIdx === actualIdx
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
          const l2Tokens = tokenize(pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "grid grid-cols-2 gap-4 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors group cursor-pointer",
                isPlaying ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""
              )}
              onClick={() => onPlaySentence?.(actualIdx)}
            >
              <div className="leading-relaxed text-slate-800 dark:text-slate-200 text-left">
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div className="leading-relaxed text-slate-500 dark:text-slate-400 text-left">
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
              <p className="leading-relaxed text-slate-800 dark:text-slate-200 text-left transition-colors duration-200">
                {sentencesInPara.length > 0 ? (
                  sentencesInPara.map((s) => {
                    const isSentActive = activeSentenceIdx === s.globalIdx;
                    const l2Tokens = tokenize(s.l2);

                    return (
                      <span
                        key={s.globalIdx}
                        className={cn(
                          "transition-colors duration-200 rounded px-1",
                          isSentActive ? "bg-slate-200" : "hover:bg-slate-100"
                        )}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   onPlaySentence?.(s.globalIdx);
                        // }} // Disabled: Audio from click only in Reading Mode
                      >
                        {renderL2Tokens(s.globalIdx, l2Tokens)}
                        {/* Add space between sentences if needed? tokenize(para) has spaces. 
                             pairedSentences usually trimmed. 
                             We might lose spaces here. 
                             But rendering separate spans is better for highlighting.
                             We can add a trailing space span.
                         */}
                        <span className="select-none">&nbsp;</span>
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
                    {renderL2Tokens(actualIdx, tokenize(para))}
                  </span>
                )}
              </p>

              {/* L1 Content (Hidden/Popup) */}
              <div
                className={cn(
                  "text-base text-slate-600 italic bg-blue-50/50 rounded-lg transition-all duration-300 overflow-hidden cursor-pointer",
                  visibleTranslations.has(actualIdx)
                    ? "max-h-[500px] opacity-100 p-4 mt-2"
                    : "max-h-0 opacity-0 p-0 mt-0 group-hover:max-h-[500px] group-hover:opacity-100 group-hover:p-4 group-hover:mt-2"
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
          const l2Tokens = tokenize(pair.l2);
          const isPlaying = activeSentenceIdx === actualIdx;

          return (
            <div
              key={actualIdx}
              id={`sentence-${actualIdx}`}
              className={cn(
                "mb-1 group p-3 rounded-lg transition-colors",
                isPlaying ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""
              )}
              onMouseEnter={() => setHoveredSentenceIndex(actualIdx)}
              onMouseLeave={() => setHoveredSentenceIndex(null)}
            >
              <div
                className={cn(
                  "text-xl leading-relaxed text-slate-900 dark:text-white text-left mb-1 transition-colors",
                  hoveredSentenceIndex === actualIdx
                    ? "text-blue-900 dark:text-blue-400"
                    : ""
                )}
              >
                {renderL2Tokens(actualIdx, l2Tokens)}
              </div>
              <div
                className={cn(
                  "font-sans text-sm leading-relaxed text-indigo-600 dark:text-indigo-400 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900 italic mb-2 transition-colors",
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
