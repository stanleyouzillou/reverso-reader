import React from "react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { DEMO_ARTICLE } from "../constants/demoContent";
import { ModeSelector } from "./metadata/ModeSelector";
import { DictionaryMode } from "./metadata/DictionaryMode";
import { AIAssistantMode } from "./metadata/AIAssistantMode";
import { VocabularyMode } from "./metadata/VocabularyMode";
import { DeckIcon } from "./metadata/DeckIcon";

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { sidebarMode, setSidebarMode, history } = useStore();

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-l border-slate-100 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        {/* Collapsed sidebar with just the mode selector */}
        <div className="flex flex-col border-b border-slate-100">
          <button
            onClick={() => setSidebarMode("dictionary")}
            className={cn(
              "py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
              sidebarMode === "dictionary"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600"
            )}
            title="Dictionary"
            aria-label="Dictionary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </button>
          <button
            onClick={() => setSidebarMode("vocabulary")}
            className={cn(
              "py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
              sidebarMode === "vocabulary"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600"
            )}
            title="Vocabulary"
            aria-label="Vocabulary"
          >
            <DeckIcon size={16} className={sidebarMode === "vocabulary" ? "text-blue-600" : "text-slate-400"} />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
            )}
          </button>
          <button
            onClick={() => setSidebarMode("ai")}
            className={cn(
              "py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2",
              sidebarMode === "ai"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600"
            )}
            title="AI Assistant"
            aria-label="AI Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4.5v3M20 12h-3M4.5 12v3M15.5 4.5 13.25 7"/>
              <path d="M16 12c-1.5 0-2.5-.5-3-2.5-.5-2.5.5-5.5 4-6-1.5 2-2 3.5-2 5.5a6.2 6.2 0 0 0 1.5 4.5c-1.5 0-2 1.5-2 3.5a6.2 6.2 0 0 0 1.5 4.5c-1.5 0-2.5-.5-3-2.5-.5-2.5.5-5.5 4-6-1.5 2-2 3.5-2 5.5a6.2 6.2 0 0 0 1.5 4.5"/>
            </svg>
          </button>
        </div>

        {/* Collapsed footer stats */}
        <div className="mt-auto p-2 border-t border-slate-100 bg-white">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
            <div className="text-[8px] text-slate-400 font-bold uppercase">
              {DEMO_ARTICLE.metadata.wordCount}
            </div>
            <div className="text-xs font-bold text-slate-800">
              W
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-100 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
      {/* Mode Selector */}
      <ModeSelector
        activeMode={sidebarMode}
        onModeChange={setSidebarMode}
      />

      {/* Content based on active mode */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarMode === 'dictionary' && (
          <DictionaryMode className="flex-1" />
        )}
        {sidebarMode === 'vocabulary' && (
          <VocabularyMode className="flex-1" />
        )}
        {sidebarMode === 'ai' && (
          <AIAssistantMode className="flex-1" />
        )}
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
