import React from "react";
import { cn } from "../../lib/utils";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import {
  MousePointerClick,
  ScanSearch,
  Highlighter,
  TextCursor,
  Globe,
  Lightbulb,
} from "lucide-react";

export const TranslationSettings: React.FC = () => {
  const {
    translationMode,
    setTranslationMode,
    translationGranularity,
    setTranslationGranularity,
    l2Language,
    setL2Language,
    showHintsEnabled,
    setShowHintsEnabled,
  } = useReaderSettings();

  // List of supported languages for translation
  const supportedLanguages = [
    { code: "af", name: "Afrikaans" },
    { code: "sq", name: "Albanian" },
    { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" },
    { code: "hy", name: "Armenian" },
    { code: "az", name: "Azerbaijani" },
    { code: "eu", name: "Basque" },
    { code: "be", name: "Belarusian" },
    { code: "bn", name: "Bengali" },
    { code: "bs", name: "Bosnian" },
    { code: "bg", name: "Bulgarian" },
    { code: "ca", name: "Catalan" },
    { code: "ceb", name: "Cebuano" },
    { code: "ny", name: "Chichewa" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "co", name: "Corsican" },
    { code: "hr", name: "Croatian" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "nl", name: "Dutch" },
    { code: "en", name: "English" },
    { code: "en-GB", name: "English (GB)" },
    { code: "en-US", name: "English (US)" },
    { code: "eo", name: "Esperanto" },
    { code: "et", name: "Estonian" },
    { code: "tl", name: "Filipino" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "fy", name: "Frisian" },
    { code: "gl", name: "Galician" },
    { code: "ka", name: "Georgian" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "gu", name: "Gujarati" },
    { code: "ht", name: "Haitian Creole" },
    { code: "ha", name: "Hausa" },
    { code: "haw", name: "Hawaiian" },
    { code: "iw", name: "Hebrew" },
    { code: "hi", name: "Hindi" },
    { code: "hmn", name: "Hmong" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "ig", name: "Igbo" },
    { code: "id", name: "Indonesian" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "jw", name: "Javanese" },
    { code: "kn", name: "Kannada" },
    { code: "kk", name: "Kazakh" },
    { code: "km", name: "Khmer" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "ko", name: "Korean" },
    { code: "ku", name: "Kurdish (Kurmanji)" },
    { code: "ky", name: "Kyrgyz" },
    { code: "lo", name: "Lao" },
    { code: "la", name: "Latin" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "lb", name: "Luxembourgish" },
    { code: "mk", name: "Macedonian" },
    { code: "mg", name: "Malagasy" },
    { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" },
    { code: "mt", name: "Maltese" },
    { code: "mi", name: "Maori" },
    { code: "mr", name: "Marathi" },
    { code: "mn", name: "Mongolian" },
    { code: "my", name: "Myanmar (Burmese)" },
    { code: "ne", name: "Nepali" },
    { code: "no", name: "Norwegian" },
    { code: "or", name: "Odia (Oriya)" },
    { code: "ps", name: "Pashto" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "pa", name: "Punjabi" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sm", name: "Samoan" },
    { code: "gd", name: "Scots Gaelic" },
    { code: "sr", name: "Serbian" },
    { code: "st", name: "Sesotho" },
    { code: "sn", name: "Shona" },
    { code: "sd", name: "Sindhi" },
    { code: "si", name: "Sinhala" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "so", name: "Somali" },
    { code: "es", name: "Spanish" },
    { code: "su", name: "Sundanese" },
    { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" },
    { code: "tg", name: "Tajik" },
    { code: "ta", name: "Tamil" },
    { code: "tt", name: "Tatar" },
    { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" },
    { code: "tr", name: "Turkish" },
    { code: "tk", name: "Turkmen" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "ug", name: "Uyghur" },
    { code: "uz", name: "Uzbek" },
    { code: "vi", name: "Vietnamese" },
    { code: "cy", name: "Welsh" },
    { code: "xh", name: "Xhosa" },
    { code: "yi", name: "Yiddish" },
    { code: "yo", name: "Yoruba" },
    { code: "zu", name: "Zulu" },
  ];

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Translation Preferences
      </h3>

      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Globe size={16} />
            Target Language
          </label>
          <select
            value={l2Language}
            onChange={(e) => setL2Language(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-2">
            Select your preferred language for translations
          </p>
        </div>

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
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            translationMode === "inline"
              ? "max-h-[200px] opacity-100"
              : "max-h-0 opacity-50"
          )}
        >
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

        {/* Show Hints Toggle */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Lightbulb
                size={16}
                className={
                  showHintsEnabled ? "text-yellow-500" : "text-slate-400"
                }
              />
              Show Hints
            </label>
            <button
              onClick={() => setShowHintsEnabled(!showHintsEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                showHintsEnabled ? "bg-blue-600" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  showHintsEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            When enabled, "Words to Know" are highlighted with a subtle
            underline to help you focus on key vocabulary.
          </p>
        </div>
      </div>
    </section>
  );
};
