import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn, isWord } from "../../lib/utils";
import {
  Selection,
  TranslatedSpan,
  ReadingMode,
  ArticleMetadata,
} from "../../types";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { useTranslationEngine } from "../../hooks/useTranslationEngine";

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
  const [hoverTranslation, setHoverTranslation] = useState<string | null>(null);
  const [isHoverLoading, setIsHoverLoading] = useState(false);

  const handleMouseEnter = useCallback(async () => {
    if (translationMode === "hover" && mode !== "clean" && isWord(token)) {
      const cached = getCachedTranslation(token);
      if (cached) {
        setHoverTranslation(cached);
      } else {
        setIsHoverLoading(true);
        // Add a small delay to prevent spamming while moving mouse fast
        // But for responsiveness, maybe we don't?
        // Let's rely on the service's debouncing if it has one (it has manual delay).
        const result = await translateText(token);
        if (result) {
          setHoverTranslation(result.text);
        }
        setIsHoverLoading(false);
      }
    }
  }, [translationMode, mode, token, translateText, getCachedTranslation]);

  const handleMouseLeave = useCallback(() => {
    if (translationMode === "hover") {
      setHoverTranslation(null);
      setIsHoverLoading(false);
    }
  }, [translationMode]);

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
      >
        {token}

        {/* Hover Popup */}
        {(hoverTranslation || isHoverLoading) && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 pointer-events-none">
            <span className="bg-slate-800/90 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm whitespace-nowrap flex items-center gap-1">
              {isHoverLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                hoverTranslation
              )}
            </span>
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800/90" />
          </span>
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
  // Logic:
  // 1. If it's the LAST token of a selection/span, we might render the popup here (old logic).
  // 2. BUT user wants the popup centered over the whole chunk.
  // 3. Current architecture is token-based. Rendering a single popup over multiple tokens is hard without a parent wrapper.
  // 4. Compromise: Render the popup on the MIDDLE token of the chunk? Or keep it on the last but position it absolute?

  // Let's refine the "show" logic.
  // We want to highlight ALL words in the chunk.
  // And show the translation once.

  const isSelectionEnd = isSelected && index === selection?.end;
  const isSpanEnd = activeSpan && index === activeSpan.end;
  const isKeyVocab =
    !isSelected && !activeSpan && keyVocab && mode === "learning";

  // Calculate if we should show the translation on THIS token
  // For multi-word selections, we want to center it.
  // Simple heuristic: Show it on the middle token index.
  const selectionLen = selection ? selection.end - selection.start + 1 : 0;
  const selectionMid = selection
    ? Math.floor(selection.start + selectionLen / 2)
    : -1;
  const showSelectionTranslation = isSelected && index === selectionMid;

  const spanLen = activeSpan ? activeSpan.end - activeSpan.start + 1 : 0;
  const spanMid = activeSpan ? Math.floor(activeSpan.start + spanLen / 2) : -1;
  const showSpanTranslation = activeSpan && index === spanMid;

  // For single words (key vocab), it's just the word itself
  const showKeyVocabTranslation = isKeyVocab;

  const translationText = showSelectionTranslation
    ? selection?.loading
      ? "..."
      : selection?.translation
    : showSpanTranslation
    ? activeSpan?.translation
    : showKeyVocabTranslation
    ? keyVocab?.translation
    : null;

  const isHighlightActive = isSelected || activeSpan;

  // We need to render the popup if:
  // 1. It has text to show
  // 2. OR it's loading (for selection)
  const shouldRenderPopup =
    translationText || (showSelectionTranslation && selection?.loading);

  if (shouldRenderPopup) {
    return (
      <span
        id={`token-${index}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(index);
        }}
        className={cn(
          "inline-flex flex-col-reverse items-center align-middle gap-0.5 mx-0.5 cursor-pointer",
          isKaraoke && "bg-yellow-200 scale-105 rounded"
        )}
        style={{ verticalAlign: "middle" }}
      >
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-inherit leading-none transition-colors",
            isHighlightActive
              ? "bg-emerald-500 text-white shadow-sm"
              : keyVocab
              ? "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-200"
              : "hover:bg-emerald-50"
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

  // Render highlighted word without popup (for other parts of the chunk)
  if (isHighlightActive) {
    return (
      <span
        id={`token-${index}`}
        onClick={() => onWordClick(index)}
        className={cn(
          "inline-block cursor-pointer transition-all duration-200 rounded px-0.5 mx-0.5",
          "bg-emerald-500 text-white shadow-sm", // Uniform highlight style for chunk
          isKaraoke && "bg-yellow-200 text-slate-900 scale-105"
        )}
      >
        {token}
      </span>
    );
  }

  return (
    <span
      id={`token-${index}`}
      onClick={() => onWordClick(index)}
      className={cn(
        "relative inline-block cursor-pointer transition-all duration-200 rounded px-0.5 -mx-0.5",
        "hover:bg-emerald-50 hover:text-emerald-800",
        isHighlightActive && "bg-emerald-100 text-emerald-900",
        isKaraoke && "bg-yellow-200 scale-105"
      )}
    >
      {token}
    </span>
  );
};
