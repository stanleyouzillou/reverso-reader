import React from 'react';
import { cn } from '../../lib/utils';

interface DeckIconProps {
  size?: number | string;
  className?: string;
}

export const DeckIcon: React.FC<DeckIconProps> = ({ size = "1.5rem", className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('flex-shrink-0', className)}
    >
      {/* Bottom card */}
      <rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="currentColor" fillOpacity="0.2" />
      {/* Middle card */}
      <rect x="2" y="4" width="18" height="12" rx="2" ry="2" fill="currentColor" fillOpacity="0.4" />
      {/* Top card */}
      <rect x="1" y="2" width="18" height="12" rx="2" ry="2" fill="currentColor" />
    </svg>
  );
};