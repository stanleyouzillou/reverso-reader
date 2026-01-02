import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { FontSettings } from "./FontSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { LayoutSettings } from "./LayoutSettings";
import { TranslationSettings } from "./TranslationSettings";
import { DebugSettings } from "./DebugSettings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[min(21.875rem,100vw)] bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[1.5rem] border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-[1.25rem] font-serif font-bold text-slate-900 dark:text-slate-100">
            Reader Settings
          </h2>
          <button
            onClick={onClose}
            className="p-[0.5rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={"1.5rem" as any} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-[1.5rem] space-y-[2rem]">
          <FontSettings />
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <AppearanceSettings />
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <TranslationSettings />
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <LayoutSettings />
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <DebugSettings />
        </div>
      </div>
    </>
  );
};
