import React, { useState } from "react";
import { History, Bookmark, Lightbulb, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";
import { DEMO_ARTICLE } from "../../constants/demoContent";

type Tab = "history" | "saved" | "learn";

interface VocabularyModeProps {
  className?: string;
}

export const VocabularyMode: React.FC<VocabularyModeProps> = ({ className = '' }) => {
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
    <div className={cn('flex flex-col h-full', className)} style={{ minHeight: 0 }}>
      {/* Tabs - Mode selectors with larger click targets */}
      <div className="flex border-b border-slate-200 bg-slate-50" role="tablist">
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-4 flex flex-col items-center gap-1 text-sm font-medium transition-all border-b-2 relative",
            "min-h-[60px] flex items-center justify-center", // Larger click target
            activeTab === "history"
              ? "text-blue-600 border-blue-600 bg-blue-50"
              : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
          )}
          role="tab"
          aria-selected={activeTab === "history"}
          aria-controls="vocabulary-history-panel"
          id="vocabulary-history-tab"
        >
          <div className="relative mb-1">
            <History size={18} className={activeTab === "history" ? "text-blue-600" : "text-slate-500"} aria-hidden="true" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" aria-label="Unread items" />
            )}
          </div>
          <span className="text-xs">HISTORY</span>
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex-1 py-4 flex flex-col items-center gap-1 text-sm font-medium transition-all border-b-2 relative",
            "min-h-[60px] flex items-center justify-center", // Larger click target
            activeTab === "saved"
              ? "text-blue-600 border-blue-600 bg-blue-50"
              : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
          )}
          role="tab"
          aria-selected={activeTab === "saved"}
          aria-controls="vocabulary-saved-panel"
          id="vocabulary-saved-tab"
        >
          <div className="mb-1">
            <Bookmark size={18} className={activeTab === "saved" ? "text-blue-600" : "text-slate-500"} aria-hidden="true" />
          </div>
          <span className="text-xs">SAVED</span>
        </button>
        <button
          onClick={() => setActiveTab("learn")}
          className={cn(
            "flex-1 py-4 flex flex-col items-center gap-1 text-sm font-medium transition-all border-b-2 relative",
            "min-h-[60px] flex items-center justify-center", // Larger click target
            activeTab === "learn"
              ? "text-blue-600 border-blue-600 bg-blue-50"
              : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
          )}
          role="tab"
          aria-selected={activeTab === "learn"}
          aria-controls="vocabulary-learn-panel"
          id="vocabulary-learn-tab"
        >
          <div className="relative mb-1">
            <Lightbulb size={18} className={activeTab === "learn" ? "text-blue-600" : "text-slate-500"} aria-hidden="true" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 text-white text-[8px] flex items-center justify-center rounded-full border border-white">
              {toLearn.length}
            </span>
          </div>
          <span className="text-xs">TO LEARN</span>
        </button>
      </div>

      {/* Content - Submode content with improved visual hierarchy */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h4
            className="text-sm font-bold text-slate-700 uppercase tracking-wider"
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
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              aria-label="Clear history"
            >
              <Trash2 size={12} aria-hidden="true" /> Clear History
            </button>
          )}
        </div>

        <div
          className="space-y-4"
          key={listKey}
          role="tabpanel"
          aria-labelledby={`vocabulary-${activeTab}-tab`}
          id={`vocabulary-${activeTab}-panel`}
        >
          {activeList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <p>No items yet.</p>
              <p className="text-xs mt-2 text-slate-400">Words you look up will appear here</p>
            </div>
          ) : (
            activeList.map((item, idx) => (
              <div
                key={`${item.word}-${idx}`}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                role="listitem"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-serif font-bold text-slate-800 text-lg">
                    {item.word}
                  </span>
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    {item.translation}
                  </span>
                </div>
                {item.context && (
                  <p className="text-sm text-slate-600 italic leading-relaxed mb-3">
                    "...{item.context}..."
                  </p>
                )}
                <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleSaved(item)}
                    className={cn(
                      "p-2 rounded-lg hover:bg-slate-200 transition-colors",
                      saved.some((s) => s.word === item.word)
                        ? "text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                        : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                    )}
                    aria-label={saved.some((s) => s.word === item.word) ? "Unsave word" : "Save word"}
                  >
                    <Bookmark
                      size={16}
                      fill={
                        saved.some((s) => s.word === item.word)
                          ? "currentColor"
                          : "none"
                      }
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};