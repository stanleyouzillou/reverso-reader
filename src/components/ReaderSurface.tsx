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

// Components
import { ReaderHeader } from "./reader/ReaderHeader";
import { DualModeView } from "./reader/DualModeView";
import { SingleModeView } from "./reader/SingleModeView";
import { Token } from "./reader/Token";
import { cn } from "../lib/utils";

export const ReaderSurface: React.FC = () => {
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
  const handleWordClick = async (index: number) => {
    if (mode === "clean") return;

    // Pause Audio Mode if active
    if (karaokeActive) {
      setKaraokeActive(false);
    }

    // 1. Calculate Selection
    const newSelection = handleWordSelection(index, allTokens);
    if (!newSelection) return;

    // 2. Fetch Translation with Context
    // Extract the full sentence context for the selected phrase
    let contextSentence = "";
    // Find sentence boundaries around the selection
    let start = newSelection.start;
    let end = newSelection.end;

    // Scan backwards for sentence start
    while (start > 0 && !/[.!?]/.test(allTokens[start - 1])) {
      start--;
    }
    // Scan forwards for sentence end
    while (end < allTokens.length - 1 && !/[.!?]/.test(allTokens[end])) {
      end++;
    }

    contextSentence = allTokens
      .slice(start, end + 1)
      .join("")
      .trim();

    const result = await translateText(newSelection.text, contextSentence);

    if (result) {
      // 3. Update Selection State with Result
      setSelection((prev) => {
        if (!prev || prev.text !== newSelection.text) return prev;
        return {
          ...prev,
          translation: result.text,
          loading: false,
        };
      });

      // 4. Update Persistent Spans
      setTranslatedSpans((prev) => {
        const { start, end } = newSelection;
        const filtered = prev.filter(
          (span) =>
            !(span.start >= start && span.start <= end) &&
            !(span.end >= start && span.end <= end) &&
            !(start >= span.start && end <= span.end)
        );
        return [...filtered, { start, end, translation: result.text }];
      });

      // 5. Add to History
      addToHistory({
        word: newSelection.text,
        translation: result.text,
        level: metadata.level,
        status: WordStatus.Learning,
        context: getContext(newSelection.start, newSelection.end),
        timestamp: Date.now(),
      });
    } else {
      setSelection((prev) =>
        prev ? { ...prev, loading: false, translation: "Error" } : null
      );
    }
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
    </div>
  );
};
