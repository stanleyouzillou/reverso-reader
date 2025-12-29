import React from 'react';
import { cn } from '../../lib/utils';

interface MatchScoreProps {
  score: number;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({ 
  score, 
  className = '' 
}) => {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative', className)} role="img" aria-label={`${score}% match`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-500 transition-all duration-500 ease-in-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700"
        style={{ fontSize: '8px' }}
      >
        {score}%
      </span>
    </div>
  );
};