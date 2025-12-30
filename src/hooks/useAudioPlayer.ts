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
    utterance.lang = "en-GB"; // Default to en-GB if no voice is selected
    utterance.rate = playbackSpeed;

    if (selectedVoice) {
      const voice = voices.find((v) => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
    }

    // Word boundary event for karaoke effect
    utterance.onboundary = (event) => {
      // Use requestAnimationFrame to ensure store updates don't lag behind speech
      requestAnimationFrame(() => {
        if (useStore.getState().karaokeActive) {
          const evt = event as any;
          if (typeof evt.charIndex === "number") {
            // Some voices might report charIndex as 0 for every boundary or skip some.
            // We only update if it's a valid non-negative index.
            if (evt.charIndex >= 0) {
              setCurrentWordIdx(evt.charIndex);
            }
          }
        }
      });
    };

    utterance.onend = () => {
      if (useStore.getState().karaokeActive) {
        setCurrentSentenceIdx(useStore.getState().currentSentenceIdx + 1);
      }
    };

    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      if (useStore.getState().karaokeActive) {
        // Try to recover by moving to next sentence
        setCurrentSentenceIdx(useStore.getState().currentSentenceIdx + 1);
      }
    };

    // Chrome Fix: Periodic resume to prevent the 15-second "stuck" bug
    // and ensure events keep firing.
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    const originalOnEnd = utterance.onend;
    utterance.onend = (e) => {
      clearInterval(keepAlive);
      if (originalOnEnd) originalOnEnd.call(utterance, e);
    };

    const originalOnError = utterance.onerror;
    utterance.onerror = (e) => {
      clearInterval(keepAlive);
      if (originalOnError) originalOnError.call(utterance, e);
    };

    // Chrome Fix: SpeechSynthesis can sometimes hang or fail to fire events
    // if the utterance is too long or if there's a queue.
    // We ensure a clean state.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = utterance;

    // Small delay before speaking to allow listeners to attach properly
    // and the browser's audio context to stabilize
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
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
