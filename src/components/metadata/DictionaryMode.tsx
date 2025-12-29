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
            <h3 className="text-lg font-bold text-slate-800 mb-1" id="selected-word">{selectedDictionaryWord.word}</h3>
            <p className="text-slate-600 mb-3" id="selected-translation">{selectedDictionaryWord.translation}</p>

            {selectedDictionaryWord.context && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm" aria-label="Context sentence">
                <p className="italic text-slate-700">"...{selectedDictionaryWord.context}..."</p>
              </div>
            )}

            <div className="mt-4 text-sm text-slate-600">
              <p className="font-medium mb-2">Definition:</p>
              <p>This would contain the detailed definition of the word from a dictionary API.</p>
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3" id="recent-lookups-heading">
                Recent Lookups
              </h4>
              <div className="space-y-2" aria-labelledby="recent-lookups-heading">
                {history.slice(0, 5).map((item, idx) => (
                  <div
                    key={`${item.word}-${idx}`}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
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
                      <span className="text-slate-500 text-sm">{item.translation}</span>
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
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <BookOpen size={32} className="text-slate-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No word selected</h3>
          <p className="text-slate-500 mb-4 max-w-xs">
            Click on any word in the article to look up its definition and see it appear here.
          </p>
          <div className="flex items-center text-slate-400 text-sm bg-slate-50 px-3 py-2 rounded-full border border-slate-200">
            <Search size={14} className="mr-1" aria-hidden="true" />
            <span>Try clicking on a word</span>
          </div>
        </div>
      )}
    </div>
  );
};