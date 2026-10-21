import React from 'react';
import { UserSession } from '../types/nocSystem';
import { TMOneNOCBrand } from './TMOneNOCBrand';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface NOCHeaderProps {
  user: UserSession;
  overdueCount: number;
  onOpenSharePointModal: () => void;
  onTriggerReminderCheck: () => void;
  isCheckingReminders: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const NOCHeader: React.FC<NOCHeaderProps> = ({
  user,
  overdueCount,
  onOpenSharePointModal,
  onTriggerReminderCheck,
  isCheckingReminders,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 select-none ${
        isDarkMode
          ? 'bg-[#18181B]/95 border-neutral-800 text-neutral-100'
          : 'bg-white/95 border-slate-200 text-[#1E293B]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left Brand Area */}
          <div className="flex items-center gap-3">
            <TMOneNOCBrand size="md" theme={isDarkMode ? 'dark' : 'light'} />
          </div>

          {/* Right Status Indicators & Tools */}
          <div className="flex items-center gap-3">
            {/* SharePoint Live Status */}
            <button
              onClick={onOpenSharePointModal}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors shadow-2xs ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 hover:border-emerald-600'
              }`}
              title="Open SharePoint Excel Table Inspector"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px]">SharePoint Excel Live</span>
            </button>

            {/* Unresolved Reminder Workflow Trigger (NOC Technical & Admin only) */}
            {user.role !== 'OPS_EXECUTIVE' && (
              <button
                onClick={onTriggerReminderCheck}
                disabled={isCheckingReminders}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors shadow-2xs ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-[#D71920]'
                    : 'bg-white border-slate-300 text-slate-900 hover:border-[#D71920]'
                }`}
                title="Execute immediate check of unresolved incidents against follow-up schedules"
              >
                <Clock className={`w-3.5 h-3.5 text-[#034DA1] ${isCheckingReminders ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">Check Reminders</span>
              </button>
            )}

            {/* Overdue Badge (NOC & Admin) */}
            {user.role !== 'OPS_EXECUTIVE' && overdueCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-100 border border-red-300 text-red-700 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400 text-xs font-bold font-mono">
                <Bell className="w-3.5 h-3.5 text-[#D71920]" />
                <span>{overdueCount} Overdue</span>
              </div>
            )}

            {/* Ops Executive Mode Badge */}
            {user.role === 'OPS_EXECUTIVE' && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300 text-xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Executive Monthly View</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors shadow-2xs ${
                isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-800 hover:text-black hover:bg-slate-50'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-neutral-800">
              <div
                className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                  user.role === 'ADMIN'
                    ? 'bg-[#D71920]'
                    : user.role === 'OPS_EXECUTIVE'
                    ? 'bg-emerald-600'
                    : 'bg-[#034DA1]'
                }`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-extrabold leading-tight truncate max-w-[140px] text-slate-950 dark:text-white">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-neutral-400 font-mono font-bold leading-none mt-0.5">
                  {user.role === 'OPS_EXECUTIVE' ? 'OPS EXECUTIVE' : user.role === 'NOC_USER' ? 'NOC' : user.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
