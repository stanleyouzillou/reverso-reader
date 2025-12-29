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
        'inline-flex items-center justify-center text-xs font-bold px-2 py-1 rounded-full',
        'bg-slate-100 text-slate-700 border border-slate-200',
        className
      )}
    >
      {level}
    </span>
  );
};