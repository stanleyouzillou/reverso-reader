import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontFamily =
  | "Inter"
  | "Georgia"
  | "Lora"
  | "Merriweather"
  | "Open Sans"
  | "Roboto"
  | "Spectral"
  | "Rubik"
  | "Bodoni Moda"
  | "Noto Serif"
  | "Poppins";

export type Theme = "light" | "dark";
export type ReadingMode = "scrolling" | "page";
export type ColumnWidth = "centered" | "extended";
export type TranslationProvider = "google" | "gemini";
export type TranslationMode = "inline" | "hover" | "minimalist";
export type TranslationGranularity = "word" | "chunk";

interface MinimalistSettings {
  enabled: boolean;
  popupDelay: number;
  highlightColor: string;
  position: "above" | "below";
}

interface DebugSettings {
  mockDictionary: boolean;
}

interface ReaderSettingsState {
  fontFamily: FontFamily;
  fontWeight: string;
  fontSize: number;
  bgColor: string;
  theme: Theme;
  columnWidth: ColumnWidth;
  readingMode: ReadingMode;
  translationProvider: TranslationProvider;
  translationMode: TranslationMode;
  translationGranularity: TranslationGranularity;
  l2Language: string;
  showHintsEnabled: boolean;
  minimalistSettings: MinimalistSettings;
  debugSettings: DebugSettings;

  setFontFamily: (font: FontFamily) => void;
  setFontWeight: (weight: string) => void;
  setFontSize: (size: number) => void;
  setBgColor: (color: string) => void;
  setTheme: (theme: Theme) => void;
  setColumnWidth: (width: ColumnWidth) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setTranslationProvider: (provider: TranslationProvider) => void;
  setTranslationMode: (mode: TranslationMode) => void;
  setTranslationGranularity: (granularity: TranslationGranularity) => void;
  setL2Language: (language: string) => void;
  setShowHintsEnabled: (enabled: boolean) => void;
  updateMinimalistSettings: (settings: Partial<MinimalistSettings>) => void;
  updateDebugSettings: (settings: Partial<DebugSettings>) => void;
}

export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      fontFamily: "Poppins",
      fontWeight: "normal",
      fontSize: 16,
      bgColor: "#ffffff",
      theme: "light",
      columnWidth: "centered",
      readingMode: "scrolling",
      translationProvider: "google",
      translationMode: "minimalist",
      translationGranularity: "chunk",
      l2Language: "fr", // Default to French
      showHintsEnabled: true,
      minimalistSettings: {
        enabled: true,
        popupDelay: 0,
        highlightColor: "rgba(59, 130, 246, 0.08)", // Even more subtle blue tint
        position: "above",
      },
      debugSettings: {
        mockDictionary: false,
      },

      setFontFamily: (font) => set({ fontFamily: font }),
      setFontWeight: (weight) => set({ fontWeight: weight }),
      setFontSize: (size) => set({ fontSize: size }),
      setBgColor: (color) => set({ bgColor: color }),
      setTheme: (theme) => set({ theme }),
      setColumnWidth: (width) => set({ columnWidth: width }),
      setReadingMode: (mode) => set({ readingMode: mode }),
      setTranslationProvider: (provider) =>
        set({ translationProvider: provider }),
      setTranslationMode: (mode) => set({ translationMode: mode }),
      setTranslationGranularity: (granularity) =>
        set({ translationGranularity: granularity }),
      setL2Language: (language) => set({ l2Language: language }),
      setShowHintsEnabled: (enabled) => set({ showHintsEnabled: enabled }),
      updateMinimalistSettings: (settings) =>
        set((state) => ({
          minimalistSettings: { ...state.minimalistSettings, ...settings },
        })),
      updateDebugSettings: (settings) =>
        set((state) => ({
          debugSettings: { ...state.debugSettings, ...settings },
        })),
    }),
    {
      name: "reader-settings",
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (e) {
            console.error("Zustand settings getItem error:", e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Zustand settings setItem error:", e);
            // Silently fail in private mode
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error("Zustand settings removeItem error:", e);
            // Silently fail
          }
        },
      },
    }
  )
);
