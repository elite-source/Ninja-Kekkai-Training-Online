import { RuneColor, Feedback, ALL_RUNES } from '../types/kekkai';

export interface OcrResult {
  runes: RuneColor[];
  confidence: number;
  method: 'client_cv' | 'gemini_ai';
  feedback?: Feedback;
  details?: {
    slot: number;
    color: RuneColor;
    confidence: number;
    hue?: number;
    sat?: number;
    light?: number;
  }[];
  rawAiNotes?: string;
}

/**
 * Convert RGB to HSL color space
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

/**
 * Identify a single tile's rune color based on canvas image data
 */
export function identifyTileFromImageData(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): { color: RuneColor; confidence: number; hue: number; sat: number; light: number } {
  const imgData = ctx.getImageData(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
  const data = imgData.data;

  // We sample pixels around the outer ring (radius 0.7 to 0.9) to detect the colored border ring,
  // and inner pixels to verify lightness/saturation.
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(centerX, centerY);

  let ringR = 0, ringG = 0, ringB = 0, ringCount = 0;
  let centerR = 0, centerG = 0, centerB = 0, centerCount = 0;

  for (let py = 0; py < height; py += 2) {
    for (let px = 0; px < width; px += 2) {
      const idx = (py * width + px) * 4;
      const alpha = data[idx + 3];
      if (alpha < 100) continue;

      const dx = px - centerX;
      const dy = py - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxRadius;

      // Outer ring sample (colored element ring)
      if (normalizedDist >= 0.55 && normalizedDist <= 0.92) {
        ringR += data[idx];
        ringG += data[idx + 1];
        ringB += data[idx + 2];
        ringCount++;
      } else if (normalizedDist < 0.45) {
        // Inner core
        centerR += data[idx];
        centerG += data[idx + 1];
        centerB += data[idx + 2];
        centerCount++;
      }
    }
  }

  if (ringCount === 0) ringCount = 1;
  if (centerCount === 0) centerCount = 1;

  const avgRingR = ringR / ringCount;
  const avgRingG = ringG / ringCount;
  const avgRingB = ringB / ringCount;

  const avgCenterR = centerR / centerCount;
  const avgCenterG = centerG / centerCount;
  const avgCenterB = centerB / centerCount;

  const [ringH, ringS, ringL] = rgbToHsl(avgRingR, avgRingG, avgRingB);
  const [, centerS, centerL] = rgbToHsl(avgCenterR, avgCenterG, avgCenterB);

  // Scoring against the 6 canonical Ninja Kekkai colors
  const scores: Record<RuneColor, number> = {
    black: 0,
    white: 0,
    green: 0,
    red: 0,
    blue: 0,
    yellow: 0,
  };

  // 1. Black rune: Very dark ring (low L) and dark center
  if (ringL < 0.32 && centerL < 0.35) {
    scores.black += 3.5;
  } else if (ringL < 0.40) {
    scores.black += 1.5;
  }

  // 2. White rune: Very high lightness on ring and center, low saturation
  if (ringL > 0.65 && ringS < 0.30 && centerL > 0.65) {
    scores.white += 3.5;
  } else if (ringL > 0.60 && ringS < 0.35) {
    scores.white += 1.8;
  }

  // 3. Green: Hue between 75° and 165°
  if (ringH >= 75 && ringH <= 165 && ringS > 0.25) {
    scores.green += 4.0;
  }

  // 4. Red: Hue between 340°-360° or 0°-25°
  if ((ringH >= 340 || ringH <= 25) && ringS > 0.3) {
    scores.red += 4.0;
  }

  // 5. Blue: Hue between 180° and 260°
  if (ringH >= 180 && ringH <= 260 && ringS > 0.25) {
    scores.blue += 4.0;
  }

  // 6. Yellow: Hue between 28° and 75°
  if (ringH >= 28 && ringH <= 75 && ringS > 0.35 && ringL > 0.35) {
    scores.yellow += 4.0;
  }

  // Find best match
  let bestRune: RuneColor = 'green';
  let bestScore = -1;

  for (const rune of ALL_RUNES) {
    if (scores[rune] > bestScore) {
      bestScore = scores[rune];
      bestRune = rune;
    }
  }

  // Fallback heuristic if low confidence
  if (bestScore <= 0) {
    if (ringL < 0.3) bestRune = 'black';
    else if (ringL > 0.7 && ringS < 0.3) bestRune = 'white';
    else if (ringH >= 80 && ringH <= 170) bestRune = 'green';
    else if (ringH >= 180 && ringH <= 270) bestRune = 'blue';
    else if (ringH >= 30 && ringH <= 80) bestRune = 'yellow';
    else bestRune = 'red';
  }

  const confidence = Math.min(0.99, Math.max(0.65, bestScore > 2 ? 0.95 : 0.75));

  return {
    color: bestRune,
    confidence,
    hue: Math.round(ringH),
    sat: Math.round(ringS * 100),
    light: Math.round(ringL * 100),
  };
}

/**
 * Scan an entire image or cropped box and extract the N runes
 */
export async function scanRunesFromImage(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  slotCount: number = 5,
  roi?: { x: number; y: number; width: number; height: number }
): Promise<OcrResult> {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width || (imageElement as any).naturalWidth || 600;
  canvas.height = imageElement.height || (imageElement as any).naturalHeight || 400;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not initialize canvas context');
  }

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  // Region to scan: either user-defined ROI or default middle 70% width, vertical center
  const box = roi || {
    x: canvas.width * 0.1,
    y: canvas.height * 0.3,
    width: canvas.width * 0.8,
    height: canvas.height * 0.4,
  };

  const slotWidth = box.width / slotCount;
  const runes: RuneColor[] = [];
  const details = [];
  let totalConfidence = 0;

  for (let i = 0; i < slotCount; i++) {
    const slotX = box.x + i * slotWidth;
    const slotY = box.y;
    const slotH = box.height;

    // Inset slightly to avoid border noise
    const padding = slotWidth * 0.1;
    const tileResult = identifyTileFromImageData(
      ctx,
      slotX + padding,
      slotY + padding,
      slotWidth - padding * 2,
      slotH - padding * 2
    );

    runes.push(tileResult.color);
    totalConfidence += tileResult.confidence;
    details.push({
      slot: i + 1,
      color: tileResult.color,
      confidence: tileResult.confidence,
      hue: tileResult.hue,
      sat: tileResult.sat,
      light: tileResult.light,
    });
  }

  return {
    runes,
    confidence: Math.round((totalConfidence / slotCount) * 100) / 100,
    method: 'client_cv',
    details,
  };
}

/**
 * Call Gemini AI Server OCR for full-screen analysis
 */
export async function scanRunesWithGemini(
  imageDataBase64: string,
  slotCount: number = 5
): Promise<OcrResult> {
  const res = await fetch('/api/ocr-kekkai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: imageDataBase64 }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Server responded with ${res.status}`);
  }

  const data = await res.json();
  const detectedRunes: RuneColor[] = (data.detectedRunes || [])
    .filter((r: any): r is RuneColor => ALL_RUNES.includes(r))
    .slice(0, slotCount);

  // If AI detected fewer runes, pad or fallback
  while (detectedRunes.length < slotCount) {
    detectedRunes.push('green');
  }

  return {
    runes: detectedRunes,
    confidence: data.confidence || 0.95,
    method: 'gemini_ai',
    feedback: data.feedback,
    rawAiNotes: data.notes,
  };
}
