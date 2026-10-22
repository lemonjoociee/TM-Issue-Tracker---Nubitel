import React, { useState } from 'react';
import { AdminSystemConfig, UserSession, UserRole, UserInvitationRecord } from '../types/nocSystem';
import { EmailInvitationModal, InvitedUserData } from './EmailInvitationModal';
import {
  Settings,
  Shield,
  FileSpreadsheet,
  Bell,
  Users,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  RefreshCw,
  Plus,
  Trash2,
  Mail,
  UserPlus,
  Send,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Info,
} from 'lucide-react';

interface NOCAdminPageViewProps {
  currentUser: UserSession;
  config: AdminSystemConfig;
  onUpdateConfig: (newConfig: AdminSystemConfig) => void;
  onTestSharePointConnection: () => void;
  isDarkMode: boolean;
}

export const NOCAdminPageView: React.FC<NOCAdminPageViewProps> = ({
  currentUser,
  config,
  onUpdateConfig,
  onTestSharePointConnection,
  isDarkMode,
}) => {
  // Access check
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#D71920] mx-auto flex items-center justify-center mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">
          This configuration section is restricted to System Administrators. Your role ({currentUser.roleTitle}) does not have administrative privileges.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'sharepoint' | 'reminders' | 'users' | 'teams' | 'vendors'>(
    'users' // Default to users tab so admin immediately sees user management & invite features
  );

  const [formConfig, setFormConfig] = useState<AdminSystemConfig>(() => {
    const sanitizedUsers = (config.authorizedUsers || []).map((u) => {
      if (u.role === 'NOC_USER' || u.team?.includes('Tier') || u.team?.includes('NOC Operations')) {
        return { ...u, department: 'NOC', team: 'NOC' };
      }
      return u;
    });
    return {
      ...config,
      authorizedUsers: sanitizedUsers,
      invitations: config.invitations || [],
    };
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviteNotification, setInviteNotification] = useState<string | null>(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);

  // New item inputs
  const [newTeam, setNewTeam] = useState('');
  const [newSite, setNewSite] = useState('');

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddTeam = () => {
    if (!newTeam.trim()) return;
    const updated = { ...formConfig, teams: [...formConfig.teams, newTeam.trim()] };
    setFormConfig(updated);
    onUpdateConfig(updated);
    setNewTeam('');
  };

  const handleRemoveTeam = (index: number) => {
    const updated = { ...formConfig, teams: formConfig.teams.filter((_, idx) => idx !== index) };
    setFormConfig(updated);
    onUpdateConfig(updated);
  };

  const handleAddSite = () => {
    if (!newSite.trim()) return;
    const updated = { ...formConfig, sites: [...formConfig.sites, newSite.trim()] };
    setFormConfig(updated);
    onUpdateConfig(updated);
    setNewSite('');
  };

  const handleRemoveSite = (index: number) => {
    const updated = { ...formConfig, sites: formConfig.sites.filter((_, idx) => idx !== index) };
    setFormConfig(updated);
    onUpdateConfig(updated);
  };

  const handleToggleUserActive = (userId: string) => {
    const updatedUsers = formConfig.authorizedUsers.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive, isPermitted: !u.isActive } : u
    );
    const updated = { ...formConfig, authorizedUsers: updatedUsers };
    setFormConfig(updated);
    onUpdateConfig(updated);
  };

  const handleSetUserRole = (userId: string, newRole: UserRole) => {
    const updatedUsers = formConfig.authorizedUsers.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          department: newRole === 'NOC_USER' ? 'NOC' : u.department,
          team: newRole === 'NOC_USER' ? 'NOC' : u.team,
        };
      }
      return u;
    });
    const updated = { ...formConfig, authorizedUsers: updatedUsers };
    setFormConfig(updated);
    onUpdateConfig(updated);
    setInviteNotification(`Updated role for user to ${newRole === 'NOC_USER' ? 'NOC' : newRole}`);
    setTimeout(() => setInviteNotification(null), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = formConfig.authorizedUsers.filter((u) => u.id !== userId);
    const updated = { ...formConfig, authorizedUsers: updatedUsers };
    setFormConfig(updated);
    onUpdateConfig(updated);
    setInviteNotification('User removed from authorized access list.');
    setTimeout(() => setInviteNotification(null), 3000);
  };

  // Called when EmailInvitationModal successfully sends an email invitation
  const handleInvitationSuccess = (invited: InvitedUserData) => {
    const existingIndex = formConfig.authorizedUsers.findIndex(
      (u) => u.email.toLowerCase() === invited.email.toLowerCase()
    );

    let updatedUsers = [...formConfig.authorizedUsers];
    if (existingIndex >= 0) {
      // Update existing user with new role and active clearance
      updatedUsers[existingIndex] = {
        ...updatedUsers[existingIndex],
        role: invited.role,
        department: invited.department,
        team: invited.team,
        isActive: true,
        isPermitted: true,
      };
    } else {
      // Add newly invited user
      const newUserId = `USR-${String(updatedUsers.length + 1).padStart(3, '0')}`;
      updatedUsers.push({
        id: newUserId,
        name: invited.name,
        email: invited.email,
        role: invited.role,
        department: invited.department,
        team: invited.team,
        isActive: true,
        isPermitted: true,
      });
    }

    const roleTitleMap: Record<UserRole, string> = {
      NOC_USER: 'NOC',
      OPS_EXECUTIVE: 'Operations Executive & Assurance Lead',
      ADMIN: 'Portal System Administrator',
    };

    const newInviteRecord: UserInvitationRecord = {
      id: `INV-${Date.now()}`,
      name: invited.name,
      email: invited.email,
      role: invited.role,
      roleTitle: roleTitleMap[invited.role] || invited.role,
      department: invited.department,
      team: invited.team,
      invitedBy: `${currentUser.name} (Admin)`,
      invitedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Delivered',
      token: `TM_INV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      customNote: invited.customNote,
    };

    const currentInvites = formConfig.invitations || [];
    const updatedInvites = [newInviteRecord, ...currentInvites];

    const updatedConfig: AdminSystemConfig = {
      ...formConfig,
      authorizedUsers: updatedUsers,
      invitations: updatedInvites,
    };

    setFormConfig(updatedConfig);
    onUpdateConfig(updatedConfig);

    setInviteNotification(
      `Invitation email successfully dispatched to ${invited.email} with pre-assigned role ${roleTitleMap[invited.role]}.`
    );
    setTimeout(() => setInviteNotification(null), 5000);
  };

  const handleResendInvitation = (invite: UserInvitationRecord) => {
    setResendingInviteId(invite.id);
    setTimeout(() => {
      setResendingInviteId(null);
      setInviteNotification(`Invitation email re-dispatched to ${invite.email} via TM SMTP.`);
      setTimeout(() => setInviteNotification(null), 4000);
    }, 600);
  };

  const handleCopyInviteLink = (invite: UserInvitationRecord) => {
    const link = `https://noc-portal.tm.com.my/invite?token=${invite.token}&email=${encodeURIComponent(
      invite.email
    )}&role=${invite.role}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(invite.id);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDeleteInviteRecord = (inviteId: string) => {
    const updatedInvites = (formConfig.invitations || []).filter((i) => i.id !== inviteId);
    const updated = { ...formConfig, invitations: updatedInvites };
    setFormConfig(updated);
    onUpdateConfig(updated);
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors font-medium ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
      : 'bg-white border-slate-300 text-slate-900 focus:border-[#D71920]'
  }`;

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D71920] text-white">ADMIN</span>;
      case 'OPS_EXECUTIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">OPS_EXECUTIVE</span>;
      case 'NOC_USER':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#034DA1] text-white">NOC</span>;
    }
  };

  const formatUserTeam = (team: string, role: UserRole) => {
    if (role === 'NOC_USER' || team?.includes('Tier 2') || team?.includes('NOC Operations')) {
      return 'NOC';
    }
    return team;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notification Banner */}
      {inviteNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{inviteNotification}</span>
          </div>
          <button
            onClick={() => setInviteNotification(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-xs cursor-pointer font-extrabold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              System Administration
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D71920] text-white">
              ADMIN CLEARANCE
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1 font-medium">
            Manage user invitations &amp; role assignments, SharePoint Excel storage, SLA reminder intervals, and system sites.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className="flex border-b border-slate-200 dark:border-neutral-800 px-4 gap-2 overflow-x-auto text-xs font-bold bg-slate-50 dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#034DA1]" />
            <span>User Access &amp; Invitations ({formConfig.authorizedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sharepoint')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sharepoint'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>SharePoint &amp; Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#D71920]" />
            <span>Reminders &amp; Outlook</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teams'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Teams &amp; Sites</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vendors'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Vendors &amp; Hours</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* TAB 1: User Access & Invitations (Primary Request) */}
          {activeTab === 'users' && (
            <div className="space-y-6 text-xs">
              {/* Header with Invite Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-neutral-800">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-sm tracking-tight">
                    Organizational Account Access Management
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-neutral-400 font-medium">
                    Invite new staff via email, pre-assign their role, and control access permissions.
                  </p>
                </div>

                {/* Primary Action: Invite User */}
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#D71920] hover:bg-[#b0141a] text-white text-xs font-black flex items-center justify-center gap-2 shadow hover:shadow-md cursor-pointer transition-all shrink-0"
                >
                  <Mail className="w-4 h-4" />
                  <span>+ Invite People to System</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-neutral-400">Total Users</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formConfig.authorizedUsers.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Active Clearances</div>
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                    {formConfig.authorizedUsers.filter((u) => u.isActive).length}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="text-[11px] font-bold text-[#034DA1] dark:text-blue-400">Invitations Sent</div>
                  <div className="text-lg font-black text-[#034DA1] dark:text-blue-300">
                    {(formConfig.invitations || []).length}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
                  <div className="text-[11px] font-bold text-red-700 dark:text-red-400">Revoked / Locked</div>
                  <div className="text-lg font-black text-red-800 dark:text-red-300">
                    {formConfig.authorizedUsers.filter((u) => !u.isActive).length}
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Authorized Staff Directory ({formConfig.authorizedUsers.length})
                  </h4>
                  <span className="text-[11px] text-slate-600 dark:text-neutral-400">
                    Assign role directly or revoke access clearance
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-neutral-800 border rounded-xl overflow-hidden border-slate-200 dark:border-neutral-800 shadow-sm">
                  {formConfig.authorizedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {u.name}
                          </span>
                          {roleBadge(u.role)}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              u.isActive
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                            }`}
                          >
                            {u.isActive ? 'Active Clearance' : 'Access Revoked'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-neutral-400 font-medium">
                          <strong className="text-slate-900 dark:text-neutral-300">{u.email}</strong> &bull;{' '}
                          {u.role === 'NOC_USER' ? 'NOC' : `${u.department} (${u.team})`}
                        </div>
                      </div>

                      {/* Controls: Role Dropdown, Access Toggle, Remove */}
                      <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
                        {/* Role Selector Dropdown */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-neutral-700">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">
                            Role:
                          </span>
                          <select
                            value={u.role}
                            onChange={(e) => handleSetUserRole(u.id, e.target.value as UserRole)}
                            className="bg-transparent font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                          >
                            <option value="NOC_USER" className="dark:bg-neutral-900 text-slate-900 dark:text-white">
                              NOC
                            </option>
                            <option value="OPS_EXECUTIVE" className="dark:bg-neutral-900 text-slate-900 dark:text-white">
                              Ops Executive (Summary)
                            </option>
                            <option value="ADMIN" className="dark:bg-neutral-900 text-slate-900 dark:text-white">
                              Admin (Full Clearance)
                            </option>
                          </select>
                        </div>

                        {/* Grant / Revoke Access */}
                        <button
                          type="button"
                          onClick={() => handleToggleUserActive(u.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            u.isActive
                              ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.isActive ? 'Revoke Access' : 'Grant Access'}
                        </button>

                        {/* Remove User */}
                        {u.email !== currentUser.email && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                            title="Remove user from authorized list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invitations History Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D71920]" />
                    <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                      Recent Email Invitations &amp; Delivery Log ({(formConfig.invitations || []).length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-neutral-400">
                    Emails dispatched via TM SMTP (System Email: <strong className="text-slate-800 dark:text-neutral-200">izzuldiniee@gmail.com</strong>)
                  </span>
                </div>

                {(!formConfig.invitations || formConfig.invitations.length === 0) ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-neutral-800 text-center text-slate-600 dark:text-neutral-400">
                    No staff invitations dispatched yet. Click <strong>+ Invite People to System</strong> above to invite your first user.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800 border rounded-xl overflow-hidden border-slate-200 dark:border-neutral-800 shadow-sm">
                    {formConfig.invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">{inv.name}</span>
                            <span className="text-xs text-slate-700 dark:text-neutral-400">&lt;{inv.email}&gt;</span>
                            {roleBadge(inv.role)}
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Email Delivered</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-neutral-400">
                            Pre-assigned: <strong className="text-slate-800 dark:text-neutral-300">{inv.role === 'NOC_USER' ? 'NOC' : inv.roleTitle}</strong> &bull; {inv.role === 'NOC_USER' ? 'NOC' : `${inv.department} (${inv.team})`} &bull; Invited {inv.invitedAt} by {inv.invitedBy}
                          </div>
                          {inv.customNote && (
                            <div className="text-[11px] text-slate-600 dark:text-neutral-400 italic">
                              &ldquo;{inv.customNote}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Actions on Invitation */}
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          {/* Resend Email */}
                          <button
                            type="button"
                            onClick={() => handleResendInvitation(inv)}
                            disabled={resendingInviteId === inv.id}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Re-send email invitation"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 text-[#034DA1] dark:text-blue-400 ${resendingInviteId === inv.id ? 'animate-spin' : ''}`} />
                            <span>{resendingInviteId === inv.id ? 'Sending...' : 'Resend Email'}</span>
                          </button>

                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(inv)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 cursor-pointer"
                            title="Copy invitation link"
                          >
                            {copiedToken === inv.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          {/* Delete Invitation Record */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInviteRecord(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SharePoint & Excel Configuration */}
          {activeTab === 'sharepoint' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 mb-1">
                  SharePoint Excel Workbook Path (TABLE 1 to 5)
                </label>
                <input
                  type="text"
                  value={formConfig.sharePointWorkbookPath}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, sharePointWorkbookPath: e.target.value })
                  }
                  className={`${inputClass} font-mono`}
                />
                <span className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1 block">
                  Expected file: <code>TM_NOC_Incident_Tracker.xlsx</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 mb-1">
                  SharePoint Document Library (Attachments)
                </label>
                <input
                  type="text"
                  value={formConfig.sharePointLibraryUrl}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, sharePointLibraryUrl: e.target.value })
                  }
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onTestSharePointConnection}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer text-slate-800 dark:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test SharePoint Connectivity &amp; Lock Status</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Reminders & Power Automate */}
          {activeTab === 'reminders' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 mb-1">
                  Microsoft Power Automate Webhook Endpoint
                </label>
                <input
                  type="text"
                  value={formConfig.powerAutomateEndpoint}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, powerAutomateEndpoint: e.target.value })
                  }
                  className={`${inputClass} font-mono`}
                />
                <span className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1 block">
                  Triggered on incident create, update, assignment, status change, and reminders.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 mb-1">
                  Unresolved Incident Background Check Interval (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={formConfig.reminderCheckIntervalMinutes}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      reminderCheckIntervalMinutes: parseInt(e.target.value) || 60,
                    })
                  }
                  className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-900 font-mono text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-600 dark:text-neutral-400 ml-2">Default: 60 minutes (1 hour)</span>
              </div>

              <div className="border-t border-slate-200 dark:border-neutral-800 pt-3">
                <div className="font-bold text-slate-800 dark:text-white mb-2">
                  Default Reminder Schedule by Priority:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">P1 Critical (Minutes)</label>
                    <input
                      type="number"
                      value={formConfig.reminderSchedule.p1Minutes}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          reminderSchedule: {
                            ...formConfig.reminderSchedule,
                            p1Minutes: parseInt(e.target.value) || 30,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">P2 High (Minutes)</label>
                    <input
                      type="number"
                      value={formConfig.reminderSchedule.p2Minutes}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          reminderSchedule: {
                            ...formConfig.reminderSchedule,
                            p2Minutes: parseInt(e.target.value) || 60,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">P3 Medium (Hours)</label>
                    <input
                      type="number"
                      value={formConfig.reminderSchedule.p3Hours}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          reminderSchedule: {
                            ...formConfig.reminderSchedule,
                            p3Hours: parseInt(e.target.value) || 4,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">P4 Low (Hours)</label>
                    <input
                      type="number"
                      value={formConfig.reminderSchedule.p4Hours}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          reminderSchedule: {
                            ...formConfig.reminderSchedule,
                            p4Hours: parseInt(e.target.value) || 24,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Teams & Sites */}
          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Teams */}
              <div className="space-y-3">
                <div className="font-bold text-slate-800 dark:text-white uppercase">
                  Assigned Operations Teams
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="New team name..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTeam}
                    className="px-3 py-2 rounded-xl bg-[#034DA1] text-white font-bold shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {formConfig.teams.map((t, idx) => (
                    <div
                      key={t}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-neutral-200">{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sites */}
              <div className="space-y-3">
                <div className="font-bold text-slate-800 dark:text-white uppercase">
                  Sites &amp; Regional Hubs
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                    placeholder="New site location..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddSite}
                    className="px-3 py-2 rounded-xl bg-[#034DA1] text-white font-bold shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {formConfig.sites.map((s, idx) => (
                    <div
                      key={s}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-neutral-200">{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSite(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Vendors & Business Hours */}
          {activeTab === 'vendors' && (
            <div className="space-y-4 text-xs">
              <div className="font-bold text-slate-800 dark:text-white uppercase">
                Vendor PIC Directory
              </div>
              <div className="divide-y divide-slate-100 dark:divide-neutral-800 border rounded-xl overflow-hidden border-slate-200 dark:border-neutral-800">
                {formConfig.vendors.map((v) => (
                  <div key={v.name} className="p-3 flex items-center justify-between bg-white dark:bg-neutral-900">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-neutral-400">
                        Email: {v.email} &bull; Contact: {v.contact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-neutral-800">
                <div className="font-bold text-slate-800 dark:text-white mb-2">
                  Operating Hours Profile
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-neutral-200">
                      24x7 Continuous Network Operations Center
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-neutral-400">
                      All days, 00:00 to 23:59 (Malaysia Standard Time)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow hover:shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Email Invitation Modal */}
      <EmailInvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendSuccess={handleInvitationSuccess}
        availableTeams={formConfig.teams}
        availableSites={formConfig.sites}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
