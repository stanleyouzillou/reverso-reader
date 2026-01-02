import React, { useState } from "react";
import {
  MousePointerClick,
  BookOpen,
  Type,
  Lightbulb,
  Columns2,
  Layout,
  Zap,
  MousePointer2,
  ChevronRight,
} from "lucide-react";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { TranslationMode } from "../hooks/useReaderSettings";

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

  const {
    mode: viewMode,
    setMode: setViewMode,
    setDualModeOption,
  } = useStore();
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);

  const handleFontSizeChange = (delta: number) => {
    setFontSize(Math.max(12, Math.min(32, fontSize + delta)));
  };

  const toggleReadingMode = () => {
    setReadingMode(readingMode === "scrolling" ? "page" : "scrolling");
  };

  const toggleViewMode = () => {
    if (viewMode === "dual") {
      setViewMode("learning");
    } else {
      setViewMode("dual");
    }
  };

  const translationModes: {
    mode: TranslationMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { mode: "inline", label: "Inline Mode", icon: <Type size="1.125rem" /> },
    {
      mode: "hover",
      label: "Hover Mode",
      icon: <MousePointer2 size="1.125rem" />,
    },
    { mode: "minimalist", label: "Minimalist", icon: <Zap size="1.125rem" /> },
  ];

  const commonButtonClasses = cn(
    "w-[2.5rem] h-[2.5rem] rounded-xl transition-all duration-200 flex items-center justify-center group relative active:scale-95",
    theme === "dark"
      ? "bg-[#333] text-slate-400 hover:text-white"
      : "bg-white text-slate-500 hover:text-slate-800"
  );

  const activeButtonClasses = (active: boolean) =>
    cn(
      active &&
        (theme === "dark"
          ? "bg-blue-600 text-white"
          : "bg-blue-600 text-white shadow-lg shadow-blue-200")
    );

  return (
    <>
      {/* Central Controls (Interaction & Reading Mode) */}
      <div
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex flex-col gap-[0.5rem] transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "right-[3.625rem]" : "right-[min(20.625rem,85vw)]",
          "max-sm:bottom-[6rem] max-sm:top-auto max-sm:right-[1rem] max-sm:translate-y-0"
        )}
      >
        <div
          className={cn(
            "backdrop-blur-sm rounded-[1rem] shadow-[0_0.5rem_1.875rem_rgba(0,0,0,0.12)] border p-[0.375rem] flex flex-col gap-[0.25rem]",
            theme === "dark"
              ? "bg-[#1A1A1A]/90 border-[#333]"
              : "bg-white/90 border-slate-100"
          )}
          onMouseLeave={() => setIsTranslationMenuOpen(false)}
        >
          {/* Translation Mode Expandable Selector */}
          <div
            className="relative group/menu"
            onMouseEnter={() => setIsTranslationMenuOpen(true)}
          >
            <button
              className={cn(
                commonButtonClasses,
                "bg-blue-600 text-white shadow-lg shadow-blue-200"
              )}
              title="Translation Modes"
              aria-label="Translation Modes"
            >
              <MousePointerClick size={"1.25rem" as any} strokeWidth={2.5} />
              <span className="absolute left-0 -translate-x-full ml-[-0.5rem] px-[0.5rem] py-[0.25rem] bg-slate-800 text-white text-[0.625rem] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                Translation Mode
              </span>
            </button>

            {/* Expanded Menu */}
            <div
              className={cn(
                "absolute right-full top-0 mr-2 flex flex-col gap-1 transition-all duration-300 ease-in-out origin-right",
                isTranslationMenuOpen
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-0 scale-90 translate-x-4 pointer-events-none"
              )}
            >
              <div
                className={cn(
                  "backdrop-blur-md rounded-xl shadow-xl border p-1 flex flex-col gap-1 min-w-[10rem]",
                  theme === "dark"
                    ? "bg-[#1A1A1A]/95 border-[#333]"
                    : "bg-white/95 border-slate-100"
                )}
              >
                {translationModes.map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      setTranslationMode(item.mode);
                      setIsTranslationMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                      translationMode === item.mode
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600 font-semibold"
                        : theme === "dark"
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md",
                        translationMode === item.mode ? "" : "opacity-60"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[0.8125rem]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* View Mode Toggle (Single vs Dual) */}
          <button
            onClick={toggleViewMode}
            className={cn(
              commonButtonClasses,
              viewMode === "dual" && activeButtonClasses(true)
            )}
            title={
              viewMode === "dual"
                ? "Switch to Single View"
                : "Switch to Dual View"
            }
            aria-label={
              viewMode === "dual"
                ? "Switch to Single View"
                : "Switch to Dual View"
            }
          >
            {viewMode === "dual" ? (
              <Columns2 size={"1.25rem" as any} strokeWidth={2.5} />
            ) : (
              <Layout size={"1.25rem" as any} strokeWidth={2.5} />
            )}
            <span className="absolute left-0 -translate-x-full ml-[-0.5rem] px-[0.5rem] py-[0.25rem] bg-slate-800 text-white text-[0.625rem] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {viewMode === "dual" ? "Single View" : "Dual View"}
            </span>
          </button>

          {/* Reading Mode Toggle */}
          <button
            onClick={toggleReadingMode}
            className={cn(
              commonButtonClasses,
              readingMode === "page" && activeButtonClasses(true)
            )}
            title={`Switch to ${
              readingMode === "scrolling" ? "Page" : "Scrolling"
            } reading`}
            aria-label={`Switch to ${
              readingMode === "scrolling" ? "Page" : "Scrolling"
            } reading`}
          >
            <BookOpen size={"1.25rem" as any} strokeWidth={2.5} />
            <span className="absolute left-0 -translate-x-full ml-[-0.5rem] px-[0.5rem] py-[0.25rem] bg-slate-800 text-white text-[0.625rem] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {readingMode === "scrolling" ? "Page Mode" : "Scroll Mode"}
            </span>
          </button>

          {/* Show Hints Toggle */}
          <button
            onClick={() => setShowHintsEnabled(!showHintsEnabled)}
            className={cn(
              commonButtonClasses,
              showHintsEnabled && activeButtonClasses(true)
            )}
            title={showHintsEnabled ? "Hide Hints" : "Show Hints"}
            aria-label={showHintsEnabled ? "Hide Hints" : "Show Hints"}
          >
            <Lightbulb size={"1.25rem" as any} strokeWidth={2.5} />
            <span className="absolute left-0 -translate-x-full ml-[-0.5rem] px-[0.5rem] py-[0.25rem] bg-slate-800 text-white text-[0.625rem] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              {showHintsEnabled ? "Hide Hints" : "Show Hints"}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Font Controls (Floating near sidebar) */}
      <div
        className={cn(
          "fixed bottom-[6rem] z-50 flex flex-col gap-[0.5rem] transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "right-[1.5rem]" : "right-[min(21.5rem,85vw)]",
          "max-sm:bottom-[1rem] max-sm:right-[1rem]"
        )}
      >
        <div className="flex flex-col gap-[0.5rem]">
          {/* Smaller Text Button (First) */}
          <button
            onClick={() => handleFontSizeChange(-2)}
            className={cn(
              "w-[2rem] h-[2rem] rounded-[0.5rem] shadow-lg border transition-all active:scale-90 flex items-center justify-center",
              theme === "dark"
                ? "bg-[#333] border-[#444] text-slate-300 hover:text-white"
                : "bg-white border-slate-100 text-slate-600 hover:text-blue-600"
            )}
            title="Decrease text size"
            aria-label="Decrease text size"
          >
            <Type size={"0.875rem" as any} strokeWidth={2.5} />
          </button>

          {/* Larger Text Button (Second) */}
          <button
            onClick={() => handleFontSizeChange(2)}
            className={cn(
              "w-[2rem] h-[2rem] rounded-[0.5rem] shadow-lg border transition-all active:scale-90 flex items-center justify-center",
              theme === "dark"
                ? "bg-[#333] border-[#444] text-slate-300 hover:text-white"
                : "bg-white border-slate-100 text-slate-600 hover:text-blue-600"
            )}
            title="Increase text size"
            aria-label="Increase text size"
          >
            <Type size={"1.125rem" as any} strokeWidth={3} />
          </button>
        </div>
      </div>
    </>
  );
};
