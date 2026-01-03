import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Globe, Gauge } from "lucide-react";
import { useStore } from "../store/useStore";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { cn } from "../lib/utils";
import { ReadingMode } from "../types";
import { useArticleIngestion } from "../hooks/useArticleIngestion";

export const ControlBar: React.FC = () => {
  const theme = useReaderSettings((state) => state.theme);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const karaokeActive = useStore((state) => state.karaokeActive);
  const setKaraokeActive = useStore((state) => state.setKaraokeActive);
  const playbackSpeed = useStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useStore((state) => state.setPlaybackSpeed);
  const selectedVoice = useStore((state) => state.selectedVoice);
  const setSelectedVoice = useStore((state) => state.setSelectedVoice);
  const currentSentenceIdx = useStore((state) => state.currentSentenceIdx);
  const setCurrentSentenceIdx = useStore((state) => state.setCurrentSentenceIdx);

  const { pairedSentences } = useArticleIngestion();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const modes: { id: ReadingMode; label: string }[] = [
    { id: "clean", label: "Reading" },
    { id: "learning", label: "Learning" },
    { id: "dual", label: "Dual" },
  ];

  const handleSkip = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentSentenceIdx(Math.max(0, currentSentenceIdx - 1));
    } else {
      setCurrentSentenceIdx(
        Math.min(pairedSentences.length - 1, currentSentenceIdx + 1)
      );
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const formatVoiceName = (voice: SpeechSynthesisVoice) => {
    let name = voice.name;
    // Remove vendor prefixes for cleaner display
    name = name.replace(/^Microsoft /, "").replace(/^Google /, "");

    // If the name already contains the language in parens (e.g. "Name (en-US)"), don't append it again
    if (name.includes(`(${voice.lang})`)) {
      return name;
    }
    return `${name} (${voice.lang})`;
  };

  useEffect(() => {
    setShowVoiceMenu(false);
  }, [karaokeActive]);

  // Default Mode Toolbar (Unified Audio Design)
  return (
    <div className="absolute bottom-[2rem] left-1/2 -translate-x-1/2 flex items-center gap-[1rem] z-50">
      <div
        className={cn(
          "backdrop-blur-md border shadow-lg rounded-full p-[0.5rem] flex items-center gap-[1rem] transition-all duration-300",
          theme === "dark"
            ? "bg-[#1A1A1A]/90 border-[#333]"
            : "bg-white/90 border-slate-200"
        )}
      >
        {/* Voice Selector */}
        <div className="relative">
          <button
            onClick={() => setShowVoiceMenu(!showVoiceMenu)}
            className={cn(
              "w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center transition-all",
              theme === "dark"
                ? "text-slate-400 hover:bg-[#333] hover:text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            title="Select Voice"
          >
            <Globe size={"1.25rem" as any} />
          </button>
          {showVoiceMenu && (
            <div
              className={cn(
                "absolute bottom-[3.5rem] left-0 w-[min(20rem,80vw)] max-h-[60vh] overflow-y-auto border shadow-xl rounded-xl p-[0.5rem] flex flex-col text-[0.875rem] z-[60]",
                theme === "dark"
                  ? "bg-[#1A1A1A] border-[#333]"
                  : "bg-white border-slate-200"
              )}
            >
              <div className="px-[0.75rem] py-[0.5rem] text-[0.625rem] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-[0.25rem]">
                Voices
              </div>
              {voices.map((v, idx) => (
                <button
                  key={v.voiceURI}
                  onClick={() => {
                    setSelectedVoice(v.voiceURI);
                    setShowVoiceMenu(false);
                  }}
                  className={cn(
                    "text-left px-[0.75rem] py-[0.625rem] rounded-lg transition-colors leading-snug flex items-center gap-[0.5rem]",
                    selectedVoice === v.voiceURI
                      ? "bg-blue-600 text-white font-medium"
                      : theme === "dark"
                      ? "text-slate-300 hover:bg-[#333]"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="truncate flex-1">{formatVoiceName(v)}</div>
                  {selectedVoice === v.voiceURI && (
                    <div className="w-[0.375rem] h-[0.375rem] bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back 10s (Prev Sentence) */}
        <button
          onClick={() => handleSkip("prev")}
          className={cn(
            "w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center transition-all relative group",
            theme === "dark"
              ? "text-slate-400 hover:bg-[#333] hover:text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
          title="Previous Sentence"
        >
          <RotateCcw size={"1.25rem" as any} />
          <span className="text-[0.5625rem] font-bold absolute mt-[0.125rem]">10</span>
        </button>

        {/* Play/Pause Main Button */}
        <button
          onClick={() => setKaraokeActive(!karaokeActive)}
          className={cn(
            "w-[3rem] h-[3rem] rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95",
            karaokeActive ? "bg-blue-600" : "bg-blue-600"
          )}
        >
          {karaokeActive ? (
            <Pause size={"1.375rem" as any} fill="currentColor" />
          ) : (
            <Play size={"1.375rem" as any} fill="currentColor" className="ml-[0.25rem]" />
          )}
        </button>

        {/* Forward 10s (Next Sentence) */}
        <button
          onClick={() => handleSkip("next")}
          className={cn(
            "w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center transition-all relative group",
            theme === "dark"
              ? "text-slate-400 hover:bg-[#333] hover:text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
          title="Next Sentence"
        >
          <RotateCw size={"1.25rem" as any} />
          <span className="text-[0.5625rem] font-bold absolute mt-[0.125rem]">10</span>
        </button>

        {/* Speed Control */}
        <button
          onClick={cycleSpeed}
          className={cn(
            "w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center transition-all font-bold text-[0.625rem] tracking-tighter",
            theme === "dark"
              ? "text-slate-400 hover:bg-[#333] hover:text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
          title="Playback Speed"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
};
