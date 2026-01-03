import { useState, useCallback, useRef } from 'react';
import { VocabItem, CEFRLevel, WordStatus } from '../types';
import { useStore } from '../store/useStore';

interface UseInlineTranslationReturn {
  showTranslation: boolean;
  selectedWord: string | null;
  position: { x: number; y: number } | null;
  isSaved: boolean;
  openTranslation: (word: string, position: { x: number; y: number }) => void;
  closeTranslation: () => void;
  toggleSave: () => void;
  addToHistory: (item: VocabItem) => void;
}

export const useInlineTranslation = (): UseInlineTranslationReturn => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const saved = useStore((state) => state.saved);
  const addToHistoryStore = useStore((state) => state.addToHistory);
  const toggleSaved = useStore((state) => state.toggleSaved);
  const [isSaved, setIsSaved] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openTranslation = useCallback((word: string, pos: { x: number; y: number }) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setSelectedWord(word);
    setPosition(pos);
    setShowTranslation(true);
    
    // Check if the word is already saved
    setIsSaved(saved.some(item => item.word.toLowerCase() === word.toLowerCase()));
  }, [saved]);

  const closeTranslation = useCallback(() => {
    // Add a small delay to allow for brief mouse exits
    timeoutRef.current = setTimeout(() => {
      setShowTranslation(false);
      setSelectedWord(null);
      setPosition(null);
    }, 100);
  }, []);

  const toggleSave = useCallback(() => {
    if (selectedWord) {
      const vocabItem: VocabItem = {
        word: selectedWord,
        translation: '', // This will be filled when translation is available
        level: CEFRLevel.B1, // This will be updated when translation is available
        status: WordStatus.Unknown,
        context: 'Inline translation',
        timestamp: Date.now(),
      };
      
      toggleSaved(vocabItem);
      setIsSaved(prev => !prev);
    }
  }, [selectedWord, toggleSaved]);

  return {
    showTranslation,
    selectedWord,
    position,
    isSaved,
    openTranslation,
    closeTranslation,
    toggleSave,
    addToHistory: addToHistoryStore
  };
};