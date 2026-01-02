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
        <div className="flex justify-center gap-[0.5rem] mb-[1.5rem]">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-[0.25rem] rounded-full">
            {(["sentences", "hover", "interleaved", "sync"] as const).map(
              (opt) => (
                <button
                  key={opt}
                  onClick={() => setDualModeOption(opt)}
                  className={cn(
                    "p-[0.5rem] rounded-full transition-all",
                    dualModeOption === opt
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title={opt.charAt(0).toUpperCase() + opt.slice(1)}
                >
                  {opt === "sentences" && <ArrowRightLeft size="1rem" />}
                  {opt === "hover" && <MousePointerClick size="1rem" />}
                  {opt === "interleaved" && <AlignJustify size="1rem" />}
                  {opt === "sync" && <ScrollText size="1rem" />}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {mode === "dual" && dualModeOption === "sync" && (
        <h2 className="text-[1.25rem] font-serif text-slate-500 dark:text-slate-400 mb-[2rem] text-center italic">
          {l1Title}
        </h2>
      )}
    </div>
  );
};
