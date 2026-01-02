import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { Loader2, Bookmark } from "lucide-react";
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
  isSelected?: boolean;
  isSelectionStart?: boolean;
  selectionLoading?: boolean;
  selectionTranslation?: string;
  selectionIsChunkActive?: boolean;
  karaokeIndex?: number;
  translatedSpans?: TranslatedSpan[];
  metadata: ArticleMetadata;
  mode: ReadingMode;
  onWordClick: (index: number) => void;
  onClearSelection: () => void;
  sentenceIndex?: number; // Added: For sentence-level highlighting
  sentenceText?: string; // Added: For translation context
}

export const Token: React.FC<TokenProps> = memo(
  ({
    token,
    index,
    isSelected,
    isSelectionStart,
    selectionLoading,
    selectionTranslation,
    selectionIsChunkActive,
    karaokeIndex,
    translatedSpans = [],
    metadata,
    mode,
    onWordClick,
    onClearSelection,
    sentenceIndex,
    sentenceText,
  }) => {
    const { translationMode, showHintsEnabled, l2Language } =
      useReaderSettings();
    const dualModeOption = useStore((state) => state.dualModeOption);
    const { translateText } = useTranslationEngine();
    const hoveredTokenId = useStore((state) => state.hoveredTokenId);
    const setHoveredTokenId = useStore((state) => state.setHoveredTokenId);
    const hoveredSentenceIdx = useStore((state) => state.hoveredSentenceIdx);
    const setHoveredSentenceIdx = useStore(
      (state) => state.setHoveredSentenceIdx
    );
    const saved = useStore((state) => state.saved);
    const highlightedWords = useStore((state) => state.highlightedWords);
    const toggleSaved = useStore((state) => state.toggleSaved);
    const [hoverTranslations, setHoverTranslations] = useState<string[]>([]);
    const [isHoverLoading, setIsHoverLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const tokenRef = useRef<HTMLSpanElement>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const tokenId = `token-${index}`;
    const isCurrentlyHovered = hoveredTokenId === tokenId;
    const isKaraoke = index === karaokeIndex;

    // Determine if this sentence is hovered in dual/sync mode
    const isSentenceHovered =
      (mode === "dual" || dualModeOption === "sync") &&
      sentenceIndex !== undefined &&
      hoveredSentenceIdx === sentenceIndex;

    // Check if the current token is saved
    useEffect(() => {
      setIsSaved(
        saved.some((item) => item.word.toLowerCase() === token.toLowerCase())
      );
    }, [saved, token]);

    const handleMouseEnter = useCallback(async () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }

      if (translationMode === "hover" && mode !== "clean" && isWord(token)) {
        setHoveredTokenId(tokenId);

        if (sentenceIndex !== undefined) {
          setHoveredSentenceIdx(sentenceIndex);
        }

        const sourceLang = l2Language.split("-")[0] || "en";
        const targetLang = "fr";

        const cached = multiTranslationService.getCachedTranslations(
          token,
          targetLang,
          sourceLang,
          sentenceText
        );
        if (cached && cached.translations.length > 0) {
          setHoverTranslations(cached.translations);
        } else {
          setIsHoverLoading(true);
          const result = await multiTranslationService.getMultipleTranslations(
            token,
            targetLang,
            sourceLang,
            sentenceText
          );

          if (useStore.getState().hoveredTokenId !== tokenId) return;

          if (result && !result.error && result.translations.length > 0) {
            setHoverTranslations(result.translations);
          } else {
            const fallbackResult = await translateText(token, sentenceText);
            if (useStore.getState().hoveredTokenId !== tokenId) return;

            if (fallbackResult && !fallbackResult.error) {
              setHoverTranslations([fallbackResult.text]);
            } else {
              setHoverTranslations(["No translation found"]);
            }
          }
          setIsHoverLoading(false);
        }
      }
    }, [
      translationMode,
      mode,
      token,
      tokenId,
      setHoveredTokenId,
      l2Language,
      translateText,
      sentenceIndex,
      sentenceText,
      setHoveredSentenceIdx,
    ]);

    const handleMouseLeave = useCallback(() => {
      if (translationMode === "hover") {
        leaveTimeoutRef.current = setTimeout(() => {
          setHoveredTokenId(null);
          setHoveredSentenceIdx(null);
        }, 300);
      }
    }, [translationMode, setHoveredTokenId, setHoveredSentenceIdx]);

    const handlePopupMouseEnter = useCallback(() => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
    }, []);

    const handlePopupMouseLeave = useCallback(() => {
      handleMouseLeave();
    }, [handleMouseLeave]);

    useEffect(() => {
      if (!isCurrentlyHovered) {
        setHoverTranslations([]);
        setIsHoverLoading(false);
      }
    }, [isCurrentlyHovered]);

    useEffect(() => {
      return () => {
        if (useStore.getState().hoveredTokenId === tokenId) {
          useStore.getState().setHoveredTokenId(null);
        }
      };
    }, [tokenId]);

    const normalizedToken = token.toLowerCase().trim();
    const keyVocab = metadata.keyVocab.find(
      (v) => v.word.toLowerCase() === normalizedToken
    );
    const isHinted =
      showHintsEnabled &&
      (highlightedWords.includes(normalizedToken) || !!keyVocab);

    const translatedSpan = translatedSpans.find(
      (span) => index >= span.start && index <= span.end
    );

    const isHighlightActive = isSelected || !!translatedSpan;
    const isChunkActive =
      selectionIsChunkActive || translatedSpan?.isChunkActive;

    const showSelectionTranslation = isSelected && isSelectionStart;
    const showTranslatedSpan =
      translatedSpan && index === translatedSpan.start && !isSelected;

    const translationText = showSelectionTranslation
      ? selectionLoading
        ? "..."
        : selectionTranslation
      : showTranslatedSpan
      ? translatedSpan?.translation
      : null;

    const isWordToken = isWord(token);

    const highlightColorClass = isChunkActive
      ? "bg-blue-100/80 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"
      : "bg-blue-200/90 text-blue-900 dark:bg-blue-800/80 dark:text-blue-50";

    const tokenHighlightClass = isHighlightActive ? highlightColorClass : "";

    const tokenStyling = cn(
      "px-0 mx-0 rounded-none",
      isWordToken && "hover:bg-slate-100 dark:hover:bg-slate-800/50"
    );

    // Early return for non-word tokens that aren't highlighted
    if (!isWordToken && !isHighlightActive && !isKaraoke) {
      return (
        <span
          className="inline whitespace-pre"
          data-token-index={index}
          data-sentence-id={sentenceIndex}
          data-is-hard-stop={/[.!?;]/.test(token) ? "true" : undefined}
        >
          {token}
        </span>
      );
    }

    // Render for Highlighted/Selected/Karaoke state
    if (
      isHighlightActive ||
      isKaraoke ||
      mode === "clean" ||
      translationMode === "hover"
    ) {
      const showTranslation =
        (isSelected && isSelectionStart) ||
        (translatedSpan && index === translatedSpan.start && !isSelected);

      return (
        <span
          ref={tokenRef}
          id={tokenId}
          onClick={(e) => {
            e.stopPropagation();
            if (isWordToken) {
              onWordClick(index);
            }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative cursor-pointer inline transition-all duration-200",
            tokenStyling,
            tokenHighlightClass,
            isKaraoke && "bg-yellow-200 dark:bg-yellow-900/60 rounded",
            isSentenceHovered && "bg-blue-100/50 dark:bg-blue-900/30",
            isHinted && !isHighlightActive && "hint-underline"
          )}
          style={{
            WebkitBoxDecorationBreak: "clone",
            boxDecorationBreak: "clone",
          }}
          data-token-index={index}
          data-sentence-id={sentenceIndex}
          data-is-hard-stop={/[.!?;]/.test(token) ? "true" : undefined}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && isWordToken) {
              onWordClick(index);
            }
          }}
        >
          {token}

          {/* Hover Popup */}
          {translationMode === "hover" &&
            isCurrentlyHovered &&
            (hoverTranslations.length > 0 || isHoverLoading) && (
              <div
                id={`popup-${index}`}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                role="tooltip"
              >
                <div className="relative">
                  <div
                    className="bg-black text-white text-xs p-3 rounded-lg shadow-2xl min-w-[180px] max-w-[280px] pointer-events-auto"
                    onMouseEnter={handlePopupMouseEnter}
                    onMouseLeave={handlePopupMouseLeave}
                  >
                    <div className="font-bold mb-1.5 border-b border-white/10 pb-1 text-[0.85rem] tracking-wide">
                      {token}
                    </div>
                    {isHoverLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          {hoverTranslations
                            .slice(0, 3)
                            .map((translation, idx) => (
                              <div
                                key={idx}
                                className="py-0.5 text-white/90 font-medium leading-tight"
                              >
                                {translation}
                              </div>
                            ))}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const vocabItem: VocabItem = {
                                word: token,
                                translation:
                                  hoverTranslations[0] ||
                                  "Translation not available",
                                level: metadata.level,
                                status: WordStatus.Unknown,
                                context: "Hover translation",
                                timestamp: Date.now(),
                              };
                              toggleSaved(vocabItem);
                            }}
                            className={cn(
                              "transition-colors",
                              isSaved
                                ? "text-yellow-400"
                                : "text-white/30 hover:text-yellow-400"
                            )}
                          >
                            <Bookmark
                              size={16}
                              fill={isSaved ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-black" />
                </div>
              </div>
            )}

          {/* Inline Translation text above the word */}
          {showTranslation && translationText && (
            <span
              className={cn(
                "absolute bottom-full left-0 z-50 pointer-events-none w-max max-w-[250px] text-left mb-0.5 transition-all duration-300 ease-out",
                selectionLoading && isSelected
                  ? "opacity-0 translate-y-1"
                  : "opacity-100 translate-y-0"
              )}
            >
              <span className="text-blue-600 dark:text-blue-400 text-[0.95rem] font-handwriting font-bold leading-tight block px-1 drop-shadow-sm whitespace-nowrap">
                {translationText}
              </span>
            </span>
          )}

          {/* Loading indicator */}
          {selectionLoading && isSelected && isSelectionStart && (
            <span className="absolute bottom-full left-0 mb-1 opacity-100 transition-opacity duration-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500/70" />
            </span>
          )}
        </span>
      );
    }

    // Default return
    return (
      <span
        ref={tokenRef}
        id={tokenId}
        className={cn(
          "transition-colors duration-200 cursor-pointer rounded px-0 mx-0",
          tokenStyling,
          isHinted && "hint-underline"
        )}
        data-token-index={index}
        data-sentence-id={sentenceIndex}
        onClick={() => isWordToken && onWordClick(index)}
      >
        {token}
      </span>
    );
  }
);

Token.displayName = "Token";
