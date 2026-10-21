import React from 'react';

interface TMOneNOCBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const TMOneNOCBrand: React.FC<TMOneNOCBrandProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const logoHeightClass = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-9',
    xl: 'h-12',
  }[size];

  const titleTextClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Telekom Malaysia Logo */}
      <div
        className={`flex items-center justify-center shrink-0 transition-all ${
          isDark ? 'bg-white p-1 rounded-xl shadow-xs' : 'p-0.5'
        }`}
      >
        <img
          src="/assets/aistudio/telekom-malaysia-2023-seeklogo_8d5f5015.png"
          alt="Telekom Malaysia"
          className={`${logoHeightClass} w-auto object-contain`}
        />
      </div>

      {/* Only "Incident Tracking System" */}
      {showSubtitle && (
        <span
          className={`font-bold tracking-tight whitespace-nowrap ${titleTextClass} ${
            isDark ? 'text-neutral-100' : 'text-[#1E293B]'
          }`}
        >
          Incident Tracking System
        </span>
      )}
    </div>
  );
};
