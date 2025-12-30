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
    <div className={cn("flex flex-col gap-6 mb-10 pt-8", className)}>
      {/* 1. Category Tags at the very top */}
      <ArticleTags tags={tags} />

      {/* 2. Title */}
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-[1.15]">
        {title}
      </h1>

      {/* 3. Metadata Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
        {/* Match Score */}
        <div
          className="flex items-center gap-2 group cursor-help"
          title="Match based on your vocabulary"
        >
          <MatchScore score={matchScore} size={18} showText={false} />
          <span className="font-bold text-slate-700 dark:text-slate-200">{matchScore}% match</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        {/* Word Count */}
        <div className="flex items-center gap-1.5">
          <Hash size={14} className="text-slate-400" />
          <span>{wordCount} words</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        {/* Read Time */}
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400" />
          <span>{estimatedMinutes} min </span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        {/* Level */}
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-slate-400" />
          <span className="font-medium">{level}</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span>{publishDate}</span>
        </div>
      </div>
    </div>
  );
};
