import React from 'react';
import { cn } from '../../lib/utils';
import { ArticleTags } from './ArticleTags';
import { ArticleLevel } from './ArticleLevel';
import { MatchScore } from './MatchScore';
import { ReadingStats } from './ReadingStats';

interface ArticleHeaderProps {
  title: string;
  tags: string[];
  level: string;
  matchScore: number;
  wordCount: number;
  estimatedMinutes: number;
  className?: string;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  title,
  tags,
  level,
  matchScore,
  wordCount,
  estimatedMinutes,
  className = ''
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-8', className)}>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <ArticleTags tags={tags} />
          <ArticleLevel level={level} />
          <div className="flex items-center gap-1" aria-label={`Match score: ${matchScore}%`}>
            <MatchScore score={matchScore} />
            <span className="text-xs text-slate-500 ml-1">Match</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800 leading-tight">
          {title}
        </h1>
      </div>
      <ReadingStats
        wordCount={wordCount}
        estimatedMinutes={estimatedMinutes}
        className="self-start sm:self-center"
      />
    </div>
  );
};