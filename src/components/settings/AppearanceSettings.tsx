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
    <div className="space-y-8">
      {/* Font Size */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Font Size
        </h3>
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-200">
          <button
            onClick={() => handleFontSizeChange(-2)}
            disabled={fontSize <= 12}
            className="p-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-all disabled:opacity-50"
          >
            <Minus size={18} />
          </button>
          <span className="font-mono text-lg font-medium text-slate-700 w-12 text-center">
            {fontSize}px
          </span>
          <button
            onClick={() => handleFontSizeChange(2)}
            disabled={fontSize >= 24}
            className="p-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-all disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Background Color */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Background Color
        </h3>
        <div className="flex justify-between items-center gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setBgColor(color.value)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative border",
                color.border
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {bgColor === color.value && (
                <Check
                  size={16}
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
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Theme
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              theme === "light"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Sun size={16} />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
              theme === "dark"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Moon size={16} />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};
