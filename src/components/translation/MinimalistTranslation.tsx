import React from "react";
import { Bookmark, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MinimalistTranslationProps {
  word: string;
  translation: string | null;
  isLoading: boolean;
  isSaved: boolean;
  onSave: () => void;
  onClose: () => void;
  position: "above" | "below";
}

export const MinimalistTranslation: React.FC<MinimalistTranslationProps> = ({
  word,
  translation,
  isLoading,
  isSaved,
  onSave,
  onClose,
  position,
}) => {
  const [justSaved, setJustSaved] = React.useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave();
    if (!isSaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1000);
    }
  };

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border animate-in fade-in zoom-in duration-200",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        position === "above" ? "bottom-full mb-2" : "top-full mt-2"
      )}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
      ) : (
        <span className="text-[0.875rem] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {translation || "Translating..."}
        </span>
      )}

      <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSave}
          className={cn(
            "p-1 rounded-full transition-all duration-300",
            isSaved
              ? "text-yellow-500"
              : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
            justSaved && "scale-125 text-yellow-500"
          )}
          title={isSaved ? "Saved to vocabulary" : "Save to vocabulary"}
        >
          <Bookmark size="0.875rem" fill={isSaved || justSaved ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size="0.875rem" />
        </button>
      </div>

      {/* Triangle arrow */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
          position === "above" 
            ? "top-full -mt-1 border-r border-b" 
            : "bottom-full -mb-1 border-l border-t"
        )}
      />
    </div>
  );
};
