import React, { useState } from "react";
import {
  ArrowRightLeft,
  MousePointerClick,
  AlignJustify,
  ScrollText,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ReadingMode } from "../../types";
import { SettingsPanel } from "../settings/SettingsPanel";
import { ArticleHeader } from "../metadata/ArticleHeader";
import { DEMO_ARTICLE } from "../../constants/demoContent";

interface ReaderHeaderProps {
  title: string;
  l1Title: string;
  categories: string[];
  level: string;
  matchScore: number;
  wordCount: number;
  estimatedMinutes: number;
  publishDate?: string;
  mode: ReadingMode;
  dualModeOption: "sentences" | "hover" | "interleaved" | "sync";
  setDualModeOption: (
    option: "sentences" | "hover" | "interleaved" | "sync"
  ) => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  title,
  l1Title,
  categories,
  level,
  matchScore,
  wordCount,
  estimatedMinutes,
  publishDate,
  mode,
  dualModeOption,
  setDualModeOption,
}) => {
  return (
    <div className="relative">
      <ArticleHeader
        title={title}
        tags={categories}
        level={level}
        matchScore={matchScore}
        wordCount={wordCount}
        estimatedMinutes={estimatedMinutes}
        publishDate={publishDate}
      />

      {/* Dual Mode Sub-options Controls */}
      {mode === "dual" && (
        <div className="flex justify-center gap-2 mb-6">
          <div className="flex bg-slate-100 p-1 rounded-full">
            {(["sentences", "hover", "interleaved", "sync"] as const).map(
              (opt) => (
                <button
                  key={opt}
                  onClick={() => setDualModeOption(opt)}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    dualModeOption === opt
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                  title={opt.charAt(0).toUpperCase() + opt.slice(1)}
                >
                  {opt === "sentences" && <ArrowRightLeft size={16} />}
                  {opt === "hover" && <MousePointerClick size={16} />}
                  {opt === "interleaved" && <AlignJustify size={16} />}
                  {opt === "sync" && <ScrollText size={16} />}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {mode === "dual" && dualModeOption === "sync" && (
        <h2 className="text-xl font-serif text-slate-500 dark:text-slate-400 mb-8 text-center italic">
          {l1Title}
        </h2>
      )}
    </div>
  );
};
