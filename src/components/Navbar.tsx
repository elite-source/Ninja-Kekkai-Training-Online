import React from 'react';
import { BookOpen, Crosshair, Swords, Shield } from 'lucide-react';
import { SLOT_SEQUENCES } from '../types/kekkai';

export type ActiveTab = 'solver' | 'training';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenGuide: () => void;
  slotCount: number;
  onChangeSlotCount: (count: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenGuide,
  slotCount,
  onChangeSlotCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 border-b border-amber-900/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-red-700 p-0.5 shadow-lg shadow-amber-900/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center border border-amber-500/40">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/20" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-widest font-black text-amber-500">
                Ninja
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                Kekkai
              </span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold font-serif tracking-tight text-stone-100 flex items-center gap-1">
              Kekkai Training & Solver
            </h1>
          </div>
        </div>

        {/* Navigation Tabs (Solver & Dojo) */}
        <nav className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-stone-800 shadow-inner order-3 sm:order-2 w-full sm:w-auto justify-center">
          <button
            onClick={() => onTabChange('solver')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'solver'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md shadow-amber-900/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kekkai Solver</span>
          </button>

          <button
            onClick={() => onTabChange('training')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'training'
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-md shadow-red-900/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Training Dojo</span>
          </button>
        </nav>

        {/* Right Action Tools: Slot Selector & Guide */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 sm:order-3">
          {/* Slot Sequence Selector */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-xs">
            <span className="text-stone-400 text-[10px] sm:text-[11px] px-1.5 font-mono hidden md:inline">Slots:</span>
            {SLOT_SEQUENCES.map((stage) => {
              const isSelected = slotCount === stage.slots;
              return (
                <button
                  key={stage.id}
                  onClick={() => onChangeSlotCount(stage.slots)}
                  className={`px-2 py-1 rounded font-bold transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={`${stage.name} (${stage.rank}) - ${stage.combosWithDupes.toLocaleString()} combinations`}
                >
                  <span className="hidden lg:inline">{stage.name}</span>
                  <span className="lg:hidden">{stage.slots}</span>
                </button>
              );
            })}
          </div>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm shrink-0"
            title="How Kekkai Works"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-xs">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
