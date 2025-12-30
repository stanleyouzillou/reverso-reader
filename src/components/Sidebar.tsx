import React from "react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { DEMO_ARTICLE } from "../constants/demoContent";
import { ModeSelector } from "./metadata/ModeSelector";
import { DictionaryMode } from "./metadata/DictionaryMode";
import { AIAssistantMode } from "./metadata/AIAssistantMode";
import { VocabularyMode } from "./metadata/VocabularyMode";
import { DeckIcon } from "./metadata/DeckIcon";
import { Sparkles } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { sidebarMode, setSidebarMode, history } = useStore();

  const handleCreateExercises = () => {
    // Logic for creating exercises can be added here
    console.log("Create Exercises clicked");
    alert("Creating exercises based on your reading progress...");
  };

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

        {/* Collapsed footer CTA */}
        <div className="mt-auto p-2 border-t border-slate-100 bg-white">
          <button
            onClick={handleCreateExercises}
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            title="Create Exercises"
          >
            <Sparkles size={16} />
          </button>
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

      {/* Footer CTA */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={handleCreateExercises}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] group"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          <span>Create Exercises</span>
        </button>
      </div>
    </div>
  );
};
