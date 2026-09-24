import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  RuneColor,
  Feedback,
  ALL_RUNES,
  RUNE_DEFINITIONS,
  SLOT_SEQUENCES,
  getSlotSequenceStage,
} from '../types/kekkai';
import { scanRunesFromImage, scanRunesWithGemini, OcrResult } from '../utils/runeVision';
import { generateSampleScreenshot } from '../utils/sampleScreenshots';
import { RuneTile } from './RuneTile';
import { SlotSequenceBar } from './SlotSequenceBar';
import { sounds } from '../utils/audio';
import {
  Upload,
  Camera,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Cpu,
  Bot,
  Image as ImageIcon,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface OcrViewProps {
  slotCount: number;
  onChangeSlotCount?: (slots: number) => void;
  onApplyToSolver: (runes: RuneColor[], feedback?: Feedback) => void;
  onApplyToTraining: (runes: RuneColor[]) => void;
}

export const OcrView: React.FC<OcrViewProps> = ({
  slotCount,
  onChangeSlotCount,
  onApplyToSolver,
  onApplyToTraining,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrEngine, setOcrEngine] = useState<'client_cv' | 'gemini_ai'>('client_cv');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  // Initialize with Sample 1 by default so the user sees immediate value
  useEffect(() => {
    loadSampleScreenshot(1);
  }, [slotCount]);

  // Load sample synthetic screenshots
  const loadSampleScreenshot = (sampleId: number) => {
    sounds.playClick();
    setErrorMsg(null);
    let sampleRunes: RuneColor[] = [];
    let sampleFeedback: Feedback = { green: 1, yellow: 2 };
    let title = 'Jounin Exam Kekkai';

    if (slotCount === 2) {
      if (sampleId === 1) {
        sampleRunes = ['green', 'red'];
        sampleFeedback = { green: 1, yellow: 0 };
        title = 'Genin 2-Slot Seal';
      } else if (sampleId === 2) {
        sampleRunes = ['blue', 'yellow'];
        sampleFeedback = { green: 0, yellow: 2 };
        title = 'Genin Trial Sample';
      } else {
        sampleRunes = ['white', 'black'];
        sampleFeedback = { green: 2, yellow: 0 };
        title = '2-Rune Quick Probe';
      }
    } else if (slotCount === 3) {
      if (sampleId === 1) {
        sampleRunes = ['green', 'red', 'blue'];
        sampleFeedback = { green: 1, yellow: 1 };
        title = 'Chunin 3-Rune Exam';
      } else if (sampleId === 2) {
        sampleRunes = ['red', 'white', 'black'];
        sampleFeedback = { green: 2, yellow: 0 };
        title = 'Chunin Barrier Clue';
      } else {
        sampleRunes = ['blue', 'black', 'yellow'];
        sampleFeedback = { green: 0, yellow: 3 };
        title = 'Chunin Trial Pattern';
      }
    } else if (slotCount === 4) {
      if (sampleId === 1) {
        sampleRunes = ['green', 'red', 'blue', 'black'];
        sampleFeedback = { green: 1, yellow: 2 };
        title = 'Special Jounin 4-Slot';
      } else if (sampleId === 2) {
        sampleRunes = ['yellow', 'white', 'green', 'red'];
        sampleFeedback = { green: 2, yellow: 1 };
        title = '4-Rune Advanced Cipher';
      } else {
        sampleRunes = ['black', 'blue', 'white', 'green'];
        sampleFeedback = { green: 0, yellow: 3 };
        title = 'Tokubetsu Seal Attempt';
      }
    } else {
      if (sampleId === 1) {
        sampleRunes = ['green', 'red', 'blue', 'black', 'yellow'];
        sampleFeedback = { green: 1, yellow: 1 };
        title = `${slotCount}-Rune Barrier Exam`;
      } else if (sampleId === 2) {
        sampleRunes = ['yellow', 'white', 'green', 'red', 'blue'];
        sampleFeedback = { green: 2, yellow: 0 };
        title = 'Mid-Game Attempt #4';
      } else {
        sampleRunes = ['black', 'blue', 'white', 'green', 'red'];
        sampleFeedback = { green: 0, yellow: 3 };
        title = 'Ninja Grand Seal';
      }
    }

    const dataUrl = generateSampleScreenshot(sampleRunes, sampleFeedback, title);
    setImageSrc(dataUrl);
    setOcrResult(null);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    sounds.playClick();
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setOcrResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            readFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Run OCR analysis
  const handleRunOcr = async () => {
    if (!imageSrc) return;

    sounds.playJutsuSubmit();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (ocrEngine === 'gemini_ai') {
        const result = await scanRunesWithGemini(imageSrc, slotCount);
        setOcrResult(result);
        sounds.playVictory();
      } else {
        // Client-side computer vision
        const img = imageElementRef.current;
        if (!img) throw new Error('Image element not loaded');

        // Allow image to render fully
        const result = await scanRunesFromImage(img, slotCount);
        setOcrResult(result);
        sounds.playVictory();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze screenshot');
      sounds.playFail();

      // If Gemini failed, suggest falling back to Client CV
      if (ocrEngine === 'gemini_ai') {
        setOcrEngine('client_cv');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger auto-scan when image changes
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        handleRunOcr();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, ocrEngine, slotCount]);

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
    <div className="space-y-6">
      {/* Slot Sequence Stepper Bar (Slot 2 -> Slot 3 -> Slot 4 -> Slot 5) */}
      <SlotSequenceBar
        currentSlotCount={slotCount}
        onSelectSlotCount={(slots) => onChangeSlotCount?.(slots)}
        onNextStage={
          nextSlotInSequence ? () => onChangeSlotCount?.(nextSlotInSequence) : undefined
        }
      />

      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-cyan-900/50 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Computer Vision & AI
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Target: <strong className="text-cyan-300">{currentStageInfo.name}</strong> ({slotCount} Rune Slots)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-cyan-200 mt-1">
            Kekkai Screenshot Tile OCR
          </h2>
          <p className="text-xs text-stone-300">
            Upload or paste (Ctrl+V) a Ninja game screenshot to automatically identify tile types and feedback clues.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => {
              sounds.playClick();
              setOcrEngine('client_cv');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              ocrEngine === 'client_cv'
                ? 'bg-cyan-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Fast Client CV</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setOcrEngine('gemini_ai');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              ocrEngine === 'gemini_ai'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Gemini AI Vision</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload / Screenshot Area & Results */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview & Sample Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sample Selectors */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Try Preloaded Game Screenshots:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadSampleScreenshot(1)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Sample #1 (Exam)
              </button>
              <button
                onClick={() => loadSampleScreenshot(2)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Sample #2 (Clues)
              </button>
              <button
                onClick={() => loadSampleScreenshot(3)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Sample #3 (Trial)
              </button>
            </div>
          </div>

          {/* Screenshot Display Box with Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) readFile(file);
            }}
            className="relative bg-stone-950/90 border-2 border-dashed border-stone-800 rounded-3xl p-4 min-h-[340px] flex flex-col items-center justify-center overflow-hidden shadow-2xl group"
          >
            {imageSrc ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Game Screenshot Preview"
                  className="max-h-[380px] w-auto rounded-xl object-contain shadow-2xl border border-stone-800"
                />

                {/* Scan Overlay Scanning Bar when processing */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-cyan-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl">
                    <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
                    <span className="text-sm font-bold text-cyan-200">
                      Scanning {ocrEngine === 'gemini_ai' ? 'with Gemini AI Vision...' : 'with Computer Vision Color Matcher...'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <Camera className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-300">
                  Drop screenshot here or paste (Ctrl+V)
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Supports PNG, JPG, WebP game captures
                </p>
              </div>
            )}

            {/* Bottom Floating Bar */}
            <div className="mt-4 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-stone-700 transition-colors shadow-md"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Custom Image</span>
              </button>

              <button
                onClick={handleRunOcr}
                disabled={isProcessing || !imageSrc}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-cyan-950"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: OCR Extraction Results & Application (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900/90 border border-cyan-900/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-stone-100">OCR Recognition Output</h3>
              </div>
              {ocrResult && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {Math.round(ocrResult.confidence * 100)}% match
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {ocrResult ? (
              <div className="space-y-6">
                {/* Detected Rune Sequence */}
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-stone-400 block mb-2">
                    Identified Tile Sequence:
                  </span>
                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                    {ocrResult.runes.map((rune, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-stone-500 mb-1">
                          #{idx + 1}
                        </span>
                        <RuneTile color={rune} size="md" />
                        <span className="text-[10px] font-bold uppercase mt-1 text-stone-300">
                          {RUNE_DEFINITIONS[rune].colorName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Indicators if detected */}
                {ocrResult.feedback && (
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-stone-400 block mb-2">
                      Detected In-Game Feedback:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-green-950/40 border border-green-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs text-green-300 font-bold">Green Clues</span>
                        </div>
                        <span className="text-xl font-black font-mono text-green-400">
                          {ocrResult.feedback.green}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <span className="text-xs text-yellow-300 font-bold">Yellow Clues</span>
                        </div>
                        <span className="text-xl font-black font-mono text-yellow-400">
                          {ocrResult.feedback.yellow}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI / CV Notes */}
                {ocrResult.rawAiNotes && (
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300">
                    <span className="text-[11px] text-stone-400 font-bold block mb-1">
                      AI Observation:
                    </span>
                    {ocrResult.rawAiNotes}
                  </div>
                )}

                {/* Individual Slot Metrics */}
                {ocrResult.details && (
                  <div className="space-y-1.5 border-t border-stone-800 pt-3">
                    <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">
                      Per-Tile Spectral Analysis:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ocrResult.details.map((d) => (
                        <div
                          key={d.slot}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[10px] flex items-center justify-between"
                        >
                          <span className="text-stone-400 font-mono">Slot {d.slot}:</span>
                          <span
                            className="font-bold"
                            style={{ color: RUNE_DEFINITIONS[d.color].accentColor }}
                          >
                            {RUNE_DEFINITIONS[d.color].colorName} ({Math.round(d.confidence * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons to connect with Solver or Training */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => {
                      sounds.playJutsuSubmit();
                      onApplyToSolver(ocrResult.runes, ocrResult.feedback);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-stone-950 font-black font-serif text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
                  >
                    <span>Push to Solver as Guess</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onApplyToTraining(ocrResult.runes);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-colors"
                  >
                    <span>Test Sequence in Training Dojo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500 text-xs">
                {isProcessing ? 'Analyzing visual elements...' : 'Load or upload an image to view OCR analysis'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
