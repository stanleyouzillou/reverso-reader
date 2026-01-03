import React from "react";
import { BookOpen, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useStore } from "../../store/useStore";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { DefinitionCard } from "../dictionary/DefinitionCard";
import { VocabContextSentence } from "../vocabulary/VocabContextSentence";
import { DEMO_ARTICLE } from "../../constants/demoContent";

interface DictionaryModeProps {
  className?: string;
}

export const DictionaryMode: React.FC<DictionaryModeProps> = ({
  className = "",
}) => {
  const selectedDictionaryWord = useStore(
    (state) => state.selectedDictionaryWord
  );
  const history = useStore((state) => state.history);
  const saved = useStore((state) => state.saved);
  const setSelectedDictionaryWord = useStore(
    (state) => state.setSelectedDictionaryWord
  );
  const toggleSaved = useStore((state) => state.toggleSaved);

  const { l2Language } = useReaderSettings();

  const isWordSaved = selectedDictionaryWord
    ? saved.some((item) => item.word === selectedDictionaryWord.word)
    : false;

  const handleNavigateToSource = (position: number) => {
    const element = document.getElementById(`token-${position}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a brief highlight effect
      element.classList.add(
        "ring-4",
        "ring-blue-400",
        "ring-opacity-50",
        "rounded-sm"
      );
      setTimeout(() => {
        element.classList.remove(
          "ring-4",
          "ring-blue-400",
          "ring-opacity-50",
          "rounded-sm"
        );
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
    <div
      className={cn("flex flex-col h-full", className)}
      style={{ minHeight: 0 }}
    >
      {selectedDictionaryWord ? (
        <div
          className="flex-1 overflow-y-auto p-[1.5rem]"
          role="tabpanel"
          aria-labelledby="dictionary-tab"
        >
          <DefinitionCard
            word={selectedDictionaryWord.word}
            sourceSentence={selectedDictionaryWord.context || ""}
            sourceLanguage={DEMO_ARTICLE.l2_language}
            targetLanguage={l2Language}
            textPosition={selectedDictionaryWord.position || 0}
            onAddToVocabulary={handleAddToVocabulary}
            onNavigateToSource={handleNavigateToSource}
            isSaved={isWordSaved}
          />

          {history.length > 1 && (
            <div className="pt-[2rem] mt-[1rem] border-t border-slate-100 dark:border-slate-800">
              <h4
                className="text-[0.6875rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-[1.5rem]"
                id="recent-lookups-heading"
              >
                Recent Lookups
              </h4>
              <div
                className="flex flex-col gap-[0.75rem]"
                aria-labelledby="recent-lookups-heading"
              >
                {history
                  .filter((item) => item.word !== selectedDictionaryWord.word)
                  .slice(0, 5)
                  .map((item, idx) => (
                    <div
                      key={`${item.word}-${idx}`}
                      className="p-[1rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1rem] hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-white dark:hover:border-slate-700 cursor-pointer transition-all duration-300"
                      role="button"
                      tabIndex={0}
                      aria-label={`View definition for ${item.word}`}
                      onClick={() => setSelectedDictionaryWord(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedDictionaryWord(item);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[1rem]">
                          {item.word}
                        </span>
                        <span className="text-blue-500 dark:text-blue-400 font-medium text-[0.875rem]">
                          {item.translation}
                        </span>
                      </div>
                      <VocabContextSentence
                        sentence={item.context || ""}
                        word={item.word}
                        className="mt-[0.5rem] text-[0.75rem]"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center p-[2rem] text-center"
          role="tabpanel"
          aria-labelledby="dictionary-tab"
        >
          <div className="bg-slate-100 dark:bg-slate-800 p-[1.5rem] rounded-full mb-[1.5rem]">
            <BookOpen
              size="2.5rem"
              className="text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-[1.25rem] font-bold text-slate-700 dark:text-slate-300 mb-[0.75rem]">
            No word selected
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-[1.5rem] max-w-[20rem] text-[1rem]">
            Click on any word in the article to look up its definition and see
            it appear here.
          </p>
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-[1rem] bg-slate-50 dark:bg-slate-800/50 px-[1rem] py-[0.75rem] rounded-[0.5rem] border border-slate-200 dark:border-slate-800">
            <Search size="1rem" className="mr-[0.5rem]" aria-hidden="true" />
            <span>Try clicking on a word</span>
          </div>
        </div>
      )}
    </div>
  );
};
