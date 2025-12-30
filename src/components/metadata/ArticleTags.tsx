import React from 'react';
import { cn } from '../../lib/utils';

interface ArticleTagsProps {
  tags: string[];
  className?: string;
}

export const ArticleTags: React.FC<ArticleTagsProps> = ({ 
  tags, 
  className = '' 
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 dark:border-white/20 shadow-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};