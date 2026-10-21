import React, { useState } from 'react';

interface TMLogoProps {
  variant?: 'color' | 'white';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Official Telekom Malaysia (TM) Corporate Logo Component.
 * Faithfully matches the official Telekom Malaysia brand mark (seeklogo asset):
 * - Italicized TM logotype in royal TM Blue (#034DA1) or White (#FFFFFF)
 * - Dynamic aerodynamic crescent wave in TM Orange (#F05A22)
 * - Trailing red spark droplet in TM Red (#ED1B2E)
 *
 * Points directly to /assets/tm-logo.svg and /assets/tm-logo-white.svg.
 */
export const TMLogo: React.FC<TMLogoProps> = ({
  variant = 'color',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const assetPath = '/assets/aistudio/telekom-malaysia-2023-seeklogo_8d5f5015.png';

  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  }[size];

  const tmTextColor = variant === 'white' ? '#FFFFFF' : '#034DA1';

  if (!imgError) {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <img
          src={assetPath}
          alt="Telekom Malaysia"
          className={`${sizeClasses} w-auto object-contain transition-transform`}
          onError={() => setImgError(true)}
        />
        {showSubtitle && size === 'xl' && (
          <div className="hidden sm:block border-l border-neutral-300 dark:border-neutral-700 pl-3.5 py-0.5 text-left">
            <div className="text-[11px] font-extrabold tracking-widest text-[#034DA1] dark:text-[#F05A22] uppercase leading-none">
              Telekom Malaysia
            </div>
            <div className="text-xs font-bold text-[#4A4A4A] dark:text-neutral-200 leading-tight mt-0.5">
              NOC &amp; OPS Management Portal
            </div>
          </div>
        )}
      </div>
    );
  }

  // Resilient vector fallback with the exact official TM paths
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 1134 532"
        className={`${sizeClasses} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Telekom Malaysia"
        role="img"
      >
        <g id="official-tm-seeklogo">
          {/* Red Crescent / Flame Wing */}
          <path
            fill="#ED1B2E"
            d="M1058.48 78.7611c56.37-2.6697 82.83 37.8802 73.56 76.2103 0 0-75.48-36.7499-235.06 1.77C934.07 125.952 999.77 81.5614 1058.48 78.7611Z"
          />
          {/* Orange Dynamic Wave / Crest Swoosh */}
          <path
            fill="#F05A22"
            d="M766.1 0.0007c100.02-.21 153.04 43.9001 153.14 89.0704.08 46.1599-72.51 95.3399-158.67 101.8999 0 0 11.83-8.67 24.74-24.79 65.95-81.4703-91.25-117.9199-311.49-31.1102C526.87 76.5608 644.17.2711 766.1.0007Z"
          />
          {/* Bold Italicized TM Logotype */}
          <path
            fill={tmTextColor}
            d="M81.9199 228.621c-39.18.11-55 10.51-65.6201 32.31L0 294.661l144.15-.29-66.45 237.23 119.81-.24 66.65-237.26 55.4-.1c53.12-.12 72.61-16.3 102.79-66.07L81.9199 228.621Zm736.2701-1.64c-43.75.12-61.92 8.14-80.87 40.57L642.45 429.621h-5.07l-18.27-202.11-110.08.13c-64.89.12-84.35 15.56-96.22 58.06l-68.43 245.33 95.37-.23 61.69-219.97h7.11l20.31 219.79 77.5-.17c49.14-.1 70.98-4.21 92.16-40.4l105.43-179.83h6.73l-61.77 220 119.68-.25 84.86-303.1-150.77.14Z"
          />
        </g>
      </svg>
      {showSubtitle && size === 'xl' && (
        <div className="hidden sm:block border-l border-neutral-300 dark:border-neutral-700 pl-3.5 py-0.5 text-left">
          <div className="text-[11px] font-extrabold tracking-widest text-[#034DA1] dark:text-[#F05A22] uppercase leading-none">
            Telekom Malaysia
          </div>
          <div className="text-xs font-bold text-[#4A4A4A] dark:text-neutral-200 leading-tight mt-0.5">
            NOC &amp; OPS Management Portal
          </div>
        </div>
      )}
    </div>
  );
};
