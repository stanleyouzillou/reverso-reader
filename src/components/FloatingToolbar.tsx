import React from "react";
import { MousePointerClick, BookOpen, Type, Lightbulb } from "lucide-react";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { cn } from "../lib/utils";

interface FloatingToolbarProps {
  sidebarCollapsed: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  sidebarCollapsed,
}) => {
  const {
    fontSize,
    setFontSize,
    translationMode,
    setTranslationMode,
    readingMode,
    setReadingMode,
    showHintsEnabled,
    setShowHintsEnabled,
    theme,
  } = useReaderSettings();

  const handleFontSizeChange = (delta: number) => {
    setFontSize(Math.max(12, Math.min(32, fontSize + delta)));
  };

  const toggleTranslationMode = () => {
    setTranslationMode(translationMode === "inline" ? "hover" : "inline");
  };

  const toggleReadingMode = () => {
    setReadingMode(readingMode === "scrolling" ? "page" : "scrolling");
  };

  const commonButtonClasses = cn(
    "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center group relative active:scale-95",
    theme === "dark"
      ? "bg-[#333] text-slate-400 hover:text-white"
      : "bg-white text-slate-500 hover:text-slate-800"
  );

  return (
    <>
      {/* Central Controls (Interaction & Reading Mode) */}
      <div
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "right-[58px]" : "right-[330px]",
          "max-sm:bottom-24 max-sm:top-auto max-sm:right-4 max-sm:translate-y-0"
        )}
      >
        <div
          className={cn(
            "backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border p-1.5 flex flex-col gap-1",
            theme === "dark"
              ? "bg-[#1A1A1A]/90 border-[#333]"
              : "bg-white/90 border-slate-100"
          )}
        >
          {/* Interaction Mode Toggle */}
          <button
            onClick={toggleTranslationMode}
            className={cn(
              commonButtonClasses,
              translationMode === "hover" &&
                (theme === "dark"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-200")
            )}
            title={`Switch to ${
              translationMode === "inline" ? "Hover" : "Inline"
            } interaction`}
            aria-label={`Switch to ${
              translationMode === "inline" ? "Hover" : "Inline"
            } interaction`}
          >
            <MousePointerClick size={20} strokeWidth={2.5} />
            <span className="absolute left-0 -translate-x-full ml-[-8px] px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {translationMode === "inline" ? "Enable Hover" : "Enable Inline"}
            </span>
          </button>

          {/* Reading Mode Toggle */}
          <button
            onClick={toggleReadingMode}
            className={cn(
              commonButtonClasses,
              readingMode === "page" &&
                (theme === "dark"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-200")
            )}
            title={`Switch to ${
              readingMode === "scrolling" ? "Page" : "Scrolling"
            } reading`}
            aria-label={`Switch to ${
              readingMode === "scrolling" ? "Page" : "Scrolling"
            } reading`}
          >
            <BookOpen size={20} strokeWidth={2.5} />
            <span className="absolute left-0 -translate-x-full ml-[-8px] px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {readingMode === "scrolling" ? "Page Mode" : "Scroll Mode"}
            </span>
          </button>

          {/* Show Hints Toggle */}
          <button
            onClick={() => setShowHintsEnabled(!showHintsEnabled)}
            className={cn(
              commonButtonClasses,
              showHintsEnabled &&
                (theme === "dark"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-200")
            )}
            title={showHintsEnabled ? "Hide Hints" : "Show Hints"}
            aria-label={showHintsEnabled ? "Hide Hints" : "Show Hints"}
          >
            <Lightbulb size={20} strokeWidth={2.5} />
            <span className="absolute left-0 -translate-x-full ml-[-8px] px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {showHintsEnabled ? "Hide Hints" : "Show Hints"}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Font Controls (Floating near sidebar) */}
      <div
        className={cn(
          "fixed bottom-24 z-50 flex flex-col gap-2 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "right-16" : "right-[336px]",
          "max-sm:bottom-4 max-sm:right-4"
        )}
      >
        <div className="flex flex-col gap-2">
          {/* Smaller Text Button (First) */}
          <button
            onClick={() => handleFontSizeChange(-2)}
            className={cn(
              "w-8 h-8 rounded-lg shadow-lg border transition-all active:scale-90 flex items-center justify-center",
              theme === "dark"
                ? "bg-[#333] border-[#444] text-slate-300 hover:text-white"
                : "bg-white border-slate-100 text-slate-600 hover:text-blue-600"
            )}
            title="Decrease text size"
            aria-label="Decrease text size"
          >
            <Type size={14} strokeWidth={2.5} />
          </button>

          {/* Larger Text Button (Second) */}
          <button
            onClick={() => handleFontSizeChange(2)}
            className={cn(
              "w-8 h-8 rounded-lg shadow-lg border transition-all active:scale-90 flex items-center justify-center",
              theme === "dark"
                ? "bg-[#333] border-[#444] text-slate-300 hover:text-white"
                : "bg-white border-slate-100 text-slate-600 hover:text-blue-600"
            )}
            title="Increase text size"
            aria-label="Increase text size"
          >
            <Type size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </>
  );
};
