import React from 'react';

interface BijadexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showByline?: boolean;
  className?: string;
}

export const BijadexLogo: React.FC<BijadexLogoProps> = ({
  size = 'md',
  showByline = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl'
  }[size];

  const bylineSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Vector Brandmark */}
      <div className={`relative ${iconDimensions} rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 p-0.5 shadow-md shadow-emerald-950/40 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-slate-950/80 rounded-[7px] flex items-center justify-center relative overflow-hidden backdrop-blur-xs">
          {/* Stylized Modern 'B' + Barcode Index Grid Symbol */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5"
          >
            {/* Primary Spine / Pillar */}
            <rect x="6" y="5" width="4" height="22" rx="1.5" fill="#10B981" />
            
            {/* Top Loop Segment */}
            <path
              d="M10 5H18C21.3137 5 24 7.68629 24 11C24 14.3137 21.3137 17 18 17H10V5Z"
              stroke="#34D399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bottom Loop Segment */}
            <path
              d="M10 16H19C22.3137 16 25 18.6863 25 22C25 25.3137 22.3137 28 19 28H10V16Z"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Precision Scanner Node (Laser Pulse) */}
            <circle cx="18" cy="11" r="1.5" fill="#FFFFFF" />
            <circle cx="19" cy="22" r="1.5" fill="#38BDF8" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-white font-sans ${textSize}`}>
            BIJADEX
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1 py-0.2 bg-emerald-950/60 rounded border border-emerald-800/40">
            ERP
          </span>
        </div>
        {showByline && (
          <span className={`text-slate-400 font-mono tracking-wider uppercase mt-0.5 ${bylineSize}`}>
            by{' '}
            <a
              href="https://bijasa.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-200 font-semibold tracking-normal hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
              title="Visit official website: bijasa.com"
            >
              bijasa
            </a>
          </span>
        )}
      </div>
    </div>
  );
};
