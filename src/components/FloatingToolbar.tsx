import React from "react";
import { Type, MousePointerClick, BookOpen, Plus, Minus } from "lucide-react";
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

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 transition-all duration-300 ease-in-out",
        "md:right-auto",
        sidebarCollapsed ? "right-[58px]" : "right-[330px]",
        // On very small screens, hide it or move it to bottom
        "max-sm:bottom-24 max-sm:top-auto max-sm:right-4 max-sm:translate-y-0"
      )}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-1.5 flex flex-col gap-1">
        {/* Font Size Adjustment */}
        <div className="flex flex-col gap-0.5 items-center border-b border-slate-100 pb-1.5">
          <button
            onClick={() => handleFontSizeChange(2)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all active:scale-90"
            title="Increase font size"
            aria-label="Increase font size"
          >
            <Plus size={16} strokeWidth={3} />
          </button>

          <div className="flex flex-col items-center justify-center h-10 w-10 bg-slate-50 rounded-lg my-0.5">
            <Type size={18} className="text-slate-700" strokeWidth={2.5} />
            <span className="text-[9px] font-black text-slate-500 leading-none mt-0.5">
              {fontSize}
            </span>
          </div>

          <button
            onClick={() => handleFontSizeChange(-2)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all active:scale-90"
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            <Minus size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Interaction Mode Toggle */}
        <button
          onClick={toggleTranslationMode}
          className={cn(
            "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center group relative active:scale-95",
            translationMode === "hover"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          )}
          title={`Switch to ${
            translationMode === "inline" ? "Hover" : "Inline"
          } interaction`}
          aria-label={`Switch to ${
            translationMode === "inline" ? "Hover" : "Inline"
          } interaction`}
        >
          <MousePointerClick size={20} strokeWidth={2.5} />
          <span
            className={cn(
              "absolute left-0 -translate-x-full ml-[-8px] px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
              "hidden md:block"
            )}
          >
            {translationMode === "inline" ? "Enable Hover" : "Enable Inline"}
          </span>
        </button>

        {/* Reading Mode Toggle */}
        <button
          onClick={toggleReadingMode}
          className={cn(
            "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center group relative active:scale-95",
            readingMode === "page"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          )}
          title={`Switch to ${
            readingMode === "scrolling" ? "Page" : "Scrolling"
          } reading`}
          aria-label={`Switch to ${
            readingMode === "scrolling" ? "Page" : "Scrolling"
          } reading`}
        >
          <BookOpen size={20} strokeWidth={2.5} />
          <span
            className={cn(
              "absolute left-0 -translate-x-full ml-[-8px] px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
              "hidden md:block"
            )}
          >
            {readingMode === "scrolling"
              ? "Enable Page Mode"
              : "Enable Scrolling"}
          </span>
        </button>
      </div>
    </div>
  );
};
