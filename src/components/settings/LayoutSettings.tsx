import React from "react";
import { AlignCenter, Maximize2, ScrollText, BookOpen, MousePointer2 } from "lucide-react";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";

export const LayoutSettings: React.FC = () => {
  const { columnWidth, setColumnWidth, readingMode, setReadingMode } =
    useReaderSettings();
  const showShortcutToolbar = useStore((state) => state.showShortcutToolbar);
  const setShowShortcutToolbar = useStore((state) => state.setShowShortcutToolbar);

  return (
    <div className="space-y-8">
      {/* Shortcut Toolbar */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Shortcuts
        </h3>
        <button
          onClick={() => setShowShortcutToolbar(!showShortcutToolbar)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
            showShortcutToolbar
              ? "bg-blue-50 border-blue-100 text-blue-900"
              : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              showShortcutToolbar ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
            )}>
              <MousePointer2 size={"1rem" as any} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Shortcut Toolbar</div>
              <div className="text-[0.75rem] opacity-70">Quick access to tools</div>
            </div>
          </div>
          <div className={cn(
            "w-10 h-6 rounded-full relative transition-colors duration-200",
            showShortcutToolbar ? "bg-blue-600" : "bg-slate-200"
          )}>
            <div className={cn(
              "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
              showShortcutToolbar ? "translate-x-4" : "translate-x-0"
            )} />
          </div>
        </button>
      </div>

      {/* Column Width */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Layout
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setColumnWidth("centered")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              columnWidth === "centered"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <AlignCenter size={"1rem" as any} />
            Centered
          </button>
          <button
            onClick={() => setColumnWidth("extended")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              columnWidth === "extended"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Maximize2 size={"1rem" as any} />
            Extended
          </button>
        </div>
      </div>

      {/* Reading Mode */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Reading Mode
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setReadingMode("scrolling")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              readingMode === "scrolling"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ScrollText size={"1rem" as any} />
            Scrolling
          </button>
          <button
            onClick={() => setReadingMode("page")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              readingMode === "page"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BookOpen size={"1rem" as any} />
            Page
          </button>
        </div>
      </div>
    </div>
  );
};
