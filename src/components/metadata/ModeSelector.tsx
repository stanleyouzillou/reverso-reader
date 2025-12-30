import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { useStore } from "../../store/useStore";
import { SidebarMode } from "../../types";
import { DeckIcon } from "./DeckIcon";

interface ModeSelectorProps {
  activeMode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  className?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onModeChange,
  className = "",
}) => {
  const { saved } = useStore();
  const modes = [
    { id: "dictionary" as SidebarMode, label: "Dictionary", icon: BookOpen },
    { id: "vocabulary" as SidebarMode, label: "Vocabulary", icon: DeckIcon },
    { id: "ai" as SidebarMode, label: "AI Assistant", icon: Sparkles },
  ];

  return (
    <div
      className={cn("flex border-b border-slate-200", className)}
      role="tablist"
      aria-label="Sidebar mode selection"
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 text-sm font-medium transition-all border-b-2 relative",
              "min-h-[60px] flex items-center justify-center", // Larger click target
              activeMode === mode.id
                ? "text-blue-600 border-blue-600 bg-blue-50"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
            )}
            role="tab"
            aria-selected={activeMode === mode.id}
            aria-controls={`panel-${mode.id}`}
            id={`tab-${mode.id}`}
          >
            <div className="mb-1 relative">
              {mode.id === "vocabulary" ? (
                <Icon
                  size={20}
                  className={
                    activeMode === mode.id ? "text-blue-600" : "text-slate-500"
                  }
                />
              ) : (
                <Icon
                  size={18}
                  className={
                    activeMode === mode.id ? "text-blue-600" : "text-slate-500"
                  }
                />
              )}
              {mode.id === "vocabulary" && saved.length > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 px-1">
                  {saved.length}
                </span>
              )}
            </div>
            <span className="text-xs">{mode.label}</span>
            {mode.id === "ai" && (
              <span className="absolute top-1 right-3 text-[6px] bg-blue-500 text-white px-1 rounded-full">
                BETA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
