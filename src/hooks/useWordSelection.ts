import { useState, useCallback } from 'react';
import { Selection } from '../types';
import { isWord } from '../lib/utils';
import { useReaderSettings } from './useReaderSettings';

interface UseWordSelectionReturn {
  selection: Selection | null;
  setSelection: React.Dispatch<React.SetStateAction<Selection | null>>;
  handleWordSelection: (index: number, allTokens: string[]) => { start: number; end: number; text: string } | null;
  clearSelection: () => void;
}

export const useWordSelection = (): UseWordSelectionReturn => {
  const [selection, setSelection] = useState<Selection | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const handleWordSelection = useCallback((index: number, allTokens: string[]) => {
    const token = allTokens[index];
    if (!isWord(token)) return null;

    const granularity = useReaderSettings.getState().translationGranularity;

    let newStart = index;
    let newEnd = index;

    // Check adjacency if selection exists AND we are in chunk mode
    if (selection && granularity === 'chunk') {
      if (index >= selection.start && index <= selection.end) {
        // If clicking within the current selection, deselect it
        setSelection(null);
        return null;
      }

      // Check if the new word is adjacent to the current selection
      let isAdjacent = (index === selection.start - 1) || (index === selection.end + 1);

      // Check if the new word is in the same sentence as the current selection
      let inSameSentence = true;

      // Determine the range to check for sentence boundaries
      let checkStart, checkEnd;
      if (index === selection.start - 1) { // New word is before the selection
        checkStart = index + 1;
        checkEnd = selection.start - 1;
      } else if (index === selection.end + 1) { // New word is after the selection
        checkStart = selection.end + 1;
        checkEnd = index - 1;
      } else {
        // Not adjacent, so definitely not in the same sentence
        isAdjacent = false;
        inSameSentence = false;
      }

      // Check for sentence boundaries in the range
      if (isAdjacent && checkStart !== undefined && checkEnd !== undefined) {
        for (let i = checkStart; i <= checkEnd; i++) {
          if (i >= 0 && i < allTokens.length && /[.!?;]/.test(allTokens[i])) {
            inSameSentence = false;
            break;
          }
        }
      }

      // If both conditions are met (adjacent and in same sentence), extend the selection
      if (isAdjacent && inSameSentence) {
        if (index < selection.start) {
          // New word is before the selection
          newStart = index;
          newEnd = selection.end;
        } else {
          // New word is after the selection
          newStart = selection.start;
          newEnd = index;
        }
      } else {
        // Reset selection and start new single-word chunk
        newStart = index;
        newEnd = index;
      }
    }

    const selectedTokens = allTokens.slice(newStart, newEnd + 1);
    // Join tokens with space to form the phrase to translate
    const textToTranslate = selectedTokens.join(" ");

    const newSelection = {
      start: newStart,
      end: newEnd,
      text: textToTranslate,
      translation: null,
      loading: true,
    };

    setSelection(newSelection);
    return newSelection;
  }, [selection]);

  return {
    selection,
    setSelection,
    handleWordSelection,
    clearSelection,
  };
};
