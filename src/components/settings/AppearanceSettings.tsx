import React from "react";
import { Minus, Plus, Check, Moon, Sun } from "lucide-react";
import { useReaderSettings } from "../../hooks/useReaderSettings";
import { cn } from "../../lib/utils";

const COLORS = [
  { name: "White", value: "#ffffff", border: "border-slate-200" },
  { name: "Sepia", value: "#F4ECD8", border: "border-[#E8DECA]" },
  { name: "Light Gray", value: "#F5F5F5", border: "border-slate-200" },
  { name: "Soft Blue", value: "#E8F4F8", border: "border-[#D0E6F0]" },
  { name: "Dark", value: "#1A1A1A", border: "border-slate-700" },
];

export const AppearanceSettings: React.FC = () => {
  const { fontSize, setFontSize, bgColor, setBgColor, theme, setTheme } =
    useReaderSettings();

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.min(24, Math.max(12, fontSize + delta));
    setFontSize(newSize);
  };

  return (
    <div className="space-y-[2rem]">
      {/* Font Size */}
      <div>
        <h3 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider mb-[1rem]">
          Font Size
        </h3>
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-[0.5rem] p-[0.5rem] border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleFontSizeChange(-2)}
            disabled={fontSize <= 12}
            className="p-[0.75rem] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-[0.375rem] transition-all disabled:opacity-50"
          >
            <Minus size="1.125rem" />
          </button>
          <span className="font-mono text-[1.125rem] font-medium text-slate-700 dark:text-slate-200 w-[3rem] text-center">
            {fontSize}px
          </span>
          <button
            onClick={() => handleFontSizeChange(2)}
            disabled={fontSize >= 24}
            className="p-[0.75rem] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-[0.375rem] transition-all disabled:opacity-50"
          >
            <Plus size="1.125rem" />
          </button>
        </div>
      </div>

      {/* Background Color */}
      <div>
        <h3 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider mb-[1rem]">
          Background Color
        </h3>
        <div className="flex justify-between items-center gap-[0.5rem]">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setBgColor(color.value)}
              className={cn(
                "w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center transition-transform hover:scale-110 relative border",
                color.border
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {bgColor === color.value && (
                <Check
                  size="1rem"
                  className={cn(
                    color.value === "#1A1A1A" ? "text-white" : "text-slate-900"
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <div>
        <h3 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider mb-[1rem]">
          Theme
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-[0.25rem] rounded-[0.5rem]">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 flex items-center justify-center gap-[0.5rem] py-[0.5rem] rounded-[0.375rem] text-[0.875rem] font-medium transition-all",
              theme === "light"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Sun size="1rem" />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 flex items-center justify-center gap-[0.5rem] py-[0.5rem] rounded-[0.375rem] text-[0.875rem] font-medium transition-all",
              theme === "dark"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Moon size="1rem" />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};
