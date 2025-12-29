import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playbackSpeed: number;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  setVoice: (voiceURI: string) => void;
  skipNext: () => void;
  skipPrev: () => void;
}

export const useAudioPlayer = (
  pairedSentences: { l2: string }[],
  containerRef?: React.RefObject<HTMLDivElement>
): UseAudioPlayerReturn => {
  const {
    karaokeActive,
    playbackSpeed,
    setKaraokeActive,
    setPlaybackSpeed,
    currentSentenceIdx,
    setCurrentSentenceIdx,
    setCurrentWordIdx,
    selectedVoice,
    setSelectedVoice,
  } = useStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Set default voice if not set
      if (!selectedVoice && available.length > 0) {
        // Priority:
        // 1. Google UK English Male (exact or partial)
        // 2. Google UK English Female (exact or partial)
        // 3. Any en-GB voice
        // 4. Any English voice
        // 5. First available
        const defaultVoice =
          available.find(
            (v) =>
              v.name.includes("Google") &&
              v.name.includes("UK") &&
              v.name.includes("Male")
          ) ||
          available.find(
            (v) =>
              v.name.includes("Google") &&
              v.name.includes("UK") &&
              v.name.includes("Female")
          ) ||
          available.find((v) => v.lang === "en-GB" || v.lang === "en_GB") ||
          available.find((v) => v.lang.startsWith("en")) ||
          available[0];
        setSelectedVoice(defaultVoice.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice, setSelectedVoice]);

  // Playback Logic
  const playSentence = useCallback(() => {
    window.speechSynthesis.cancel();

    if (currentSentenceIdx >= pairedSentences.length) {
      setKaraokeActive(false);
      setCurrentSentenceIdx(0);
      return;
    }

    // Reset word highlighting when starting a new utterance (e.g. voice change)
    setCurrentWordIdx(-1);

    const text = pairedSentences[currentSentenceIdx]?.l2;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;

    if (selectedVoice) {
      const voice = voices.find((v) => v.voiceURI === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    // Word boundary event for karaoke effect
    utterance.onboundary = (event) => {
      // Ensure we are still playing and this event belongs to the active session
      if (useStore.getState().karaokeActive) {
        // Always update if charIndex is available, regardless of event name
        // Some voices might use different names or empty strings
        // We cast to any to avoid strict type checking issues with some browser implementations
        const evt = event as any;
        if (typeof evt.charIndex === "number") {
          setCurrentWordIdx(evt.charIndex);
        }
      }
    };

    utterance.onend = () => {
      // Only advance if we are still playing (wasn't cancelled manually)
      // We check store/ref state in a functional update or effect,
      // but here we rely on the fact that if it stops, we cancel.
      // However, onend might fire after cancel in some browsers.
      // Ideally, we advance state, and the effect triggers the next play.
      if (useStore.getState().karaokeActive) {
        setCurrentSentenceIdx(useStore.getState().currentSentenceIdx + 1);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [
    currentSentenceIdx,
    pairedSentences,
    playbackSpeed,
    selectedVoice,
    setKaraokeActive,
    setCurrentSentenceIdx,
    setCurrentWordIdx,
    voices,
  ]);

  // Effect to Trigger Play/Pause/Update
  useEffect(() => {
    if (karaokeActive) {
      playSentence();
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      // Cleanup: cancel on unmount or dependency change (re-run playSentence)
      // Note: If we just cancel here, it might interrupt smooth transitions.
      // But since deps include currentSentenceIdx, we WANT to cancel and restart the new sentence.
      window.speechSynthesis.cancel();
    };
  }, [
    karaokeActive,
    currentSentenceIdx,
    playbackSpeed,
    selectedVoice,
    playSentence,
  ]);

  // Auto-scroll to active sentence (basic implementation)
  useEffect(() => {
    if (karaokeActive && containerRef?.current) {
      // This requires the sentence elements to have IDs.
      // We will need to add IDs to the rendered sentences in the Views.
      // Format: sentence-{index}
      const el = document.getElementById(`sentence-${currentSentenceIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSentenceIdx, karaokeActive, containerRef]);

  const togglePlay = () => setKaraokeActive(!karaokeActive);
  const setSpeed = (speed: number) => setPlaybackSpeed(speed);
  const setVoice = (voiceURI: string) => setSelectedVoice(voiceURI);

  const skipNext = () => {
    const next = Math.min(currentSentenceIdx + 1, pairedSentences.length - 1);
    setCurrentSentenceIdx(next);
  };

  const skipPrev = () => {
    const prev = Math.max(currentSentenceIdx - 1, 0);
    setCurrentSentenceIdx(prev);
  };

  return {
    isPlaying: karaokeActive,
    playbackSpeed,
    togglePlay,
    setSpeed,
    voices,
    selectedVoice,
    setVoice,
    skipNext,
    skipPrev,
  };
};
