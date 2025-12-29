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
        setSelection(null);
        return null;
      }

      const isBefore = index < selection.start;
      
      let adjacent = true;
      const checkRangeStart = isBefore ? index + 1 : selection.end + 1;
      const checkRangeEnd = isBefore ? selection.start : index;
      
      // Strict Adjacency Check:
      // We only allow expansion if there are NO other words between the selection and the new click.
      // Whitespace and non-sentence-ending punctuation are allowed.
      for (let i = checkRangeStart; i < checkRangeEnd; i++) {
        const t = allTokens[i];
        if (isWord(t)) {
            adjacent = false; // Found another word in between -> Gap -> Not adjacent
            break;
        }
        if (/[.!?]/.test(t)) { 
            adjacent = false; // Found sentence boundary -> Not adjacent
            break;
        }
      }

      if (adjacent) {
        // Expand selection while preserving the anchor
        if (isBefore) {
            newStart = index;
            newEnd = selection.end;
        } else {
            newStart = selection.start;
            newEnd = index;
        }
      } else {
        // Start new selection
        newStart = index;
        newEnd = index;
      }
    }

    const selectedTokens = allTokens.slice(newStart, newEnd + 1);
    const textToTranslate = selectedTokens.join("");

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
