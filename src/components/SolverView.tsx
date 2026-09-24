import React, { useState, useEffect, useMemo } from 'react';
import {
  RuneColor,
  Feedback,
  SolverStep,
  SolverStrategy,
  ALL_RUNES,
  RUNE_DEFINITIONS,
  SLOT_SEQUENCES,
  getSlotSequenceStage,
} from '../types/kekkai';
import {
  generateAllCombinations,
  filterCandidates,
  getRecommendedGuess,
  analyzeProbabilities,
} from '../utils/solver';
import { RuneTile } from './RuneTile';
import { RuneSelector } from './RuneSelector';
import { SlotSequenceBar } from './SlotSequenceBar';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  History,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  Trophy,
} from 'lucide-react';

interface SolverViewProps {
  slotCount: number;
  initialRunes?: RuneColor[];
  initialFeedback?: Feedback;
  onChangeSlotCount?: (slots: number) => void;
  completedSlots?: number[];
  onCompleteSlot?: (slots: number) => void;
}

export const SolverView: React.FC<SolverViewProps> = ({
  slotCount,
  initialRunes,
  initialFeedback,
  onChangeSlotCount,
  completedSlots = [],
  onCompleteSlot,
}) => {
  // Solver settings
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [strategy, setStrategy] = useState<SolverStrategy>('entropy');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCandidatesList, setShowCandidatesList] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // All possible codes in search space
  const allCodes = useMemo(() => {
    return generateAllCombinations(slotCount, allowDuplicates);
  }, [slotCount, allowDuplicates]);

  // Current surviving candidates
  const [candidates, setCandidates] = useState<RuneColor[][]>(allCodes);

  // History of guesses and feedback
  const [history, setHistory] = useState<SolverStep[]>([]);

  // Current active guess being entered
  const [currentGuess, setCurrentGuess] = useState<RuneColor[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  // Feedback input state for current guess
  const [feedbackGreen, setFeedbackGreen] = useState<number>(0);
  const [feedbackYellow, setFeedbackYellow] = useState<number>(0);

  // Re-generate candidates and initial guess when slotCount or allowDuplicates changes
  useEffect(() => {
    const codes = generateAllCombinations(slotCount, allowDuplicates);
    setCandidates(codes);
    setHistory([]);
    setFeedbackGreen(0);
    setFeedbackYellow(0);

    // Default slot sequence to all green
    setCurrentGuess(Array(slotCount).fill('green'));
    setSelectedSlotIndex(0);
  }, [slotCount, allowDuplicates, strategy]);

  // Apply initial external runes if provided
  useEffect(() => {
    if (initialRunes && initialRunes.length === slotCount) {
      setCurrentGuess(initialRunes);
      if (initialFeedback) {
        setFeedbackGreen(initialFeedback.green);
        setFeedbackYellow(initialFeedback.yellow);
      }
    }
  }, [initialRunes, initialFeedback, slotCount]);

  // Compute next recommended guess whenever history or candidates update
  const recommended = useMemo(() => {
    return getRecommendedGuess(candidates, allCodes, history, slotCount, strategy, allowDuplicates);
  }, [candidates, allCodes, history, slotCount, strategy, allowDuplicates]);

  // Probabilities for each slot based on remaining candidates
  const slotProbabilities = useMemo(() => {
    return analyzeProbabilities(candidates, slotCount);
  }, [candidates, slotCount]);

  // Auto-fill recommended guess when step advances
  const handleApplyRecommended = () => {
    setCurrentGuess(recommended.guess);
    setFeedbackGreen(0);
    setFeedbackYellow(0);
  };

  // Submit feedback for current guess
  const handleSubmitFeedback = () => {
    if (feedbackGreen + feedbackYellow > slotCount) {
      return;
    }

    const fb: Feedback = { green: feedbackGreen, yellow: feedbackYellow };
    const nextCandidates = filterCandidates(candidates, currentGuess, fb);

    const newStep: SolverStep = {
      id: Math.random().toString(36).substring(2, 9),
      guess: [...currentGuess],
      feedback: fb,
      remainingCandidates: nextCandidates.length,
      timestamp: Date.now(),
      isGuaranteed: nextCandidates.length === 1,
    };

    const newHistory = [...history, newStep];
    setHistory(newHistory);
    setCandidates(nextCandidates);

    if (feedbackGreen === slotCount) {
      onCompleteSlot?.(slotCount);
    }

    // Set next guess
    if (nextCandidates.length > 0) {
      const nextRec = getRecommendedGuess(
        nextCandidates,
        allCodes,
        newHistory,
        slotCount,
        strategy,
        allowDuplicates
      );
      setCurrentGuess(nextRec.guess);
    }

    setFeedbackGreen(0);
    setFeedbackYellow(0);
  };

  // Undo a specific step
  const handleUndoStep = (stepIndex: number) => {
    const updatedHistory = history.slice(0, stepIndex);

    let filtered = allCodes;
    for (const step of updatedHistory) {
      filtered = filterCandidates(filtered, step.guess, step.feedback);
    }

    setHistory(updatedHistory);
    setCandidates(filtered);

    const nextRec = getRecommendedGuess(
      filtered,
      allCodes,
      updatedHistory,
      slotCount,
      strategy,
      allowDuplicates
    );
    setCurrentGuess(nextRec.guess);
    setFeedbackGreen(0);
    setFeedbackYellow(0);
  };

  // Reset solver
  const handleReset = () => {
    const codes = generateAllCombinations(slotCount, allowDuplicates);
    setCandidates(codes);
    setHistory([]);
    setFeedbackGreen(0);
    setFeedbackYellow(0);
    setCurrentGuess(Array(slotCount).fill('green'));
    setSelectedSlotIndex(0);
  };

  // Copy sequence to clipboard
  const handleCopyGuess = () => {
    const text = currentGuess.map((r) => RUNE_DEFINITIONS[r].colorName).join(' - ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Update a single slot in current guess
  const handleSlotRuneChange = (rune: RuneColor) => {
    const newGuess = [...currentGuess];
    newGuess[selectedSlotIndex] = rune;
    setCurrentGuess(newGuess);
    // Advance to next slot automatically
    setSelectedSlotIndex((prev) => (prev + 1) % slotCount);
  };

  // Status flags
  const isSolved = history.length > 0 && history[history.length - 1].feedback.green === slotCount;
  const isGuaranteed = candidates.length === 1;
  const isContradiction = candidates.length === 0;

  // Percentage space eliminated
  const initialPoolSize = allCodes.length;
  const eliminatedPercentage = Math.round(
    ((initialPoolSize - candidates.length) / initialPoolSize) * 100
  );

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

      {/* Top Banner / Strategy Control */}
      <div className="bg-stone-900/90 border border-amber-900/50 rounded-2xl p-3.5 sm:p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Turn {history.length + 1}
            </span>
            <span className="text-[11px] sm:text-xs text-stone-400 font-mono">
              Stage: <strong className="text-amber-300">{currentStageInfo.name}</strong> ({currentStageInfo.rank}) • {slotCount} Slots • {allowDuplicates ? 'Duplicates' : 'Unique'}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black font-serif text-amber-200 mt-1">
            Recommended Kekkai Pattern
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-300">
            Input this exact sequence into the game, then enter the Green & Yellow clues received.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Settings Drawer (Expandable) */}
      {showSettings && (
        <div className="bg-stone-900/95 border border-amber-800/60 rounded-xl p-3.5 sm:p-4 animate-in slide-in-from-top duration-200 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5 sm:gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Solver Parameters
            </h4>
            <span className="text-[10px] sm:text-xs text-stone-400 font-mono">
              Permutations: {allCodes.length.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            {/* Strategy */}
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">
                Solving Algorithm Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStrategy('entropy')}
                  className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    strategy === 'entropy'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs">Max Information Entropy</div>
                  <div className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">
                    Fastest mathematical resolution
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStrategy('ninja_probe')}
                  className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    strategy === 'ninja_probe'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs">Ninja Color Probing</div>
                  <div className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">
                    Classic guide technique
                  </div>
                </button>
              </div>
            </div>

            {/* Duplicates Toggle */}
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">
                Allow Duplicate Runes:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAllowDuplicates(true)}
                  className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    allowDuplicates
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs">Allowed (Standard Exam)</div>
                  <div className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">
                    Repeating colors allowed
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAllowDuplicates(false)}
                  className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    !allowDuplicates
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs">Unique Runes Only</div>
                  <div className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">
                    Each color at most once
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Board Display */}
      <div className="relative bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-2 border-amber-900/60 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Solved Victory Banner with Sequence Advance */}
        {isSolved && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-stone-900 to-emerald-950/90 border-2 border-emerald-500 text-emerald-200 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-xl shadow-emerald-950/50 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-black text-sm sm:text-base uppercase tracking-wide text-emerald-300 flex items-center gap-2">
                  <span>{currentStageInfo.name} ({currentStageInfo.rank}) Barrier Solved!</span>
                </div>
                <div className="text-[11px] sm:text-xs text-stone-300 mt-0.5">
                  You cracked the {slotCount}-slot barrier seal in {history.length} {history.length === 1 ? 'attempt' : 'attempts'}.
                </div>
              </div>
            </div>

            {nextSlotInSequence ? (
              <button
                onClick={() => onChangeSlotCount?.(nextSlotInSequence)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <span>Advance to Slot {nextSlotInSequence}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Entire Slot Sequence (Slot 2 ➔ 5) Mastered!</span>
              </div>
            )}
          </div>
        )}

        {/* Guaranteed Win Notification */}
        {isGuaranteed && !isSolved && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center gap-2.5 sm:gap-3 text-amber-200">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            <div>
              <div className="font-black text-xs sm:text-sm uppercase tracking-wide">
                Guaranteed Victory Code Identified!
              </div>
              <div className="text-[11px] sm:text-xs text-amber-100">
                Only 1 valid combination remains. Input this sequence into the game to pass the exam!
              </div>
            </div>
          </div>
        )}

        {/* Contradiction Warning */}
        {isContradiction && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-200 flex items-start gap-2.5 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs sm:text-sm">Contradiction Detected (0 Candidates)</div>
              <div className="text-[11px] sm:text-xs text-red-300 mt-1">
                The feedback you entered conflicts with one of your earlier clues. Check your game screen and click <strong>Undo</strong> on the mistaken step.
              </div>
              <button
                onClick={() => handleUndoStep(history.length - 1)}
                className="mt-2.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Undo Last Feedback Step
              </button>
            </div>
          </div>
        )}

        {/* Current Suggested Runes Row (Responsive for all screen sizes) */}
        <div className="flex flex-col items-center w-full">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-400/80 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <span>Slot Sequence</span>
            <span className="text-stone-500">|</span>
            <span className="text-stone-400 lowercase">tap slot to customize</span>
          </span>

          <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 md:gap-6 my-2 w-full max-w-full overflow-x-auto pb-1">
            {currentGuess.map((rune, idx) => {
              const isSelected = selectedSlotIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSlotIndex(idx)}
                  className={`flex flex-col items-center cursor-pointer p-1 sm:p-2 rounded-2xl transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-[9px] sm:text-[11px] font-mono font-bold text-stone-400 mb-0.5 sm:mb-1">
                    Slot {idx + 1}
                  </span>
                  <RuneTile
                    color={rune}
                    size="lg"
                    selected={isSelected}
                    clickable
                  />
                  <span className="text-[9px] sm:text-xs font-bold uppercase mt-1 sm:mt-2 text-stone-200 truncate max-w-[60px] text-center">
                    {RUNE_DEFINITIONS[rune].colorName}
                  </span>
                  {slotProbabilities[idx] && candidates.length > 1 && (
                    <span className="text-[9px] sm:text-[10px] text-amber-400 font-mono font-bold mt-0.5">
                      {slotProbabilities[idx].distribution[rune]}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 sm:mt-4">
            <button
              onClick={handleCopyGuess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy sequence to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Sequence'}</span>
            </button>

            {candidates.length > 1 && (
              <button
                onClick={handleApplyRecommended}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-align Optimal Suggestion</span>
              </button>
            )}
          </div>
        </div>

        {/* Slot Rune Picker Bar */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-stone-800/80">
          <div className="text-center text-[11px] sm:text-xs text-stone-400 mb-2 font-mono">
            Replace Slot #{selectedSlotIndex + 1} Rune:
          </div>
          <RuneSelector
            onSelect={handleSlotRuneChange}
            selectedRune={currentGuess[selectedSlotIndex]}
            compact
          />
        </div>

        {/* Feedback Input Module */}
        <div className="mt-6 sm:mt-8 p-3.5 sm:p-6 rounded-2xl bg-stone-950/80 border-2 border-stone-800 shadow-inner">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Step 2: Enter In-Game Feedback Clues
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Check the left panel in your game result and enter the exact Green & Yellow circle counts:
              </p>
            </div>
            <span className="text-[11px] sm:text-xs text-stone-500 font-mono hidden sm:inline">
              Max Sum: {slotCount}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Green (Exact Position & Color) */}
            <div className="p-3 sm:p-4 rounded-xl bg-green-950/30 border border-green-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 border border-green-300 flex items-center justify-center shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                    <span className="text-[10px] font-black text-black">✓</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-green-300">Green Circles</span>
                    <span className="text-[10px] text-stone-400 block">Correct Rune & Position</span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-green-400">
                  {feedbackGreen}
                </span>
              </div>

              {/* Number buttons 0 to slotCount */}
              <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                {Array.from({ length: slotCount + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeedbackGreen(i)}
                    className={`py-2 sm:py-2.5 rounded-lg font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      feedbackGreen === i
                        ? 'bg-green-600 text-stone-950 shadow-md shadow-green-900/50 scale-105'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Yellow (Correct Color, Wrong Position) */}
            <div className="p-3 sm:p-4 rounded-xl bg-yellow-950/30 border border-yellow-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                    <span className="text-[10px] font-black text-black">~</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-yellow-300">Yellow Circles</span>
                    <span className="text-[10px] text-stone-400 block">Correct Rune, Wrong Position</span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-yellow-400">
                  {feedbackYellow}
                </span>
              </div>

              {/* Number buttons 0 to slotCount */}
              <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                {Array.from({ length: slotCount + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeedbackYellow(i)}
                    className={`py-2 sm:py-2.5 rounded-lg font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      feedbackYellow === i
                        ? 'bg-yellow-500 text-stone-950 shadow-md shadow-yellow-900/50 scale-105'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 sm:mt-5">
            <button
              onClick={handleSubmitFeedback}
              disabled={isContradiction}
              className={`w-full py-3.5 sm:py-4 px-3 rounded-2xl font-bold font-serif text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                feedbackGreen === slotCount
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-stone-950 hover:brightness-110 shadow-green-900/40'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-stone-950 hover:brightness-110 shadow-amber-900/40'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-center">
                {feedbackGreen === slotCount
                  ? 'Kekkai Barrier Broken (Puzzle Complete)!'
                  : 'Submit Feedback & Calculate Next Move'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Candidates Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Candidates Metric */}
        <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs uppercase font-bold text-stone-400">
              Remaining Possibilities
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-0.5">
              {candidates.length.toLocaleString()}{' '}
              <span className="text-xs text-stone-500 font-normal">
                / {initialPoolSize.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCandidatesList(!showCandidatesList)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1 border border-stone-700 transition-colors cursor-pointer"
          >
            <span>Inspect</span>
            {showCandidatesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Elimination Progress */}
        <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-3.5 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-400 font-bold uppercase text-[11px] sm:text-xs">Search Space Eliminated</span>
            <span className="font-mono text-amber-400 font-bold">{eliminatedPercentage}%</span>
          </div>
          <div className="w-full bg-stone-950 rounded-full h-2.5 sm:h-3 overflow-hidden border border-stone-800">
            <div
              className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${eliminatedPercentage}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            {initialPoolSize - candidates.length} combinations ruled out by logic
          </span>
        </div>

        {/* Strategy Insight */}
        <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center gap-3 sm:col-span-2 md:col-span-1">
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">Optimal Deduction Tip</div>
            <p className="text-[10px] sm:text-[11px] text-stone-300 leading-tight mt-0.5">
              {candidates.length > 50
                ? 'High entropy guesses maximize information gain across all colors.'
                : candidates.length > 1
                ? 'Only a few candidates remain! The next guess is mathematically poised to crack it.'
                : 'Guaranteed solution reached! Input with full confidence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Probability Heatmap Breakdown per Slot */}
      {candidates.length > 0 && candidates.length < 500 && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5 flex-wrap">
              <span>Slot Probability Heatmap</span>
              <span className="text-stone-500 font-normal hidden sm:inline">
                (Likelihood of each color in each position)
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {slotProbabilities.map((prob) => (
              <div
                key={prob.slotIndex}
                className="p-2.5 sm:p-3 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col"
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-300 border-b border-stone-800 pb-1.5 mb-2">
                  <span>Slot #{prob.slotIndex + 1}</span>
                  <span
                    className="font-mono text-[10px] sm:text-[11px]"
                    style={{ color: RUNE_DEFINITIONS[prob.mostLikely.color].accentColor }}
                  >
                    {prob.mostLikely.percentage}% {prob.mostLikely.color}
                  </span>
                </div>

                <div className="space-y-1">
                  {ALL_RUNES.map((rune) => {
                    const pct = prob.distribution[rune];
                    if (pct === 0) return null;
                    return (
                      <div key={rune} className="flex items-center gap-1 text-[10px]">
                        <span className="w-11 sm:w-12 text-stone-400 font-mono truncate">
                          {RUNE_DEFINITIONS[rune].colorName}
                        </span>
                        <div className="flex-1 bg-stone-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: RUNE_DEFINITIONS[rune].borderColor,
                            }}
                          ></div>
                        </div>
                        <span className="w-6 sm:w-7 text-right font-mono text-stone-300">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Candidates Expandable Drawer */}
      {showCandidatesList && (
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-3.5 sm:p-5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-300">
              Surviving Combinations ({candidates.length})
            </h4>
            <span className="text-[10px] sm:text-xs text-stone-400">
              Click code to set as next guess
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pr-1">
            {candidates.slice(0, 120).map((code, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentGuess(code)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Use this combination"
              >
                {code.map((r, rIdx) => (
                  <RuneTile key={rIdx} color={r} size="xs" />
                ))}
              </button>
            ))}
          </div>
          {candidates.length > 120 && (
            <p className="text-center text-xs text-stone-500 mt-2 font-mono">
              Showing first 120 of {candidates.length} candidates
            </p>
          )}
        </div>
      )}

      {/* History Log Table */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-3.5 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-stone-800 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-stone-100">Attempt History</h3>
            <span className="text-[11px] sm:text-xs text-stone-400 font-mono">
              ({history.length} steps)
            </span>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => handleUndoStep(history.length - 1)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-stone-500 text-xs">
            No attempts made yet. Input the suggested runes into your Ninja game and click <strong>Submit Feedback</strong>!
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {history.map((step, idx) => (
              <div
                key={step.id}
                className="p-2.5 sm:p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 hover:border-stone-700 transition-colors"
              >
                {/* Step number & Runes */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-amber-400 shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {step.guess.map((r, rIdx) => (
                      <RuneTile key={rIdx} color={r} size="xs" />
                    ))}
                  </div>
                </div>

                {/* Feedback Badges */}
                <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-green-950/60 border border-green-800 text-green-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {step.feedback.green} Green
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-yellow-950/60 border border-yellow-800 text-yellow-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      {step.feedback.yellow} Yellow
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-[11px] text-stone-500 font-mono hidden md:inline">
                    {step.remainingCandidates} left
                  </span>

                  <button
                    onClick={() => handleUndoStep(idx)}
                    className="p-1 rounded text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Undo this step"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
