import React, { useState } from 'react';
import { TMLogo } from './TMLogo';
import { UserSession } from './LoginPage';
import {
  UserCheck,
  Shield,
  Plus,
  RefreshCw,
  Mail,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Key,
  ExternalLink,
  Settings,
  Database,
  Lock,
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser?: UserSession;
  onOpenInviteModal: () => void;
  onRefreshSharePoint?: () => void;
  isLiveSyncing?: boolean;
  totalIssuesCount: number;
  isDarkMode?: boolean;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'NOC Tier 2 Engineer' | 'OPS Executive' | 'Portal Administrator' | 'Incident Lead';
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onOpenInviteModal,
  onRefreshSharePoint,
  isLiveSyncing = false,
  totalIssuesCount,
  isDarkMode = true,
}) => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([
    {
      id: 'TM-01824',
      name: 'Izzul Dinie',
      email: 'izzul_a@scicom.com.my',
      role: 'Incident Lead',
      department: 'NOC Tier 2 Operations',
      status: 'Active',
      lastActive: 'Just now',
    },
    {
      id: 'TM-01490',
      name: 'Ahmad Fadzil',
      email: 'ahmad.f@tm.com.my',
      role: 'OPS Executive',
      department: 'Executive Operations & Assurance',
      status: 'Active',
      lastActive: '12 mins ago',
    },
    {
      id: 'TM-00912',
      name: 'Norazlina H.',
      email: 'norazlina.h@tm.com.my',
      role: 'Portal Administrator',
      department: 'TM IT Infrastructure',
      status: 'Active',
      lastActive: '1 hour ago',
    },
    {
      id: 'TM-02411',
      name: 'Mohd Shahril',
      email: 'shahril.m@tm.com.my',
      role: 'NOC Tier 2 Engineer',
      department: 'Network Operations Center',
      status: 'Active',
      lastActive: '3 hours ago',
    },
    {
      id: 'TM-03102',
      name: 'Farah Nadia',
      email: 'farah.n@tm.com.my',
      role: 'OPS Executive',
      department: 'Service Level Assurance',
      status: 'Invited',
      lastActive: 'Pending verification',
    },
  ]);

  const cardBg = isDarkMode
    ? 'bg-[#1e1e24] border-neutral-800'
    : 'bg-white border-neutral-200 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Corporate Admin Header with Official TM Logo */}
      <div className={`${cardBg} rounded-2xl border p-6 transition-colors`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="lg" />
            <div className="border-l border-neutral-300 dark:border-neutral-700 pl-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#D71920] text-white">
                  Corporate Governance
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  Role-Based Access Control &middot; Portal Security
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-[#4A4A4A] dark:text-white mt-1">
                Telekom Malaysia Portal Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenInviteModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#D71920] hover:bg-[#BF151B] active:bg-[#A31015] shadow-md shadow-[#D71920]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Invite Staff (TM Email Template)</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health & Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SharePoint Sync Health */}
        <div className={`${cardBg} rounded-2xl border p-5 transition-colors`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              SharePoint Live Engine
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-base font-bold text-[#4A4A4A] dark:text-white">
            Scicom Cloud Connector
          </div>
          <div className="text-xs text-neutral-500 mt-1 space-y-1">
            <div className="flex justify-between">
              <span>Sync Interval:</span>
              <span className="font-mono font-semibold text-emerald-500">5 seconds (active)</span>
            </div>
            <div className="flex justify-between">
              <span>Synchronized Records:</span>
              <span className="font-mono font-semibold">{totalIssuesCount} incidents</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway:</span>
              <span className="font-mono text-neutral-400">Netlify Serverless</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <button
              onClick={onRefreshSharePoint}
              disabled={isLiveSyncing}
              className="text-xs font-bold text-[#D71920] hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
              <span>{isLiveSyncing ? 'Syncing...' : 'Test Sync Now'}</span>
            </button>
            <a
              href="https://scicommsc-my.sharepoint.com/:x:/g/personal/izzul_a_scicom_com_my/IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY?e=ln7nZo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1"
            >
              <span>Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Identity & SSO Gateway */}
        <div className={`${cardBg} rounded-2xl border p-5 transition-colors`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              TM Enterprise IAM
            </span>
            <Shield className="w-4 h-4 text-[#D71920]" />
          </div>
          <div className="text-base font-bold text-[#4A4A4A] dark:text-white">
            SSO &amp; LDAP Gateway
          </div>
          <div className="text-xs text-neutral-500 mt-1 space-y-1">
            <div className="flex justify-between">
              <span>Security Level:</span>
              <span className="font-semibold text-[#4A4A4A] dark:text-neutral-200">Level 4 Restricted</span>
            </div>
            <div className="flex justify-between">
              <span>Active Sessions:</span>
              <span className="font-mono font-semibold">4 Authorized</span>
            </div>
            <div className="flex justify-between">
              <span>Password Policy:</span>
              <span className="text-emerald-500 font-semibold">Compliant (ISO 27001)</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
            Current User: <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role || 'ADMIN'})
          </div>
        </div>

        {/* Audit & Compliance */}
        <div className={`${cardBg} rounded-2xl border p-5 transition-colors`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Audit Logging
            </span>
            <Database className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-bold text-[#4A4A4A] dark:text-white">
            Audit Trail Active
          </div>
          <div className="text-xs text-neutral-500 mt-1 space-y-1">
            <div className="flex justify-between">
              <span>Retention Period:</span>
              <span className="font-semibold">365 Days</span>
            </div>
            <div className="flex justify-between">
              <span>Tamper Resistance:</span>
              <span className="text-emerald-500 font-semibold">SHA-256 Checksum</span>
            </div>
            <div className="flex justify-between">
              <span>Last Backup:</span>
              <span className="font-mono">Daily Automated</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
            Compliance: Telekom Malaysia Regulatory Standard
          </div>
        </div>
      </div>

      {/* Staff & User Management Table */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden transition-colors`}>
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#4A4A4A] dark:text-white">
              Authorized Operational Personnel ({staffUsers.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Active NOC engineers, operations executives, and system administrators
            </p>
          </div>

          <button
            onClick={onOpenInviteModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#D71920] hover:bg-[#BF151B] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Invite Staff</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name &amp; Corporate Email</th>
                <th className="py-3 px-4">Operational Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {staffUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-500">
                    {u.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#4A4A4A] dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{u.department}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-400">{u.lastActive}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={onOpenInviteModal}
                      className="text-xs font-semibold text-[#D71920] hover:underline cursor-pointer"
                    >
                      Resend Invite
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
