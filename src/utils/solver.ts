import { RuneColor, ALL_RUNES, Feedback, SolverStep, SolverStrategy } from '../types/kekkai';

/**
 * Generate all possible permutations of rune codes
 */
export function generateAllCombinations(slots: number, allowDuplicates: boolean = true): RuneColor[][] {
  const result: RuneColor[][] = [];

  function helper(current: RuneColor[]) {
    if (current.length === slots) {
      result.push([...current]);
      return;
    }

    for (const rune of ALL_RUNES) {
      if (!allowDuplicates && current.includes(rune)) {
        continue;
      }
      current.push(rune);
      helper(current);
      current.pop();
    }
  }

  helper([]);
  return result;
}

/**
 * Calculate the exact Mastermind / Kekkai feedback
 * green = correct color in correct position
 * yellow = correct color in wrong position
 */
export function calculateFeedback(guess: RuneColor[], secret: RuneColor[]): Feedback {
  let green = 0;
  let yellow = 0;

  const unmatchedGuessCounts: Partial<Record<RuneColor, number>> = {};
  const unmatchedSecretCounts: Partial<Record<RuneColor, number>> = {};

  for (let i = 0; i < guess.length; i++) {
    const g = guess[i];
    const s = secret[i];
    if (g === s) {
      green++;
    } else {
      unmatchedGuessCounts[g] = (unmatchedGuessCounts[g] || 0) + 1;
      unmatchedSecretCounts[s] = (unmatchedSecretCounts[s] || 0) + 1;
    }
  }

  for (const rune of ALL_RUNES) {
    const gCount = unmatchedGuessCounts[rune] || 0;
    const sCount = unmatchedSecretCounts[rune] || 0;
    yellow += Math.min(gCount, sCount);
  }

  return { green, yellow };
}

/**
 * Filter candidates that match the given feedback for the guess
 */
export function filterCandidates(
  candidates: RuneColor[][],
  guess: RuneColor[],
  feedback: Feedback
): RuneColor[][] {
  return candidates.filter((candidate) => {
    const fb = calculateFeedback(guess, candidate);
    return fb.green === feedback.green && fb.yellow === feedback.yellow;
  });
}

/**
 * Encode feedback as a single integer key for fast grouping
 */
function feedbackKey(fb: Feedback): number {
  return fb.green * 100 + fb.yellow;
}

/**
 * Calculate Information Entropy (Shannon Entropy) of a guess across candidate set
 */
