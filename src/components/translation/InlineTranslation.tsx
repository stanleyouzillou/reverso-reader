import React, { useState, useEffect, useRef } from "react";
import { Loader2, Heart, HeartOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { VocabItem, WordStatus, CEFRLevel } from "../../types";
import { useStore } from "../../store/useStore";
import { useTranslationEngine } from "../../hooks/useTranslationEngine";
import { DEMO_ARTICLE } from "../../constants/demoContent";

interface InlineTranslationProps {
  word: string;
  context?: string;
  position?: { x: number; y: number };
  onClose: () => void;
  onAddToVocabulary: (vocabItem: VocabItem) => void;
  isSaved?: boolean;
  onToggleSave: () => void;
}

export const InlineTranslation: React.FC<InlineTranslationProps> = ({
  word,
  context,
  position,
  onClose,
  onAddToVocabulary,
  isSaved,
  onToggleSave,
}) => {
  const { translateText, loading, error } = useTranslationEngine();
  const [translation, setTranslation] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<any | null>(null);
  const [showFullDefinition, setShowFullDefinition] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const result = await translateText(word, context);
        if (result) {
          setTranslation(result.text);

          // If there's dictionary data, store it separately
          if (result.dictionary) {
            setDictionaryData(result.dictionary);
          }

          // Add to vocabulary history
          const vocabItem: VocabItem = {
            word,
            translation: result.text,
            level: DEMO_ARTICLE.metadata.level || CEFRLevel.B1,
            status: WordStatus.Unknown,
            context: context || "Inline translation",
            timestamp: Date.now(),
          };
          onAddToVocabulary(vocabItem);
        }
      } catch (err) {
        console.error("Translation error:", err);
      }
    };

    fetchTranslation();
  }, [word, context, translateText, onAddToVocabulary]);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Calculate position to keep popup within viewport
  const calculatePosition = () => {
    if (!position) return { top: "0.625rem", left: "0.625rem" };

    // Use rem-based sizing for consistency during zoom
    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const popupWidthRem = 18.75; // 300px / 16
    const popupWidth = popupWidthRem * rootFontSize;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Use min/max and clamp for robust positioning
    // We position slightly above the click point
    const verticalOffset = 0.625 * rootFontSize; // 10px in rem
    let top = position.y - verticalOffset;
    let left = position.x;

    // Adjust horizontal position to stay within viewport with a small buffer (1rem)
    const horizontalBuffer = 1 * rootFontSize;
    if (left + popupWidth > viewportWidth - horizontalBuffer) {
      left = viewportWidth - popupWidth - horizontalBuffer;
    }

    // Ensure it doesn't go off the left side
    left = Math.max(horizontalBuffer, left);

    // Adjust vertical position if needed (minimum 3rem from top)
    const topBuffer = 3 * rootFontSize;
    if (top < topBuffer) {
      // If too high, position below the word instead
      top = position.y + 2 * rootFontSize;
    }

    // Final safety check for bottom of viewport
    const popupHeightEstimate = 10 * rootFontSize; // Rough estimate
    if (top + popupHeightEstimate > viewportHeight - horizontalBuffer) {
      top = viewportHeight - popupHeightEstimate - horizontalBuffer;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: "translateY(-100%)", // Shift up so (left, top) is bottom-left of popup
    };
  };

  const positionStyle = calculatePosition();

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white dark:bg-slate-900 rounded-[0.5rem] shadow-xl border border-slate-200 dark:border-slate-800 max-w-[min(90vw,20rem)] w-auto"
      style={positionStyle}
      role="dialog"
      aria-label={`Translation for ${word}`}
      aria-modal="true"
    >
      <div className="p-[1rem]">
        <div className="flex justify-between items-start mb-[0.5rem]">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[1.125rem]">
            {word}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-[0.25rem]"
            aria-label="Close translation"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[1rem]">
            <Loader2
              className="h-[1.25rem] w-[1.25rem] animate-spin text-slate-500"
              aria-label="Loading translation"
            />
          </div>
        ) : error ? (
          <div className="text-red-500 text-[0.875rem]">{error}</div>
        ) : (
          <>
            <div className="mb-[0.75rem]">
              <p className="text-slate-700 dark:text-slate-300 font-medium text-[1rem]">
                {translation}
              </p>
            </div>

            {dictionaryData && (
              <div className="mb-[0.75rem]">
                <button
                  onClick={() => setShowFullDefinition(!showFullDefinition)}
                  className="text-blue-600 text-[0.875rem] font-medium hover:underline flex items-center"
                >
                  {showFullDefinition ? "Show less" : "Show definition"}
                  <svg
                    className={`ml-[0.25rem] h-[1rem] w-[1rem] transition-transform ${
                      showFullDefinition ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showFullDefinition && (
                  <div className="mt-[0.5rem] pt-[0.5rem] border-t border-slate-100 dark:border-slate-800">
                    {dictionaryData.meanings && dictionaryData.meanings[0] && (
                      <div className="space-y-[0.5rem]">
                        <p className="text-[0.875rem] text-slate-600 dark:text-slate-400 italic">
                          {dictionaryData.meanings[0].definitions[0]?.example ||
                            ""}
                        </p>
                        <p className="text-[0.875rem] text-slate-500 dark:text-slate-500">
                          {dictionaryData.meanings[0].definitions[0]
                            ?.definition || ""}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-[0.5rem] border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onToggleSave}
                className={`flex items-center gap-[0.25rem] text-[0.875rem] ${
                  isSaved ? "text-red-500" : "text-slate-500 hover:text-red-500"
                }`}
                aria-label={isSaved ? "Unsave word" : "Save word"}
              >
                {isSaved ? (
                  <Heart
                    className="h-[1rem] w-[1rem] fill-current"
                    aria-label="Saved"
                  />
                ) : (
                  <Heart className="h-[1rem] w-[1rem]" aria-label="Save word" />
                )}
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>

              {context && (
                <div
                  className="text-[0.75rem] text-slate-500 italic max-w-[11.25rem] truncate"
                  title={context}
                >
                  "...{context}..."
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
