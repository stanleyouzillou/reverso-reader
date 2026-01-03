import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  HighlightMode,
  ReadingMode,
  SidebarMode,
  VocabItem,
  WordStatus,
} from "../types";
import { DEMO_ARTICLE } from "../constants/demoContent";

interface State {
  mode: ReadingMode;
  sidebarMode: SidebarMode;
  highlightMode: HighlightMode;
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
  isPaused: boolean; // Added: For tracking pause state
  selectedVoice: string | null;

  // Dictionary State
  selectedDictionaryWord: VocabItem | null;
  sidebarCollapsed: boolean;
  showShortcutToolbar: boolean;

  // Hover Lookup State
  hoveredTokenId: string | null;
  hoveredSentenceIdx: number | null;

  // Optimized Lookups
  savedWordsRecord: Record<string, boolean>; // word.toLowerCase().trim() -> boolean

  // Minimalist Translation State
  minimalistTokenId: string | null;
  minimalistTranslation: string | null;
  isMinimalistLoading: boolean;

  // Word States (Session-based)
  translatedWords: Record<string, number>; // word -> timestamp
  lastActivity: number;

  // Actions
  setMode: (mode: ReadingMode) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  setHighlightMode: (mode: HighlightMode) => void;
  setDualModeOption: (
    option: "sentences" | "hover" | "interleaved" | "sync"
  ) => void;
  addToHistory: (item: VocabItem) => void;
  toggleSaved: (item: VocabItem) => void;
  addTranslatedWord: (word: string) => void;
  clearTranslatedWords: () => void;
  updateActivity: () => void;
  checkSessionTimeout: () => void;
  toggleHighlightedWord: (word: string) => void;
  setKaraokeActive: (active: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentSentenceIdx: (idx: number) => void;
  setCurrentWordIdx: (idx: number) => void; // Added: Action to set word index
  setIsPaused: (paused: boolean) => void; // Added: Action to set pause state
  setSelectedVoice: (voice: string | null) => void;
  setSelectedDictionaryWord: (word: VocabItem | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowShortcutToolbar: (show: boolean) => void;
  setHoveredTokenId: (id: string | null) => void;
  setHoveredSentenceIdx: (idx: number | null) => void;
  setMinimalistTokenId: (id: string | null) => void;
  setMinimalistTranslation: (translation: string | null) => void;
  setIsMinimalistLoading: (loading: boolean) => void;
  resetVocabNotification: () => void;
  clearHistory: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => {
      const initialSaved: VocabItem[] = [];
      const initialRecord: Record<string, boolean> = {};
      initialSaved.forEach((item) => {
        initialRecord[item.word.toLowerCase().trim()] = true;
      });

      return {
        mode: "single",
        sidebarMode: "vocabulary",
        highlightMode: "saved",
        history: [],
        saved: initialSaved,
        savedWordsRecord: initialRecord,
        toLearn: DEMO_ARTICLE.metadata.keyVocab,
        vocabNotificationCount: 0,
        karaokeActive: false,
        playbackSpeed: 1,
        dualModeOption: "sentences",
        highlightedWords: [],
        currentSentenceIdx: 0,
        currentWordIdx: -1, // Default: no word highlighted
        isPaused: true, // Start paused
        selectedVoice: null,
        selectedDictionaryWord: null,
        sidebarCollapsed: false,
        showShortcutToolbar: false,
        hoveredTokenId: null,
        hoveredSentenceIdx: null,
        minimalistTokenId: null,
        minimalistTranslation: null,
        isMinimalistLoading: false,
        translatedWords: {},
        lastActivity: Date.now(),

        setMode: (mode) => {
          set({ mode, lastActivity: Date.now() });
        },
        setSidebarMode: (mode) =>
          set({ sidebarMode: mode, lastActivity: Date.now() }),
        setHighlightMode: (mode) =>
          set({ highlightMode: mode, lastActivity: Date.now() }),
        setDualModeOption: (option) =>
          set({ dualModeOption: option, lastActivity: Date.now() }),
        setSelectedDictionaryWord: (word) =>
          set({ selectedDictionaryWord: word, lastActivity: Date.now() }),
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),
        setShowShortcutToolbar: (show) => set({ showShortcutToolbar: show }),
        setHoveredTokenId: (id) => set({ hoveredTokenId: id }),
        setHoveredSentenceIdx: (idx) => set({ hoveredSentenceIdx: idx }),
        setMinimalistTokenId: (id) => set({ minimalistTokenId: id }),
        setMinimalistTranslation: (translation) =>
          set({ minimalistTranslation: translation }),
        setIsMinimalistLoading: (loading) =>
          set({ isMinimalistLoading: loading }),

        addTranslatedWord: (word) =>
          set((state) => {
            const normalizedWord = word.toLowerCase().trim();
            return {
              translatedWords: {
                ...state.translatedWords,
                [normalizedWord]: Date.now(),
              },
              lastActivity: Date.now(),
            };
          }),

        clearTranslatedWords: () => set({ translatedWords: {} }),

        updateActivity: () => set({ lastActivity: Date.now() }),

        checkSessionTimeout: () =>
          set((state) => {
            const now = Date.now();
            const thirtyMinutes = 30 * 60 * 1000;
            if (now - state.lastActivity > thirtyMinutes) {
              return { translatedWords: {}, lastActivity: now };
            }
            return state;
          }),

        addToHistory: (item) =>
          set((state) => {
            // Avoid duplicates at the top of the list
            const filtered = state.history.filter((i) => i.word !== item.word);
            return { history: [item, ...filtered] };
          }),

        toggleSaved: (item) =>
          set((state) => {
            const normalizedWord = item.word.toLowerCase().trim();
            const isSaved = !!state.savedWordsRecord[normalizedWord];

            if (isSaved) {
              const newSaved = state.saved.filter(
                (i) => i.word.toLowerCase().trim() !== normalizedWord
              );
              const newRecord = { ...state.savedWordsRecord };
              delete newRecord[normalizedWord];

              return {
                saved: newSaved,
                savedWordsRecord: newRecord,
                lastActivity: Date.now(),
              };
            }

            return {
              saved: [item, ...state.saved],
              savedWordsRecord: {
                ...state.savedWordsRecord,
                [normalizedWord]: true,
              },
              vocabNotificationCount: state.vocabNotificationCount + 1,
              lastActivity: Date.now(),
            };
          }),

        toggleHighlightedWord: (word) =>
          set((state) => {
            const normalizedWord = word.toLowerCase().trim();
            const isHighlighted =
              state.highlightedWords.includes(normalizedWord);
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
        setIsPaused: (paused) => set({ isPaused: paused }),
        setSelectedVoice: (voice) => set({ selectedVoice: voice }),

        resetVocabNotification: () => set({ vocabNotificationCount: 0 }),

        clearHistory: () => set({ history: [] }),
      };
    },
    {
      name: "reverso-reader-storage",
      partialize: (state) => {
        const { translatedWords, lastActivity, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rebuild the optimized record if it's missing or out of sync
          const record: Record<string, boolean> = {};
          state.saved.forEach((item) => {
            record[item.word.toLowerCase().trim()] = true;
          });
          state.savedWordsRecord = record;
        }
      },
    }
  )
);
