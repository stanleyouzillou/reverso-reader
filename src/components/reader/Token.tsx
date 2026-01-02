import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { Loader2, Bookmark } from "lucide-react";
import { cn, isWord, normalizeLanguageCode } from "../../lib/utils";
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
import { MinimalistTranslation } from "../translation/MinimalistTranslation";
import { useInlineTranslation } from "../../hooks/useInlineTranslation";

interface TokenProps {
  token: string;
  index: number;
  isSelected?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isSelectionChunkActive?: boolean;
  karaokeIndex?: number;
  translatedSpans?: TranslatedSpan[];
  metadata: ArticleMetadata;
  mode: ReadingMode;
  onWordClick: (index: number) => void;
  onClearSelection: () => void;
  sentenceIndex?: number;
  sentenceText?: string;
  sourceLanguage?: string;
}

export const Token: React.FC<TokenProps> = memo(
  ({
    token,
    index,
    isSelected,
    isSelectionStart,
    isSelectionEnd,
    isSelectionChunkActive,
    karaokeIndex,
    translatedSpans = [],
    metadata,
    mode,
    onWordClick,
    onClearSelection,
    sentenceIndex,
    sentenceText,
    sourceLanguage,
  }) => {
    const {
      translationMode,
      showHintsEnabled,
      l2Language,
      minimalistSettings,
    } = useReaderSettings();
    const dualModeOption = useStore((state) => state.dualModeOption);
    const { translateText } = useTranslationEngine();
    const hoveredTokenId = useStore((state) => state.hoveredTokenId);
    const setHoveredTokenId = useStore((state) => state.setHoveredTokenId);
    const hoveredSentenceIdx = useStore((state) => state.hoveredSentenceIdx);
    const setHoveredSentenceIdx = useStore(
      (state) => state.setHoveredSentenceIdx
    );
    const minimalistTokenId = useStore((state) => state.minimalistTokenId);
    const setMinimalistTokenId = useStore(
      (state) => state.setMinimalistTokenId
    );
    const minimalistTranslation = useStore(
      (state) => state.minimalistTranslation
    );
    const setMinimalistTranslation = useStore(
      (state) => state.setMinimalistTranslation
    );
    const isMinimalistLoading = useStore((state) => state.isMinimalistLoading);
    const setIsMinimalistLoading = useStore(
      (state) => state.setIsMinimalistLoading
    );
    const isSaved = useStore((state) =>
      state.saved.some(
        (item) => item.word.toLowerCase() === token.toLowerCase().trim()
      )
    );
    const isTranslated = useStore(
      (state) => token.toLowerCase().trim() in state.translatedWords
    );
    const addTranslatedWord = useStore((state) => state.addTranslatedWord);
    const addToHistory = useStore((state) => state.addToHistory);
    const highlightedWords = useStore((state) => state.highlightedWords);
    const toggleSaved = useStore((state) => state.toggleSaved);
    const [hoverTranslations, setHoverTranslations] = useState<string[]>([]);
    const [isHoverLoading, setIsHoverLoading] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const tokenRef = useRef<HTMLSpanElement>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const tokenId = `token-${index}`;
    const isCurrentlyHovered = hoveredTokenId === tokenId;
    const isMinimalistActive = minimalistTokenId === tokenId;
    const isKaraoke = index === karaokeIndex;

    // Determine if this sentence is hovered in dual/sync mode
    const isSentenceHovered =
      translationMode !== "minimalist" && // Disable sentence highlight in minimalist mode
      (mode === "dual" || dualModeOption === "sync") &&
      sentenceIndex !== undefined &&
      hoveredSentenceIdx === sentenceIndex;

    // Track when a word becomes translated to trigger animation
    const prevIsTranslatedRef = useRef(isTranslated);
    useEffect(() => {
      if (isTranslated && !prevIsTranslatedRef.current) {
        setShouldAnimate(true);
        const timer = setTimeout(() => setShouldAnimate(false), 1200);
        return () => clearTimeout(timer);
      }
      prevIsTranslatedRef.current = isTranslated;
    }, [isTranslated]);

    const handleMouseEnter = useCallback(async () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }

      if (translationMode === "minimalist" && isWord(token)) {
        setHoveredTokenId(tokenId);
        return;
      }

      if (translationMode === "hover" && mode !== "clean" && isWord(token)) {
        setHoveredTokenId(tokenId);
        addTranslatedWord(token);

        if (sentenceIndex !== undefined) {
          setHoveredSentenceIdx(sentenceIndex);
        }

        const sourceLang = normalizeLanguageCode(sourceLanguage || "en");
        const targetLang = normalizeLanguageCode(l2Language || "fr");

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
      sourceLanguage,
    ]);

    const handleMouseLeave = useCallback(() => {
      if (translationMode === "hover" || translationMode === "minimalist") {
        leaveTimeoutRef.current = setTimeout(
          () => {
            // Only clear if the current hovered token is still this one
            // This prevents the "fade out" when moving quickly between words
            if (useStore.getState().hoveredTokenId === tokenId) {
              setHoveredTokenId(null);
            }
            if (
              sentenceIndex !== undefined &&
              useStore.getState().hoveredSentenceIdx === sentenceIndex
            ) {
              setHoveredSentenceIdx(null);
            }
          },
          translationMode === "minimalist" ? 150 : 300 // Increased minimalist delay slightly for stability
        );
      }
    }, [
      translationMode,
      setHoveredTokenId,
      setHoveredSentenceIdx,
      tokenId,
      sentenceIndex,
    ]);

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
      !!translatedSpan?.isChunkActive || !!isSelectionChunkActive;

    const isWordToken = isWord(token);

    const handleTokenClick = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isWordToken) return;

        // Ensure hover state is set when clicking
        if (hoveredTokenId !== tokenId) {
          setHoveredTokenId(tokenId);
        }

        if (translationMode === "minimalist") {
          addTranslatedWord(token);
          setMinimalistTokenId(tokenId);
          setMinimalistTranslation(null);
          setIsMinimalistLoading(true);

          // sourceLang is the language of the article (L2 for the user)
          // targetLang is the user's chosen target language from settings (L1/l2Language)
          const sourceLang = normalizeLanguageCode(sourceLanguage || "en");
          const targetLang = normalizeLanguageCode(l2Language || "fr");

          console.log(`[Token] Minimal mode translation request:`, {
            token,
            sourceLang,
            targetLang,
            sourceLanguageProp: sourceLanguage,
            l2LanguageSetting: l2Language,
          });

          // Try cache first
          const cached = multiTranslationService.getCachedTranslations(
            token,
            targetLang,
            sourceLang,
            sentenceText
          );

          if (cached && cached.translations.length > 0) {
            setMinimalistTranslation(cached.translations[0]);
            setIsMinimalistLoading(false);

            // Add to history even if cached
            addToHistory({
              word: token,
              translation: cached.translations[0],
              level: metadata.level,
              status: WordStatus.Learning,
              context: sentenceText,
              timestamp: Date.now(),
            });
          } else {
            // Add artificial delay if configured
            if (minimalistSettings.popupDelay > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, minimalistSettings.popupDelay)
              );
            }

            const result =
              await multiTranslationService.getMultipleTranslations(
                token,
                targetLang,
                sourceLang,
                sentenceText
              );

            if (useStore.getState().minimalistTokenId !== tokenId) return;

            if (result && !result.error && result.translations.length > 0) {
              setMinimalistTranslation(result.translations[0]);
              addToHistory({
                word: token,
                translation: result.translations[0],
                level: metadata.level,
                status: WordStatus.Learning,
                context: sentenceText,
                timestamp: Date.now(),
              });
            } else {
              const fallbackResult = await translateText(
                token,
                sentenceText,
                targetLang,
                sourceLang
              );
              if (useStore.getState().minimalistTokenId !== tokenId) return;
              if (fallbackResult && !fallbackResult.error) {
                setMinimalistTranslation(fallbackResult.text);
                addToHistory({
                  word: token,
                  translation: fallbackResult.text,
                  level: metadata.level,
                  status: WordStatus.Learning,
                  context: sentenceText,
                  timestamp: Date.now(),
                });
              } else {
                setMinimalistTranslation("No translation found");
              }
            }
            setIsMinimalistLoading(false);
          }
          return;
        }

        onWordClick(index);
      },
      [
        index,
        isWordToken,
        onWordClick,
        translationMode,
        tokenId,
        token,
        l2Language,
        sentenceText,
        translateText,
        setMinimalistTokenId,
        setMinimalistTranslation,
        setIsMinimalistLoading,
        minimalistSettings.popupDelay,
        sourceLanguage,
      ]
    );

    const highlightColorClass = isChunkActive
      ? "bg-blue-100/80 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"
      : "bg-blue-200/90 text-blue-900 dark:bg-blue-800/80 dark:text-blue-50";

    const tokenHighlightClass = isHighlightActive ? highlightColorClass : "";

    const tokenStyling = cn(
      "mx-0 rounded-sm transition-colors duration-200 ease-out", // Removed horizontal padding to fix alignment
      isWordToken &&
        translationMode !== "minimalist" &&
        "hover:bg-slate-100 dark:hover:bg-slate-800/50"
    );

    const minimalistHoverStyle =
      translationMode === "minimalist" && isCurrentlyHovered
        ? {
            backgroundColor: "var(--minimalist-highlight-color)",
          }
        : {};

    // Early return for non-word tokens that aren't highlighted
    // We return them as plain text nodes to prevent wrapping-induced indentation
    if (!isWordToken && !isHighlightActive && !isKaraoke) {
      return <>{token}</>;
    }

    // Render for Highlighted/Selected/Karaoke state
    if (
      isHighlightActive ||
      isKaraoke ||
      mode === "clean" ||
      translationMode === "hover" ||
      translationMode === "minimalist"
    ) {
      return (
        <span
          ref={tokenRef}
          id={tokenId}
          onClick={handleTokenClick}
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
          className={cn(
            "relative cursor-pointer inline transition-all duration-200 ease-out z-10",
            tokenStyling,
            tokenHighlightClass,
            isKaraoke && "bg-yellow-200 dark:bg-yellow-900/60 rounded",
            isSentenceHovered && "bg-blue-100/50 dark:bg-blue-900/30",
            isHinted && !isHighlightActive && "hint-underline",
            // Word State Styles
            isSaved && "word-state-saved",
            isTranslated && !isSaved && "word-state-translated",
            shouldAnimate && "animate-translated-underline"
          )}
          style={{
            WebkitBoxDecorationBreak: "clone",
            boxDecorationBreak: "clone",
            ...minimalistHoverStyle,
          }}
          data-token-index={index}
          data-sentence-id={sentenceIndex}
          data-is-hard-stop={/[.!?;]/.test(token) ? "true" : undefined}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && isWordToken) {
              handleTokenClick(e as any);
            }
          }}
        >
          {token}

          {/* Minimalist Popup */}
          {translationMode === "minimalist" && isMinimalistActive && (
            <MinimalistTranslation
              word={token}
              translation={minimalistTranslation}
              isLoading={isMinimalistLoading}
              isSaved={isSaved}
              onSave={() => {
                const vocabItem: VocabItem = {
                  word: token,
                  translation: minimalistTranslation || "",
                  level: metadata.level,
                  status: WordStatus.Unknown,
                  context: sentenceText,
                  timestamp: Date.now(),
                };
                toggleSaved(vocabItem);
              }}
              onClose={() => setMinimalistTokenId(null)}
              position={minimalistSettings.position}
            />
          )}

          {/* Hover Popup */}
          {translationMode === "hover" &&
            isCurrentlyHovered &&
            (hoverTranslations.length > 0 || isHoverLoading) && (
              <div
                id={`popup-${index}`}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[0.5rem] z-50 pointer-events-none"
                role="tooltip"
              >
                <div className="relative">
                  <div
                    className="bg-black text-white text-[0.75rem] p-[0.75rem] rounded-lg shadow-2xl min-w-[12rem] max-w-[18rem] pointer-events-auto"
                    onMouseEnter={handlePopupMouseEnter}
                    onMouseLeave={handlePopupMouseLeave}
                  >
                    <div className="font-bold mb-[0.5rem] border-b border-white/10 pb-[0.25rem] text-[0.85rem] tracking-wide">
                      {token}
                    </div>
                    {isHoverLoading ? (
                      <div className="flex items-center justify-center py-[0.5rem]">
                        <Loader2 className="h-[1rem] w-[1rem] animate-spin text-white/50" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-[0.4rem]">
                          {hoverTranslations
                            .slice(0, 3)
                            .map((translation, idx) => (
                              <div
                                key={idx}
                                className="py-[0.125rem] text-white/90 font-medium leading-tight"
                              >
                                {translation}
                              </div>
                            ))}
                        </div>
                        <div className="mt-[0.6rem] pt-[0.5rem] border-t border-white/10 flex justify-end">
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
                              size={"1rem" as any}
                              fill={isSaved ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[0.25rem] w-0 h-0 border-l-[0.375rem] border-r-[0.375rem] border-t-[0.375rem] border-l-transparent border-r-transparent border-t-black" />
                </div>
              </div>
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
