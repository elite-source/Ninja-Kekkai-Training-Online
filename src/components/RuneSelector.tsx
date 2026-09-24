import React, { useEffect } from 'react';
import { RuneColor, ALL_RUNES, RUNE_DEFINITIONS } from '../types/kekkai';
import { RuneTile } from './RuneTile';

interface RuneSelectorProps {
  onSelect: (rune: RuneColor) => void;
  selectedRune?: RuneColor | null;
  disabledRunes?: RuneColor[];
  compact?: boolean;
}

export const RuneSelector: React.FC<RuneSelectorProps> = ({
  onSelect,
  selectedRune,
  disabledRunes = [],
  compact = false,
}) => {
  // Global keyboard shortcuts (1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;
      const found = ALL_RUNES.find((r) => RUNE_DEFINITIONS[r].shortcut === key);
      if (found && !disabledRunes.includes(found)) {
        onSelect(found);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, disabledRunes]);

  return (
    <div className="bg-stone-900/90 border border-amber-900/60 rounded-xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-300/80 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
          Elemental Runes Palette
        </span>
        <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
          Hotkeys: [1-6]
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5 sm:gap-3 items-center justify-items-center">
        {ALL_RUNES.map((rune) => {
          const info = RUNE_DEFINITIONS[rune];
          const isDisabled = disabledRunes.includes(rune);
          const isSelected = selectedRune === rune;

          return (
            <button
              key={rune}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(rune)}
              className="flex flex-col items-center group relative focus:outline-none transition-transform cursor-pointer p-0.5"
            >
              <RuneTile
                color={rune}
                size={compact ? 'sm' : 'md'}
                selected={isSelected}
                clickable={!isDisabled}
                disabled={isDisabled}
              />
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700/80 shadow-inner group-hover:border-amber-500/70 group-hover:text-amber-300 transition-colors">
                  {info.shortcut}
                </span>
                <span className="text-[11px] font-semibold text-stone-300 hidden md:inline">
                  {info.colorName}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
