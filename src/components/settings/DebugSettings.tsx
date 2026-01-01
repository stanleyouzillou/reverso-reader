import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import {
  Trash2,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getLLMMetrics } from "../../services/gemini";

export const DebugSettings: React.FC = () => {
  const { translationProvider, setTranslationProvider } = useReaderSettings();
  const [clearing, setClearing] = useState(false);
  const [metrics, setMetrics] = useState(getLLMMetrics());

  const handleRefreshMetrics = () => {
    setMetrics(getLLMMetrics());
  };

  const handleClearCache = () => {
    setClearing(true);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("def_") || key.startsWith("trans_"))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

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
                  <span>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </span>
                  {translationProvider === provider && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Select the backend provider for translations. Google Translate is
            the primary provider.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">
              LLM Service Monitoring
            </label>
            <button
              onClick={handleRefreshMetrics}
              className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Activity size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-tight">
                  Total Calls
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {metrics.totalCalls}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-tight">
                  Success
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {metrics.successfulCalls}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-tight">
                  Failed
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {metrics.failedCalls}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Clock size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-tight">
                  Avg Time
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {Math.round(metrics.averageResponseTime)}ms
              </p>
            </div>
          </div>

          {metrics.lastError && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 mb-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-tight">
                  Last Error
                </span>
              </div>
              <p className="text-xs text-red-700 break-words font-mono">
                {metrics.lastError}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Cache Hits: {metrics.cacheHits}</span>
            <span>Mock Fallbacks: {metrics.fallbackToMock}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
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
