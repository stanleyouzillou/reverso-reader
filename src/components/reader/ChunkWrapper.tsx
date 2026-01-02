import React from "react";
import { cn } from "../../lib/utils";
import { TranslatedSpan } from "../../types";

interface ChunkWrapperProps {
  children: React.ReactNode;
  translation?: string;
  isEndToken?: boolean;
  className?: string;
}

export const ChunkWrapper: React.FC<ChunkWrapperProps> = ({
  children,
  translation,
  isEndToken = false,
  className = ""
}) => {
  return (
    <span className={cn("chunk-wrapper", className)}>
      {children}
      {isEndToken && translation && (
        <span className="chunk-translation">
          {translation}
        </span>
      )}
    </span>
  );
};