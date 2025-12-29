import React, { useState } from "react";
import { RefreshCw, Monitor, Zap, Settings, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsPanel } from "./settings/SettingsPanel";
import { useArticleIngestion } from "../hooks/useArticleIngestion";

interface HeaderProps {
  showStickyTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showStickyTitle = false }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { title } = useArticleIngestion();

  return (
    <div className="flex flex-col w-full relative z-50">
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Top Bar */}
      <div className="bg-brand-dark text-gray-400 text-xs py-2 px-6 flex justify-between items-center font-sans relative">
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Preview
          </span>
          <span className="hover:text-white cursor-pointer">Code</span>
          <span className="hover:text-white cursor-pointer">Fullscreen</span>
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
          <span className="text-white font-bold text-xs truncate max-w-[400px]">
            {title}
          </span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>

        <div className="flex gap-4 items-center">
          <span className="hover:text-white cursor-pointer flex items-center gap-1">
            <Monitor size={14} /> Device
          </span>
          <span className="hover:text-white cursor-pointer">
            <RefreshCw size={14} />
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-slate-100 py-3 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-serif italic font-bold text-xl">
            L
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 font-bold text-sm leading-tight">
              Rev Reader
            </h1>
            <span className="text-slate-500 text-[10px] font-medium tracking-wide">
              B2 ENGLISH • FRENCH SUPPORT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
            GEMINI
          </button>
          <button className="px-3 py-1.5 rounded-full border border-green-500 text-xs font-medium text-green-700 bg-green-50">
            GOOGLE
          </button>
          <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
            Reset
          </button>
          <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-1">
            AI Assistant
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            title="Reader Settings"
          >
            <Settings size={20} />
          </button>

          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <span className="sr-only">More</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
