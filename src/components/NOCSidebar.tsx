import React from 'react';
import { UserSession } from '../types/nocSystem';
import { TMOneNOCBrand } from './TMOneNOCBrand';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  AlertOctagon,
  BarChart3,
  Settings,
  LogOut,
  FileSpreadsheet,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';

export type NOCTab =
  | 'dashboard'
  | 'ops'
  | 'create'
  | 'list'
  | 'overdue'
  | 'reports'
  | 'admin';

interface NOCSidebarProps {
  activeTab: NOCTab;
  setActiveTab: (tab: NOCTab) => void;
  user: UserSession;
  totalIncidentsCount: number;
  overdueCount: number;
  onOpenCreateModal: () => void;
  onOpenSharePointModal: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isLiveSyncing?: boolean;
}

export const NOCSidebar: React.FC<NOCSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  totalIncidentsCount,
  overdueCount,
  onOpenCreateModal,
  onOpenSharePointModal,
  onLogout,
  isDarkMode,
  onToggleTheme,
  isLiveSyncing = false,
}) => {
  const isOpsUser = user.role === 'OPS_EXECUTIVE';

  const allNavItems = [
    {
      id: 'ops' as NOCTab,
      label: 'Ops Monthly Summary',
      icon: TrendingUp,
      badge: 'Executive',
      badgeColor: 'bg-emerald-600 text-white',
      forOpsOnly: false,
    },
    {
      id: 'dashboard' as NOCTab,
      label: 'NOC Dashboard',
      icon: LayoutDashboard,
      badge: null,
      hideForOps: true,
    },
    {
      id: 'create' as NOCTab,
      label: 'Create Incident',
      icon: PlusCircle,
      badge: 'Manual',
      highlight: true,
      hideForOps: true,
    },
    {
      id: 'list' as NOCTab,
      label: 'Incident List',
      icon: ListOrdered,
      badge: totalIncidentsCount.toString(),
      hideForOps: true,
    },
    {
      id: 'overdue' as NOCTab,
      label: 'Overdue Incidents',
      icon: AlertOctagon,
      badge: overdueCount > 0 ? overdueCount.toString() : null,
      badgeColor: 'bg-[#D71920] text-white',
      hideForOps: true,
    },
    {
      id: 'reports' as NOCTab,
      label: 'Reports & Export',
      icon: BarChart3,
      badge: null,
      hideForOps: true,
    },
    {
      id: 'admin' as NOCTab,
      label: 'Administration',
      icon: Settings,
      badge: user.role === 'ADMIN' ? 'Admin' : 'Restricted',
      requiresAdmin: true,
      hideForOps: true,
    },
  ];

  const navItems = allNavItems.filter((item) => {
    if (isOpsUser) {
      return !item.hideForOps;
    }
    return true;
  });

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between border-r select-none transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#18181B] border-neutral-800 text-neutral-200'
          : 'bg-white border-slate-200 text-[#1E293B]'
      }`}
    >
      {/* Top Branding Section with text placeholder */}
      <div>
        <div className={`p-4 border-b ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
          <TMOneNOCBrand size="md" theme={isDarkMode ? 'dark' : 'light'} />
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-slate-800 dark:text-neutral-200">
              {isOpsUser ? 'Operations Portal' : 'Manual Entry SOP'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              {isOpsUser ? 'Ops Executive' : 'Audit Verified'}
            </span>
          </div>
        </div>

        {/* Quick Action Button (Hidden for Ops User to keep experience straightforward) */}
        {!isOpsUser && (
          <div className="p-3">
            <button
              onClick={() => {
                setActiveTab('create');
                onOpenCreateModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Incident</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-neutral-400">
            Operations Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isForbidden = item.requiresAdmin && user.role !== 'ADMIN';

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'create') {
                    onOpenCreateModal();
                  }
                  setActiveTab(item.id);
                }}
                disabled={isForbidden}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#034DA1] text-white shadow-sm'
                      : 'bg-[#034DA1] text-white shadow-sm'
                    : isForbidden
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                    : isDarkMode
                    ? 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#D71920]'
                        : 'text-slate-400 dark:text-neutral-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ml-1.5 ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-white/20 text-white'
                        : isDarkMode
                        ? 'bg-neutral-800 text-neutral-300'
                        : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: SharePoint Excel Sync & User Profile */}
      <div className={`p-3 border-t space-y-2.5 ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
        {/* SharePoint Excel Quick Access Widget */}
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:border-[#034DA1] transition-colors ${
            isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}
          onClick={onOpenSharePointModal}
          title="Open SharePoint Excel Workbook Manager"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <div className="font-bold text-[11px] truncate">TM_NOC_Incident_Tracker.xlsx</div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                SharePoint Live Tables
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Sync
          </span>
        </div>

        {/* User Account Card */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                user.role === 'ADMIN' ? 'bg-[#D71920]' : 'bg-[#034DA1]'
              }`}
            >
              {user.name.charAt(0)}
            </div>
            <div className="truncate min-w-0">
              <div className="text-xs font-bold truncate leading-tight text-slate-900 dark:text-neutral-100">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                {user.roleTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-neutral-800/60 text-[11px]">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[#D71920] hover:underline font-bold cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
