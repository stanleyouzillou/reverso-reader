import React, { useState, useEffect } from "react";
import {
  Volume2,
  Languages,
  ArrowRight,
  GraduationCap,
  Loader2,
  Bookmark,
  Plus,
} from "lucide-react";
import {
  fetchDefinition,
  GeminiDefinitionResponse,
} from "../../services/gemini";
import { translationService } from "../../services/TranslationService";
import { cn } from "../../lib/utils";

interface DefinitionCardProps {
  word: string;
  sourceSentence: string;
  sourceLanguage: string; // L2 (e.g., "en")
  targetLanguage: string; // L1 (e.g., "fr", "es")
  textPosition: number; // For scroll-to-source feature
  onAddToVocabulary: (word: string) => void;
  onNavigateToSource: (position: number) => void;
}

type Tab = "Definition" | "Examples" | "Source";

export function DefinitionCard({
  word,
  sourceSentence,
  sourceLanguage,
  targetLanguage,
  textPosition,
  onAddToVocabulary,
  onNavigateToSource,
}: DefinitionCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Definition");
  const [definition, setDefinition] = useState<GeminiDefinitionResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDefinition(word, sourceSentence, sourceLanguage, targetLanguage)
      .then(setDefinition)
      .finally(() => setLoading(false));
  }, [word, sourceSentence, sourceLanguage, targetLanguage]);

  const handleTranslateClick = async (text: string, key: string) => {
    if (translations[key]) return; // Already translated

    try {
      const result = await translationService.translate(
        text,
        targetLanguage,
        sourceSentence // use full context for better translation
      );
      setTranslations((prev) => ({ ...prev, [key]: result.text }));
    } catch (error) {
      console.error("Translation error in DefinitionCard:", error);
      setTranslations((prev) => ({ ...prev, [key]: "[Error]" }));
    }
  };

  const handleSpeak = (text: string, key: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = sourceLanguage;
    utterance.onstart = () => setIsSpeaking(key);
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">
          Fetching definition for "{word}"...
        </p>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Could not load definition for "{word}".</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden animate-in fade-in duration-500 no-scrollbar">
      {/* HEADER SECTION */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">
              {definition.word}
            </h2>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "transition-colors",
                isBookmarked
                  ? "text-blue-600"
                  : "text-slate-300 hover:text-blue-400"
              )}
            >
              <Bookmark
                size={18}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>
          </div>
          <button
            onClick={() => handleSpeak(definition.word, "word")}
            className={cn(
              "p-1.5 rounded-full hover:bg-slate-50 text-blue-600 transition-colors",
              isSpeaking === "word" && "bg-blue-50"
            )}
          >
            <Volume2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-2 font-medium">
          <span className="uppercase tracking-wider">
            {definition.pronunciation}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">
            {definition.partOfSpeech}
          </span>
        </div>

        {/* HORIZONTAL NAVIGATION */}
        <div className="flex border-b border-slate-100 mb-3">
          {(["Definition", "Examples", "Source"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-[13px] font-semibold transition-all relative",
                activeTab === tab
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2">
        {activeTab === "Definition" && (
          <div className="space-y-[14px]">
            {definition.definitions.map((def, idx) => (
              <div key={idx} className="relative group">
                <div className="flex items-center gap-1.5 m-0">
                  <span className="text-slate-500 font-semibold text-[12px]">
                    {idx + 1}.
                  </span>
                  <span className="text-slate-400 italic text-[11px]">
                    {def.senseLabel}
                  </span>
                </div>

                <p className="text-gray-900 text-[13px] leading-[1.4] font-semibold mt-[2px] mb-[6px] ml-0 mr-0">
                  {def.meaning}
                </p>

                <div className="flex items-start gap-1.5 group/example m-0">
                  <p className="text-gray-600 text-[12px] leading-[1.5] flex-1 italic m-0">
                    "{def.example}"
                  </p>
                  <button
                    onClick={() => handleSpeak(def.example, `ex-${idx}`)}
                    className={cn(
                      "p-1 rounded-full text-slate-300 hover:text-slate-600 transition-opacity opacity-0 group-hover/example:opacity-100 mt-0.5",
                      isSpeaking === `ex-${idx}` && "opacity-100 text-blue-500"
                    )}
                  >
                    <Volume2 size={14} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-[5px] m-0 p-0">
                  {def.translations.map((t, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-800 text-[11px] px-2 py-0.5 rounded-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Examples" && (
          <div className="space-y-3">
            {definition.usageExamples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 group/usage relative"
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <p className="text-slate-800 text-[12px] leading-relaxed font-semibold flex-1">
                    {ex.sentence}
                  </p>
                  <button
                    onClick={() => handleSpeak(ex.sentence, `usage-${idx}`)}
                    className={cn(
                      "p-1 rounded-full text-slate-300 hover:text-slate-600 transition-opacity opacity-0 group-hover/usage:opacity-100 mt-0.5",
                      isSpeaking === `usage-${idx}` &&
                        "opacity-100 text-blue-500"
                    )}
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
                <p className="text-blue-700 text-[11px] font-medium">
                  {ex.translation}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Source" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group/source relative">
              <p className="text-slate-800 text-[13px] leading-relaxed mb-3 font-semibold italic">
                "{sourceSentence}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                <button
                  onClick={() => onNavigateToSource(textPosition)}
                  className="flex items-center gap-1.5 text-blue-600 font-bold text-[12px] hover:gap-2 transition-all"
                >
                  View in text <ArrowRight size={14} />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpeak(sourceSentence, "source")}
                    className={cn(
                      "p-1.5 rounded-full hover:bg-white text-slate-400 hover:text-blue-600 transition-colors",
                      isSpeaking === "source" && "text-blue-600 bg-white"
                    )}
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleTranslateClick(sourceSentence, "source")
                    }
                    className="p-1.5 rounded-full hover:bg-white text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Languages size={16} />
                  </button>
                </div>
              </div>

              {translations["source"] && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 text-blue-800 text-[11px] font-medium animate-in slide-in-from-top-2 duration-300">
                  {translations["source"]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
