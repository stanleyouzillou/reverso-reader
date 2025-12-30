import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReadingMode, SidebarMode, VocabItem, WordStatus } from "../types";
import { DEMO_ARTICLE } from "../constants/demoContent";

interface State {
  mode: ReadingMode;
  sidebarMode: SidebarMode;
  history: VocabItem[];
  saved: VocabItem[];
  toLearn: VocabItem[];
  vocabNotificationCount: number;
  karaokeActive: boolean;
  playbackSpeed: number;
  dualModeOption: "sentences" | "hover" | "interleaved" | "sync";
  highlightedWords: string[]; // List of words to know

  // Audio State
  currentSentenceIdx: number;
  currentWordIdx: number; // Added: For tracking current spoken word
  selectedVoice: string | null;

  // Dictionary State
  selectedDictionaryWord: VocabItem | null;

  // Hover Lookup State
  hoveredTokenId: string | null;
  hoveredSentenceIdx: number | null;

  // Actions
  setMode: (mode: ReadingMode) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  setDualModeOption: (
    option: "sentences" | "hover" | "interleaved" | "sync"
  ) => void;
  addToHistory: (item: VocabItem) => void;
  toggleSaved: (item: VocabItem) => void;
  toggleHighlightedWord: (word: string) => void;
  setKaraokeActive: (active: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentSentenceIdx: (idx: number) => void;
  setCurrentWordIdx: (idx: number) => void; // Added: Action to set word index
  setSelectedVoice: (voice: string | null) => void;
  setSelectedDictionaryWord: (word: VocabItem | null) => void;
  setHoveredTokenId: (id: string | null) => void;
  setHoveredSentenceIdx: (idx: number | null) => void;
  resetVocabNotification: () => void;
  clearHistory: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      mode: "learning",
      sidebarMode: "vocabulary",
      history: [],
      saved: [],
      toLearn: DEMO_ARTICLE.metadata.keyVocab,
      vocabNotificationCount: 0,
      karaokeActive: false,
      playbackSpeed: 1,
      dualModeOption: "sentences",
      highlightedWords: [],
      currentSentenceIdx: 0,
      currentWordIdx: -1, // Default: no word highlighted
      selectedVoice: null,
      selectedDictionaryWord: null,
      hoveredTokenId: null,
      hoveredSentenceIdx: null,

      setMode: (mode) => set({ mode }),
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      setDualModeOption: (option) => set({ dualModeOption: option }),
      setSelectedDictionaryWord: (word) =>
        set({ selectedDictionaryWord: word }),
      setHoveredTokenId: (id) => set({ hoveredTokenId: id }),
      setHoveredSentenceIdx: (idx) => set({ hoveredSentenceIdx: idx }),

      addToHistory: (item) =>
        set((state) => {
          // Avoid duplicates at the top of the list
          const filtered = state.history.filter((i) => i.word !== item.word);
          return { history: [item, ...filtered] };
        }),

      toggleSaved: (item) =>
        set((state) => {
          const isSaved = state.saved.some((i) => i.word === item.word);
          if (isSaved) {
            return { saved: state.saved.filter((i) => i.word !== item.word) };
          }
          return {
            saved: [item, ...state.saved],
            vocabNotificationCount: state.vocabNotificationCount + 1,
          };
        }),

      toggleHighlightedWord: (word) =>
        set((state) => {
          const normalizedWord = word.toLowerCase().trim();
          const isHighlighted = state.highlightedWords.includes(normalizedWord);
          if (isHighlighted) {
            return {
              highlightedWords: state.highlightedWords.filter(
                (w) => w !== normalizedWord
              ),
            };
          }
          return {
            highlightedWords: [...state.highlightedWords, normalizedWord],
          };
        }),

      setKaraokeActive: (active) => set({ karaokeActive: active }),

      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      setCurrentSentenceIdx: (idx) =>
        set({ currentSentenceIdx: idx, currentWordIdx: -1 }), // Reset word index on sentence change
      setCurrentWordIdx: (idx) => set({ currentWordIdx: idx }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),

      resetVocabNotification: () => set({ vocabNotificationCount: 0 }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "reverso-reader-storage",
    }
  )
);
