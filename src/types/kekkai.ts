export type RuneColor = 'green' | 'red' | 'blue' | 'black' | 'yellow' | 'white';

export interface RuneInfo {
  id: RuneColor;
  name: string;
  japanese: string;
  element: string;
  symbol: string;
  colorName: string;
  borderColor: string;
  accentColor: string;
  bgInner: string;
  emblemColor: string;
  shortcut: string;
  lore: string;
}

export const RUNE_DEFINITIONS: Record<RuneColor, RuneInfo> = {
  green: {
    id: 'green',
    name: 'Wind Rune',
    japanese: 'Fu',
    element: 'Wind / Swiftness',
    symbol: 'Mitsudomoe Vortex',
    colorName: 'Green',
    borderColor: '#05c405',
    accentColor: '#22c55e',
    bgInner: '#d4fcd7',
    emblemColor: '#052b08',
    shortcut: '1',
    lore: 'Controls turbulent currents and whirlwind currents. Embodied by the 3-bladed sacred tomoe.',
  },
  red: {
    id: 'red',
    name: 'Shell / Water Rune',
    japanese: 'Sui',
    element: 'Water / Flow',
    symbol: 'Magatama Spiral',
    colorName: 'Red',
    borderColor: '#e11d24',
    accentColor: '#ef4444',
    bgInner: '#ffe4e6',
    emblemColor: '#450a0a',
    shortcut: '2',
    lore: 'Harmonizes tidal pressure and fluid chakra. Embodied by the sacred spiral whirlpool.',
  },
  blue: {
    id: 'blue',
    name: 'Mountain / Earth Rune',
    japanese: 'Do',
    element: 'Earth / Bastion',
    symbol: 'Twin Peaks',
    colorName: 'Blue',
    borderColor: '#0047e6',
    accentColor: '#3b82f6',
    bgInner: '#cff0ff',
    emblemColor: '#080d2d',
    shortcut: '3',
    lore: 'Stands firm against seismic tremors and stone barriers. Embodied by the towering twin summits.',
  },
  black: {
    id: 'black',
    name: 'Lightning Rune',
    japanese: 'Rai',
    element: 'Lightning / Pierce',
    symbol: 'Thunder Bolt',
    colorName: 'Black',
    borderColor: '#1e293b',
    accentColor: '#94a3b8',
    bgInner: '#0c0e12',
    emblemColor: '#f1f5f9',
    shortcut: '4',
    lore: 'Channels instantaneous electrical voltage. Embodied by the jagged silver raikiri bolt.',
  },
  yellow: {
    id: 'yellow',
    name: 'Fire Rune',
    japanese: 'Ka',
    element: 'Fire / Blaze',
    symbol: 'Scorching Flame',
    colorName: 'Yellow',
    borderColor: '#eab308',
    accentColor: '#f59e0b',
    bgInner: '#fef9c3',
    emblemColor: '#451a03',
    shortcut: '5',
    lore: 'Kindles intense thermal combustion and ash. Embodied by the dancing sacred fire tongue.',
  },
  white: {
    id: 'white',
    name: 'Sound / Spirit Rune',
    japanese: 'Oto',
    element: 'Sound / Resonance',
    symbol: 'Resonant Glyph',
    colorName: 'White',
    borderColor: '#e2e8f0',
    accentColor: '#cbd5e1',
    bgInner: '#ffffff',
    emblemColor: '#090d16',
    shortcut: '6',
    lore: 'Transmits unseen ultrasonic frequencies and mental clarity. Embodied by the harmonic wave rest.',
  },
};

export const ALL_RUNES: RuneColor[] = ['green', 'red', 'blue', 'black', 'yellow', 'white'];

export interface Feedback {
  green: number; // Correct rune & Correct position (Bulls / Exact)
  yellow: number; // Correct rune & Wrong position (Cows / Blow)
}

export interface SolverStep {
  id: string;
  guess: RuneColor[];
  feedback: Feedback;
  remainingCandidates: number;
  timestamp: number;
  isGuaranteed?: boolean;
}

export interface GameAttempt {
  guess: RuneColor[];
  feedback: Feedback;
}

export type SolverStrategy = 'entropy' | 'ninja_probe';

export interface SlotSequenceStage {
  slots: number;
  id: string;
  name: string;
  shortName: string;
  rank: string;
  japaneseTitle: string;
  description: string;
  combosWithDupes: number;
  combosWithoutDupes: number;
  allowedAttempts: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
}

export const SLOT_SEQUENCES: SlotSequenceStage[] = [
  {
    slots: 2,
    id: 'slot-2',
    name: 'Slot 2',
    shortName: '2 Slots',
    rank: 'Genin Trial',
    japaneseTitle: 'Trial I',
    description: '2 Rune Slots • 36 Combinations • Quick Reflex Warmup',
    combosWithDupes: 36,
    combosWithoutDupes: 30,
    allowedAttempts: 6,
    difficulty: 'Beginner',
  },
  {
    slots: 3,
    id: 'slot-3',
    name: 'Slot 3',
    shortName: '3 Slots',
    rank: 'Chunin Exam',
    japaneseTitle: 'Trial II',
    description: '3 Rune Slots • 216 Combinations • Academy Trial',
    combosWithDupes: 216,
    combosWithoutDupes: 120,
    allowedAttempts: 8,
    difficulty: 'Intermediate',
  },
  {
    slots: 4,
    id: 'slot-4',
    name: 'Slot 4',
    shortName: '4 Slots',
    rank: 'Special Jounin',
    japaneseTitle: 'Trial III',
    description: '4 Rune Slots • 1,296 Combinations • Advanced Barrier',
    combosWithDupes: 1296,
    combosWithoutDupes: 360,
    allowedAttempts: 8,
    difficulty: 'Advanced',
  },
  {
    slots: 5,
    id: 'slot-5',
    name: 'Slot 5',
    shortName: '5 Slots',
    rank: 'Jounin Exam',
    japaneseTitle: 'Grand Seal',
    description: '5 Rune Slots • 7,776 Combinations • Ninja Grand Seal',
    combosWithDupes: 7776,
    combosWithoutDupes: 720,
    allowedAttempts: 8,
    difficulty: 'Master',
  },
];

export function getSlotSequenceStage(slots: number): SlotSequenceStage {
  const found = SLOT_SEQUENCES.find((s) => s.slots === slots);
  return found || SLOT_SEQUENCES[SLOT_SEQUENCES.length - 1];
}
