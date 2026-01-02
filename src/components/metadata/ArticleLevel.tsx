import React from 'react';
import { cn } from '../../lib/utils';

interface ArticleLevelProps {
  level: string;
  className?: string;
}

export const ArticleLevel: React.FC<ArticleLevelProps> = ({ 
  level, 
  className = '' 
}) => {
  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center text-[0.75rem] font-bold px-[0.5rem] py-[0.25rem] rounded-full',
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {level}
    </span>
  );
};