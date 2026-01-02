import { useState, useCallback } from "react";
import { Selection } from "../types";
import { isWord } from "../lib/utils";
import { useReaderSettings } from "./useReaderSettings";

interface UseWordSelectionReturn {
  selection: Selection | null;
  setSelection: React.Dispatch<React.SetStateAction<Selection | null>>;
  handleWordSelection: (
    index: number,
    allTokens: string[],
    tokenToSentenceMap: number[]
  ) => Selection | null;
  clearSelection: () => void;
}

export const useWordSelection = (): UseWordSelectionReturn => {
  const [selection, setSelection] = useState<Selection | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const handleWordSelection = useCallback(
    (index: number, allTokens: string[], tokenToSentenceMap: number[]) => {
      const token = allTokens[index];
      if (!isWord(token)) return null;

      const granularity = useReaderSettings.getState().translationGranularity;
      const sentenceId = tokenToSentenceMap[index];

      let newStart = index;
      let newEnd = index;

      // For initial selection, also include trailing punctuation
      const HARD_STOPS = [".", "!", "?", ";"];
      while (
        newEnd < allTokens.length - 1 &&
        !isWord(allTokens[newEnd + 1]) &&
        !HARD_STOPS.includes(allTokens[newEnd + 1].trim())
      ) {
        newEnd++;
      }

      let isChunkActive = false;
      let newVersion = (selection?.version || 0) + 1;

      // Interaction rules for chunk mode
      if (granularity === "chunk" && selection) {
        const inSameSentence = selection.sentenceId === sentenceId;

        if (inSameSentence) {
          // Check for adjacency (no other words between selection and clicked index)
          // and no hard stops crossed.
          let isAdjacent = false;
          let hardStopCrossed = false;

          if (index > selection.end) {
            // Checking forward
            isAdjacent = true;
            for (let i = selection.end + 1; i < index; i++) {
              if (isWord(allTokens[i])) {
                isAdjacent = false;
                break;
              }
              if (HARD_STOPS.includes(allTokens[i].trim())) {
                hardStopCrossed = true;
                break;
              }
            }
            if (isAdjacent && !hardStopCrossed) {
              newStart = selection.start;
              newEnd = index;

              // Automatically expand end to include trailing punctuation (but not hard stops or words)
              while (
                newEnd < allTokens.length - 1 &&
                !isWord(allTokens[newEnd + 1]) &&
                !HARD_STOPS.includes(allTokens[newEnd + 1].trim())
              ) {
                newEnd++;
              }

              isChunkActive = true;
            }
          } else if (index < selection.start) {
            // Checking backward
            isAdjacent = true;
            for (let i = index + 1; i < selection.start; i++) {
              if (isWord(allTokens[i])) {
                isAdjacent = false;
                break;
              }
              if (HARD_STOPS.includes(allTokens[i].trim())) {
                hardStopCrossed = true;
                break;
              }
            }
            if (isAdjacent && !hardStopCrossed) {
              newStart = index;
              newEnd = selection.end;

              // Automatically expand end to include trailing punctuation if the click was at the start
              // (though usually we expand forward, let's be robust)
              while (
                newEnd < allTokens.length - 1 &&
                !isWord(allTokens[newEnd + 1]) &&
                !HARD_STOPS.includes(allTokens[newEnd + 1].trim())
              ) {
                newEnd++;
              }

              isChunkActive = true;
            }
          } else {
            // Clicked inside existing selection - reset to this word
            newStart = index;
            newEnd = index;
            isChunkActive = false;
          }
        }
      }

      const selectedTokens = allTokens.slice(newStart, newEnd + 1);
      const textToTranslate = selectedTokens.join(""); // Use join("") because allTokens already contains spaces

      const newSelection: Selection = {
        start: newStart,
        end: newEnd,
        clickedIndex: index, // Preserve the specific word clicked
        text: allTokens.slice(newStart, newEnd + 1).join(""),
        translation: null,
        loading: true,
        isChunkActive,
        sentenceId,
        version: newVersion,
      };

      setSelection(newSelection);
      return newSelection;
    },
    [selection]
  );

  return {
    selection,
    setSelection,
    handleWordSelection,
    clearSelection,
  };
};
