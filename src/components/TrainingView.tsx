import React, { useState, useEffect, useMemo } from 'react';
import {
  RuneColor,
  ALL_RUNES,
  RUNE_DEFINITIONS,
  GameAttempt,
  SolverStep,
  SLOT_SEQUENCES,
  getSlotSequenceStage,
} from '../types/kekkai';
import {
  calculateFeedback,
  generateAllCombinations,
  filterCandidates,
  getRecommendedGuess,
} from '../utils/solver';
import { RuneTile } from './RuneTile';
import { RuneSelector } from './RuneSelector';
import { SlotSequenceBar } from './SlotSequenceBar';
import {
  Sparkles,
  RotateCcw,
  Trophy,
  ShieldAlert,
  Flame,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface TrainingViewProps {
  slotCount: number;
  onChangeSlotCount?: (slots: number) => void;
  completedSlots?: number[];
  onCompleteSlot?: (slots: number) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  slotCount,
  onChangeSlotCount,
  completedSlots = [],
  onCompleteSlot,
}) => {
  const MAX_ATTEMPTS = 8;
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);

  // Secret code to guess
  const [secretCode, setSecretCode] = useState<RuneColor[]>([]);

  // Current active row being composed
  const [currentSlots, setCurrentSlots] = useState<RuneColor[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  // Game attempts history
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Win streak
  const [winStreak, setWinStreak] = useState<number>(0);

  // AI Hint message
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Initialize a new secret code
  const startNewGame = () => {
    const newCode: RuneColor[] = [];
    const pool = [...ALL_RUNES];

    for (let i = 0; i < slotCount; i++) {
      if (allowDuplicates) {
        const rand = ALL_RUNES[Math.floor(Math.random() * ALL_RUNES.length)];
        newCode.push(rand);
      } else {
        const randIdx = Math.floor(Math.random() * pool.length);
        newCode.push(pool[randIdx]);
        pool.splice(randIdx, 1);
      }
    }

    setSecretCode(newCode);
    setCurrentSlots(Array(slotCount).fill('green'));
    setActiveSlot(0);
    setAttempts([]);
    setIsGameOver(false);
    setIsWon(false);
    setHintMessage(null);
  };

  useEffect(() => {
    startNewGame();
  }, [slotCount, allowDuplicates]);

  // Handle placing a rune into active slot
  const handleRuneSelect = (rune: RuneColor) => {
    const updated = [...currentSlots];
    updated[activeSlot] = rune;
    setCurrentSlots(updated);
    setActiveSlot((prev) => (prev + 1) % slotCount);
  };

  // Submit current attempt
  const handleSubmitAttempt = () => {
    if (isGameOver) return;

    const fb = calculateFeedback(currentSlots, secretCode);
    const newAttempts = [...attempts, { guess: [...currentSlots], feedback: fb }];
    setAttempts(newAttempts);

    if (fb.green === slotCount) {
      // Won!
      setIsGameOver(true);
      setIsWon(true);
      setWinStreak((prev) => prev + 1);
      onCompleteSlot?.(slotCount);
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      // Lost
      setIsGameOver(true);
      setIsWon(false);
      setWinStreak(0);
    } else {
      // Advance to next attempt
      setHintMessage(null);
    }
  };

  // Solver Hint: computes optimal guess using solver algorithm against current attempts
  const handleAskSolverHint = () => {
    const allCodes = generateAllCombinations(slotCount, allowDuplicates);

    // Filter down to remaining candidates based on attempts so far
    let surviving = allCodes;
    const solverHistory: SolverStep[] = [];

    for (let i = 0; i < attempts.length; i++) {
      const att = attempts[i];
      surviving = filterCandidates(surviving, att.guess, att.feedback);
      solverHistory.push({
        id: `att-${i}`,
        guess: att.guess,
        feedback: att.feedback,
        remainingCandidates: surviving.length,
        timestamp: Date.now(),
      });
    }

    const rec = getRecommendedGuess(
      surviving,
      allCodes,
      solverHistory,
      slotCount,
      'entropy',
      allowDuplicates
    );

    setCurrentSlots(rec.guess);
    setHintMessage(
      `AI Solver calculated: ${surviving.length} candidates left. Pattern [${rec.guess
        .map((r) => RUNE_DEFINITIONS[r].colorName)
        .join(', ')}] will maximize clue information.`
    );
  };

  // Stage info for current slot count
  const currentStageInfo = useMemo(() => getSlotSequenceStage(slotCount), [slotCount]);

  const nextSlotInSequence = useMemo(() => {
    const idx = SLOT_SEQUENCES.findIndex((s) => s.slots === slotCount);
    if (idx >= 0 && idx < SLOT_SEQUENCES.length - 1) {
      return SLOT_SEQUENCES[idx + 1].slots;
    }
    return null;
  }, [slotCount]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Slot Sequence Stepper Bar (Slot 2 -> Slot 3 -> Slot 4 -> Slot 5) */}
      <SlotSequenceBar
        currentSlotCount={slotCount}
        onSelectSlotCount={(slots) => onChangeSlotCount?.(slots)}
        completedSlots={completedSlots}
        onNextStage={
          nextSlotInSequence ? () => onChangeSlotCount?.(nextSlotInSequence) : undefined
        }
      />

      {/* Top Header */}
      <div className="bg-stone-900/90 border border-red-900/50 rounded-2xl p-3.5 sm:p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              Exam Simulation
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Streak: {winStreak}</span>
            </div>
            <span className="text-[11px] sm:text-xs text-stone-400 font-mono">
              Stage: <strong className="text-amber-300">{currentStageInfo.name}</strong> ({currentStageInfo.rank})
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black font-serif text-red-200 mt-1">
            Kekkai Dojo Training Ground
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-300">
            Practice cracking the secret barrier code under exam conditions ({MAX_ATTEMPTS} attempts allowed).
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setAllowDuplicates(!allowDuplicates)}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              allowDuplicates
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            {allowDuplicates ? 'Duplicates: ON' : 'Duplicates: OFF'}
          </button>
          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>New Puzzle</span>
          </button>
        </div>
      </div>

      {/* Victory / Defeat Modal Banner */}
      {isGameOver && (
        <div
          className={`p-4 sm:p-6 rounded-3xl border-2 text-center shadow-2xl animate-in zoom-in-95 duration-300 ${
            isWon
              ? 'bg-gradient-to-b from-green-950/90 to-stone-950/90 border-green-500 text-green-100 shadow-green-900/50'
              : 'bg-gradient-to-b from-red-950/90 to-stone-950/90 border-red-500 text-red-100 shadow-red-900/50'
          }`}
        >
          <div className="flex flex-col items-center">
            {isWon ? (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-green-300 mb-2.5 sm:mb-3">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-green-300">
                  Kekkai Barrier Shattered! Exam Passed!
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-300 mt-1 max-w-md">
                  You successfully deduced the secret sequence in {attempts.length} attempts. Your chakra control is exemplary!
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center text-red-300 mb-2.5 sm:mb-3">
                  <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-red-300">
                  Chakra Depleted — Barrier Held
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-300 mt-1 max-w-md">
                  You reached the 8-attempt limit. Study the feedback clues or use the AI Solver to hone your deduction.
                </p>
              </>
            )}

            {/* Revealed Secret Code */}
            <div className="my-3 sm:my-4 p-2.5 sm:p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">
                Secret Barrier Code Was:
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                {secretCode.map((rune, idx) => (
                  <RuneTile key={idx} color={rune} size="md" />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {isWon && nextSlotInSequence && (
                <button
                  onClick={() => onChangeSlotCount?.(nextSlotInSequence)}
                  className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black font-serif text-xs sm:text-sm transition-transform hover:scale-105 shadow-xl shadow-emerald-950/60 cursor-pointer"
                >
                  <span>Advance to {getSlotSequenceStage(nextSlotInSequence).name} ({getSlotSequenceStage(nextSlotInSequence).rank})</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {isWon && !nextSlotInSequence && (
                <button
                  onClick={() => onChangeSlotCount?.(2)}
                  className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-serif text-xs sm:text-sm transition-transform hover:scale-105 shadow-xl shadow-amber-950/60 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Restart Full Sequence from Slot 2</span>
                </button>
              )}

              <button
                onClick={startNewGame}
                className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm border border-stone-700 transition-colors cursor-pointer"
              >
                {isWon ? 'Play This Stage Again' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Board Interactive Area */}
      <div className="bg-stone-950/90 border-2 border-stone-800 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            Attempt #{attempts.length + 1} of {MAX_ATTEMPTS}
          </span>
          <span className="text-[11px] sm:text-xs text-stone-400 font-mono">
            {MAX_ATTEMPTS - attempts.length} attempts left
          </span>
        </div>

        {/* Current Active Placement Row */}
        {!isGameOver && (
          <div className="p-3.5 sm:p-6 rounded-2xl bg-stone-900/90 border-2 border-amber-900/50 flex flex-col items-center">
            <span className="text-[11px] sm:text-xs text-stone-400 mb-2 sm:mb-3 text-center">
              Click a slot to select it, then pick a rune from the palette:
            </span>

            <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 md:gap-6 my-2 w-full max-w-full overflow-x-auto pb-1">
              {currentSlots.map((rune, idx) => {
                const isSelected = activeSlot === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlot(idx)}
                    className={`flex flex-col items-center cursor-pointer p-1 sm:p-2 rounded-2xl transition-all shrink-0 ${
                      isSelected
                        ? 'bg-red-500/20 ring-2 ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 mb-0.5 sm:mb-1">
                      Slot {idx + 1}
                    </span>
                    <RuneTile color={rune} size="lg" selected={isSelected} clickable />
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase mt-1 text-stone-300 truncate max-w-[60px] text-center">
                      {RUNE_DEFINITIONS[rune].colorName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hint Notification if clicked */}
            {hintMessage && (
              <div className="mt-3 p-2.5 sm:p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 max-w-xl">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{hintMessage}</span>
              </div>
            )}

            {/* Submit & Hint Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 mt-4 sm:mt-5 w-full max-w-md">
              <button
                onClick={handleAskSolverHint}
                className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Consult the AI solver algorithm for optimal placement"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Ask Solver Hint</span>
              </button>

              <button
                onClick={handleSubmitAttempt}
                className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white text-xs font-black uppercase font-serif tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/40 transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Guess</span>
              </button>
            </div>
          </div>
        )}

        {/* Rune Palette */}
        {!isGameOver && (
          <div className="mt-4 sm:mt-6">
            <RuneSelector onSelect={handleRuneSelect} selectedRune={currentSlots[activeSlot]} />
          </div>
        )}

        {/* Previous Attempts History */}
        <div className="mt-6 sm:mt-8 border-t border-stone-800/80 pt-4 sm:pt-6">
          <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-stone-400 mb-2.5 sm:mb-3">
            Attempt Clues Log ({attempts.length}/{MAX_ATTEMPTS})
          </h4>

          {attempts.length === 0 ? (
            <div className="text-center py-6 text-stone-500 text-xs font-mono">
              Your guess history and clues will appear here.
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {attempts.map((att, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between flex-wrap gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-stone-300">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {att.guess.map((r, rIdx) => (
                        <RuneTile key={rIdx} color={r} size="xs" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-green-950/60 border border-green-800 text-green-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {att.feedback.green} Green
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-yellow-950/60 border border-yellow-800 text-yellow-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      {att.feedback.yellow} Yellow
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
