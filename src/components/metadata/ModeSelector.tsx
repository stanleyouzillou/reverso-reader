import React from 'react';
import { BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SidebarMode } from '../../types';

interface ModeSelectorProps {
  activeMode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  className?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onModeChange,
  className = ''
}) => {
  const modes = [
    { id: 'dictionary' as SidebarMode, label: 'Dictionary', icon: BookOpen },
    { id: 'vocabulary' as SidebarMode, label: 'Vocabulary', icon: Lightbulb },
    { id: 'ai' as SidebarMode, label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div
      className={cn('flex border-b border-slate-200', className)}
      role="tablist"
      aria-label="Sidebar mode selection"
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              'flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors border-b-2 relative',
              activeMode === mode.id
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            )}
            role="tab"
            aria-selected={activeMode === mode.id}
            aria-controls={`panel-${mode.id}`}
            id={`tab-${mode.id}`}
          >
            <Icon size={16} />
            <span>{mode.label}</span>
            {mode.id === 'ai' && (
              <span className="absolute top-1 right-3 text-[6px] bg-blue-500 text-white px-1 rounded-full">
                BETA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};