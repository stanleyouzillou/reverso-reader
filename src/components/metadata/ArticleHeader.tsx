import React from "react";
import { cn } from "../../lib/utils";
import { ArticleTags } from "./ArticleTags";
import { MatchScore } from "./MatchScore";
import { Clock, Hash, BarChart3, Calendar } from "lucide-react";

interface ArticleHeaderProps {
  title: string;
  tags: string[];
  level: string;
  matchScore: number;
  wordCount: number;
  estimatedMinutes: number;
  publishDate?: string;
  className?: string;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  title,
  tags,
  level,
  matchScore,
  wordCount,
  estimatedMinutes,
  publishDate = "Oct 12, 2025",
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-[1.5rem] mb-[2.5rem] pt-[2rem]",
        className
      )}
    >
      {/* 1. Category Tags at the very top */}
      <ArticleTags tags={tags} />

      {/* 2. Title */}
      <h1 className="text-[2.25rem] sm:text-[3rem] font-serif font-bold text-slate-900 dark:text-white leading-[1.15]">
        {title}
      </h1>

      {/* 3. Metadata Row */}
      <div className="flex flex-wrap items-center gap-x-[1rem] gap-y-[0.5rem] text-[0.75rem] text-slate-500 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-[1.25rem]">
        {/* Match Score */}
        <div
          className="flex items-center gap-[0.5rem] group cursor-help"
          title="Match based on your vocabulary"
        >
          <MatchScore score={matchScore} size="1.125rem" showText={false} />
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {matchScore}% match
          </span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        {/* Word Count */}
        <div className="flex items-center gap-[0.375rem]">
          <Hash
            size="0.875rem"
            className="text-slate-400 dark:text-slate-500"
          />
          <span>{wordCount} words</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
          •
        </span>

        {/* Read Time */}
        <div className="flex items-center gap-[0.375rem]">
          <Clock
            size="0.875rem"
            className="text-slate-400 dark:text-slate-500"
          />
          <span>{estimatedMinutes} min </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
          •
        </span>

        {/* Level */}
        <div className="flex items-center gap-[0.375rem]">
          <BarChart3
            size="0.875rem"
            className="text-slate-400 dark:text-slate-500"
          />
          <span className="font-medium">{level}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
          •
        </span>

        {/* Date */}
        <div className="flex items-center gap-[0.375rem]">
          <Calendar
            size="0.875rem"
            className="text-slate-400 dark:text-slate-500"
          />
          <span>{publishDate}</span>
        </div>
      </div>
    </div>
  );
};
