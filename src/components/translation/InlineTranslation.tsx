import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Heart, HeartOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { VocabItem, WordStatus, CEFRLevel } from '../../types';
import { useStore } from '../../store/useStore';
import { useTranslationEngine } from '../../hooks/useTranslationEngine';
import { DEMO_ARTICLE } from '../../constants/demoContent';

interface InlineTranslationProps {
  word: string;
  context?: string;
  position?: { x: number; y: number };
  onClose: () => void;
  onAddToVocabulary: (vocabItem: VocabItem) => void;
  isSaved?: boolean;
  onToggleSave: () => void;
}

export const InlineTranslation: React.FC<InlineTranslationProps> = ({
  word,
  context,
  position,
  onClose,
  onAddToVocabulary,
  isSaved,
  onToggleSave
}) => {
  const { translateText, loading, error } = useTranslationEngine();
  const [translation, setTranslation] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<any | null>(null);
  const [showFullDefinition, setShowFullDefinition] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const result = await translateText(word, context);
        if (result) {
          setTranslation(result.text);
          
          // If there's dictionary data, store it separately
          if (result.dictionary) {
            setDictionaryData(result.dictionary);
          }
          
          // Add to vocabulary history
          const vocabItem: VocabItem = {
            word,
            translation: result.text,
            level: DEMO_ARTICLE.metadata.level || CEFRLevel.B1,
            status: WordStatus.Unknown,
            context: context || 'Inline translation',
            timestamp: Date.now(),
          };
          onAddToVocabulary(vocabItem);
        }
      } catch (err) {
        console.error('Translation error:', err);
      }
    };

    fetchTranslation();
  }, [word, context, translateText, onAddToVocabulary]);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Calculate position to keep popup within viewport
  const calculatePosition = () => {
    if (!position) return { top: '10px', left: '10px' };
    
    const popupWidth = 300; // Approximate width of the popup
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let top = position.y - 10; // Position above the word
    let left = position.x;
    
    // Adjust horizontal position to stay within viewport
    if (left + popupWidth > viewportWidth) {
      left = viewportWidth - popupWidth - 10;
    }
    
    // Ensure it doesn't go off the left side
    if (left < 10) {
      left = 10;
    }
    
    // Adjust vertical position if needed
    if (top < 50) {
      top = 50; // Minimum distance from top
    }
    
    return { top: `${top}px`, left: `${left}px` };
  };

  const positionStyle = calculatePosition();

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 max-w-xs w-auto"
      style={positionStyle}
      role="dialog"
      aria-label={`Translation for ${word}`}
      aria-modal="true"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 text-lg">{word}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close translation"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-label="Loading translation" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-slate-700 font-medium">{translation}</p>
            </div>

            {dictionaryData && (
              <div className="mb-3">
                <button
                  onClick={() => setShowFullDefinition(!showFullDefinition)}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                >
                  {showFullDefinition ? 'Show less' : 'Show definition'}
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${showFullDefinition ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFullDefinition && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    {dictionaryData.meanings && dictionaryData.meanings[0] && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 italic">
                          {dictionaryData.meanings[0].definitions[0]?.example || ''}
                        </p>
                        <p className="text-sm text-slate-500">
                          {dictionaryData.meanings[0].definitions[0]?.definition || ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={onToggleSave}
                className={`flex items-center gap-1 text-sm ${isSaved ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                aria-label={isSaved ? "Unsave word" : "Save word"}
              >
                {isSaved ? (
                  <Heart className="h-4 w-4 fill-current" aria-label="Saved" />
                ) : (
                  <Heart className="h-4 w-4" aria-label="Save word" />
                )}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {context && (
                <div className="text-xs text-slate-500 italic max-w-[180px] truncate" title={context}>
                  "...{context}..."
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};