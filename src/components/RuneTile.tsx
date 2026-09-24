import React from 'react';
import { RuneColor, RUNE_DEFINITIONS } from '../types/kekkai';

interface RuneTileProps {
  color: RuneColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  pulse?: boolean;
  onClick?: () => void;
  className?: string;
}

export const RuneTile: React.FC<RuneTileProps> = ({
  color,
  size = 'md',
  selected = false,
  clickable = false,
  disabled = false,
  showLabel = false,
  pulse = false,
  onClick,
  className = '',
}) => {
  const info = RUNE_DEFINITIONS[color];

  const sizeDimensions = {
    xs: { px: 32, box: 'w-7 h-7 sm:w-8 sm:h-8', text: 'text-[9px]' },
    sm: { px: 44, box: 'w-9 h-9 sm:w-11 sm:h-11', text: 'text-[10px] sm:text-[11px]' },
    md: { px: 56, box: 'w-11 h-11 sm:w-14 sm:h-14', text: 'text-[11px] sm:text-xs' },
    lg: { px: 72, box: 'w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18', text: 'text-xs sm:text-sm' },
    xl: { px: 96, box: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24', text: 'text-sm sm:text-base' },
  }[size];

  // Specific SVG Paths for the 6 authentic Ninja Kekkai Runes
  const renderEmblem = () => {
    switch (color) {
      case 'black':
        // Lightning bolt (Raikiri / Thunder)
        return (
          <g>
            <path
              d="M 52 18 L 35 48 L 47 48 L 41 82 L 67 44 L 53 44 Z"
              fill="#f1f5f9"
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))"
            />
            <path
              d="M 50 20 L 37 46 L 47 46 L 43 76 L 63 46 L 52 46 Z"
              fill="#ffffff"
            />
          </g>
        );

      case 'blue':
        // Mountain Peaks (Twin summits)
        return (
          <g fill="#070a24">
            {/* Left smaller mountain */}
            <polygon points="32,74 44,48 54,74" />
            <polygon points="33,73 44,50 49,73" fill="#0f163d" />
            {/* Right taller mountain */}
            <polygon points="46,74 61,24 76,74" />
            <polygon points="48,73 61,27 68,73" fill="#141c4d" />
          </g>
        );

      case 'green':
        // Mitsudomoe (Three swirling commas)
        return (
          <g fill="#042807" transform="rotate(-15 50 50)">
            {/* Head 1 */}
            <circle cx="50" cy="36" r="9" />
            <path d="M 50 27 C 62 27 68 40 68 50 C 68 42 58 36 50 36 Z" />
            {/* Head 2 */}
            <circle cx="38" cy="57" r="9" />
            <path d="M 30 62 C 24 51 32 39 41 33 C 34 39 33 50 38 57 Z" />
            {/* Head 3 */}
            <circle cx="62" cy="57" r="9" />
            <path d="M 70 57 C 68 69 54 71 45 67 C 53 67 62 64 62 57 Z" />
            {/* Center swirl merge */}
            <circle cx="50" cy="50" r="4.5" fill="#d4fcd7" />
          </g>
        );

      case 'red':
        // Nautilus / Spiral Shell Magatama
        return (
          <g fill="#450a0a">
            <path
              d="M 50 22 C 68 22 78 34 76 52 C 74 68 62 78 48 78 C 34 78 24 66 26 50 C 27 38 36 32 46 32 C 54 32 58 38 58 46 C 58 53 53 58 48 58 C 44 58 41 55 42 51 C 43 47 48 48 48 50 C 48 51 46 51 46 51 C 44 51 46 45 50 45 C 54 45 56 48 55 54 C 53 63 43 68 36 62 C 30 56 31 43 38 35 C 44 28 58 28 66 36 C 73 45 71 61 62 69 C 55 74 44 73 38 68"
              fill="none"
              stroke="#450a0a"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx="48" cy="50" r="3.5" fill="#450a0a" />
          </g>
        );

      case 'white':
        // Musical rest / vertical wave glyph
        return (
          <g fill="#0f172a">
            <path
              d="M 49 22 C 53 25 58 32 58 40 C 58 47 50 51 46 56 C 41 62 43 70 48 78 C 45 77 40 73 40 66 C 40 59 47 55 51 50 C 54 46 51 40 47 34 C 45 30 46 25 49 22 Z"
            />
            {/* Bottom comma tail */}
            <path
              d="M 48 78 C 53 74 55 69 54 66 C 54 66 52 72 48 78 Z"
            />
          </g>
        );

      case 'yellow':
        // Fire / Flame silhouette
        return (
          <g fill="#451a03">
            <path
              d="M 50 20 C 52 28 58 32 63 38 C 69 45 71 54 69 63 C 66 73 57 79 49 79 C 39 79 31 71 31 60 C 31 52 35 46 39 42 C 38 46 40 50 43 51 C 41 42 45 34 50 20 Z"
            />
            {/* Inner flame core */}
            <path
              d="M 48 52 C 45 56 45 63 49 68 C 53 68 56 64 56 59 C 56 55 53 53 50 50 C 49 51 49 52 48 52 Z"
              fill="#fef08a"
              opacity="0.85"
            />
          </g>
        );
    }
  };

  const getBorderRingGradient = () => {
    switch (color) {
      case 'green':
        return { start: '#00e600', end: '#028a0f' };
      case 'red':
        return { start: '#ff1a1a', end: '#990000' };
      case 'blue':
        return { start: '#0055ff', end: '#001a80' };
      case 'black':
        return { start: '#334155', end: '#090d16' };
      case 'yellow':
        return { start: '#ffcc00', end: '#b37700' };
      case 'white':
        return { start: '#ffffff', end: '#94a3b8' };
    }
  };

  const ringGrad = getBorderRingGradient();

  return (
    <div
      onClick={!disabled && clickable ? onClick : undefined}
      className={`relative inline-flex flex-col items-center select-none group transition-all duration-200 ${
        clickable && !disabled ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      title={`${info.name} (${info.element}) - Click to select`}
    >
      <div
        className={`relative ${sizeDimensions.box} rounded-full flex items-center justify-center transition-all ${
          selected
            ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
            : 'hover:shadow-[0_0_12px_rgba(255,255,255,0.25)]'
        } ${pulse ? 'animate-pulse' : ''}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Wood Rim Radial Gradient */}
            <radialGradient id={`wood-bg-${color}`} cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#4a2508" />
              <stop offset="95%" stopColor="#2c1403" />
              <stop offset="100%" stopColor="#1a0a01" />
            </radialGradient>

            {/* Element Outer Ring Gradient */}
            <linearGradient id={`ring-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ringGrad.start} />
              <stop offset="100%" stopColor={ringGrad.end} />
            </linearGradient>

            {/* Metallic Side Clasps Gradient */}
            <linearGradient id={`tab-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Inner Plate Drop Shadow */}
            <radialGradient id={`inner-disc-${color}`} cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor={color === 'black' ? '#22252e' : '#ffffff'} stopOpacity="0.9" />
              <stop offset="70%" stopColor={info.bgInner} />
              <stop offset="100%" stopColor={color === 'black' ? '#090a0d' : info.bgInner} />
            </radialGradient>
          </defs>

          {/* Background Wood Base Disc */}
          <circle cx="50" cy="50" r="49" fill={`url(#wood-bg-${color})`} />

          {/* Left Metallic Clasp Tab */}
          <rect
            x="6"
            y="36"
            width="6"
            height="28"
            rx="3"
            fill={`url(#tab-${color})`}
            stroke="#1e293b"
            strokeWidth="0.8"
          />

          {/* Right Metallic Clasp Tab */}
          <rect
            x="88"
            y="36"
            width="6"
            height="28"
            rx="3"
            fill={`url(#tab-${color})`}
            stroke="#1e293b"
            strokeWidth="0.8"
          />

          {/* Outer Colored Element Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={`url(#ring-${color})`}
            strokeWidth="6.5"
          />

          {/* Inner Border Ring (Dark Divider) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#0b0f19"
            strokeWidth="1.8"
          />

          {/* Inner Disc Face */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill={`url(#inner-disc-${color})`}
          />

          {/* Center Emblem Symbol */}
          {renderEmblem()}

          {/* Glossy Top Glass Arc Highlight */}
          <path
            d="M 24 38 A 36 36 0 0 1 76 38 A 38 24 0 0 0 24 38 Z"
            fill="#ffffff"
            opacity="0.18"
          />
        </svg>
      </div>

      {showLabel && (
        <span
          className={`mt-1 font-bold uppercase tracking-wider ${sizeDimensions.text}`}
          style={{ color: info.accentColor }}
        >
          {info.colorName}
        </span>
      )}
    </div>
  );
};
