import { RuneColor, RUNE_DEFINITIONS } from '../types/kekkai';

/**
 * Generate a synthetic Ninja Kekkai game screenshot onto a canvas and return data URL
 */
export function generateSampleScreenshot(
  runes: RuneColor[],
  feedback?: { green: number; yellow: number },
  title: string = 'Kekkai Training (Chunin/Jounin Exam)'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Authentic Ninja Dojo wooden floor & scroll wallpaper
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#1c1511');
  bgGrad.addColorStop(0.5, '#2e1f16');
  bgGrad.addColorStop(1, '#18100b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wood planks pattern
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  for (let y = 60; y < canvas.height; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Top header banner
  ctx.fillStyle = 'rgba(15, 10, 8, 0.85)';
  ctx.fillRect(0, 0, canvas.width, 50);
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, canvas.width, 50);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 18px "Cinzel", serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`NINJA SAGE — ${title.toUpperCase()}`, canvas.width / 2, 32);

  // Inner Game Board Panel / Tatami Scroll Frame
  const panelX = 40;
  const panelY = 80;
  const panelW = canvas.width - 80;
  const panelH = 280;

  // Frame shadow & fill
  ctx.fillStyle = '#261910';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Decorative corner brackets
  const cornerSize = 16;
  ctx.fillStyle = '#f59e0b';
  // Top-left
  ctx.fillRect(panelX, panelY, cornerSize, 4);
  ctx.fillRect(panelX, panelY, 4, cornerSize);
  // Top-right
  ctx.fillRect(panelX + panelW - cornerSize, panelY, cornerSize, 4);
  ctx.fillRect(panelX + panelW - 4, panelY, 4, cornerSize);
  // Bottom-left
  ctx.fillRect(panelX, panelY + panelH - 4, cornerSize, 4);
  ctx.fillRect(panelX, panelY + panelH - cornerSize, 4, cornerSize);
  // Bottom-right
  ctx.fillRect(panelX + panelW - cornerSize, panelY + panelH - 4, cornerSize, 4);
  ctx.fillRect(panelX + panelW - 4, panelY + panelH - cornerSize, 4, cornerSize);

  // Subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Attempt #3 / 8 — Match the Kekkai Barrier Runes', panelX + 24, panelY + 36);

  // Slots area
  const slotsY = panelY + 110;
  const slotCount = runes.length;
  const totalSlotsWidth = panelW - 200;
  const spacing = totalSlotsWidth / slotCount;
  const startX = panelX + 30 + spacing / 2;
  const runeRadius = 38;

  runes.forEach((rune, index) => {
    const rx = startX + index * spacing;
    const ry = slotsY;
    const info = RUNE_DEFINITIONS[rune];

    // Slot socket ring
    ctx.beginPath();
    ctx.arc(rx, ry, runeRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#120b06';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wood base of rune
    ctx.beginPath();
    ctx.arc(rx, ry, runeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#3f1f08';
    ctx.fill();

    // Colored outer ring
    ctx.beginPath();
    ctx.arc(rx, ry, runeRadius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = info.borderColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Inner disc
    ctx.beginPath();
    ctx.arc(rx, ry, runeRadius - 9, 0, Math.PI * 2);
    ctx.fillStyle = info.bgInner;
    ctx.fill();

    // Simple emblem representation on canvas for OCR template
    ctx.fillStyle = info.emblemColor;
    if (rune === 'black') {
      // Lightning
      ctx.beginPath();
      ctx.moveTo(rx, ry - 18);
      ctx.lineTo(rx - 8, ry);
      ctx.lineTo(rx + 2, ry);
      ctx.lineTo(rx - 4, ry + 18);
      ctx.lineTo(rx + 10, ry - 2);
      ctx.lineTo(rx, ry - 2);
      ctx.closePath();
      ctx.fill();
    } else if (rune === 'blue') {
      // Mountains
      ctx.beginPath();
      ctx.moveTo(rx - 16, ry + 12);
      ctx.lineTo(rx - 6, ry - 4);
      ctx.lineTo(rx + 2, ry + 12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx - 2, ry + 12);
      ctx.lineTo(rx + 10, ry - 16);
      ctx.lineTo(rx + 20, ry + 12);
      ctx.closePath();
      ctx.fill();
    } else if (rune === 'green') {
      // Tomoe
      ctx.beginPath();
      ctx.arc(rx, ry - 7, 6, 0, Math.PI * 2);
      ctx.arc(rx - 7, ry + 6, 6, 0, Math.PI * 2);
      ctx.arc(rx + 7, ry + 6, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (rune === 'red') {
      // Spiral
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 1.5);
      ctx.lineWidth = 4;
      ctx.strokeStyle = info.emblemColor;
      ctx.stroke();
    } else if (rune === 'white') {
      // Rest
      ctx.fillRect(rx - 2, ry - 14, 4, 28);
    } else if (rune === 'yellow') {
      // Flame
      ctx.beginPath();
      ctx.moveTo(rx, ry - 16);
      ctx.quadraticCurveTo(rx + 14, ry, rx, ry + 16);
      ctx.quadraticCurveTo(rx - 14, ry, rx, ry - 16);
      ctx.fill();
    }

    // Number tag under rune
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Slot ${index + 1}`, rx, ry + runeRadius + 20);
  });

  // Score / Feedback Panel on the right
  const scoreX = panelX + panelW - 150;
  const scoreY = panelY + 70;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(scoreX, scoreY, 130, 150);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(scoreX, scoreY, 130, 150);

  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 12px "Cinzel", serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KEKKAI RESULT', scoreX + 65, scoreY + 24);

  const fb = feedback || { green: 1, yellow: 2 };

  // Green Indicator
  ctx.beginPath();
  ctx.arc(scoreX + 35, scoreY + 60, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`× ${fb.green}`, scoreX + 60, scoreY + 66);

  ctx.fillStyle = '#86efac';
  ctx.font = '10px sans-serif';
  ctx.fillText('Correct Spot', scoreX + 25, scoreY + 84);

  // Yellow Indicator
  ctx.beginPath();
  ctx.arc(scoreX + 35, scoreY + 112, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#eab308';
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`× ${fb.yellow}`, scoreX + 60, scoreY + 118);

  ctx.fillStyle = '#fde047';
  ctx.font = '10px sans-serif';
  ctx.fillText('Wrong Spot', scoreX + 25, scoreY + 136);

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Ninja Game Capture Simulation', canvas.width - 20, canvas.height - 12);

  return canvas.toDataURL('image/png');
}
