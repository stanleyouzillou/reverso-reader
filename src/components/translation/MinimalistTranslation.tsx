import React from "react";
import { Bookmark, X, Loader2, Book, Volume2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ActionButtonProps {
  action: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  icon,
  label,
  className,
  activeClassName,
  isActive,
}) => (
  <button
    data-action={action}
    className={cn(
      "p-1.5 rounded-full transition-colors duration-200 relative",
      isActive ? activeClassName : className
    )}
    aria-label={label}
  >
    <span className="pointer-events-none">{icon}</span>
  </button>
);

interface MinimalistTranslationProps {
  word: string;
  translation: string | null;
  isLoading: boolean;
  isSaved: boolean;
  isDictionaryActive: boolean;
  onSave: () => void;
  onClose: () => void;
  onDictionary: () => void;
  onPronounce: () => void;
  position: "above" | "below";
}

export const MinimalistTranslation: React.FC<MinimalistTranslationProps> = ({
  word,
  translation,
  isLoading,
  isSaved,
  isDictionaryActive,
  onSave,
  onClose,
  onDictionary,
  onPronounce,
  position,
}) => {
  const [justSaved, setJustSaved] = React.useState(false);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = (e.target as HTMLElement).closest("[data-action]");
    if (!target) return;

    const action = target.getAttribute("data-action");
    switch (action) {
      case "pronounce":
        onPronounce();
        break;
      case "dictionary":
        onDictionary();
        break;
      case "save":
        onSave();
        if (!isSaved) {
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 1000);
        }
        break;
      case "close":
        onClose();
        break;
    }
  };

  return (
    <span
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

      <span
        className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800"
        onClick={handleActionClick}
      >
        <ActionButton
          action="pronounce"
          icon={<Volume2 size="1rem" />}
          label="Pronounce"
          className="text-slate-400"
        />
        <ActionButton
          action="dictionary"
          icon={<Book size="1rem" />}
          label="Dictionary"
          isActive={isDictionaryActive}
          activeClassName="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
          className="text-slate-400"
        />
        <ActionButton
          action="save"
          icon={
            <Bookmark
              size="1rem"
              fill={isSaved || justSaved ? "currentColor" : "none"}
            />
          }
          label={isSaved ? "Saved" : "Save"}
          isActive={isSaved || justSaved}
          activeClassName="text-yellow-500"
          className="text-slate-400"
        />
        <ActionButton
          action="close"
          icon={<X size="1rem" />}
          label="Close"
          className="text-slate-400"
        />
      </span>

      {/* Triangle arrow */}
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
          position === "above"
            ? "top-full -mt-1 border-r border-b"
            : "bottom-full -mb-1 border-l border-t"
        )}
      />
    </span>
  );
};
