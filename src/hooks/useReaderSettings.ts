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
export type TranslationProvider = "google" | "reverso" | "gemini";
export type TranslationMode = "inline" | "hover";
export type TranslationGranularity = "word" | "chunk";

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
      translationMode: "inline",
      translationGranularity: "chunk",
      l2Language: "fr", // Default to French
      showHintsEnabled: false,

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
    }),
    {
      name: "reader-settings",
    }
  )
);
