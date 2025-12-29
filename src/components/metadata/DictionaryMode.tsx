import React from 'react';
import { BookOpen, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { VocabItem } from '../../types';
import { useStore } from '../../store/useStore';

interface DictionaryModeProps {
  className?: string;
}

export const DictionaryMode: React.FC<DictionaryModeProps> = ({
  className = ''
}) => {
  const { selectedDictionaryWord, history } = useStore();

  return (
    <div className={cn('flex flex-col h-full', className)} style={{ minHeight: 0 }}>
      {selectedDictionaryWord ? (
        <div className="flex-1 overflow-y-auto p-4" role="tabpanel" aria-labelledby="dictionary-tab">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-1" id="selected-word">{selectedDictionaryWord.word}</h3>
            <p className="text-slate-600 mb-3 text-lg" id="selected-translation">{selectedDictionaryWord.translation}</p>

            {selectedDictionaryWord.context && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-base mb-4" aria-label="Context sentence">
                <p className="italic text-slate-700">"...{selectedDictionaryWord.context}..."</p>
              </div>
            )}

            <div className="mt-4 text-base text-slate-600">
              <p className="font-medium mb-2">Definition:</p>
              <p>This would contain the detailed definition of the word from a dictionary API.</p>
            </div>
          </div>

          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4" id="recent-lookups-heading">
                Recent Lookups
              </h4>
              <div className="space-y-3" aria-labelledby="recent-lookups-heading">
                {history.slice(0, 5).map((item, idx) => (
                  <div
                    key={`${item.word}-${idx}`}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                    role="button"
                    tabIndex={0}
                    aria-label={`View definition for ${item.word}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        // In a real implementation, this would select the word
                      }
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-800">{item.word}</span>
                      <span className="text-slate-600">{item.translation}</span>
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