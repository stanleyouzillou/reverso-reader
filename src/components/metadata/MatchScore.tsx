import React from "react";
import { cn } from "../../lib/utils";

interface MatchScoreProps {
  score: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  size = 32,
  showText = true,
  className = "",
}) => {
  const strokeWidth = Math.max(2, size / 10);
  const radius = (size - strokeWidth) / 2;
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
      style={{ width: size, height: size }}
    >
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
          className="text-blue-500 transition-all duration-500 ease-in-out"
        />
      </svg>
      {showText && (
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-slate-700"
          style={{ fontSize: `${size / 3.5}px` }}
        >
          {score}
        </span>
      )}
    </div>
  );
};
