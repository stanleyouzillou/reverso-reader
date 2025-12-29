import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Globe, Gauge } from "lucide-react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { ReadingMode } from "../types";
import { useArticleIngestion } from "../hooks/useArticleIngestion";

export const ControlBar: React.FC = () => {
  const {
    mode,
    setMode,
    karaokeActive,
    setKaraokeActive,
    playbackSpeed,
    setPlaybackSpeed,
    selectedVoice,
    setSelectedVoice,
    currentSentenceIdx,
    setCurrentSentenceIdx,
  } = useStore();

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

  // Audio Mode Toolbar
  if (karaokeActive) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg rounded-full p-2 flex items-center gap-4">
          {/* Voice Selector */}
          <div className="relative">
            <button
              onClick={() => setShowVoiceMenu(!showVoiceMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all"
              title="Select Voice"
            >
              <Globe size={20} />
            </button>
            {showVoiceMenu && (
              <div className="absolute bottom-14 left-0 w-96 max-h-[60vh] overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex flex-col text-base">
                {voices.map((v, idx) => (
                  <button
                    key={v.voiceURI}
                    onClick={() => {
                      setSelectedVoice(v.voiceURI);
                      setShowVoiceMenu(false);
                    }}
                    className={cn(
                      "text-left px-4 py-3 shrink-0 rounded-md hover:bg-slate-50 transition-colors leading-normal",
                      selectedVoice === v.voiceURI
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-700",
                      idx !== voices.length - 1 && "border-b border-slate-100"
                    )}
                    title={`${v.name} (${v.lang})`}
                  >
                    <div className="truncate">{formatVoiceName(v)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Back 10s (Prev Sentence) */}
          <button
            onClick={() => handleSkip("prev")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all"
            title="Previous Sentence"
          >
            <RotateCcw size={20} />
            <span className="text-[10px] font-bold absolute mt-1">10</span>
          </button>

          {/* Play/Pause Main Button */}
          <button
            onClick={() => setKaraokeActive(!karaokeActive)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-blue-600"
          >
            <Pause size={24} fill="currentColor" />
          </button>

          {/* Forward 10s (Next Sentence) */}
          <button
            onClick={() => handleSkip("next")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all"
            title="Next Sentence"
          >
            <RotateCw size={20} />
            <span className="text-[10px] font-bold absolute mt-1">10</span>
          </button>

          {/* Speed Control */}
          <button
            onClick={cycleSpeed}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-bold text-xs"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    );
  }

  // Default Mode Toolbar
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg rounded-full p-1 flex items-center">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              mode === m.id
                ? "bg-slate-100 text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setKaraokeActive(!karaokeActive)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95",
          karaokeActive ? "bg-red-500" : "bg-blue-600"
        )}
      >
        {karaokeActive ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-1" />
        )}
      </button>
    </div>
  );
};
