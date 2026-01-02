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
  const {
    sidebarMode,
    setSidebarMode,
    history,
    saved,
    vocabNotificationCount,
    resetVocabNotification,
  } = useStore();

  const handleCreateExercises = () => {
    // Logic for creating exercises can be added here
    console.log("Create Exercises clicked");
    alert("Creating exercises based on your reading progress...");
  };

  if (collapsed) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 transition-colors overflow-hidden">
        {/* Collapsed sidebar with just the mode selector */}
        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSidebarMode("dictionary")}
            className={cn(
              "py-[0.75rem] flex flex-col items-center gap-[0.25rem] text-[0.625rem] font-medium transition-colors border-b-2",
              sidebarMode === "dictionary"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
            )}
            title="Dictionary"
            aria-label="Dictionary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.25rem"
              height="1.25rem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[1.25rem] h-[1.25rem]"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </button>
          <button
            onClick={() => {
              setSidebarMode("vocabulary");
              resetVocabNotification();
            }}
            className={cn(
              "py-[0.75rem] flex flex-col items-center gap-[0.25rem] text-[0.625rem] font-medium transition-colors border-b-2 relative",
              sidebarMode === "vocabulary"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
            )}
            title="Vocabulary"
            aria-label="Vocabulary"
          >
            <DeckIcon
              size={"1.25rem" as any}
              className={
                sidebarMode === "vocabulary"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            />
            {saved.length > 0 && (
              <span className="absolute top-[0.5rem] right-[0.25rem] min-w-[1rem] h-[1rem] bg-red-500 text-white text-[0.5rem] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900 px-[0.125rem]">
                {saved.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSidebarMode("ai")}
            className={cn(
              "py-[0.75rem] flex flex-col items-center gap-[0.25rem] text-[0.625rem] font-medium transition-colors border-b-2",
              sidebarMode === "ai"
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
            )}
            title="AI Assistant"
            aria-label="AI Assistant"
          >
            <Sparkles size={"1.25rem" as any} className={sidebarMode === "ai" ? "text-blue-600" : "text-slate-400"} />
          </button>
        </div>

        {/* Collapsed footer CTA */}
        <div className="mt-auto p-[0.5rem] border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <button
            onClick={handleCreateExercises}
            className="w-[2rem] h-[2rem] mx-auto flex items-center justify-center bg-blue-600 text-white rounded-[0.5rem] hover:bg-blue-700 transition-colors shadow-sm"
            title="Create Exercises"
          >
            <Sparkles size={"1rem" as any} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 transition-colors overflow-hidden">
      {/* Mode Selector */}
      <ModeSelector
        activeMode={sidebarMode}
        onModeChange={(mode) => {
          setSidebarMode(mode);
          if (mode === "vocabulary") resetVocabNotification();
        }}
      />

      {/* Content based on active mode */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarMode === "dictionary" && <DictionaryMode className="flex-1" />}
        {sidebarMode === "vocabulary" && <VocabularyMode className="flex-1" />}
        {sidebarMode === "ai" && <AIAssistantMode className="flex-1" />}
      </div>

      {/* Footer CTA */}
      <div className="p-[1rem] border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <button
          onClick={handleCreateExercises}
          className="w-full flex items-center justify-center gap-[0.5rem] py-[0.75rem] px-[1rem] bg-blue-600 hover:bg-blue-700 text-white rounded-[0.75rem] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] group"
        >
          <Sparkles size={"1.125rem" as any} className="group-hover:animate-pulse" />
          <span className="text-[0.9rem]">Create Exercises</span>
        </button>
      </div>
    </div>
  );
};
