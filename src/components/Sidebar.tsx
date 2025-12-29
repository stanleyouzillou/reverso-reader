import React, { useState } from "react";
import { History, Bookmark, Lightbulb, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { DEMO_ARTICLE } from "../constants/demoContent";

type Tab = "history" | "saved" | "learn";

export const Sidebar: React.FC = () => {
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
    <div className="w-80 bg-white border-l border-slate-100 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-serif font-bold text-slate-800 text-sm mb-3 line-clamp-1">
          {DEMO_ARTICLE.title}
        </h3>

        {/* Progress Bar */}
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-bold text-green-600">78% Match</span>
          <span className="text-slate-400">B1 Recommended</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 w-[78%] rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
            activeTab === "history"
              ? "text-blue-600 border-blue-600"
              : "text-slate-400 border-transparent hover:text-slate-600"
          )}
        >
          <div className="relative">
            <History size={16} />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
            )}
          </div>
          HISTORY
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
            activeTab === "saved"
              ? "text-blue-600 border-blue-600"
              : "text-slate-400 border-transparent hover:text-slate-600"
          )}
        >
          <Bookmark size={16} />
          SAVED
        </button>
        <button
          onClick={() => setActiveTab("learn")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
            activeTab === "learn"
              ? "text-blue-600 border-blue-600"
              : "text-slate-400 border-transparent hover:text-slate-600"
          )}
        >
          <div className="relative">
            <Lightbulb size={16} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 text-white text-[8px] flex items-center justify-center rounded-full border border-white">
              {toLearn.length}
            </span>
          </div>
          TO LEARN
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {activeTab === "history"
              ? "Recent Lookups"
              : activeTab === "saved"
              ? "Saved Vocabulary"
              : "Recommended"}
          </h4>
          {activeTab === "history" && history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 size={10} /> Clear History
            </button>
          )}
        </div>

        <div className="space-y-3" key={listKey}>
          {activeList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No items yet.
            </div>
          ) : (
            activeList.map((item, idx) => (
              <div
                key={`${item.word}-${idx}`}
                className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-serif font-bold text-slate-800 text-base">
                    {item.word}
                  </span>
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {item.translation}
                  </span>
                </div>
                {item.context && (
                  <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2">
                    "...{item.context}..."
                  </p>
                )}
                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleSaved(item)}
                    className={cn(
                      "p-1 rounded hover:bg-slate-100",
                      saved.some((s) => s.word === item.word)
                        ? "text-yellow-500"
                        : "text-slate-300"
                    )}
                  >
                    <Bookmark
                      size={14}
                      fill={
                        saved.some((s) => s.word === item.word)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase">
            Total Words
          </div>
          <div className="text-lg font-bold text-slate-800">
            {DEMO_ARTICLE.metadata.wordCount}
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase">
            Read Time
          </div>
          <div className="text-lg font-bold text-slate-800">
            {DEMO_ARTICLE.metadata.estimatedMinutes} min
          </div>
        </div>
      </div>
    </div>
  );
};
