import React, { useState, useEffect, useMemo } from "react";
import { cn, isWord } from "../../lib/utils";
import { ReadingMode } from "../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SingleModeViewProps {
  mode: ReadingMode;
  readingMode: "scrolling" | "page";
  paragraphTokens: string[][];
  l1Paragraphs: string[];
  renderToken: (token: string, index: number) => React.ReactNode;
  activeSentenceIdx?: number | null; // This maps to PARAGRAPH index in Single Mode
  currentSentenceIdx?: number; // Actual sentence index (0-N)
  activeWordIdx?: number; // Char index from speech synthesis
  pairedSentences?: { l2: string }[]; // Needed for word mapping
  sentenceToParagraphMap?: number[]; // Added for accurate click-to-play mapping
  tokenToSentenceMap?: number[];
  onPlaySentence?: (index: number) => void;
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
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const paragraphsPerPage = 1;

  // Reset page when mode changes
  useEffect(() => {
    setCurrentPage(0);
  }, [readingMode]);

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
        <div className="text-center font-serif text-slate-400 text-sm mb-8 font-medium uppercase tracking-widest">
          Page {currentPage + 1} / {totalPages}
        </div>
      )}

      <div className="flex items-start gap-8">
        {/* 2. Left Arrow (Desktop) */}
        {readingMode === "page" && (
          <div className="hidden md:flex flex-col justify-center h-[50vh] sticky top-32">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-3 rounded-full hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent text-slate-400 hover:text-slate-800 transition-all"
            >
              <ChevronLeft size={32} />
            </button>
          </div>
        )}

        {/* 3. Content Area */}
        <div
          className={cn(
            "grid gap-8 w-full transition-colors duration-300 flex-1",
            mode === "dual" ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {/* L2 Content */}
          <div
            className={cn(
              mode === "dual" ? "text-left" : "text-justify",
              "text-inherit"
            )}
          >
            {visibleIndices.map((originalIndex) => {
              const tokens = paragraphTokens[originalIndex];
              const startIdx = tokenOffsets[originalIndex];
              const isPlayingParagraph = activeSentenceIdx === originalIndex;

              // Skip rendering empty paragraphs in Page Mode
              if (
                tokens.length === 0 ||
                (tokens.length === 1 && !tokens[0].trim())
              ) {
                return <div key={originalIndex} className="h-4" />;
              }

              // Group tokens by sentence
              const sentencesInPara: {
                sentenceIdx: number;
                tokens: { text: string; globalIdx: number }[];
              }[] = [];

              if (tokenToSentenceMap) {
                let currentGroup: {
                  sentenceIdx: number;
                  tokens: { text: string; globalIdx: number }[];
                } | null = null;

                tokens.forEach((token, tIndex) => {
                  const globalIdx = startIdx + tIndex;
                  const sentIdx = tokenToSentenceMap[globalIdx];

                  if (!currentGroup || currentGroup.sentenceIdx !== sentIdx) {
                    currentGroup = { sentenceIdx: sentIdx, tokens: [] };
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

              return (
                <p
                  key={originalIndex}
                  id={`paragraph-${originalIndex}`}
                  className="mb-6 leading-relaxed transition-colors p-2 rounded dark:text-slate-200"
                >
                  {sentencesInPara.map((group, gIdx) => {
                    const isSentActive =
                      group.sentenceIdx === currentSentenceIdx &&
                      currentSentenceIdx !== -1;

                    // Track char index for word highlighting within this sentence
                    let charCount = 0;

                    return (
                      <span
                        key={gIdx}
                        className={cn(
                          "transition-colors duration-200 rounded px-1",
                          isSentActive
                            ? "bg-slate-200"
                            : "hover:bg-slate-100 cursor-pointer"
                        )}
                        onClick={() => {
                          // Only allow click-to-play in Reading (Clean) Mode
                          if (mode === "clean") {
                            onPlaySentence?.(group.sentenceIdx);
                          }
                        }}
                      >
                        {group.tokens.map((t, tIdx) => {
                          const tokenLen = t.text.length;
                          const isWordActive =
                            isSentActive &&
                            activeWordIdx !== -1 &&
                            activeWordIdx >= charCount &&
                            activeWordIdx < charCount + tokenLen;
                          charCount += tokenLen;

                          return (
                            <span
                              key={t.globalIdx}
                              className={cn(
                                isWordActive ? "bg-yellow-400 rounded-sm" : ""
                              )}
                            >
                              {renderToken(t.text, t.globalIdx)}
                            </span>
                          );
                        })}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>

          {/* L1 Content (Dual Mode - Sync) */}
          {mode === "dual" && (
            <div className="text-slate-500 dark:text-slate-400 leading-relaxed text-left border-l border-slate-100 dark:border-slate-800 pl-8">
              {visibleIndices.map((originalIndex) => {
                if (
                  !paragraphTokens[originalIndex] ||
                  (paragraphTokens[originalIndex].length === 1 &&
                    !paragraphTokens[originalIndex][0].trim())
                ) {
                  return <div key={originalIndex} className="h-4" />;
                }

                return (
                  <p key={originalIndex} className="mb-6">
                    {l1Paragraphs[originalIndex]}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Right Arrow (Desktop) */}
        {readingMode === "page" && (
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
        )}
      </div>

      {/* Mobile Pagination Controls (Bottom) */}
      {readingMode === "page" && (
        <div className="md:hidden flex items-center justify-center gap-4 mt-8 py-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-slate-500">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
