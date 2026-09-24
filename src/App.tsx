import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { SolverView } from './components/SolverView';
import { TrainingView } from './components/TrainingView';
import { RulesGuideModal } from './components/RulesGuideModal';
import { RuneTile } from './components/RuneTile';
import { ALL_RUNES, RUNE_DEFINITIONS } from './types/kekkai';
import { Shield, ExternalLink, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');
  const [slotCount, setSlotCount] = useState<number>(5);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [completedSlots, setCompletedSlots] = useState<number[]>([]);

  const handleCompleteSlot = (slot: number) => {
    setCompletedSlots((prev) => Array.from(new Set([...prev, slot])));
  };

  return (
    <div className="min-h-screen w-full flex flex-col text-stone-200 bg-stone-950 overflow-x-hidden selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        slotCount={slotCount}
        onChangeSlotCount={setSlotCount}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'solver' && (
          <SolverView
            slotCount={slotCount}
            onChangeSlotCount={setSlotCount}
            completedSlots={completedSlots}
            onCompleteSlot={handleCompleteSlot}
          />
        )}

        {activeTab === 'training' && (
          <TrainingView
            slotCount={slotCount}
            onChangeSlotCount={setSlotCount}
            completedSlots={completedSlots}
            onCompleteSlot={handleCompleteSlot}
          />
        )}
      </main>

      {/* Persistent Bottom Reference Footer */}
      <footer className="mt-auto border-t border-amber-950/60 bg-stone-950/95 py-5 sm:py-6 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Quick Rune Reference Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5 shrink-0">
              <Shield className="w-4 h-4 text-amber-500" />
              Elemental Runes Index:
            </span>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              {ALL_RUNES.map((rune) => {
                const info = RUNE_DEFINITIONS[rune];
                return (
                  <div
                    key={rune}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 text-xs"
                  >
                    <RuneTile color={rune} size="xs" />
                    <span className="font-semibold text-stone-300 truncate">
                      {info.colorName}
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:inline">
                      ({info.element.split('/')[0].trim()})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Copyright & Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-serif font-bold text-stone-400">
                Ninja Kekkai Training & Solver
              </span>
              <span>•</span>
              <span>Mastermind Information Entropy Algorithm</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How Kekkai Works</span>
              </button>
              <a
                href="https://www.ninjasaga.online/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium text-amber-400/90 hover:underline underline-offset-2"
              >
                <span>Official Ninja Game</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <RulesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
