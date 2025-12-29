import React from "react";
import { cn } from "../../lib/utils";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { MousePointerClick, ScanSearch, Highlighter, TextCursor } from "lucide-react";

export const TranslationSettings: React.FC = () => {
  const { 
    translationMode, 
    setTranslationMode,
    translationGranularity,
    setTranslationGranularity
  } = useReaderSettings();

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Translation Preferences
      </h3>
      
      <div className="space-y-6">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Interaction Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTranslationMode("inline")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-2 text-center",
                translationMode === "inline"
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <MousePointerClick size={20} />
              <span>Inline (Click)</span>
            </button>
            <button
              onClick={() => setTranslationMode("hover")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-2 text-center",
                translationMode === "hover"
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <ScanSearch size={20} />
              <span>Hover (Popup)</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {translationMode === "inline" 
              ? "Click words to translate them directly in the text flow."
              : "Hover over words to see a temporary translation popup."}
          </p>
        </div>

        {/* Granularity Selection (Only for Inline) */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          translationMode === "inline" ? "max-h-[200px] opacity-100" : "max-h-0 opacity-50"
        )}>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Translation Granularity
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTranslationGranularity("chunk")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-2 text-center",
                translationGranularity === "chunk"
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Highlighter size={20} />
              <span>Chunk (Smart)</span>
            </button>
            <button
              onClick={() => setTranslationGranularity("word")}
              className={cn(
                "p-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-2 text-center",
                translationGranularity === "word"
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <TextCursor size={20} />
              <span>Single Word</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {translationGranularity === "chunk"
              ? "Intelligently groups words into phrases (e.g., 'labor market')."
              : "Strictly translates one word at a time."}
          </p>
        </div>
      </div>
    </section>
  );
};
