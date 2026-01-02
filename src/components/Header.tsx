import React, { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  ChevronDown,
  BookOpen,
  Brain,
  Copy,
} from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsPanel } from "./settings/SettingsPanel";
import { useArticleIngestion } from "../hooks/useArticleIngestion";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { useStore } from "../store/useStore";
import { ReadingMode } from "../types";

interface HeaderProps {
  showStickyTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showStickyTitle = false }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { title } = useArticleIngestion();
  const { theme, setTheme } = useReaderSettings();
  const { mode, setMode } = useStore();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const modes: { id: ReadingMode; label: string; icon: React.ReactNode }[] = [
    { id: "clean", label: "Read", icon: <BookOpen size={"1.125rem" as any} /> },
    {
      id: "learning",
      label: "Learn",
      icon: <Brain size={"1.125rem" as any} />,
    },
    { id: "dual", label: "Dual", icon: <Copy size={"1.125rem" as any} /> },
  ];

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
          "border-b py-[0.5rem] px-[1rem] sm:px-[1.5rem] flex justify-between items-center shadow-sm transition-colors duration-300",
          theme === "dark"
            ? "bg-[#1A1A1A] border-[#333]"
            : "bg-white border-slate-100"
        )}
      >
        {/* Left Section: Logo */}
        <div className="flex items-center gap-[0.75rem] flex-shrink-0">
          <div className="w-[2rem] h-[2rem] bg-blue-600 rounded-[0.5rem] flex items-center justify-center text-white font-serif italic font-bold text-[1.25rem] shadow-sm">
            R
          </div>
          <div className="hidden sm:flex flex-col">
            <h1
              className={cn(
                "font-bold text-[0.875rem] leading-tight transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}
            >
              Rev Reader
            </h1>
            <span
              className={cn(
                "text-[0.625rem] font-medium tracking-wide transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )}
            >
              For readers and learners
            </span>
          </div>
        </div>

        {/* Center Section: Mode Switcher & Sticky Title */}
        <div className="flex-1 flex justify-center items-center relative h-[2.5rem] px-[1rem] overflow-hidden">
          {/* Mode Switcher */}
          <div
            className={cn(
              "flex items-center gap-[0.25rem] bg-slate-100 dark:bg-[#2A2A2A] p-[0.25rem] rounded-[0.75rem] transition-all duration-500 ease-in-out shadow-inner",
              showStickyTitle
                ? "opacity-0 -translate-y-full pointer-events-none"
                : "opacity-100 translate-y-0"
            )}
          >
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center gap-[0.5rem] px-[0.75rem] py-[0.375rem] rounded-[0.5rem] text-[0.75rem] font-semibold transition-all duration-300 relative group",
                  mode === m.id
                    ? "bg-white dark:bg-[#444] text-blue-600 dark:text-blue-400 shadow-sm scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
                aria-label={m.label}
              >
                <span
                  className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    mode === m.id ? "scale-110" : ""
                  )}
                >
                  {m.icon}
                </span>
                <span className="hidden md:inline">{m.label}</span>
                {mode === m.id && (
                  <span className="absolute -bottom-[0.25rem] left-1/2 -translate-x-1/2 w-[0.25rem] h-[0.25rem] bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Sticky Title */}
          <div
            className={cn(
              "absolute inset-0 flex justify-center items-center gap-[0.5rem] transition-all duration-500 ease-in-out px-[1rem]",
              showStickyTitle
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full pointer-events-none"
            )}
          >
            <span
              className={cn(
                "font-bold text-[0.875rem] truncate max-w-full text-center",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}
            >
              {title}
            </span>
            <ChevronDown
              size="0.875rem"
              className="text-slate-400 flex-shrink-0"
            />
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-[0.25rem] sm:gap-[0.5rem] flex-shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-[0.5rem] rounded-full transition-all duration-300 active:scale-95",
              theme === "dark"
                ? "bg-[#333] text-yellow-400 hover:bg-[#444]"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            )}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            aria-label={`Switch to ${
              theme === "light" ? "Dark" : "Light"
            } Mode`}
          >
            {theme === "light" ? (
              <Moon size="1.25rem" />
            ) : (
              <Sun size="1.25rem" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "p-[0.5rem] rounded-full transition-all duration-300 active:scale-95",
              theme === "dark"
                ? "bg-[#333] text-slate-400 hover:text-white hover:bg-[#444]"
                : "bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            )}
            title="Reader Settings"
            aria-label="Reader Settings"
          >
            <Settings size="1.25rem" />
          </button>
        </div>
      </div>
    </div>
  );
};
