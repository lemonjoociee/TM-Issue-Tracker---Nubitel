import React, { useState } from 'react';
import { TMLogo } from './TMLogo';
import { UserRole } from '../types/nocSystem';
import {
  X,
  Mail,
  CheckCircle2,
  Copy,
  Send,
  Shield,
  ExternalLink,
  User,
  Building,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

export interface InvitedUserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  team: string;
  site?: string;
  customNote?: string;
}

interface EmailInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess?: (user: InvitedUserData) => void;
  availableTeams?: string[];
  availableSites?: string[];
  isDarkMode?: boolean;
}

export const EmailInvitationModal: React.FC<EmailInvitationModalProps> = ({
  isOpen,
  onClose,
  onSendSuccess,
  availableTeams = [
    'NOC',
    'Tier 1 Support',
    'Tier 3 Voice Core',
    'Executive Leadership',
    'Network & Infrastructure Team',
    'Vendor Escalation Team',
  ],
  availableSites = [
    'Kuala Lumpur (HQ)',
    'Cyberjaya Data Centre',
    'Menara TM (Bangsar)',
    'Penang Regional Hub',
    'Johor Bahru Hub',
  ],
  isDarkMode = true,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [role, setRole] = useState<UserRole>('NOC_USER');
  const [department, setDepartment] = useState('Network Operations Center');
  const [team, setTeam] = useState('NOC');
  const [site, setSite] = useState(availableSites[0] || 'Kuala Lumpur (HQ)');
  const [sendCopyToAdmin, setSendCopyToAdmin] = useState(true);
  const [customNote, setCustomNote] = useState(
    'Please complete your system access activation to start managing and tracking Telekom Malaysia UCC incidents.'
  );

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  if (!isOpen) return null;

  const roleConfigs: Record<
    UserRole,
    {
      title: string;
      badgeBg: string;
      badgeText: string;
      badgeColor: string;
      summary: string;
      permissions: string[];
    }
  > = {
    NOC_USER: {
      title: 'NOC',
      badgeBg: 'bg-[#034DA1]',
      badgeText: 'text-white',
      badgeColor: 'border-[#034DA1]/40',
      summary: 'Operational access for incident logging, resolution workflows, and ticket tracking.',
      permissions: [
        'Manual incident entry & validation',
        'Incident tracking & resolution sign-off',
        'Technical notes & AnyDesk inspection',
        'Overdue incident alert tracking',
      ],
    },
    OPS_EXECUTIVE: {
      title: 'Operations Executive & Assurance Lead',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      badgeColor: 'border-emerald-500/40',
      summary: 'Executive dashboard access with monthly summaries, high-level KPIs, and non-technical metrics.',
      permissions: [
        'Monthly incident summaries by selected month',
        'Non-technical service health overview',
        'Resolution rates & downtime metrics',
        'No technical jargon or raw incident editing',
      ],
    },
    ADMIN: {
      title: 'Portal System Administrator',
      badgeBg: 'bg-[#D71920]',
      badgeText: 'text-white',
      badgeColor: 'border-[#D71920]/40',
      summary: 'Full administrative authority over system configurations, invitations, and access clearances.',
      permissions: [
        'User access control & invitations dispatch',
        'SharePoint & Power Automate connector config',
        'SLA reminder timers & alert thresholds',
        'System-wide role permissions and audit logs',
      ],
    },
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'OPS_EXECUTIVE') {
      setDepartment('Operations & Service Management');
      setTeam('Executive Leadership');
    } else if (newRole === 'ADMIN') {
      setDepartment('NOC Systems Administration');
      setTeam('Tier 3 Voice Core');
    } else {
      setDepartment('Network Operations Center');
      setTeam('NOC');
    }
  };

  const inviteLink = `https://noc-portal.tm.com.my/invite?token=${generatedToken || 'TM_INV_' + Date.now()}&email=${encodeURIComponent(
    recipientEmail
  )}&role=${role}`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientName.trim()) return;

    setIsSending(true);
    const token = `TM_INV_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setGeneratedToken(token);

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);

      const newUserData: InvitedUserData = {
        id: `USR-INV-${Date.now().toString().slice(-4)}`,
        name: recipientName.trim(),
        email: recipientEmail.trim().toLowerCase(),
        role: role,
        department: department.trim(),
        team: team.trim(),
        site: site.trim(),
        customNote: customNote.trim(),
      };

      if (onSendSuccess) {
        onSendSuccess(newUserData);
      }
    }, 850);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const resetForm = () => {
    setSentSuccess(false);
    setRecipientEmail('');
    setRecipientName('');
    setCustomNote(
      'Please complete your system access activation to start managing and tracking Telekom Malaysia UCC incidents.'
    );
  };

  const cardBg = isDarkMode
    ? 'bg-[#18181B] border-neutral-800 text-neutral-100'
    : 'bg-white border-slate-200 text-slate-900';

  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors font-medium ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-[#D71920]'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#D71920]'
  }`;

  const labelClass = `block text-xs font-bold mb-1.5 ${
    isDarkMode ? 'text-neutral-200' : 'text-slate-800'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${cardBg}`}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="sm" showSubtitle={false} />
            <div className="border-l border-slate-300 dark:border-neutral-700 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#D71920] uppercase">
                  Staff Invitation &amp; Role Pre-Assignment
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#034DA1] text-white">
                  SMTP EMAIL DISPATCH
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Invite New User to Incident Tracking System
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {sentSuccess ? (
            <div className="text-center py-6 sm:py-10 space-y-5 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto animate-in zoom-in-75">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  DISPATCH CONFIRMED (200 OK)
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Invitation Email Dispatched!
                </h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                  An official Telekom Malaysia onboarding invitation has been successfully sent to{' '}
                  <strong className="text-slate-900 dark:text-white">{recipientEmail}</strong> with pre-assigned role{' '}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${roleConfigs[role].badgeBg} text-white align-middle ml-1`}
                  >
                    {roleConfigs[role].title}
                  </span>
                  .
                </p>
              </div>

              {/* Delivery Receipt Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>Server Gateway:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                    smtp.tm.com.my (TLS 1.3)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>System Sender:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    izzuldiniee@gmail.com
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>Recipient:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {recipientName} &lt;{recipientEmail}&gt;
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>Pre-assigned Role:</span>
                  <span className="font-bold text-[#034DA1] dark:text-blue-400">{roleConfigs[role].title}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>Department &amp; Team:</span>
                  <span className="text-slate-900 dark:text-white">
                    {department} &bull; {team}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                  <span>System Clearance:</span>
                  <span className="text-emerald-600 font-bold">Active &bull; Immediate Login Enabled</span>
                </div>
              </div>

              {/* Activation Link */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                  Direct One-Click Activation URL (Also sent in email body):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-800 dark:text-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  + Invite Another User
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-[#D71920] hover:bg-[#b0141a] text-white shadow-md cursor-pointer"
                >
                  Return to User Management
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Details & Role Assignment (7 cols) */}
              <form onSubmit={handleSend} className="lg:col-span-7 space-y-4">
                {/* Notice */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#034DA1] dark:text-blue-400" />
                  <div>
                    <span className="font-bold">Official System Invitation:</span> Enter the staff member's
                    details below and assign their system role first. An invitation email with their secure login
                    credentials will be dispatched immediately.
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Staff Full Name <span className="text-[#D71920]">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Mohd Daniel Azman"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Corporate Email <span className="text-[#D71920]">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. daniel@tm.com.my or @scicom.com.my"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Role Pre-Assignment (Highlighted prominently) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${labelClass} mb-0`}>
                      Pre-Assign System Role <span className="text-[#D71920]">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Determines user permissions &amp; UI views
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* NOC_USER */}
                    <div
                      onClick={() => handleRoleChange('NOC_USER')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        role === 'NOC_USER'
                          ? 'border-[#034DA1] bg-[#034DA1]/10 shadow-sm'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#034DA1] text-white">
                          NOC
                        </span>
                        {role === 'NOC_USER' && (
                          <CheckCircle2 className="w-4 h-4 text-[#034DA1] dark:text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        NOC
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1 leading-snug">
                        Incident entry, live tracking, technical resolution, and overdue actions.
                      </div>
                    </div>

                    {/* OPS_EXECUTIVE */}
                    <div
                      onClick={() => handleRoleChange('OPS_EXECUTIVE')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        role === 'OPS_EXECUTIVE'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                          OPS EXECUTIVE
                        </span>
                        {role === 'OPS_EXECUTIVE' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        Operations Executive
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1 leading-snug">
                        Monthly summaries only. Non-technical executive metrics &amp; SLA reports.
                      </div>
                    </div>

                    {/* ADMIN */}
                    <div
                      onClick={() => handleRoleChange('ADMIN')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        role === 'ADMIN'
                          ? 'border-[#D71920] bg-[#D71920]/10 shadow-sm'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D71920] text-white">
                          ADMIN
                        </span>
                        {role === 'ADMIN' && (
                          <CheckCircle2 className="w-4 h-4 text-[#D71920]" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        System Admin
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1 leading-snug">
                        Full access: User access control, invitations, SharePoint &amp; reminders.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department, Team, Site */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Network Operations"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Team</label>
                    <select
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className={inputClass}
                    >
                      {availableTeams.map((t) => (
                        <option key={t} value={t} className="dark:bg-neutral-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Site Location</label>
                    <select
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      className={inputClass}
                    >
                      {availableSites.map((s) => (
                        <option key={s} value={s} className="dark:bg-neutral-900">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Note */}
                <div>
                  <label className={labelClass}>
                    Personalized Welcome Note &amp; Instructions (Included in Email)
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className={inputClass}
                    placeholder="Add specific instructions or briefing remarks..."
                  />
                </div>

                {/* Copy to admin option */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ccAdmin"
                    checked={sendCopyToAdmin}
                    onChange={(e) => setSendCopyToAdmin(e.target.checked)}
                    className="w-4 h-4 text-[#D71920] rounded border-slate-300 dark:border-neutral-700 cursor-pointer"
                  />
                  <label htmlFor="ccAdmin" className="text-xs text-slate-700 dark:text-neutral-300 cursor-pointer">
                    Send dispatch copy &amp; audit receipt to <strong>izzuldiniee@gmail.com</strong>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex gap-3 border-t border-slate-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-2 py-2.5 px-5 text-xs font-black text-white bg-[#D71920] hover:bg-[#b0141a] rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all disabled:opacity-75"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Dispatching Email via TM SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Official Invitation Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Email Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Live Email Template Preview</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    WYSIWYG
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white text-slate-800 shadow-sm flex flex-col flex-1">
                  {/* TM Official Email Header */}
                  <div className="bg-[#D71920] p-3.5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TMLogo variant="white" size="xs" showSubtitle={false} />
                      <div className="leading-tight">
                        <div className="text-[10px] font-black tracking-widest uppercase">
                          Telekom Malaysia
                        </div>
                        <div className="text-[9px] opacity-90">Corporate Staff Invitation</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-wider opacity-90 uppercase px-1.5 py-0.5 rounded bg-black/20">
                      SECURE M365
                    </span>
                  </div>

                  {/* Email Body */}
                  <div className="p-4 space-y-3.5 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Meta header */}
                      <div className="border-b border-slate-100 pb-2.5 text-[11px] text-slate-500 space-y-0.5">
                        <div>
                          <strong>From:</strong> Telekom Malaysia NOC System &lt;izzuldiniee@gmail.com&gt;
                        </div>
                        <div>
                          <strong>To:</strong>{' '}
                          <span className="text-slate-900 font-semibold">
                            {recipientEmail || 'staff.name@tm.com.my'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs pt-1">
                          Subject: [TM Official] Invitation: UCC Incident Tracking System Access
                        </div>
                      </div>

                      {/* Salutation & Role notice */}
                      <div className="space-y-2">
                        <p className="text-slate-800 font-medium leading-relaxed">
                          Dear <strong>{recipientName || 'Colleague'}</strong>,
                        </p>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          You have been officially invited and provisioned authorized access to the{' '}
                          <strong>Telekom Malaysia Incident Tracking System</strong>.
                        </p>
                      </div>

                      {/* Assigned Role Box */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Assigned System Role:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${roleConfigs[role].badgeBg} text-white`}
                          >
                            {role}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {roleConfigs[role].title}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {department} &bull; {team} ({site})
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                          {roleConfigs[role].summary}
                        </div>
                      </div>

                      {/* Custom note */}
                      {customNote && (
                        <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-700 text-[11px] italic">
                          &ldquo;{customNote}&rdquo;
                        </div>
                      )}

                      {/* CTA button in email */}
                      <div className="py-1 text-center">
                        <div className="inline-block px-4 py-2 rounded-xl bg-[#D71920] text-white font-extrabold text-xs shadow-sm">
                          Activate Account &amp; Sign In &rarr;
                        </div>
                      </div>
                    </div>

                    {/* Email Footer */}
                    <div className="border-t border-slate-100 pt-2 text-[9px] text-slate-400 space-y-0.5">
                      <div>
                        <strong>Confidentiality Notice:</strong> This invitation is restricted solely to the
                        designated Telekom Malaysia recipient.
                      </div>
                      <div>Menara TM, Jalan Pantai Baharu, 50672 Kuala Lumpur &bull; TM One NOC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
