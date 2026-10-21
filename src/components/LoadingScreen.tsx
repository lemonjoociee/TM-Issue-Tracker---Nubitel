import React from 'react';
import { TMLogo } from './TMLogo';

interface LoadingScreenProps {
  statusText?: string;
  isDarkMode?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  statusText = 'Initializing Telekom Malaysia NOC & OPS Platform...',
  isDarkMode = true,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-[#18181b] text-white' : 'bg-[#F5F5F5] text-[#4A4A4A]'
      }`}
    >
      <div className="flex flex-col items-center text-center p-8 max-w-sm">
        {/* Official TM Logo */}
        <div className="mb-6 animate-pulse">
          <TMLogo variant={isDarkMode ? 'white' : 'color'} size="xl" showSubtitle={false} />
        </div>

        {/* TM Red corporate progress bar */}
        <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#D71920] rounded-full animate-indeterminate" />
        </div>

        <h3 className="text-sm font-bold tracking-tight text-[#4A4A4A] dark:text-neutral-100">
          Telekom Malaysia Berhad
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {statusText}
        </p>

        <div className="mt-8 text-[11px] font-mono text-neutral-400">
          TM NOC Operations &middot; Core v4.2
        </div>
      </div>
    </div>
  );
};
