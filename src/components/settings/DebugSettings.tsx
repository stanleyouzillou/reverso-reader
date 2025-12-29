import React from "react";
import { cn } from "../../lib/utils";
import { useReaderSettings } from "../../hooks/useReaderSettings";

export const DebugSettings: React.FC = () => {
  const { translationProvider, setTranslationProvider } = useReaderSettings();

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Debug & Integrations
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Translation Service
          </label>
          <div className="flex flex-col gap-2">
            {(["google", "reverso", "gemini"] as const).map((provider) => (
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
            Select the backend provider for translations. "Reverso" provides context-aware results.
          </p>
        </div>
      </div>
    </section>
  );
};
