import React, { useEffect, useRef } from 'react';

// Code 128-B patterns (107 symbols, each 11 modules wide except Stop which is 13)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (104=Start B, 106=Stop)
];

const START_B_INDEX = 104;
const STOP_INDEX = 106;

/**
 * Generate standard Code 128 barcode modules (1 for bar, 0 for space)
 */
export function encodeCode128(text: string): string {
  if (!text) return '';
  const clean = text.replace(/[^\x20-\x7E]/g, '');
  if (!clean.length) return '';

  const indices: number[] = [START_B_INDEX];
  let checkSum = START_B_INDEX;

  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const codeIndex = charCode - 32; // In Code 128B, ASCII 32 is value 0
    indices.push(codeIndex);
    checkSum += codeIndex * (i + 1);
  }

  const checkDigitIndex = checkSum % 103;
  indices.push(checkDigitIndex);
  indices.push(STOP_INDEX);

  let binaryPattern = '';
  for (const index of indices) {
    const pattern = CODE128_PATTERNS[index];
    if (!pattern) continue;
    let isBar = true;
    for (const widthChar of pattern) {
      const width = parseInt(widthChar, 10);
      binaryPattern += (isBar ? '1' : '0').repeat(width);
      isBar = !isBar;
    }
  }

  return binaryPattern;
}

/**
 * React Component to render crisp vector SVG barcode with label
 */
interface BarcodeDisplayProps {
  value: string;
  height?: number;
  showText?: boolean;
  className?: string;
  barColor?: string;
  bgColor?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  height = 42,
  showText = true,
  className = '',
  barColor = '#0f172a',
  bgColor = 'transparent',
}) => {
  const binary = encodeCode128(value);
  if (!binary) {
    return <span className="text-xs text-slate-400 font-mono">{value}</span>;
  }

  // Calculate SVG dimensions
  const moduleWidth = 2;
  const quietZone = 20; // 10 modules on each side
  const totalWidth = binary.length * moduleWidth + quietZone * 2;
  const barHeight = height;
  const textHeight = showText ? 16 : 0;
  const totalHeight = barHeight + textHeight + 4;

  // Build SVG rects
  const rects: React.ReactElement[] = [];
  let currentRun = 0;
  let currentVal = '0';
  let startX = quietZone;

  for (let i = 0; i <= binary.length; i++) {
    const bit = binary[i];
    if (bit === currentVal && i < binary.length) {
      currentRun++;
    } else {
      if (currentVal === '1' && currentRun > 0) {
        rects.push(
          <rect
            key={`bar-${startX}`}
            x={startX}
            y={2}
            width={currentRun * moduleWidth}
            height={barHeight}
            fill={barColor}
          />
        );
      }
      startX += currentRun * moduleWidth;
      currentRun = 1;
      currentVal = bit;
    }
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={{ width: '100%', maxWidth: totalWidth, height: 'auto', backgroundColor: bgColor }}
        className="shape-crisp-edges"
      >
        {rects}
        {showText && (
          <text
            x={totalWidth / 2}
            y={totalHeight - 2}
            textAnchor="middle"
            fill={barColor}
            fontSize="11"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="2"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  );
};

/**
 * Global Keyboard Hook for Hardware USB/Bluetooth Barcode Scanners (HID Keyboard Wedge)
 */
export function useHardwareScanner(onScan: (code: string) => void, enabled: boolean = true) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing normally in a standard input or textarea unless it is rapid scanner burst
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key marks end of scan in standard barcode guns
      if (e.key === 'Enter') {
        const scannedString = bufferRef.current.trim();
        // Hardware scanners typically yield 4 to 32 characters in under 350ms total
        if (scannedString.length >= 4) {
          e.preventDefault();
          e.stopPropagation();
          onScan(scannedString);
        }
        bufferRef.current = '';
        return;
      }

      // If delay between keypresses was more than 150ms, this is a human typing, reset buffer
      if (timeDiff > 150 && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      // Accumulate printable alphanumeric and dash characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, onScan]);
}
