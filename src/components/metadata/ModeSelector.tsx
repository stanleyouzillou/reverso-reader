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
              "flex-1 py-[1rem] flex flex-col items-center gap-[0.25rem] text-[0.875rem] font-medium transition-all border-b-2 relative",
              "min-h-[3.75rem] flex items-center justify-center", // Larger click target
              activeMode === mode.id
                ? "text-blue-600 border-blue-600 bg-blue-50"
                : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
            )}
            role="tab"
            aria-selected={activeMode === mode.id}
            aria-controls={`panel-${mode.id}`}
            id={`tab-${mode.id}`}
          >
            <div className="mb-[0.25rem] relative">
              <Icon
                size={(mode.id === "vocabulary" ? "1.25rem" : "1.125rem") as any}
                className={
                  activeMode === mode.id ? "text-blue-600" : "text-slate-500"
                }
              />
              {mode.id === "vocabulary" && saved.length > 0 && (
                <span className="absolute -top-[0.375rem] -right-[0.5rem] min-w-[1rem] h-[1rem] bg-red-500 text-white text-[0.625rem] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 px-[0.25rem]">
                  {saved.length}
                </span>
              )}
            </div>
            <span className="text-[0.75rem]">{mode.label}</span>
            {mode.id === "ai" && (
              <span className="absolute top-[0.25rem] right-[0.75rem] text-[0.375rem] bg-blue-500 text-white px-[0.25rem] rounded-full">
                BETA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
