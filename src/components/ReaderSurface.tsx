import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { WordStatus, TranslatedSpan } from "../types";
import { useReaderSettings } from "../hooks/useReaderSettings";

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
  } = useReaderSettings();
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

  // Orchestrator: Handle Word Click
  const handleWordClick = (index: number) => {
    if (mode === "clean") return;

    // Pause Audio Mode if active
    if (karaokeActive) {
      setKaraokeActive(false);
    }

    // 1. Calculate Selection (Optimistic UI: Update highlight immediately)
    const newSelection = handleWordSelection(index, allTokens);
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

    // Create new abort controller for this request
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    // Set debounce timer for API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // 3. Fetch Translation with Context
        // Extract the full sentence context for the selected phrase
        let contextSentence = "";
        // Find sentence boundaries around the selection
        let sentenceStart = newSelection.start;
        let sentenceEnd = newSelection.end;

        // Scan backwards for sentence start
        while (
          sentenceStart > 0 &&
          !/[.!?;]/.test(allTokens[sentenceStart - 1])
        ) {
          sentenceStart--;
        }
        // Scan forwards for sentence end
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

        // Format the context for the translation API
        const contextForApi = `Translate this phrase as it appears in context: "${contextSentence}"`;

        const result = await translateText(newSelection.text, contextForApi);

        if (result && !newAbortController.signal.aborted) {
          // 4. Update Selection State with Result
          setSelection((prev) => {
            if (!prev || prev.text !== newSelection.text) return prev;
            return {
              ...prev,
              translation: result.text,
              loading: false,
            };
          });

          // 5. Update Persistent Spans
          setTranslatedSpans((prev) => {
            const { start, end } = newSelection;
            // Remove any spans that overlap with the new selection
            // This ensures visual clarity and prevents duplicate translations
            const filtered = prev.filter(
              (span) =>
                // Keep spans that don't overlap at all
                span.end < start || span.start > end
            );
            return [...filtered, { start, end, translation: result.text }];
          });

          // 6. Add to History
          const vocabItem = {
            word: newSelection.text,
            translation: result.text,
            level: metadata.level,
            status: WordStatus.Learning,
            context: contextSentence,
            position: newSelection.start,
            timestamp: Date.now(),
          };

          addToHistory(vocabItem);

          // 7. Set as selected dictionary word and switch mode
          const store = useStore.getState();
          store.setSelectedDictionaryWord(vocabItem);
          store.setSidebarMode("dictionary");
        } else if (!newAbortController.signal.aborted) {
          setSelection((prev) =>
            prev ? { ...prev, loading: false, translation: "Error" } : null
          );
        }
      } catch (error: any) {
        if (!newAbortController.signal.aborted) {
          console.error("Translation error:", error);
          setSelection((prev) =>
            prev ? { ...prev, loading: false, translation: "Error" } : null
          );
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
  const renderToken = (token: string, index: number) => {
    // Check if this token should be highlighted for karaoke
    // We need to approximate which token corresponds to the current character index (currentWordIdx)
    // This is tricky with pre-tokenized text.
    // A simpler approach for now:
    // If the token's start index in the full text roughly matches currentWordIdx?
    // No, currentWordIdx is relative to the SENTENCE text in the utterance.
    //
    // Let's pass the audio state down to the Views, and let them handle highlighting
    // because they know the sentence structure.
    //
    // Actually, Token component is unaware of sentence context.
    // We should probably highlight at the View level where we map tokens to sentences.

    return (
      <Token
        key={index}
        token={token}
        index={index}
        selection={selection}
        karaokeIndex={-1} // Disabled old karaoke, handled by parent
        translatedSpans={translatedSpans}
        metadata={metadata}
        mode={mode}
        onWordClick={handleWordClick}
        onClearSelection={clearSelection}
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
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "mx-auto px-8 py-12 pb-32 transition-all duration-300",
          columnWidth === "centered" ? "max-w-3xl" : "max-w-[1400px]"
        )}
        style={{ fontSize: `${fontSize}px` }}
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
