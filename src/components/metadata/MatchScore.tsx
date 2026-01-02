import React from "react";
import { cn } from "../../lib/utils";

interface MatchScoreProps {
  score: number;
  size?: number | string;
  showText?: boolean;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  size = "2rem",
  showText = true,
  className = "",
}) => {
  // Use a fixed internal coordinate system for SVG math
  const internalSize = 100;
  const strokeWidth = 10;
  const radius = (internalSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      role="img"
      aria-label={`${score}% match`}
      style={{ 
        width: typeof size === 'number' ? `${size}px` : size, 
        height: typeof size === 'number' ? `${size}px` : size 
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${internalSize} ${internalSize}`}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={internalSize / 2}
          cy={internalSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx={internalSize / 2}
          cy={internalSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-500 transition-all duration-500 ease-in-out"
        />
      </svg>
      {showText && (
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300"
          style={{ fontSize: "0.3em" }}
        >
          {score}
        </span>
      )}
    </div>
  );
};
