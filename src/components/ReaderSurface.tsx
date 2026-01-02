import React, { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "../store/useStore";
import { WordStatus, TranslatedSpan } from "../types";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { isWord } from "../lib/utils";
import { multiTranslationService } from "../services/MultiTranslationService";

// Hooks
import { useTranslationEngine } from "../hooks/useTranslationEngine";
import { useWordSelection } from "../hooks/useWordSelection";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useArticleIngestion } from "../hooks/useArticleIngestion";
import { useVocabulary } from "../hooks/useVocabulary";
import { useInlineTranslation } from "../hooks/useInlineTranslation";

// Components
import { ReaderHeader } from "./reader/ReaderHeader";
import { DualModeView } from "./reader/DualModeView";
import { SingleModeView } from "./reader/SingleModeView";
import { Token } from "./reader/Token";
import { InlineTranslation } from "./translation/InlineTranslation";
import { cn } from "../lib/utils";

interface ReaderSurfaceProps {
  sidebarCollapsed?: boolean;
}

export const ReaderSurface: React.FC<ReaderSurfaceProps> = ({
  sidebarCollapsed = false,
}) => {
  // 1. Global Store & Layout State
  const {
    mode,
    dualModeOption,
    setDualModeOption,
    currentSentenceIdx,
    currentWordIdx,
    karaokeActive,
    setCurrentSentenceIdx,
    setKaraokeActive,
    isPaused,
    setIsPaused,
  } = useStore();

  // Inline translation functionality
  const {
    showTranslation,
    selectedWord,
    position,
    isSaved,
    openTranslation,
    closeTranslation,
    toggleSave,
    addToHistory: addToHistoryInline,
  } = useInlineTranslation();
  const {
    fontFamily,
    fontWeight,
    fontSize,
    bgColor,
    theme,
    columnWidth,
    readingMode,
    translationMode,
    l2Language,
  } = useReaderSettings();

  // 1.5. Dynamic Line Height Calculation
  const dynamicLineHeight = useMemo(() => {
    // Base line height for readability
    let base = 1.625; // Default "relaxed"

    // If inline translations are enabled, we need significant vertical space
    if (translationMode === "inline") {
      // Inline translations (text-[0.95rem]) appear above the word.
      // We need space for: Word Height (1em) + Translation (~0.95em) + Buffer (~0.25em)
      // Total roughly 2.2 - 2.5em depending on language.
      base = 2.4;
    }

    // Adjust for specific languages with taller characters or complex scripts
    const complexScripts = ["ja", "zh", "ko", "ar", "hi", "th"];
    if (complexScripts.includes(l2Language)) {
      base += 0.2;
    }

    // Further adjustment based on font size - larger fonts need slightly less relative padding
    if (fontSize > 24) {
      base -= 0.1;
    } else if (fontSize < 14) {
      base += 0.1;
    }

    return base;
  }, [translationMode, l2Language, fontSize]);

  const containerRef = useRef<HTMLDivElement>(null);
  // Track the abort controller for pending requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 2. Data Ingestion
  const {
    allTokens,
    paragraphTokens,
    paragraphs,
    l1Paragraphs,
    pairedSentences,
    sentenceToParagraphMap, // Added: Mapping for Single Mode highlighting
    tokenToSentenceMap,
    getContext,
    title,
    l1_title,
    categories,
    metadata,
  } = useArticleIngestion();

  // 3. Audio / Karaoke
  // We pass pairedSentences for the new sentence-based TTS
  useAudioPlayer(pairedSentences, containerRef);

  // 4. Selection & Translation Logic
  const { selection, setSelection, handleWordSelection, clearSelection } =
    useWordSelection();

  const { translateText } = useTranslationEngine();
  const { addToHistory } = useVocabulary();

  // Local state for persistent visual spans
  const [translatedSpans, setTranslatedSpans] = useState<TranslatedSpan[]>([]);

  // Track the latest selection version to implement only-latest-wins
  const latestSelectionVersionRef = useRef<number>(0);

  // 5. Dual Mode UI State
  const [hoveredSentenceIndex, setHoveredSentenceIndex] = useState<
    number | null
  >(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(
    new Set()
  );

  // Reset local UI state on mode change
  useEffect(() => {
    clearSelection();
    setHoveredSentenceIndex(null);
    setVisibleTranslations(new Set());
  }, [mode, dualModeOption, clearSelection]);

  // Handle keyboard events for clearing selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearSelection]);

  // Orchestrator: Handle Word Click
  const handleWordClick = (index: number) => {
    if (mode === "clean") return;

    // Pause Audio Mode if active
    if (karaokeActive) {
      setKaraokeActive(false);
    }

    // 1. Calculate Selection (Optimistic UI: Update highlight immediately)
    const newSelection = handleWordSelection(
      index,
      allTokens,
      tokenToSentenceMap
    );
    if (!newSelection) return;

    // 2. Debounced Translation Request (250ms delay)
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Abort any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Update the latest selection version
    latestSelectionVersionRef.current = newSelection.version;

    // Create new abort controller for this request
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    // Set debounce timer for API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // 3. Fetch Translation with Context
        // Extract the full sentence context for the selected phrase
        let contextSentence = "";

        if (newSelection.sentenceId !== null) {
          // Use the sentenceId from selection to get context
          contextSentence = pairedSentences[newSelection.sentenceId]?.l2 || "";
        } else {
          // Fallback to boundary scan
          let sentenceStart = newSelection.start;
          let sentenceEnd = newSelection.end;
          while (
            sentenceStart > 0 &&
            !/[.!?;]/.test(allTokens[sentenceStart - 1])
          ) {
            sentenceStart--;
          }
          while (
            sentenceEnd < allTokens.length - 1 &&
            !/[.!?;]/.test(allTokens[sentenceEnd])
          ) {
            sentenceEnd++;
          }
          contextSentence = allTokens
            .slice(sentenceStart, sentenceEnd + 1)
            .join("")
            .trim();
        }

        // For chunk mode, build phraseText by joining the selected tokens exactly
        let phraseText = "";
        if (newSelection.isChunkActive) {
          // Join the selected tokens exactly as they are to preserve punctuation/spacing
          phraseText = allTokens
            .slice(newSelection.start, newSelection.end + 1)
            .join("");
        } else {
          // For single word mode, use the existing text
          phraseText = newSelection.text;
        }

        // The specific word for the dictionary lookup (always just the clicked token)
        // Restrict dictionary lookups to only the specific word clicked by the user
        const dictionaryWordText = allTokens[newSelection.clickedIndex];

        // Check for cached translation before making API call
        const sourceLang =
          useReaderSettings.getState().l2Language.split("-")[0] || "en";
        const targetLang = "fr"; // Default target language

        // For caching, we'll use the multiTranslationService which should handle chunk caching
        const cached = multiTranslationService.getCachedTranslations(
          phraseText,
          targetLang,
          sourceLang,
          contextSentence
        );

        let result;
        if (cached && cached.translations.length > 0) {
          // Use cached result
          result = { text: cached.translations[0] };
        } else {
          // Format the context for the translation API
          const contextForApi = `Translate this phrase as it appears in context: "${contextSentence}"`;

          result = await translateText(phraseText, contextForApi);

          // Cache the result if successful
          if (result) {
            multiTranslationService.cacheTranslation(
              phraseText,
              targetLang,
              sourceLang,
              result.text,
              contextSentence
            );
          }
        }

        if (result && !newAbortController.signal.aborted) {
          // 4. Update Selection State with Result - only if this is the latest request
          setSelection((prev) => {
            // Only update if this is the same version and text, and this is the latest request
            if (
              !prev ||
              prev.version !== newSelection.version ||
              prev.text !== newSelection.text ||
              newSelection.version < latestSelectionVersionRef.current
            )
              return prev;
            return {
              ...prev,
              translation: result.text,
              loading: false,
            };
          });

          // 5. Update Persistent Spans - only if this is the latest request
          if (newSelection.version >= latestSelectionVersionRef.current) {
            setTranslatedSpans((prev) => {
              const { start, end, isChunkActive } = newSelection;
              // Remove any spans that overlap with the new selection
              const filtered = prev.filter(
                (span) => span.end < start || span.start > end
              );
              return [
                ...filtered,
                { start, end, translation: result.text, isChunkActive },
              ];
            });
          }

          // 6. Add to History - only if this is the latest request
          if (newSelection.version >= latestSelectionVersionRef.current) {
            // For dictionary lookup, we only use the specific word clicked
            const dictionaryVocabItem = {
              word: dictionaryWordText,
              translation: "", // Dictionary will fetch its own translation/definition
              level: metadata.level,
              status: WordStatus.Learning,
              context: contextSentence,
              position: newSelection.clickedIndex,
              timestamp: Date.now(),
            };

            const historyVocabItem = {
              word: phraseText, // History still records the whole phrase/chunk
              translation: result.text,
              level: metadata.level,
              status: WordStatus.Learning,
              context: contextSentence,
              position: newSelection.start,
              timestamp: Date.now(),
            };

            addToHistory(historyVocabItem);

            // 7. Set as selected dictionary word and switch mode
            const store = useStore.getState();
            store.setSelectedDictionaryWord(dictionaryVocabItem);
            store.setSidebarMode("dictionary");
          }
        } else if (!newAbortController.signal.aborted) {
          // Only update to error state if this is the latest request
          setSelection((prev) => {
            if (
              !prev ||
              prev.version !== newSelection.version ||
              newSelection.version < latestSelectionVersionRef.current
            )
              return prev;
            return { ...prev, loading: false, translation: "Error" };
          });
        }
      } catch (error: any) {
        if (!newAbortController.signal.aborted) {
          console.error("Translation error:", error);
          // Only update to error state if this is the latest request
          setSelection((prev) => {
            if (
              !prev ||
              prev.version !== newSelection.version ||
              newSelection.version < latestSelectionVersionRef.current
            )
              return prev;
            return { ...prev, loading: false, translation: "Error" };
          });
        }
      } finally {
        // Clean up the abort controller if this was the active one
        if (abortControllerRef.current === newAbortController) {
          abortControllerRef.current = null;
        }
      }
    }, 250); // 250ms debounce
  };

  // Orchestrator: Handle Sentence Play
  const handlePlaySentence = (index: number) => {
    setCurrentSentenceIdx(index);
    setKaraokeActive(true);
  };

  // Render Token Wrapper
  const renderToken = (
    token: string,
    index: number,
    isKaraoke: boolean = false
  ) => {
    // Get the sentence index for this token
    const sentenceIndex = tokenToSentenceMap
      ? tokenToSentenceMap[index]
      : undefined;

    const sentenceText =
      sentenceIndex !== undefined && pairedSentences[sentenceIndex]
        ? pairedSentences[sentenceIndex].l2
        : undefined;

    const isSelected =
      selection && index >= selection.start && index <= selection.end;
    const isSelectionStart = selection?.start === index;

    return (
      <Token
        key={index}
        token={token}
        index={index}
        isSelected={isSelected}
        isSelectionStart={isSelectionStart}
        selectionLoading={selection?.loading}
        selectionTranslation={selection?.translation}
        selectionIsChunkActive={selection?.isChunkActive}
        karaokeIndex={isKaraoke ? index : -1}
        translatedSpans={translatedSpans}
        metadata={metadata}
        mode={mode}
        onWordClick={handleWordClick}
        onClearSelection={clearSelection}
        sentenceIndex={sentenceIndex}
        sentenceText={sentenceText}
      />
    );
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        theme === "dark" ? "bg-[#1A1A1A] text-[#E5E5E5]" : ""
      )}
      style={{
        backgroundColor: theme === "dark" ? "#1A1A1A" : bgColor,
        fontFamily,
        fontWeight: fontWeight || "normal",
        ["--reader-line-height" as any]: dynamicLineHeight,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "mx-auto px-8 py-12 pb-32 transition-all duration-300",
          columnWidth === "centered" ? "max-w-3xl" : "max-w-[1400px]"
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight: dynamicLineHeight }}
      >
        <ReaderHeader
          title={title}
          l1Title={l1_title}
          categories={categories}
          level={metadata.level}
          matchScore={78} // This would come from actual data in a real implementation
          wordCount={metadata.wordCount}
          estimatedMinutes={metadata.estimatedMinutes}
          mode={mode}
          dualModeOption={dualModeOption}
          setDualModeOption={setDualModeOption}
        />

        {/* DUAL MODE RENDERING */}
        {mode === "dual" && dualModeOption !== "sync" ? (
          <DualModeView
            dualModeOption={dualModeOption}
            readingMode={readingMode}
            pairedSentences={pairedSentences}
            paragraphs={paragraphs}
            l1Paragraphs={l1Paragraphs}
            hoveredSentenceIndex={hoveredSentenceIndex}
            setHoveredSentenceIndex={setHoveredSentenceIndex}
            visibleTranslations={visibleTranslations}
            setVisibleTranslations={setVisibleTranslations}
            // Audio Props
            activeSentenceIdx={karaokeActive ? currentSentenceIdx : null}
            activeWordIdx={karaokeActive ? currentWordIdx : -1}
            onPlaySentence={handlePlaySentence}
            sentenceToParagraphMap={sentenceToParagraphMap} // Pass map for hover mode highlighting
            metadata={metadata}
            mode={mode}
            isPaused={isPaused}
            renderToken={renderToken}
            tokenToSentenceMap={tokenToSentenceMap}
            allTokens={allTokens}
          />
        ) : (
          /* Standard / Sync Mode */
          <SingleModeView
            mode={mode}
            readingMode={readingMode}
            paragraphTokens={paragraphTokens}
            l1Paragraphs={l1Paragraphs}
            renderToken={renderToken}
            tokenToSentenceMap={tokenToSentenceMap}
            // Map the sentence index to paragraph index for correct highlighting
            activeSentenceIdx={
              karaokeActive && sentenceToParagraphMap
                ? sentenceToParagraphMap[currentSentenceIdx]
                : null
            }
            currentSentenceIdx={karaokeActive ? currentSentenceIdx : -1}
            activeWordIdx={karaokeActive ? currentWordIdx : -1}
            pairedSentences={pairedSentences}
            onPlaySentence={handlePlaySentence}
            sentenceToParagraphMap={sentenceToParagraphMap}
            isPaused={isPaused}
          />
        )}
      </div>

      {/* Inline Translation Popup */}
      {showTranslation && selectedWord && position && (
        <InlineTranslation
          word={selectedWord}
          position={position}
          onClose={closeTranslation}
          onAddToVocabulary={addToHistory}
          isSaved={isSaved}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  );
};
