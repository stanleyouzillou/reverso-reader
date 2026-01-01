import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { Trash2 } from "lucide-react";

export const DebugSettings: React.FC = () => {
  const { translationProvider, setTranslationProvider } = useReaderSettings();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = () => {
    setClearing(true);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("def_") || key.startsWith("trans_"))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setTimeout(() => {
      setClearing(false);
      alert(`Cleared ${keysToRemove.length} cached items.`);
    }, 500);
  };

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Debug & Integrations
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Translation Service
          </label>
          <div className="flex flex-col gap-2">
            {(["google", "gemini"] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => setTranslationProvider(provider)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border",
                  translationProvider === provider
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                  {translationProvider === provider && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Select the backend provider for translations. Google Translate is the primary provider.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Local Cache
          </label>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {clearing ? "Clearing..." : "Clear Translation Cache"}
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Removes all stored translations and definitions from LocalStorage.
          </p>
        </div>
      </div>
    </section>
  );
};
