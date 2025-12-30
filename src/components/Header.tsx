import React, { useState, useEffect } from "react";
import { Settings, Moon, Sun, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsPanel } from "./settings/SettingsPanel";
import { useArticleIngestion } from "../hooks/useArticleIngestion";
import { useReaderSettings } from "../hooks/useReaderSettings";

interface HeaderProps {
  showStickyTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showStickyTitle = false }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { title } = useArticleIngestion();
  const { theme, setTheme } = useReaderSettings();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <div className="flex flex-col w-full relative z-50">
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Main Header */}
      <div
        className={cn(
          "border-b py-3 px-6 flex justify-between items-center shadow-sm transition-colors duration-300",
          theme === "dark"
            ? "bg-[#1A1A1A] border-[#333]"
            : "bg-white border-slate-100"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-serif italic font-bold text-xl shadow-sm">
            R
          </div>
          <div className="flex flex-col">
            <h1
              className={cn(
                "font-bold text-sm leading-tight transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}
            >
              Rev Reader
            </h1>
            <span
              className={cn(
                "text-[10px] font-medium tracking-wide transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )}
            >
              For readers and learners
            </span>
          </div>
        </div>

        {/* Sticky Title (Centered) */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-2 transition-all duration-300",
            showStickyTitle
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <span
            className={cn(
              "font-bold text-xs truncate max-w-[250px] sm:max-w-[400px]",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </span>
          <ChevronDown size={12} className="text-slate-400" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all duration-300 active:scale-95",
              theme === "dark"
                ? "bg-[#333] text-yellow-400 hover:bg-[#444]"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            )}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            aria-label={`Switch to ${
              theme === "light" ? "Dark" : "Light"
            } Mode`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "p-2 rounded-full transition-all duration-300 active:scale-95",
              theme === "dark"
                ? "bg-[#333] text-slate-400 hover:text-white hover:bg-[#444]"
                : "bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            )}
            title="Reader Settings"
            aria-label="Reader Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
