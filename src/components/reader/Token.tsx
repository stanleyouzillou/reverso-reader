import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, Heart, HeartOff } from "lucide-react";
import { cn, isWord } from "../../lib/utils";
import {
  Selection,
  TranslatedSpan,
  ReadingMode,
  ArticleMetadata,
  VocabItem,
  WordStatus,
  CEFRLevel,
} from "../../types";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { useTranslationEngine } from "../../hooks/useTranslationEngine";
import { useStore } from "../../store/useStore";
import { multiTranslationService } from "../../services/MultiTranslationService";
import { InlineTranslation } from "../translation/InlineTranslation";
import { useInlineTranslation } from "../../hooks/useInlineTranslation";

interface TokenProps {
  token: string;
  index: number;
  selection: Selection | null;
  karaokeIndex: number;
  translatedSpans: TranslatedSpan[];
  metadata: ArticleMetadata;
  mode: ReadingMode;
  onWordClick: (index: number) => void;
  onClearSelection: () => void;
}

export const Token: React.FC<TokenProps> = ({
  token,
  index,
  selection,
  karaokeIndex,
  translatedSpans,
  metadata,
  mode,
  onWordClick,
  onClearSelection,
}) => {
  const { translationMode } = useReaderSettings();
  const { translateText, getCachedTranslation } = useTranslationEngine();
  const { saved, addToHistory, toggleSaved } = useStore();
  const [hoverTranslations, setHoverTranslations] = useState<string[]>([]);
  const [isHoverLoading, setIsHoverLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef<HTMLSpanElement>(null);

  // Check if the current token is saved
  useEffect(() => {
    setIsSaved(
      saved.some((item) => item.word.toLowerCase() === token.toLowerCase())
    );
  }, [saved, token]);

  const handleMouseEnter = useCallback(async () => {
    if (translationMode === "hover" && mode !== "clean" && isWord(token)) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Check for cached multi-translations first
      const cached = multiTranslationService.getCachedTranslations(token);
      if (cached && cached.translations.length > 0) {
        setHoverTranslations(cached.translations);
      } else {
        setIsHoverLoading(true);
        // Get multiple translations
        const result = await multiTranslationService.getMultipleTranslations(
          token
        );
        if (result && !result.error && result.translations.length > 0) {
          setHoverTranslations(result.translations);

          // Add first translation to history
          const vocabItem: VocabItem = {
            word: token,
            translation: result.translations[0],
            level: metadata.level,
            status: WordStatus.Unknown,
            context: "Hover translation",
            timestamp: Date.now(),
          };
          addToHistory(vocabItem);
        } else if (!result.error) {
          // Fallback to single translation if multi-translation fails
          const fallbackResult = await translateText(token);
          if (fallbackResult && !fallbackResult.error) {
            setHoverTranslations([fallbackResult.text]);

            const vocabItem: VocabItem = {
              word: token,
              translation: fallbackResult.text,
              level: metadata.level,
              status: WordStatus.Unknown,
              context: "Hover translation",
              timestamp: Date.now(),
            };
            addToHistory(vocabItem);
          }
        }
        setIsHoverLoading(false);
      }
    }
  }, [
    translationMode,
    mode,
    token,
    translateText,
    metadata.level,
    addToHistory,
  ]);

  const handleMouseLeave = useCallback(() => {
    if (translationMode === "hover") {
      // Add a small delay before hiding to allow for brief mouse exits
      hoverTimeoutRef.current = setTimeout(() => {
        setHoverTranslations([]);
        setIsHoverLoading(false);
      }, 100);
    }
  }, [translationMode]);

  // Clear hover state when token changes to prevent stale state
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Reset state when component unmounts
      setHoverTranslations([]);
      setIsHoverLoading(false);
    };
  }, [token]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!isWord(token)) {
    return <span className="whitespace-pre-wrap">{token}</span>;
  }

  // Define isKaraoke before using it in Hover Mode
  const isKaraoke = index === karaokeIndex;

  // Hover Mode Logic
  // Only applicable in 'learning' or 'dual' (implicit in usage) and NOT 'clean'
  if (translationMode === "hover" && mode !== "clean") {
    return (
      <span
        className={cn(
          "relative inline-block transition-all duration-200 rounded px-0.5 -mx-0.5",
          "hover:bg-blue-50 hover:text-blue-800 cursor-zoom-in group", // Hover effect + cursor
          isKaraoke && "bg-yellow-200 scale-105"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter} // Support keyboard focus
        onBlur={handleMouseLeave} // Support keyboard blur
        tabIndex={0} // Make the token focusable
        aria-describedby={
          hoverTranslations.length > 0 || isHoverLoading
            ? `popup-${index}`
            : undefined
        }
      >
        {token}

        {/* Hover Popup */}
        {(hoverTranslations.length > 0 || isHoverLoading) && (
          <div
            id={`popup-${index}`}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-auto"
            role="tooltip"
            aria-live="polite"
          >
            <div
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 min-w-[200px] max-w-[300px]"
              tabIndex={-1} // Allow focus on the popup container for accessibility
            >
              <div
                className="font-semibold mb-1 text-slate-700 dark:text-slate-300"
                tabIndex={0}
              >
                {token}
              </div>

              {isHoverLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2
                    className="h-4 w-4 animate-spin text-slate-500"
                    aria-label="Loading translations"
                  />
                </div>
              ) : (
                <>
                  <div
                    className="space-y-1 max-h-32 overflow-y-auto"
                    tabIndex={0}
                    aria-label="Translations list"
                  >
                    {hoverTranslations.slice(0, 3).map((translation, idx) => (
                      <div
                        key={idx}
                        className="py-1 border-b border-slate-100 dark:border-slate-700 last:border-0"
                        tabIndex={0}
                        aria-label={`Translation ${idx + 1}: ${translation}`}
                      >
                        {idx + 1}. {translation}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const vocabItem: VocabItem = {
                          word: token,
                          translation:
                            hoverTranslations[0] || "Translation not available",
                          level: metadata.level,
                          status: WordStatus.Unknown,
                          context: "Hover translation",
                          timestamp: Date.now(),
                        };
                        toggleSaved(vocabItem);
                      }}
                      className={`flex items-center gap-1 text-sm ${
                        isSaved
                          ? "text-red-500"
                          : "text-slate-500 hover:text-red-500"
                      }`}
                      aria-label={isSaved ? "Unsave word" : "Save word"}
                      title={isSaved ? "Unsave word" : "Save word"}
                    >
                      {isSaved ? (
                        <Heart
                          className="h-4 w-4 fill-current"
                          aria-label="Saved"
                        />
                      ) : (
                        <Heart className="h-4 w-4" aria-label="Save word" />
                      )}
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <span
                      className="text-xs text-slate-500 dark:text-slate-400"
                      aria-label={`Showing ${hoverTranslations.length} translations`}
                    >
                      {hoverTranslations.length > 3
                        ? `+${hoverTranslations.length - 3} more`
                        : `${hoverTranslations.length} translations`}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800" />
          </div>
        )}
      </span>
    );
  }

  const isSelected =
    selection && index >= selection.start && index <= selection.end;
  // const isKaraoke = index === karaokeIndex; // Already defined above
  const activeSpan = translatedSpans.find(
    (span) => index >= span.start && index <= span.end
  );
  const keyVocab = metadata.keyVocab.find(
    (v) => v.word.toLowerCase() === token.toLowerCase()
  );

  if (mode === "clean") {
    return (
      <span
        ref={tokenRef}
        className={cn(
          "transition-colors duration-200",
          isKaraoke && "bg-yellow-200"
        )}
      >
        {token}
      </span>
    );
  }

  // Determine if this token is part of a multi-word chunk that needs special rendering
  // For multi-word selections, we want to show the popup only once for the entire selection
  // and highlight all tokens in the selection

  const isSelectionStart = isSelected && index === selection?.start;
  const isSelectionEnd = isSelected && index === selection?.end;
  const isKeyVocab =
    !isSelected && !activeSpan && keyVocab && mode === "learning";

  // Check if this token is part of a translated span (persistent translation)
  const translatedSpan = translatedSpans.find(
    (span) => index >= span.start && index <= span.end
  );

  // Calculate middle token for multi-word chunks to center the translation
  const selectionMiddle = selection
    ? Math.floor((selection.start + selection.end) / 2)
    : -1;
  const translatedSpanMiddle = translatedSpan
    ? Math.floor((translatedSpan.start + translatedSpan.end) / 2)
    : -1;

  // Show the popup on the middle token of the selection/span for better visual balance
  const showSelectionTranslation = isSelected && index === selectionMiddle;
  const showTranslatedSpan =
    translatedSpan && index === translatedSpanMiddle && !isSelected;

  // For single words (key vocab), it's just the word itself
  const showKeyVocabTranslation = isKeyVocab;

  // Get translation text
  const translationText = showSelectionTranslation
    ? selection?.loading
      ? "..."
      : selection?.translation
    : showTranslatedSpan
    ? translatedSpan?.translation
    : showKeyVocabTranslation
    ? keyVocab?.translation
    : null;

  // Check if this token is highlighted
  const isCurrentSelectionActive = isSelected;
  const isTranslatedSpanActive = !!translatedSpan;
  const isHighlightActive = isCurrentSelectionActive || isTranslatedSpanActive;

  // Unified styling logic for consistent highlights
  const isMultiToken =
    (isCurrentSelectionActive && selection?.end > selection?.start) ||
    (isTranslatedSpanActive && translatedSpan?.end > translatedSpan?.start);

  // Determine if this token is the currently clicked word (the last added to the selection)
  const isCurrentlyClicked = isCurrentSelectionActive && index === selection?.end;

  let tokenStyling = "";
  let tokenHighlightClass = "";

  if (isHighlightActive) {
    if (isMultiToken) {
      const start = isCurrentSelectionActive
        ? selection?.start
        : translatedSpan?.start;
      const end = isCurrentSelectionActive
        ? selection?.end
        : translatedSpan?.end;

      if (index === start) {
        tokenStyling =
          "rounded-l px-1.5 mx-0 bg-emerald-500 text-white shadow-sm";
      } else if (index === end) {
        tokenStyling =
          "rounded-r px-1.5 mx-0 bg-emerald-500 text-white shadow-sm";
      } else {
        tokenStyling = "px-0 mx-0 bg-emerald-500 text-white shadow-sm";
      }
    } else {
      tokenStyling =
        "rounded px-1.5 mx-0.5 bg-emerald-500 text-white shadow-sm";
    }

    // Apply distinct visual for just-clicked word (the currently added word to the chunk)
    if (isCurrentlyClicked) {
      tokenHighlightClass = "ring-2 ring-blue-300"; // Distinct visual for just-clicked word
    }
  } else if (keyVocab && mode === "learning") {
    tokenStyling =
      "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-200 rounded px-1.5 mx-0.5 hover:bg-emerald-200";
  } else {
    tokenStyling = "hover:bg-emerald-50 rounded px-1.5 mx-0.5";
  }

  // We need to render the popup if:
  const shouldRenderPopup =
    (showSelectionTranslation &&
      (selection?.loading || selection?.translation)) ||
    (showTranslatedSpan && translatedSpan?.translation);

  if (shouldRenderPopup) {
    return (
      <span
        id={`token-${index}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(index);
        }}
        className={cn(
          "inline-flex flex-col-reverse items-center align-middle gap-0.5 cursor-pointer",
          isMultiToken ? "mx-0" : "mx-0.5",
          isKaraoke && "bg-yellow-200 scale-105 rounded"
        )}
        style={{ verticalAlign: "middle" }}
      >
        <span
          className={cn(
            "py-0.5 text-inherit leading-none transition-colors",
            tokenStyling,
            tokenHighlightClass // Separate visual for just-clicked word
          )}
        >
          {token}
        </span>

        {/* Floating Popup Container */}
        <span
          className={cn(
            "text-[0.9rem] leading-none whitespace-nowrap font-handwriting text-emerald-600 select-none flex items-center gap-1"
          )}
        >
          {selection?.loading && showSelectionTranslation ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-emerald-100 flex items-center gap-1">
              {translationText}
              {showSelectionTranslation && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection();
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-700 cursor-pointer ml-1 font-sans border-l border-emerald-100 pl-1"
                >
                  ✕
                </span>
              )}
            </span>
          )}
        </span>
      </span>
    );
  }

  // Render highlighted word without popup (for other parts of the selection or persistent spans)
  if (isHighlightActive) {
    return (
      <span
        ref={tokenRef}
        id={`token-${index}`}
        onClick={() => onWordClick(index)}
        className={cn(
          "inline-block cursor-pointer transition-all duration-200",
          tokenStyling,
          tokenHighlightClass, // Separate visual for just-clicked word
          isKaraoke && "bg-yellow-200 text-slate-900 scale-105"
        )}
      >
        {token}
      </span>
    );
  }

  return (
    <span
      ref={tokenRef}
      id={`token-${index}`}
      onClick={(e) => {
        if (isWord(token)) {
          onWordClick(index);
        }
      }}
      className={cn(
        "inline-block cursor-pointer transition-all duration-200",
        tokenStyling,
        isKaraoke && "bg-yellow-200 text-slate-900 scale-105"
      )}
      aria-label={`Click to translate "${token}"`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (isWord(token)) {
            onWordClick(index);
          }
        }
      }}
    >
      {token}
    </span>
  );
};