function calculateEntropy(guess: RuneColor[], candidates: RuneColor[][]): number {
  const scoreCounts: Record<number, number> = {};
  const total = candidates.length;

  for (let i = 0; i < total; i++) {
    const fb = calculateFeedback(guess, candidates[i]);
    const key = feedbackKey(fb);
    scoreCounts[key] = (scoreCounts[key] || 0) + 1;
  }

  let entropy = 0;
  for (const key in scoreCounts) {
    const count = scoreCounts[key];
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Find the optimal next guess using Information Theory (Max Entropy) or Ninja Probing
 */
export function getRecommendedGuess(
  candidates: RuneColor[][],
  allCodes: RuneColor[][],
  history: SolverStep[],
  slots: number,
  strategy: SolverStrategy = 'entropy',
  allowDuplicates: boolean = true
): { guess: RuneColor[]; isCandidate: boolean; expectedEntropy: number } {
  // If only 1 candidate remains, it is the guaranteed answer
  if (candidates.length === 1) {
    return { guess: candidates[0], isCandidate: true, expectedEntropy: 0 };
  }

  // If no candidates remain, return fallback
  if (candidates.length === 0) {
    return {
      guess: Array(slots).fill(ALL_RUNES[0]),
      isCandidate: false,
      expectedEntropy: 0,
    };
  }

  // Turn 1 optimizations:
  if (history.length === 0) {
    if (strategy === 'ninja_probe' || allowDuplicates) {
      // In classic Ninja, probing with all green runes is the signature opening
      return {
        guess: Array(slots).fill('green'),
        isCandidate: true,
        expectedEntropy: 1.5,
      };
    }

    // High-entropy initial guess based on slot count (when duplicates are disabled)
    if (slots === 2) {
      return {
        guess: ['green', 'red'],
        isCandidate: true,
        expectedEntropy: 1.8,
      };
    } else if (slots === 3) {
      return {
        guess: ['green', 'red', 'blue'],
        isCandidate: true,
        expectedEntropy: 2.1,
      };
    } else if (slots === 4) {
      return {
        guess: ['green', 'red', 'blue', 'black'],
        isCandidate: true,
        expectedEntropy: 2.7,
      };
    } else if (slots === 5) {
      return {
        guess: ['green', 'red', 'blue', 'black', 'yellow'],
        isCandidate: true,
        expectedEntropy: 3.2,
      };
    }
  }

  // If candidate count is small (<= 2), pick first candidate directly
  if (candidates.length <= 2) {
    return { guess: candidates[0], isCandidate: true, expectedEntropy: 1.0 };
  }

  // Candidate pool to evaluate for entropy:
  // If candidates size is reasonably small, evaluate all candidates.
  // If large, sample candidates + top distinct patterns to keep computation under 20ms
  const searchPool =
    candidates.length <= 350
      ? candidates
      : [
          ...candidates.slice(0, 150),
          // Sample additional varied codes from allCodes
          ...allCodes.filter((_, idx) => idx % Math.floor(allCodes.length / 50) === 0),
        ];

  let bestGuess = candidates[0];
  let maxEntropy = -1;
  let bestIsCandidate = true;

  const candidateSet = new Set(candidates.map((c) => c.join('-')));

  for (const candidate of searchPool) {
    const entropy = calculateEntropy(candidate, candidates);
    const isCand = candidateSet.has(candidate.join('-'));

    // Preference bonus if guess is also an actual remaining candidate
    const effectiveScore = entropy + (isCand ? 0.001 : 0);

    if (effectiveScore > maxEntropy) {
      maxEntropy = effectiveScore;
      bestGuess = candidate;
      bestIsCandidate = isCand;
    }
  }

  return {
    guess: bestGuess,
    isCandidate: bestIsCandidate,
    expectedEntropy: Math.round(maxEntropy * 100) / 100,
  };
}

/**
 * Probability heatmap analysis across all candidate solutions
 */
export interface SlotProbability {
  slotIndex: number;
  distribution: Record<RuneColor, number>; // percentages 0-100
  mostLikely: { color: RuneColor; percentage: number };
}

export function analyzeProbabilities(
  candidates: RuneColor[][],
  slots: number
): SlotProbability[] {
  if (candidates.length === 0) {
    return Array.from({ length: slots }, (_, i) => ({
      slotIndex: i,
      distribution: {
        green: 0,
        red: 0,
        blue: 0,
        black: 0,
        yellow: 0,
        white: 0,
      },
      mostLikely: { color: 'green', percentage: 0 },
    }));
  }

  const total = candidates.length;
  const result: SlotProbability[] = [];

  for (let slot = 0; slot < slots; slot++) {
    const counts: Record<RuneColor, number> = {
      green: 0,
      red: 0,
      blue: 0,
      black: 0,
      yellow: 0,
      white: 0,
    };

    for (const code of candidates) {
      counts[code[slot]]++;
    }

    const distribution: Record<RuneColor, number> = {
      green: Math.round((counts.green / total) * 100),
      red: Math.round((counts.red / total) * 100),
      blue: Math.round((counts.blue / total) * 100),
      black: Math.round((counts.black / total) * 100),
      yellow: Math.round((counts.yellow / total) * 100),
      white: Math.round((counts.white / total) * 100),
    };

    let topColor: RuneColor = 'green';
    let topVal = -1;

    for (const rune of ALL_RUNES) {
      if (distribution[rune] > topVal) {
        topVal = distribution[rune];
        topColor = rune;
      }
    }

    result.push({
      slotIndex: slot,
      distribution,
      mostLikely: { color: topColor, percentage: topVal },
    });
  }

  return result;
}
