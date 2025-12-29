import React, { useState, useEffect } from 'react';
import { Volume2, Languages, ArrowRight, GraduationCap, Loader2 } from 'lucide-react';
import { fetchDefinition, GeminiDefinitionResponse } from '../../services/gemini';
import { translateText } from '../../services/translation';
import { cn } from '../../lib/utils';

interface DefinitionCardProps {
  word: string;
  sourceSentence: string;
  sourceLanguage: string; // L2 (e.g., "en")
  targetLanguage: string; // L1 (e.g., "fr", "es")
  textPosition: number; // For scroll-to-source feature
  onAddToVocabulary: (word: string) => void;
  onNavigateToSource: (position: number) => void;
}

export function DefinitionCard({
  word,
  sourceSentence,
  sourceLanguage,
  targetLanguage,
  textPosition,
  onAddToVocabulary,
  onNavigateToSource
}: DefinitionCardProps) {
  const [definition, setDefinition] = useState<GeminiDefinitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDefinition(
      word,
      sourceSentence,
      sourceLanguage,
      targetLanguage
    )
      .then(setDefinition)
      .finally(() => setLoading(false));
  }, [word, sourceSentence, sourceLanguage, targetLanguage]);

  const handleTranslateClick = async (text: string, key: string) => {
    if (translations[key]) return; // Already translated

    const translated = await translateText(
      text,
      sourceLanguage,
      targetLanguage
    );
    setTranslations(prev => ({ ...prev, [key]: translated }));
  };

  const handleSpeak = (text: string, key: string) => {
    // Stop any current speech
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
        <p className="text-sm font-medium">Fetching definition for "{word}"...</p>
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
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-3xl font-bold text-slate-800 leading-tight">{definition.word}</h2>
        <button 
          onClick={() => handleSpeak(definition.word, 'word')} 
          className={cn(
            "p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-blue-500",
            isSpeaking === 'word' && "text-blue-500 animate-pulse bg-blue-50"
          )}
          title="Speak word"
        >
          <Volume2 size={24} />
        </button>
      </div>

      <div className="text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
        {definition.pronunciation} <span className="mx-2 text-slate-300">·</span> {definition.partOfSpeech}
      </div>

      {/* TRANSLATIONS BAR */}
      <div className="flex flex-wrap gap-2 mb-8 items-center">
        {definition.definitions[0]?.translations.map((t, i) => (
          <React.Fragment key={i}>
            <span className="text-blue-600 font-semibold text-lg">{t}</span>
            {i < definition.definitions[0].translations.length - 1 && (
              <span className="text-slate-300 text-lg">·</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* DEFINITIONS */}
      <div className="space-y-8 mb-10">
        {definition.definitions.map((def, idx) => (
          <div key={idx} className="group">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-slate-400 font-bold text-sm italic">({def.senseLabel})</span>
              <p className="text-slate-800 text-lg font-bold leading-snug flex-1">
                {def.meaning}
              </p>
              <div className="flex flex-col items-end gap-1 min-w-[80px]">
                {def.translations.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-slate-600 text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>

            <div
              className="relative bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all group/example"
              onMouseEnter={() => setHoveredSentence(`ex-${idx}`)}
              onMouseLeave={() => setHoveredSentence(null)}
            >
              <p className="text-slate-600 italic text-[15px] leading-relaxed pr-12">
                "{def.example}"
              </p>

              <div className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-200",
                hoveredSentence === `ex-${idx}` ? "opacity-100" : "opacity-0"
              )}>
                <button
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
                  onClick={() => handleTranslateClick(def.example, `ex-${idx}`)}
                  title="Translate sentence"
                >
                  <Languages size={18} />
                </button>
                <button 
                  onClick={() => handleSpeak(def.example, `ex-${idx}`)} 
                  className={cn(
                    "p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors",
                    isSpeaking === `ex-${idx}` && "text-blue-500 animate-pulse bg-blue-50"
                  )}
                  title="Speak sentence"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {translations[`ex-${idx}`] && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-blue-600 text-[14px] font-medium animate-in slide-in-from-top-1 duration-200">
                  {translations[`ex-${idx}`]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SOURCE SECTION */}
      <div className="bg-slate-50/80 rounded-2xl p-6 mb-8 border border-slate-100">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Source</h3>
        <div
          className="relative group/source mb-4"
          onMouseEnter={() => setHoveredSentence('source')}
          onMouseLeave={() => setHoveredSentence(null)}
        >
          <p className="text-slate-700 leading-relaxed pr-12">
            {sourceSentence}
          </p>

          <div className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-200",
            hoveredSentence === 'source' ? "opacity-100" : "opacity-0"
          )}>
            <button
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
              onClick={() => handleTranslateClick(sourceSentence, 'source')}
              title="Translate source"
            >
              <Languages size={18} />
            </button>
            <button 
              onClick={() => handleSpeak(sourceSentence, 'source')} 
              className={cn(
                "p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors",
                isSpeaking === 'source' && "text-blue-500 animate-pulse bg-blue-50"
              )}
              title="Speak source"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {translations['source'] && (
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-blue-600 text-[14px] font-medium animate-in slide-in-from-top-1 duration-200">
              {translations['source']}
            </div>
          )}
        </div>

        <button
          className="flex items-center text-blue-500 font-bold text-sm hover:translate-x-1 transition-transform"
          onClick={() => onNavigateToSource(textPosition)}
        >
          View in text <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {/* ADD TO VOCABULARY CTA */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mb-6"
        onClick={() => onAddToVocabulary(word)}
      >
        <GraduationCap size={20} />
        Add to vocabulary
      </button>
    </div>
  );
}
