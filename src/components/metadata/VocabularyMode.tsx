import React, { useState } from "react";
import { History, Bookmark, Lightbulb, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";
import { DEMO_ARTICLE } from "../../constants/demoContent";
import { VocabContextSentence } from "../vocabulary/VocabContextSentence";

type Tab = "history" | "saved" | "learn";

interface VocabularyModeProps {
  className?: string;
}

export const VocabularyMode: React.FC<VocabularyModeProps> = ({
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const { history, saved, toLearn, clearHistory, addToHistory, toggleSaved } =
    useStore();

  // Debugging log to check history updates
  React.useEffect(() => {
    console.log("Current History:", history);
  }, [history]);

  const activeList =
    activeTab === "history" ? history : activeTab === "saved" ? saved : toLearn;

  // Use a key to force re-render if needed, though React should handle this via the hook
  const listKey = `${activeTab}-${activeList.length}`;

  return (
    <div
      className={cn("flex flex-col h-full", className)}
      style={{ minHeight: 0 }}
    >
      {/* Tabs - Minimalist redesigned selector */}
      <div
        className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
        role="tablist"
      >
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-0.5 transition-all border-b-2 relative",
            "min-h-[3.25rem] justify-center", // Optimized height to match other modes
            activeTab === "history"
              ? "text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100"
              : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
          )}
          role="tab"
          aria-selected={activeTab === "history"}
          aria-controls="vocabulary-history-panel"
          id="vocabulary-history-tab"
        >
          <div className="relative">
            <History
              size={"1rem" as any}
              className={
                activeTab === "history"
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400"
              }
              aria-hidden="true"
            />
          </div>
          <span className="text-[0.625rem] font-semibold tracking-wide">
            History
          </span>
          {history.length > 0 && (
            <span
              className="absolute top-[0.5rem] right-[1rem] w-[0.375rem] h-[0.375rem] bg-slate-400 dark:bg-slate-500 rounded-full"
              aria-hidden="true"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-0.5 transition-all border-b-2 relative",
            "min-h-[3.25rem] justify-center", // Optimized height to match other modes
            activeTab === "saved"
              ? "text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100"
              : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
          )}
          role="tab"
          aria-selected={activeTab === "saved"}
          aria-controls="vocabulary-saved-panel"
          id="vocabulary-saved-tab"
        >
          <div className="relative">
            <Bookmark
              size={"1rem" as any}
              className={
                activeTab === "saved"
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400"
              }
              aria-hidden="true"
            />
          </div>
          <span className="text-[0.625rem] font-semibold tracking-wide">
            Saved
          </span>
          {saved.length > 0 && (
            <span className="absolute top-[0.5rem] right-[0.75rem] text-[0.5625rem] font-medium text-slate-500 dark:text-slate-400">
              {saved.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("learn")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-0.5 transition-all border-b-2 relative",
            "min-h-[3.25rem] justify-center", // Optimized height to match other modes
            activeTab === "learn"
              ? "text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100"
              : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
          )}
          role="tab"
          aria-selected={activeTab === "learn"}
          aria-controls="vocabulary-learn-panel"
          id="vocabulary-learn-tab"
        >
          <div className="relative">
            <Lightbulb
              size={"1rem" as any}
              className={
                activeTab === "learn"
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400"
              }
              aria-hidden="true"
            />
          </div>
          <span className="text-[0.625rem] font-semibold tracking-wide">
            To Learn
          </span>
          {toLearn.length > 0 && (
            <span className="absolute top-[0.5rem] right-[0.5rem] text-[0.5625rem] font-medium text-slate-500 dark:text-slate-400">
              {toLearn.length}
            </span>
          )}
        </button>
      </div>

      {/* Content - Submode content with minimalist hierarchy */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-950">
        <div className="flex justify-between items-center mb-4">
          <h4
            className="text-[0.625rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
            id="vocabulary-section-heading"
          >
            {activeTab === "history"
              ? "Recent Lookups"
              : activeTab === "saved"
              ? "Saved Vocabulary"
              : "Recommended"}
          </h4>
          {activeTab === "history" && history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[0.625rem] font-semibold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
              aria-label="Clear history"
            >
              Clear
            </button>
          )}
        </div>

        <div
          className="space-y-2"
          key={listKey}
          role="tabpanel"
          aria-labelledby={`vocabulary-${activeTab}-tab`}
          id={`vocabulary-${activeTab}-panel`}
        >
          {activeList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              <p>No items yet.</p>
              <p className="text-xs mt-2 text-slate-400 dark:text-slate-500">
                Words you look up will appear here
              </p>
            </div>
          ) : (
            activeList.map((item, idx) => {
              const isSaved = saved.some((s) => s.word === item.word);
              return (
                <div
                  key={`${item.word}-${idx}`}
                  className={cn(
                    "p-3 rounded-xl border transition-all group relative",
                    activeTab === "saved" || isSaved
                      ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm"
                  )}
                  role="listitem"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1.5 pr-8">
                    <span className="font-serif font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight">
                      {item.word}
                    </span>
                    <span
                      className={cn(
                        "text-[0.625rem] leading-tight font-medium px-2 py-0.5 rounded-full border max-w-[8.75rem] text-center",
                        activeTab === "saved" || isSaved
                          ? "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          : "text-slate-500 dark:text-slate-400 bg-transparent border-slate-200 dark:border-slate-800"
                      )}
                    >
                      {item.translation}
                    </span>
                  </div>

                  <VocabContextSentence
                    sentence={item.context || ""}
                    word={item.word}
                  />

                  <button
                    onClick={() => toggleSaved(item)}
                    className={cn(
                      "absolute top-[0.75rem] right-[0.75rem] p-1.5 rounded-lg transition-all",
                      "opacity-0 group-hover:opacity-100",
                      isSaved
                        ? "opacity-100 text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    aria-label={isSaved ? "Unsave word" : "Save word"}
                  >
                    <Bookmark
                      size={"0.875rem" as any}
                      fill={isSaved ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
