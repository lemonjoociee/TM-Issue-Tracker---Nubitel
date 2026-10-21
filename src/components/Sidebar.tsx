import React from 'react';
import { TMLogo } from './TMLogo';
import { UserSession } from './LoginPage';
import {
  Activity,
  Server,
  ShieldAlert,
  Layers,
  BookOpen,
  Calendar,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  FileSpreadsheet,
  FileText,
  Mail,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export type NavTab = 'noc' | 'ops' | 'admin' | 'tracker' | 'guidelines' | 'matrix';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserSession;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeIssuesCount: number;
  isLiveSyncing: boolean;
  onRefreshSharePoint?: () => void;
  onOpenReportModal: () => void;
  onOpenInviteModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isDarkMode,
  onToggleTheme,
  activeIssuesCount,
  isLiveSyncing,
  onRefreshSharePoint,
  onOpenReportModal,
  onOpenInviteModal,
}) => {
  const navItems = [
    {
      id: 'noc' as NavTab,
      label: 'NOC Dashboard',
      description: 'Operations Centre Monitoring',
      icon: Server,
      badge: activeIssuesCount > 0 ? `${activeIssuesCount} Active` : undefined,
      badgeColor: 'bg-[#D71920] text-white',
    },
    {
      id: 'ops' as NavTab,
      label: 'OPS Dashboard',
      description: 'Executive Management KPIs',
      icon: Activity,
    },
    {
      id: 'admin' as NavTab,
      label: 'Admin Dashboard',
      description: 'Governance & User Access',
      icon: UserCheck,
      badge: user.role === 'ADMIN' ? 'Admin' : undefined,
      badgeColor: 'bg-neutral-600 text-white',
    },
    {
      id: 'tracker' as NavTab,
      label: 'Incident Tracker',
      description: 'Past & Present Cases',
      icon: Layers,
    },
    {
      id: 'guidelines' as NavTab,
      label: 'Guidelines & RCA',
      description: 'SOPs & Knowledge Base',
      icon: BookOpen,
    },
    {
      id: 'matrix' as NavTab,
      label: 'Monthly Matrix',
      description: 'Performance Breakdown',
      icon: Calendar,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (user.role === 'ADMIN') {
      // Admin: Admin Dashboard, NOC Dashboard, OPS Dashboard, plus incident tools
      return true;
    }
    if (user.role === 'NOC_ENGINEER') {
      // NOC: NOC Dashboard, incident tracker, guidelines, and matrix
      return item.id === 'noc' || item.id === 'tracker' || item.id === 'guidelines' || item.id === 'matrix';
    }
    if (user.role === 'OPS_EXECUTIVE') {
      // OPS: OPS Dashboard only
      return item.id === 'ops';
    }
    return true;
  });

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between border-r transition-colors duration-200 select-none ${
        isDarkMode
          ? 'bg-[#1e1e24] border-neutral-800 text-neutral-200'
          : 'bg-white border-neutral-200 text-[#4A4A4A]'
      }`}
    >
      {/* Top Branding Section with Official TM Logo */}
      <div>
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="md" showSubtitle={false} />
            <div className="min-w-0">
              <div className="text-xs font-black tracking-tight text-[#4A4A4A] dark:text-white uppercase leading-tight">
                TM NOC &amp; OPS
              </div>
              <div className="text-[11px] font-semibold text-[#D71920] leading-tight">
                Management Portal
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between text-[10px]">
            <span className="font-bold text-neutral-500 dark:text-neutral-400">TM OneTrack</span>
            <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-[#034DA1] text-white text-[9px]">
              Core v4.2
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {user.role === 'OPS_EXECUTIVE'
              ? 'Executive Dashboard'
              : user.role === 'ADMIN'
              ? 'All Dashboards & Controls'
              : 'NOC Operational View'}
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#D71920] text-white font-semibold shadow-sm shadow-[#D71920]/30'
                    : isDarkMode
                    ? 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                    : 'text-[#4A4A4A] hover:bg-[#F5F5F5] hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-[#D71920]'
                    }`}
                  />
                  <div className="text-left truncate">
                    <div className="truncate leading-tight">{item.label}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Enterprise Tools */}
        <div className="px-3 pt-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Reports &amp; Invites
          </div>
          <button
            onClick={onOpenReportModal}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                : 'text-[#4A4A4A] hover:bg-[#F5F5F5] hover:text-black'
            }`}
          >
            <FileText className="w-4 h-4 text-[#D71920]" />
            <span>Generate TM Report</span>
          </button>

          {user.role === 'ADMIN' && (
            <button
              onClick={onOpenInviteModal}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                  : 'text-[#4A4A4A] hover:bg-[#F5F5F5] hover:text-black'
              }`}
            >
              <Mail className="w-4 h-4 text-[#D71920]" />
              <span>Email Invitation</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Section: Real-time sync, User Profile & Actions */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        {/* SharePoint Sync Mini Widget */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-[#F5F5F5] border-neutral-200'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'
              } shrink-0`}
            />
            <div className="truncate">
              <div className="font-semibold text-[11px] truncate">SharePoint Live</div>
              <div className="text-[10px] text-neutral-500 truncate">5s Active Sync</div>
            </div>
          </div>
          <button
            onClick={onRefreshSharePoint}
            disabled={isLiveSyncing}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer disabled:opacity-50"
            title="Instant Refresh from SharePoint"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-[#D71920]' : ''}`} />
          </button>
        </div>

        {/* User Card */}
        <div className={`p-2.5 rounded-xl border ${
          isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold truncate leading-tight text-[#4A4A4A] dark:text-neutral-100">
                  {user.name}
                </div>
                <div className="text-[10px] text-neutral-500 truncate">
                  {user.roleTitle}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[11px]">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[#D71920] hover:underline font-semibold cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
