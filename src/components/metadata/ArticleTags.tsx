import React from "react";
import { cn } from "../../lib/utils";

interface ArticleTagsProps {
  tags: string[];
  className?: string;
}

export const ArticleTags: React.FC<ArticleTagsProps> = ({
  tags,
  className = "",
}) => {
  return (
    <div className={cn("flex flex-wrap gap-[0.5rem]", className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="text-[0.625rem] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white px-[0.75rem] py-[0.375rem] rounded-full uppercase tracking-widest border border-slate-200 dark:border-white/20 shadow-sm transition-colors hover:bg-slate-200 dark:hover:bg-white/20"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
