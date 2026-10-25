import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  showTagline = false,
}) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const textColor = variant === 'dark' ? 'text-white' : 'text-[#0B1220]';
  const tagColor = variant === 'dark' ? 'text-slate-400' : 'text-[#687386]';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Geometric shield with subtle medical cross and signal wave motif */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-sm"
        >
          {/* Outer Shield Path */}
          <path
            d="M16 2L5 6.5V14C5 21.5 9.7 28.2 16 30C22.3 28.2 27 21.5 27 14V6.5L16 2Z"
            fill="#0B1220"
            stroke="#18B6A4"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Signal Pulse Wave inside Shield */}
          <path
            d="M8.5 16H12L14 11.5L18 20.5L20 16H23.5"
            stroke="#E53945"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Central Medical Cross Anchor */}
          <circle cx="16" cy="16" r="2.2" fill="#18B6A4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-extrabold tracking-tight ${textSize} ${textColor}`}>
            RESQ<span className="text-[#E53945]">-AI</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#18B6A4] px-1.5 py-0.2 rounded bg-[#18B6A4]/10 border border-[#18B6A4]/20">
            DEMO
          </span>
        </div>
        {showTagline && (
          <span className={`text-xs ${tagColor} tracking-tight -mt-0.5`}>
            Every Second Matters.
          </span>
        )}
      </div>
    </div>
  );
};
