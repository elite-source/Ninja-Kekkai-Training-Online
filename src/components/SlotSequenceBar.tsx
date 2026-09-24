import React from 'react';
import { SLOT_SEQUENCES } from '../types/kekkai';
import { ChevronRight, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface SlotSequenceBarProps {
  currentSlotCount: number;
  onSelectSlotCount: (slots: number) => void;
  completedSlots?: number[];
  variant?: 'compact' | 'expanded';
  onNextStage?: () => void;
}

export const SlotSequenceBar: React.FC<SlotSequenceBarProps> = ({
  currentSlotCount,
  onSelectSlotCount,
  completedSlots = [],
  onNextStage,
}) => {
  const currentIndex = SLOT_SEQUENCES.findIndex((s) => s.slots === currentSlotCount);
  const nextStage = currentIndex < SLOT_SEQUENCES.length - 1 ? SLOT_SEQUENCES[currentIndex + 1] : null;

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-2.5 sm:p-4 shadow-lg backdrop-blur-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 sm:mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Kekkai Sequence Path
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 font-mono border border-emerald-800/40">
                Slot 2 ➔ 5
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 hidden sm:block">
              Progressive seal sequence from Genin 2-slot practice to Jounin 5-slot barrier
            </p>
          </div>
        </div>

        {nextStage && onNextStage && (
          <button
            onClick={() => onNextStage()}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <span>Next: {nextStage.name}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>

      {/* Sequence Stepper */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {SLOT_SEQUENCES.map((stage, idx) => {
          const isActive = stage.slots === currentSlotCount;
          const isCompleted = completedSlots.includes(stage.slots);

          return (
            <button
              key={stage.id}
              onClick={() => onSelectSlotCount(stage.slots)}
              className={`relative text-left p-2 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-950/40 via-stone-900 to-stone-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/40'
              }`}
            >
              {/* Active / Completed indicator ribbon */}
              <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-black font-mono shrink-0 ${
                      isActive
                        ? 'bg-emerald-500 text-stone-950 shadow-sm shadow-emerald-500/50'
                        : isCompleted
                        ? 'bg-emerald-600 text-stone-950'
                        : 'bg-stone-800 text-stone-400 group-hover:text-stone-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : idx + 1}
                  </span>
                  <span
                    className={`font-black tracking-tight text-xs sm:text-sm truncate ${
                      isActive ? 'text-emerald-400' : 'text-stone-200'
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>

                <span
                  className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {stage.slots} Runes
                </span>
              </div>

              {/* Rank & Stage difficulty */}
              <div className="text-[11px] sm:text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span>{stage.rank}</span>
                <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-mono">
                  {stage.difficulty}
                </span>
              </div>

              {/* Combinations count */}
              <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-400">
                <span>Search:</span>
                <span className="font-mono font-bold text-emerald-400/90">
                  {stage.combosWithDupes.toLocaleString()}
                </span>
              </div>

              {/* Connecting arrow visual on large screens */}
              {idx < SLOT_SEQUENCES.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-stone-900 border border-stone-700 items-center justify-center text-stone-500">
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
