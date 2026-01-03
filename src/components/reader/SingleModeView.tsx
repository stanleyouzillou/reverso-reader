import React, { useState, useEffect, useMemo } from "react";
import { cn, isWord } from "../../lib/utils";
import { ReadingMode } from "../../types";
import { ChevronLeft, ChevronRight, Languages, Volume2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useReaderSettings } from "../../hooks/useReaderSettings";

interface SingleModeViewProps {
  mode: ReadingMode;
  readingMode: "scrolling" | "page";
  paragraphTokens: string[][];
  l1Paragraphs: string[];
  renderToken: (
    token: string,
    index: number,
    isKaraoke?: boolean
  ) => React.ReactNode;
  activeSentenceIdx?: number | null; // This maps to PARAGRAPH index in Single Mode
  currentSentenceIdx?: number; // Actual sentence index (0-N)
  activeWordIdx?: number; // Char index from speech synthesis
  pairedSentences?: { l2: string; l1: string }[]; // Needed for word mapping
  sentenceToParagraphMap?: number[]; // Added for accurate click-to-play mapping
  tokenToSentenceMap?: number[];
  onPlaySentence?: (index: number) => void;
  isPaused?: boolean;
}

export const SingleModeView: React.FC<SingleModeViewProps> = ({
  mode,
  readingMode,
  paragraphTokens,
  l1Paragraphs,
  renderToken,
  activeSentenceIdx,
  currentSentenceIdx = -1,
  activeWordIdx = -1,
  pairedSentences = [],
  sentenceToParagraphMap,
  tokenToSentenceMap,
  onPlaySentence,
  isPaused = true,
}) => {
  const translationMode = useReaderSettings((state) => state.translationMode);
  const hoveredSentenceIdx = useStore((state) => state.hoveredSentenceIdx);
  const setHoveredSentenceIdx = useStore(
    (state) => state.setHoveredSentenceIdx
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<number>>(
    new Set()
  );
  const paragraphsPerPage = 1;

  const toggleTranslation = (idx: number) => {
    setExpandedTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // 1. Calculate Offsets
  const tokenOffsets = useMemo(() => {
    const offsets = [0];
    for (let i = 0; i < paragraphTokens.length; i++) {
      offsets.push(offsets[i] + paragraphTokens[i].length);
    }
    return offsets;
  }, [paragraphTokens]);

  // 2. Identify Valid Content
  const contentIndices = useMemo(() => {
    return paragraphTokens
      .map((tokens, idx) =>
        tokens.length > 0 && (tokens.length > 1 || tokens[0].trim() !== "")
          ? idx
          : -1
      )
      .filter((idx) => idx !== -1);
  }, [paragraphTokens]);

  // Sync page with active paragraph when it changes (e.g. during playback)
  useEffect(() => {
    if (
      readingMode === "page" &&
      activeSentenceIdx !== null &&
      activeSentenceIdx !== undefined
    ) {
      const targetPage = contentIndices.indexOf(activeSentenceIdx);
      if (targetPage !== -1 && targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [activeSentenceIdx, readingMode, contentIndices, currentPage]);

  // Reset page when mode changes
  useEffect(() => {
    setCurrentPage(0);
  }, [readingMode]);

  // 3. Determine Visible Paragraphs
  const visibleIndices = useMemo(() => {
    if (readingMode === "scrolling") {
      return paragraphTokens.map((_, i) => i);
    } else {
      const start = currentPage * paragraphsPerPage;
      const end = start + paragraphsPerPage;
      return contentIndices.slice(start, end);
    }
  }, [readingMode, currentPage, contentIndices, paragraphTokens.length]);

  const totalPages = Math.ceil(contentIndices.length / paragraphsPerPage);

  // Helper to check if a specific token index should be highlighted
  const isWordHighlighted = (
    paragraphIdx: number,
    tokenIdx: number,
    startIdx: number
  ) => {
    if (
      activeSentenceIdx !== paragraphIdx || // Must be in active paragraph
      currentSentenceIdx === -1 ||
      activeWordIdx === -1 ||
      !pairedSentences[currentSentenceIdx]
    ) {
      return false;
    }

    // This is the hard part: Mapping char index (activeWordIdx) from the SENTENCE string
    // to the TOKEN index in the PARAGRAPH.
    //
    // Strategy:
    // 1. Get the full text of the current sentence.
    // 2. Find the word at activeWordIdx (char index).
    // 3. Match that word against the tokens in the paragraph.
    //
    // Limitation: If the word appears multiple times in the paragraph, we might highlight wrong.
    // But since we have the sentence structure, we can try to approximate.

    // Simpler Visual Approach for "Karaoke":
    // Just highlight the whole sentence (gray) and the specific word (yellow).
    //
    // Since SingleMode lumps sentences into paragraphs, precise mapping is tough without
    // storing sentence-to-token maps.
    //
    // Fallback: Just highlight the paragraph container (already done).
    // Future improvement: Better token mapping.

    return false;
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Page Number Top */}
      {readingMode === "page" && (
        <div className="text-center font-serif text-slate-400 text-[0.875rem] mb-[2rem] font-medium uppercase tracking-widest">
          Page {currentPage + 1} / {totalPages}
        </div>
      )}

      <div className="flex items-start gap-[1rem] sm:gap-[2rem]">
        {/* 2. Left Arrow (Desktop) */}
        {readingMode === "page" && (
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-[8rem]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-[0.75rem] rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronLeft size="2rem" />
            </button>
          </div>
        )}

        {/* 3. Content Area */}
        <div
          className={cn(
            "grid gap-[0.5rem] w-full transition-colors duration-300 flex-1",
            mode === "dual" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          )}
        >
          {/* L2 Content */}
          <div className={cn("text-left", "text-inherit")}>
            {visibleIndices.map((originalIndex) => {
              const tokens = paragraphTokens[originalIndex];
              const startIdx = tokenOffsets[originalIndex];
              const isPlayingParagraph = activeSentenceIdx === originalIndex;

              // Skip rendering empty paragraphs
              if (
                tokens.length === 0 ||
                (tokens.length === 1 && !tokens[0].trim())
              ) {
                return null;
              }

              // Group tokens by sentence
              const sentencesInPara: {
                sentenceIdx: number;
                tokens: { text: string; globalIdx: number }[];
                l1?: string;
              }[] = [];

              if (tokenToSentenceMap) {
                let currentGroup: {
                  sentenceIdx: number;
                  tokens: { text: string; globalIdx: number }[];
                  l1?: string;
                } | null = null;

                tokens.forEach((token, tIndex) => {
                  const globalIdx = startIdx + tIndex;
                  const sentIdx = tokenToSentenceMap[globalIdx];

                  if (!currentGroup || currentGroup.sentenceIdx !== sentIdx) {
                    currentGroup = {
                      sentenceIdx: sentIdx,
                      tokens: [],
                      l1: pairedSentences[sentIdx]?.l1,
                    };
                    sentencesInPara.push(currentGroup);
                  }
                  currentGroup.tokens.push({ text: token, globalIdx });
                });
              } else {
                // Fallback if map not ready (shouldn't happen)
                sentencesInPara.push({
                  sentenceIdx: -1,
                  tokens: tokens.map((t, i) => ({
                    text: t,
                    globalIdx: startIdx + i,
                  })),
                });
              }

              const isTranslationExpanded =
                expandedTranslations.has(originalIndex);

              return (
                <div key={originalIndex} className="mb-[2.5rem] group">
                  <div className="flex items-start gap-4">
                    {mode === "learning" && (
                      <div className="flex flex-col gap-1 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTranslation(originalIndex);
                          }}
                          className={cn(
                            "flex-shrink-0 p-1.5 rounded-md transition-all duration-200",
                            "text-slate-300 group-hover:text-slate-400 hover:text-blue-500 hover:bg-blue-50",
                            "dark:text-slate-600 dark:group-hover:text-slate-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30",
                            isTranslationExpanded &&
                              "text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 opacity-100"
                          )}
                          aria-expanded={isTranslationExpanded}
                          aria-label={
                            isTranslationExpanded
                              ? "Hide translation"
                              : "Show translation"
                          }
                          title={
                            isTranslationExpanded
                              ? "Hide translation"
                              : "Show translation"
                          }
                        >
                          <Languages size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const firstSentenceIdx =
                              sentencesInPara[0]?.sentenceIdx;
                            if (firstSentenceIdx !== undefined) {
                              onPlaySentence?.(firstSentenceIdx);
                            }
                          }}
                          className={cn(
                            "flex-shrink-0 p-1.5 rounded-md transition-all duration-200",
                            "text-slate-300 group-hover:text-slate-400 hover:text-blue-500 hover:bg-blue-50",
                            "dark:text-slate-600 dark:group-hover:text-slate-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
                          )}
                          aria-label="Listen to paragraph"
                          title="Listen to paragraph"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        id={`paragraph-${originalIndex}`}
                        className="dark:text-slate-200 text-left leading-relaxed"
                      >
                        {sentencesInPara.map((group, gIdx) => {
                          const isSentActive =
                            group.sentenceIdx === currentSentenceIdx &&
                            currentSentenceIdx !== -1;

                          const isHovered =
                            hoveredSentenceIdx === group.sentenceIdx;
                          const showMatchingHighlight = isTranslationExpanded;

                          // Track char index for word highlighting within this sentence
                          let charCount = 0;

                          return (
                            <span
                              key={gIdx}
                              className={cn(
                                "cursor-pointer transition-all duration-300 ease-in-out px-0.5",
                                isSentActive
                                  ? "bg-amber-100/80 dark:bg-amber-900/40 rounded-sm shadow-[0_0_0_1px_rgba(245,158,11,0.2)]"
                                  : showMatchingHighlight && isHovered
                                  ? "bg-blue-100/50 dark:bg-blue-900/30 rounded-sm shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
                                  : ""
                              )}
                              style={{
                                WebkitBoxDecorationBreak: "clone",
                                boxDecorationBreak: "clone",
                              }}
                              onMouseEnter={() => {
                                if (
                                  translationMode !== "minimalist" &&
                                  isTranslationExpanded &&
                                  group.sentenceIdx !== -1
                                ) {
                                  setHoveredSentenceIdx(group.sentenceIdx);
                                }
                              }}
                              onMouseLeave={() => {
                                if (translationMode !== "minimalist") {
                                  setHoveredSentenceIdx(null);
                                }
                              }}
                              onClick={(e) => {
                                // In minimalist mode, we want clicks to go to tokens for translation
                                // Only trigger playback if NOT in minimalist mode
                                if (translationMode !== "minimalist") {
                                  onPlaySentence?.(group.sentenceIdx);
                                }
                              }}
                            >
                              {group.tokens.map((t) => {
                                const tokenLen = t.text.length;
                                const isWordActive =
                                  isSentActive &&
                                  activeWordIdx !== -1 &&
                                  activeWordIdx >= charCount &&
                                  activeWordIdx < charCount + tokenLen;

                                // Correctly increment charCount after check to match TTS boundary reporting
                                const currentTokenIdx = charCount;
                                charCount += tokenLen;

                                return renderToken(
                                  t.text,
                                  t.globalIdx,
                                  isWordActive
                                );
                              })}
                            </span>
                          );
                        })}
                      </div>

                      {/* Translation Block */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isTranslationExpanded
                            ? "max-h-[1000px] opacity-100 mt-4"
                            : "max-h-0 opacity-0 mt-0"
                        )}
                      >
                        <div className="pl-4 border-l-2 border-blue-100 dark:border-blue-900/50 py-1">
                          <div className="text-slate-500 dark:text-slate-400 italic text-[0.95em] leading-relaxed">
                            {sentencesInPara.map((pair, pIdx) => {
                              const isSentActive =
                                pair.sentenceIdx === currentSentenceIdx &&
                                currentSentenceIdx !== -1;
                              const isHovered =
                                hoveredSentenceIdx === pair.sentenceIdx;

                              return (
                                <span
                                  key={pIdx}
                                  className={cn(
                                    "transition-all duration-200 ease-in-out rounded-sm px-0.5",
                                    isSentActive
                                      ? "bg-amber-100/60 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]"
                                      : isHovered
                                      ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.05)]"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                  )}
                                  onMouseEnter={() => {
                                    if (translationMode !== "minimalist") {
                                      setHoveredSentenceIdx(pair.sentenceIdx);
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (translationMode !== "minimalist") {
                                      setHoveredSentenceIdx(null);
                                    }
                                  }}
                                >
                                  {pair.l1}
                                  {pIdx < sentencesInPara.length - 1 && " "}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* L1 Content (Dual Mode - Sync) */}
          {mode === "dual" && (
            <div className="text-slate-500 dark:text-slate-400 text-left border-l border-slate-100 dark:border-slate-800 pl-[2rem]">
              {visibleIndices.map((originalIndex) => {
                if (
                  !paragraphTokens[originalIndex] ||
                  (paragraphTokens[originalIndex].length === 1 &&
                    !paragraphTokens[originalIndex][0].trim())
                ) {
                  return null;
                }

                // Find sentences that belong to this paragraph
                const sentencesInPara = pairedSentences
                  .map((pair, globalIdx) => ({ ...pair, globalIdx }))
                  .filter((_, globalIdx) =>
                    sentenceToParagraphMap
                      ? sentenceToParagraphMap[globalIdx] === originalIndex
                      : false
                  );

                return (
                  <div key={originalIndex} className="mb-[0.75rem]">
                    {sentencesInPara.length > 0 ? (
                      sentencesInPara.map((s) => (
                        <span
                          key={s.globalIdx}
                          className={cn(
                            "transition-all duration-200 rounded-sm block md:inline cursor-pointer px-0.5",
                            translationMode !== "minimalist" &&
                              hoveredSentenceIdx === s.globalIdx
                              ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : s.globalIdx === currentSentenceIdx &&
                                currentSentenceIdx !== -1
                              ? "bg-amber-100/60 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]"
                              : ""
                          )}
                          onMouseEnter={() => {
                            if (translationMode !== "minimalist") {
                              setHoveredSentenceIdx(s.globalIdx);
                            }
                          }}
                          onMouseLeave={() => {
                            if (translationMode !== "minimalist") {
                              setHoveredSentenceIdx(null);
                            }
                          }}
                        >
                          {s.l1}
                          <span className="select-none">&nbsp;</span>
                        </span>
                      ))
                    ) : (
                      <p className="mb-[0.5rem]">
                        {l1Paragraphs[originalIndex]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Right Arrow (Desktop) */}
        {readingMode === "page" && (
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
        )}
      </div>
    </div>
  );
};
