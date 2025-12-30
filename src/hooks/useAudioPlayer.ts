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

    // Use the raw text directly from the sentence list
    const text = pairedSentences[currentSentenceIdx]?.l2;
    if (!text) return;

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
    // We use addEventListener as it's often more reliable for boundary events in Chrome
    const handleBoundary = (event: SpeechSynthesisEvent) => {
      const state = useStore.getState();

      // Safety check: ensure we are still playing this exact utterance
      if (!state.karaokeActive || utteranceRef.current !== utterance) return;

      // Some voices fire 'sentence' boundaries at charIndex 0.
      // We skip these to avoid resetting the highlight if we're already on a word.
      if (event.name === "sentence") return;

      if (typeof event.charIndex === "number" && event.charIndex >= 0) {
        // Since we are not trimming the text, the charIndex matches our UI tokens perfectly
        state.setCurrentWordIdx(event.charIndex);
      }
    };

    utterance.addEventListener("boundary", handleBoundary);

    // When the voice actually starts speaking, ensure the first word is highlighted
    utterance.onstart = () => {
      const state = useStore.getState();
      if (state.karaokeActive && utteranceRef.current === utterance) {
        // Find the first actual word in the text to avoid highlighting leading whitespace/punctuation
        const firstWordMatch = text.match(/[\p{L}\p{N}]/u);
        const firstWordIdx = firstWordMatch ? firstWordMatch.index || 0 : 0;
        state.setCurrentWordIdx(firstWordIdx);
      }
    };

    utterance.onend = () => {
      const state = useStore.getState();
      if (state.karaokeActive && utteranceRef.current === utterance) {
        // Small delay to let the user see the last word highlighted before moving to next sentence
        setTimeout(() => {
          const latestState = useStore.getState();
          if (latestState.karaokeActive && utteranceRef.current === utterance) {
            latestState.setCurrentSentenceIdx(
              latestState.currentSentenceIdx + 1
            );
          }
        }, 150);
      }
    };

    utterance.onerror = (event) => {
      // Don't log 'interrupted' errors as they are normal when skipping/canceling
      if ((event as any).error !== "interrupted") {
        console.error("TTS Error:", event);
      }
      const state = useStore.getState();
      if (state.karaokeActive && utteranceRef.current === utterance) {
        state.setCurrentSentenceIdx(state.currentSentenceIdx + 1);
      }
    };

    // Chrome Fix: Ensure a clean state before speaking
    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;

    // Small delay helps ensure the voice is ready and events fire correctly
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
