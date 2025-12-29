import React from "react";
import { AlignCenter, Maximize2, ScrollText, BookOpen } from "lucide-react";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { cn } from "../../lib/utils";

export const LayoutSettings: React.FC = () => {
  const { columnWidth, setColumnWidth, readingMode, setReadingMode } =
    useReaderSettings();

  return (
    <div className="space-y-8">
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
            <AlignCenter size={16} />
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
            <Maximize2 size={16} />
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
            <ScrollText size={16} />
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
            <BookOpen size={16} />
            Page
          </button>
        </div>
      </div>
    </div>
  );
};
