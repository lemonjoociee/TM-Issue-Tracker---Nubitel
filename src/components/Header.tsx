import React from 'react';
import { TMLogo } from './TMLogo';
import { UserSession } from './LoginPage';
import { NavTab } from './Sidebar';
import {
  Plus,
  Download,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  FileText,
  FileSpreadsheet,
  Layers,
  Activity,
  Server,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user?: UserSession;
  onOpenNewIssue: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onOpenReportModal: () => void;
  onOpenSharePointSync: () => void;
  onRefreshSharePoint?: () => void;
  isLiveSyncing?: boolean;
  activeIssuesCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenNewIssue,
  onExportCSV,
  onExportExcel,
  onOpenReportModal,
  onOpenSharePointSync,
  onRefreshSharePoint,
  isLiveSyncing = false,
  activeIssuesCount,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#1e1e24]/95 border-neutral-800 text-neutral-100'
          : 'bg-white/95 border-neutral-200 text-[#4A4A4A]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Official TM Corporate Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="md" />
            <div className="hidden lg:block border-l border-neutral-300 dark:border-neutral-700 pl-3">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D71920] flex items-center gap-1.5">
                <span>TM ONETRACK</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#034DA1] text-white font-mono font-normal">Core v4.2</span>
              </div>
              <div className="text-xs font-bold text-[#4A4A4A] dark:text-neutral-200 leading-none mt-0.5">
                NOC &amp; OPS Management Portal
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Role Filtered) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold">
            {/* NOC Dashboard: Admin & NOC */}
            {(user?.role === 'ADMIN' || user?.role === 'NOC_ENGINEER') && (
              <button
                onClick={() => setActiveTab('noc')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'noc'
                    ? 'bg-[#D71920] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>NOC</span>
                {activeIssuesCount > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded font-bold ${
                    activeTab === 'noc' ? 'bg-white/20 text-white' : 'bg-[#D71920] text-white'
                  }`}>
                    {activeIssuesCount}
                  </span>
                )}
              </button>
            )}

            {/* OPS Dashboard: Admin & OPS */}
            {(user?.role === 'ADMIN' || user?.role === 'OPS_EXECUTIVE') && (
              <button
                onClick={() => setActiveTab('ops')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ops'
                    ? 'bg-[#D71920] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>OPS Dashboard</span>
              </button>
            )}

            {/* Admin Dashboard: Admin only */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#D71920] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Technical Tools: Admin & NOC */}
            {user?.role !== 'OPS_EXECUTIVE' && (
              <>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'tracker'
                      ? 'bg-[#D71920] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-neutral-300 hover:bg-neutral-800'
                      : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tracker</span>
                </button>

                <button
                  onClick={() => setActiveTab('guidelines')}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'guidelines'
                      ? 'bg-[#D71920] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-neutral-300 hover:bg-neutral-800'
                      : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Guidelines &amp; RCA
                </button>

                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-[#D71920] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-neutral-300 hover:bg-neutral-800'
                      : 'text-[#4A4A4A] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Matrix
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: TM Actions & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Real-time SharePoint Button */}
            <button
              onClick={onRefreshSharePoint || onOpenSharePointSync}
              disabled={isLiveSyncing}
              title="SharePoint Live Synchronizer (Click to pull fresh changes)"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shadow-sm cursor-pointer ${
                isLiveSyncing
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50 cursor-wait'
                  : isDarkMode
                  ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
              }`}
            >
              {isLiveSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isLiveSyncing ? 'Syncing...' : 'SharePoint Live'}
              </span>
            </button>

            {/* Generate TM Report button */}
            <button
              onClick={onOpenReportModal}
              title="Export Official TM Report (PDF / Print layout)"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  : 'bg-[#F5F5F5] hover:bg-neutral-200 border-neutral-300 text-[#4A4A4A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#D71920]" />
              <span>TM Report</span>
            </button>

            {/* Log Incident Button in TM Corporate Red */}
            <button
              onClick={onOpenNewIssue}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#BF151B] active:bg-[#A31015] rounded-lg shadow-sm shadow-[#D71920]/30 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-amber-400 hover:bg-neutral-700'
                  : 'bg-neutral-100 border-neutral-200 text-slate-700 hover:bg-neutral-200'
              }`}
              title="Toggle Light / Dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
