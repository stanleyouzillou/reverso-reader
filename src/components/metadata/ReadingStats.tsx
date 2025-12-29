import React from 'react';
import { Clock, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReadingStatsProps {
  wordCount: number;
  estimatedMinutes: number;
  className?: string;
}

export const ReadingStats: React.FC<ReadingStatsProps> = ({ 
  wordCount, 
  estimatedMinutes,
  className = '' 
}) => {
  return (
    <div className={cn('flex items-center gap-3 text-xs text-slate-500', className)}>
      <div className="flex items-center gap-1">
        <Hash size={12} className="text-slate-400" />
        <span>{wordCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock size={12} className="text-slate-400" />
        <span>{estimatedMinutes} min</span>
      </div>
    </div>
  );
};