import React from 'react';
import { BookOpen, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { DefinitionCard } from '../dictionary/DefinitionCard';

interface DictionaryModeProps {
  className?: string;
}

export const DictionaryMode: React.FC<DictionaryModeProps> = ({
  className = ''
}) => {
  const { selectedDictionaryWord, history, setSelectedDictionaryWord, toggleSaved } = useStore();

  const handleNavigateToSource = (position: number) => {
    const element = document.getElementById(`token-${position}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50', 'rounded-sm');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50', 'rounded-sm');
      }, 2000);
    }
  };

  const handleAddToVocabulary = (word: string) => {
    if (selectedDictionaryWord) {
      toggleSaved(selectedDictionaryWord);
      // Success feedback could be added here
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)} style={{ minHeight: 0 }}>
      {selectedDictionaryWord ? (
        <div className="flex-1 overflow-y-auto p-6" role="tabpanel" aria-labelledby="dictionary-tab">
          <DefinitionCard
            word={selectedDictionaryWord.word}
            sourceSentence={selectedDictionaryWord.context || ""}
            sourceLanguage="en" // Should be dynamic based on article
            targetLanguage="fr" // Should be dynamic based on user settings
            textPosition={selectedDictionaryWord.position || 0}
            onAddToVocabulary={handleAddToVocabulary}
            onNavigateToSource={handleNavigateToSource}
          />

          {history.length > 1 && (
            <div className="pt-8 mt-4 border-t border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6" id="recent-lookups-heading">
                Recent Lookups
              </h4>
              <div className="space-y-3" aria-labelledby="recent-lookups-heading">
                {history.filter(item => item.word !== selectedDictionaryWord.word).slice(0, 5).map((item, idx) => (
                  <div
                    key={`${item.word}-${idx}`}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-white cursor-pointer transition-all duration-300"
                    role="button"
                    tabIndex={0}
                    aria-label={`View definition for ${item.word}`}
                    onClick={() => setSelectedDictionaryWord(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedDictionaryWord(item);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{item.word}</span>
                      <span className="text-blue-500 font-medium text-sm">{item.translation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          role="tabpanel"
          aria-labelledby="dictionary-tab"
        >
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <BookOpen size={40} className="text-slate-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-3">No word selected</h3>
          <p className="text-slate-500 mb-6 max-w-xs text-base">
            Click on any word in the article to look up its definition and see it appear here.
          </p>
          <div className="flex items-center text-slate-500 text-base bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
            <Search size={16} className="mr-2" aria-hidden="true" />
            <span>Try clicking on a word</span>
          </div>
        </div>
      )}
    </div>
  );
};