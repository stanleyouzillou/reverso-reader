import React from "react";
import { useReaderSettings, FontFamily } from "../../hooks/useReaderSettings";
import { cn } from "../../lib/utils";

const FONTS: {
  name: string;
  family: FontFamily;
  label: string;
  weight?: string;
}[] = [
  { name: "Rubik", family: "Rubik", label: "Rubik Regular" },
  { name: "Rubik Bold", family: "Rubik", label: "Rubik Bold", weight: "700" },
  { name: "Georgia", family: "Georgia", label: "Georgia Serif" },
  { name: "Roboto", family: "Roboto", label: "Roboto" },
  { name: "Spectral", family: "Spectral", label: "Spectral" },
  { name: "Lora", family: "Lora", label: "Lora" },
  { name: "Poppins", family: "Poppins", label: "Poppins" },
  { name: "Inter", family: "Inter", label: "Inter" },
  { name: "Bodoni", family: "Bodoni Moda", label: "Bodoni" },
  { name: "Open Sans", family: "Open Sans", label: "Open Sans" },
  { name: "Noto Serif", family: "Noto Serif", label: "Noto Serif" },
  { name: "Merriweather", family: "Merriweather", label: "Merriweather" },
];

export const FontSettings: React.FC = () => {
  const { fontFamily, setFontFamily, fontWeight, setFontWeight } =
    useReaderSettings();

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Character Style
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {FONTS.map((font) => (
          <button
            key={font.label}
            onClick={() => {
              setFontFamily(font.family);
              setFontWeight(font.weight || "normal");
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border transition-all h-24",
              fontFamily === font.family &&
                (fontWeight || "normal") === (font.weight || "normal")
                ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
            )}
          >
            <span
              className="text-3xl mb-2"
              style={{
                fontFamily: font.family,
                fontWeight: font.weight || "normal",
              }}
            >
              Aa
            </span>
            <span className="text-[10px] font-medium leading-tight text-center opacity-80">
              {font.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
