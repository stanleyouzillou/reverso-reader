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
  const karaokeActive = useStore((state) => state.karaokeActive);
  const playbackSpeed = useStore((state) => state.playbackSpeed);
  const setKaraokeActive = useStore((state) => state.setKaraokeActive);
  const setPlaybackSpeed = useStore((state) => state.setPlaybackSpeed);
  const currentSentenceIdx = useStore((state) => state.currentSentenceIdx);
  const setCurrentSentenceIdx = useStore((state) => state.setCurrentSentenceIdx);
  const setCurrentWordIdx = useStore((state) => state.setCurrentWordIdx);
  const selectedVoice = useStore((state) => state.selectedVoice);
  const setSelectedVoice = useStore((state) => state.setSelectedVoice);
  const isPaused = useStore((state) => state.isPaused);
  const setIsPaused = useStore((state) => state.setIsPaused);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;

      setVoices(available);

      // Check if current selectedVoice is valid and is an English voice
      const currentVoice = available.find((v) => v.voiceURI === selectedVoice);
      const isVoiceValidAndEnglish =
        currentVoice &&
        (currentVoice.lang.startsWith("en") ||
          currentVoice.lang.startsWith("en-") ||
          currentVoice.lang.startsWith("en_"));

      // Set default voice if:
      // 1. No voice is selected
      // 2. The selected voice is no longer available in the browser
      // 3. The selected voice is not an English voice (we want English by default for L2)
      if ((!selectedVoice || !isVoiceValidAndEnglish) && available.length > 0) {
        // Priority:
        // 1. Google UK English Male (exact or partial)
        // 2. Google UK English Female (exact or partial)
        // 3. Any en-GB voice
        // 4. Any English voice
        // 5. First available
        const defaultVoice =
          available.find(
            (v) =>
              v.name.toLowerCase().includes("uk") &&
              v.name.toLowerCase().includes("english") &&
              v.name.toLowerCase().includes("male")
          ) ||
          available.find(
            (v) =>
              v.name.toLowerCase().includes("uk") &&
              v.name.toLowerCase().includes("english") &&
              v.name.toLowerCase().includes("female")
          ) ||
          available.find((v) => {
            const l = v.lang.toLowerCase().replace("_", "-");
            return l === "en-gb" || l.startsWith("en-gb-");
          }) ||
          available.find((v) => v.lang.toLowerCase().startsWith("en")) ||
          available[0];

        if (defaultVoice) {
          console.log(
            "Setting default voice to:",
            defaultVoice.name,
            defaultVoice.lang
          );
          setSelectedVoice(defaultVoice.voiceURI);
        }
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

    // Reset word highlighting to the start of the sentence
    const originalText = pairedSentences[currentSentenceIdx]?.l2;
    if (!originalText) return;

    // Find the first word character to avoid highlighting leading whitespace
    const firstWordMatch = originalText.match(/[a-zA-Z0-9\u00C0-\u00FF]/);
    const firstWordIdx = firstWordMatch ? firstWordMatch.index || 0 : 0;
    setCurrentWordIdx(firstWordIdx);

    const text = originalText.trim();
    const offset = originalText.indexOf(text);

    const utterance = new SpeechSynthesisUtterance(text);
    // Voice selection and properties
    if (selectedVoice) {
      const voice = voices.find((v) => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
    } else {
      utterance.lang = "en-GB";
    }

    utterance.rate = playbackSpeed;

    // Word boundary event for karaoke effect
    utterance.onboundary = (event) => {
      // Use direct store access to avoid closure issues and for maximum responsiveness
      if (useStore.getState().karaokeActive) {
        // Some voices fire 'sentence' boundaries which we might want to ignore
        // for word-level highlighting if they don't provide a useful charIndex.
        if (event.name === "sentence") return;

        // Many voices have quirks with the 'name' property.
        // For word-level highlighting, the charIndex is the most reliable piece of information.
        if (typeof event.charIndex === "number" && event.charIndex >= 0) {
          // Adjust for the trim offset to keep it in sync with the original sentence tokens
          useStore.getState().setCurrentWordIdx(event.charIndex + offset);
        }
      }
    };

    utterance.onend = () => {
      if (useStore.getState().karaokeActive) {
        // Small delay to let the user see the last word highlighted
        setTimeout(() => {
          if (useStore.getState().karaokeActive) {
            setCurrentSentenceIdx(useStore.getState().currentSentenceIdx + 1);
          }
        }, 50);
      }
    };

    utterance.onerror = (event) => {
      const error = (event as any).error;
      // Ignore 'interrupted' errors as they are expected when we cancel previous speech
      // Ignore 'not-allowed' errors which often happen in production due to autoplay policies
      // especially when moving between sentences.
      if (error === "interrupted" || error === "not-allowed") {
        return;
      }
      console.error("TTS Error:", event);
      if (useStore.getState().karaokeActive) {
        setCurrentSentenceIdx(useStore.getState().currentSentenceIdx + 1);
      }
    };

    // Ensure we reference the utterance so it doesn't get garbage collected
    utteranceRef.current = utterance;

    // Small delay before speaking helps some browsers/voices initialize correctly
    // and ensures events like onboundary are reliably fired.
    setTimeout(() => {
      if (
        useStore.getState().karaokeActive &&
        utteranceRef.current === utterance
      ) {
        window.speechSynthesis.speak(utterance);
      }
    }, 50);
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

  const togglePlay = () => {
    const newActive = !karaokeActive;
    setKaraokeActive(newActive);
    setIsPaused(!newActive);
  };
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
