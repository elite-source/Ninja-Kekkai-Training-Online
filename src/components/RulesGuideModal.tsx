import React from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import { ALL_RUNES, RUNE_DEFINITIONS } from '../types/kekkai';
import { RuneTile } from './RuneTile';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-stone-900 border-2 border-amber-800/80 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl shadow-amber-950/50">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-wide text-amber-300">
                Kekkai Training & Solver Guide
              </h2>
              <p className="text-xs text-stone-400">
                Official Ninja Exam mechanics, feedback rules, and solving tactics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm">
          {/* Section 1: Objective */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. The Goal of Kekkai (Barrier) Training
            </h3>
            <p className="text-stone-300 leading-relaxed">
              In Ninja, the Kekkai Training is a sacred code-breaking ritual required during Chunin and Jounin exams.
              A secret barrier sequence of runes (typically <strong className="text-amber-300">5 runes</strong> or 3 runes) is hidden.
              You must crack the sequence within <strong className="text-amber-300">8 attempts</strong> using the clues given after each submission.
            </p>
          </div>

          {/* Section 2: Feedback System */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              2. Understanding Feedback Clues
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-950/40 border border-green-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                  <span className="text-xs font-black text-black">●</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-300">Green Circle (Exact Match)</h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Indicates a rune is the <strong>correct color</strong> AND in the <strong>exact right position</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-yellow-950/40 border border-yellow-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-200 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(250,204,21,0.6)]">
                  <span className="text-xs font-black text-black">●</span>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-300">Yellow Circle (Color Match)</h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Indicates a rune is <strong>present</strong> in the secret code, but placed in the <strong>wrong position</strong>.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2 italic">
              Note: The game does NOT tell you WHICH specific slot triggered the green or yellow circle. That is what our solver deduces!
            </p>
          </div>

          {/* Section 3: The 6 Kekkai Runes */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              3. The 6 Elemental Runes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_RUNES.map((rune) => {
                const info = RUNE_DEFINITIONS[rune];
                return (
                  <div
                    key={rune}
                    className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 flex items-center gap-3"
                  >
                    <RuneTile color={rune} size="sm" />
                    <div>
                      <div className="font-bold text-xs" style={{ color: info.accentColor }}>
                        {info.colorName} ({info.element})
                      </div>
                      <div className="text-[11px] text-stone-400">{info.symbol}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        Hotkey: [{info.shortcut}]
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: How to Use the Solver */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50">
            <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              4. How to Use the Solver with the Game
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-stone-300 text-xs sm:text-sm">
              <li>
                <strong className="text-stone-100">Step 1:</strong> Look at the Recommended Pattern suggested by this solver.
              </li>
              <li>
                <strong className="text-stone-100">Step 2:</strong> Input the exact pattern into your Ninja game.
              </li>
              <li>
                <strong className="text-stone-100">Step 3:</strong> Note the number of Green and Yellow circles the game gives you on the left panel.
              </li>
              <li>
                <strong className="text-stone-100">Step 4:</strong> Click the matching Green & Yellow numbers here and press <em>Submit Feedback</em>.
              </li>
              <li>
                <strong className="text-stone-100">Step 5:</strong> Repeat! In 3 to 5 steps, the remaining possibilities will drop to 1, securing your pass!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/25"
          >
            Understood, Start Training!
          </button>
        </div>
      </div>
    </div>
  );
};
