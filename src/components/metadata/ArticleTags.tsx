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
          className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};