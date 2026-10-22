import React, { useState } from 'react';
import {
  Incident,
  IncidentHistory,
  AttachmentRecord,
  NotificationRecord,
  IncidentStatus,
  UserSession,
} from '../types/nocSystem';
import { isIncidentOverdue, calculateIncidentAge } from '../services/notificationService';
import {
  X,
  FileSpreadsheet,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Mail,
  History,
  Edit,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Send,
  Building,
  Server,
  Layers,
  Phone,
  RotateCcw,
  Users,
} from 'lucide-react';

interface NOCIncidentDetailModalProps {
  incident: Incident;
  histories: IncidentHistory[];
  attachments: AttachmentRecord[];
  notifications: NotificationRecord[];
  currentUser: UserSession;
  initialTab?: string;
  onClose: () => void;
  onOpenResolveModal: (incident: Incident) => void;
  onOpenReminderModal?: (incident: Incident) => void;
  onAddProgressUpdate: (incidentId: string, updateText: string, newFollowUp?: string) => void;
  onChangeStatus: (incidentId: string, newStatus: IncidentStatus, remarks: string) => void;
  onChangeAssignment: (incidentId: string, newPerson: string, newTeam: string, remarks: string) => void;
  onReopenIncident: (incidentId: string, remarks: string) => void;
  isDarkMode: boolean;
}

export const NOCIncidentDetailModal: React.FC<NOCIncidentDetailModalProps> = ({
  incident,
  histories,
  attachments,
  notifications,
  currentUser,
  initialTab = 'overview',
  onClose,
  onOpenResolveModal,
  onOpenReminderModal,
  onAddProgressUpdate,
  onChangeStatus,
  onChangeAssignment,
  onReopenIncident,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resolution' | 'attachments' | 'notifications' | 'history'>(
    initialTab === 'history' ? 'history' : 'overview'
  );

  // Sub-modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateFollowUpDate, setUpdateFollowUpDate] = useState(
    incident.nextFollowUpDateTime.split(' ')[0]
  );
  const [updateFollowUpTime, setUpdateFollowUpTime] = useState(
    incident.nextFollowUpDateTime.split(' ')[1] || '16:00'
  );

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>(incident.status);
  const [statusRemarks, setStatusRemarks] = useState('');

  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenRemarks, setReopenRemarks] = useState('');

  const overdue = isIncidentOverdue(incident);
  const age = calculateIncidentAge(incident.createdDateTime);

  // Filter items belonging to this incident
  const incidentHistories = histories.filter((h) => h.incidentId === incident.incidentId);
  const incidentAttachments = attachments.filter((a) => a.incidentId === incident.incidentId);
  const incidentNotifications = notifications.filter((n) => n.incidentId === incident.incidentId);

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    onAddProgressUpdate(
      incident.incidentId,
      updateText.trim(),
      `${updateFollowUpDate} ${updateFollowUpTime}`
    );
    setIsUpdateModalOpen(false);
    setUpdateText('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus === 'Resolved') {
      setIsStatusModalOpen(false);
      onOpenResolveModal(incident);
      return;
    }
    onChangeStatus(incident.incidentId, targetStatus, statusRemarks.trim() || `Status updated to ${targetStatus}`);
    setIsStatusModalOpen(false);
    setStatusRemarks('');
  };

  const handleSaveReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenRemarks.trim()) return;
    onReopenIncident(incident.incidentId, reopenRemarks.trim());
    setIsReopenModalOpen(false);
    setReopenRemarks('');
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const subCardBg = isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden ${cardBg}`}>
        {/* Top Header Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#034DA1] text-white flex items-center justify-center font-bold text-sm shrink-0">
              NOC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-[#034DA1] dark:text-blue-400">
                  {incident.incidentId}
                </span>
                <span className="text-xs font-mono text-slate-400">({incident.callId})</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                    incident.priority === 'P1'
                      ? 'bg-red-600 text-white'
                      : incident.priority === 'P2'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {incident.priority}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                  {incident.status}
                </span>
                {overdue && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D71920] text-white font-mono">
                    Overdue
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                {incident.issueTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 px-5 gap-2 overflow-x-auto text-xs font-bold bg-white dark:bg-[#1C1C1F]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
          >
            Incident Overview
          </button>

          {(incident.status === 'Resolved' || incident.status === 'Closed' || incident.resolutionSummary) && (
            <button
              onClick={() => setActiveTab('resolution')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'resolution'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resolution Details</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachments ({incidentAttachments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Log ({incidentNotifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#034DA1] text-[#034DA1] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Timeline ({incidentHistories.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Incident Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner Alert */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border ${subCardBg}`}>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Next Follow-up</div>
                  <div className={`font-mono text-xs font-bold mt-0.5 ${overdue ? 'text-red-600' : 'text-slate-800 dark:text-neutral-200'}`}>
                    {incident.nextFollowUpDateTime}
                  </div>
                  <div className="text-[10px] text-slate-400">{incident.reminderFrequency}</div>
                </div>

                <div className={`p-3 rounded-xl border ${subCardBg}`}>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Incident Age</div>
                  <div className="font-mono text-xs font-bold mt-0.5 text-slate-800 dark:text-neutral-200">
                    {age}
                  </div>
                  <div className="text-[10px] text-slate-400">Since {incident.createdDateTime}</div>
                </div>

                <div className={`p-3 rounded-xl border ${subCardBg}`}>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Team</div>
                  <div className="text-xs font-bold mt-0.5 text-[#034DA1] dark:text-blue-400 truncate flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>All NOC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Everyone helps this issue</div>
                </div>

                <div className={`p-3 rounded-xl border ${subCardBg}`}>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Customer &amp; Site</div>
                  <div className="text-xs font-bold mt-0.5 text-slate-800 dark:text-neutral-200 truncate">
                    {incident.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{incident.siteLocation}</div>
                </div>
              </div>

              {/* Latest Update Box */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#034DA1] dark:text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Latest Progress Update</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Updated: {incident.lastUpdatedDateTime} by {incident.lastUpdatedBy}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-neutral-200 leading-relaxed font-medium">
                  {incident.latestUpdate || 'No status updates logged yet.'}
                </p>
              </div>

              {/* Grid of Sections: Reporter, Service, Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Reporter & User */}
                <div className={`p-4 rounded-xl border ${subCardBg} space-y-2.5`}>
                  <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-2 border-slate-200 dark:border-neutral-800">
                    Reporter &amp; User Contact Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Reported By</span>
                      <span className="font-bold text-slate-800 dark:text-neutral-200">{incident.reportedBy}</span>
                      <div className="text-slate-500 text-[11px]">{incident.reporterContactNumber}</div>
                      <div className="text-slate-500 text-[11px] truncate">{incident.reporterEmail}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Impacted User</span>
                      <span className="font-bold text-slate-800 dark:text-neutral-200">{incident.userName}</span>
                      <div className="text-slate-500 text-[11px]">{incident.userContactNumber}</div>
                      <div className="text-slate-500 text-[11px] truncate">{incident.userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Technical Environment */}
                <div className={`p-4 rounded-xl border ${subCardBg} space-y-2.5`}>
                  <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-2 border-slate-200 dark:border-neutral-800">
                    Technical Environment &amp; Channels
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Affected Channels</span>
                      <span className="font-bold text-slate-800 dark:text-neutral-200">
                        {incident.systemChannelAffected.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Service &amp; App</span>
                      <span className="font-bold text-slate-800 dark:text-neutral-200">{incident.serviceName}</span>
                      <div className="text-slate-500 text-[11px]">{incident.applicationName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Work / Network Mode</span>
                      <span className="font-medium text-slate-700 dark:text-neutral-300">
                        {incident.workLocation} &bull; {incident.networkConnection}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vendor &amp; TAC PIC</span>
                      <span className="font-medium text-slate-700 dark:text-neutral-300">
                        {incident.vendorName} ({incident.vendorPIC})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Issue Scope */}
              <div className={`p-4 rounded-xl border ${subCardBg} space-y-3 text-xs`}>
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-2 border-slate-200 dark:border-neutral-800">
                  Issue Description &amp; Troubleshooting Performed
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">Full Issue Description</span>
                  <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed text-slate-800 dark:text-neutral-200 font-medium">
                    {incident.issueDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Error Message Displayed</span>
                    <span className="font-mono text-slate-700 dark:text-neutral-300">{incident.errorMessage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Issue Behavior / Occurred</span>
                    <span className="font-medium text-slate-700 dark:text-neutral-300">
                      {incident.issueBehavior} &bull; {incident.issueOccurredDateTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Users Affected</span>
                    <span className="font-medium text-slate-700 dark:text-neutral-300">{incident.usersAffected}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">Troubleshooting Performed</span>
                  <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed text-slate-700 dark:text-neutral-300">
                    {incident.troubleshootingPerformed || 'None recorded yet.'}
                  </p>
                </div>

                {/* Section E Telephony info */}
                <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inbound Call ID</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-neutral-300">{incident.inboundCallId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer Number</span>
                    <span className="font-mono text-slate-700 dark:text-neutral-300">{incident.inboundCustomerNumberANI}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inbound Timestamp</span>
                    <span className="text-slate-700 dark:text-neutral-300">{incident.inboundCallTimestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inbound DNIS</span>
                    <span className="font-mono text-slate-700 dark:text-neutral-300">{incident.inboundDNIS}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">IVR Outcome</span>
                    <span className="text-slate-700 dark:text-neutral-300">{incident.inboundIVROutcome}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Resolution Details */}
          {activeTab === 'resolution' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Resolution Record &amp; User Confirmation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-emerald-500/20">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Resolved By</span>
                    <span className="font-bold text-slate-900 dark:text-white">{incident.resolvedBy || 'NOC Engineer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Resolution Timestamp</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{incident.resolvedDateTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">User Confirmation</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {incident.userConfirmation} ({incident.confirmationMethod})
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Resolution Summary</span>
                  <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed font-semibold text-slate-800 dark:text-neutral-200">
                    {incident.resolutionSummary || 'No summary entered.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Action Taken</span>
                  <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed text-slate-700 dark:text-neutral-300">
                    {incident.resolutionAction || 'No action details entered.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Root Cause</span>
                  <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed text-slate-700 dark:text-neutral-300">
                    {incident.rootCause || 'No root cause entered.'}
                  </p>
                </div>

                {incident.finalRemarks && (
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-1">Final Remarks</span>
                    <p className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 leading-relaxed text-slate-700 dark:text-neutral-300">
                      {incident.finalRemarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Attachments (Section 10 Table 3) */}
          {activeTab === 'attachments' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                    SharePoint Document Library Attachments
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Target Library: <code>https://scicom.sharepoint.com/sites/tmnoc/Attachments/{incident.incidentId}/</code>
                  </p>
                </div>
              </div>

              {incidentAttachments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No supporting documents uploaded for this incident.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incidentAttachments.map((att) => (
                    <div
                      key={att.attachmentId}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${subCardBg}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate" title={att.fileName}>
                            {att.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {att.fileSize} &bull; Uploaded {att.uploadedDateTime} by {att.uploadedBy}
                          </div>
                        </div>
                      </div>

                      <a
                        href={att.sharePointFileURL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulating SharePoint Open File:\n${att.sharePointFileURL}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-xs font-bold text-[#034DA1] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-1 shrink-0"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Notification History (Section 10 Table 4 & Section 11) */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                  Outlook Email Notification Log (Power Automate)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Recorded in TABLE 4: NotificationHistory in SharePoint Excel
                </p>
              </div>

              {incidentNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No automated email notifications dispatched yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {incidentNotifications.map((notif) => (
                    <div
                      key={notif.notificationId}
                      className={`p-4 rounded-xl border space-y-2 ${subCardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#034DA1] text-white font-bold">
                            {notif.notificationType}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                            {notif.notificationId}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {notif.sentDateTime} &bull; <strong className="text-emerald-600">{notif.deliveryStatus}</strong>
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white">
                        {notif.emailSubject}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        <strong>Recipients:</strong> {notif.recipient}
                      </div>

                      <pre className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-slate-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {notif.emailBody}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Activity Timeline (Section 9 & Section 10 Table 2) */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                  Complete Activity History Timeline
                </h3>
                <p className="text-[11px] text-slate-400">
                  TABLE 2: IncidentHistory. Permanent audit log with date, time, and user attribution.
                </p>
              </div>

              {incidentHistories.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No modifications logged for this record.
                </div>
              ) : (
                <div className="relative border-l-2 border-[#034DA1]/30 ml-4 pl-6 space-y-6">
                  {incidentHistories.map((h) => (
                    <div key={h.historyId} className="relative group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#034DA1] ring-4 ring-white dark:ring-[#1C1C1F]" />

                      <div className={`p-4 rounded-xl border ${subCardBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                              {h.actionType}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {h.fieldChanged}: {h.previousValue} &rarr; <span className="text-[#034DA1] dark:text-blue-400">{h.newValue}</span>
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {h.updatedDateTime}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
                          {h.remarks}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono pt-1">
                          Action by: <strong>{h.updatedBy}</strong> &bull; Ref: {h.historyId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Bar (Section 9 Requirement) */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                isDarkMode ? 'border-neutral-700 text-neutral-300 hover:text-white' : 'border-slate-300 text-slate-700 hover:text-black'
              }`}
            >
              &larr; Return to Incident List
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Add Progress Update */}
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Progress Update</span>
            </button>

            {/* Change Status */}
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isDarkMode ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800' : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>

            {/* Send Reminder Email */}
            {incident.status !== 'Resolved' && incident.status !== 'Closed' && onOpenReminderModal && (
              <button
                onClick={() => onOpenReminderModal(incident)}
                className="px-3.5 py-2 rounded-xl border border-[#D71920]/40 text-[#D71920] hover:bg-[#D71920]/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Send notification reminder email to assigned NOC credentials"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Reminder Email</span>
              </button>
            )}

            {/* Mark as Resolved */}
            {incident.status !== 'Resolved' && incident.status !== 'Closed' && (
              <button
                onClick={() => onOpenResolveModal(incident)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Resolved</span>
              </button>
            )}

            {/* Reopen Incident */}
            {(incident.status === 'Resolved' || incident.status === 'Closed') && (
              <button
                onClick={() => setIsReopenModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Incident</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Modal: Add Progress Update */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardBg}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-3">
              Add Progress Update
            </h3>
            <form onSubmit={handleSaveUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Progress Description / Latest Investigation Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Detail results of troubleshooting, vendor communication, or dispatch..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={updateFollowUpDate}
                    onChange={(e) => setUpdateFollowUpDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Next Follow-up Time
                  </label>
                  <input
                    type="time"
                    value={updateFollowUpTime}
                    onChange={(e) => setUpdateFollowUpTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#034DA1] text-white text-xs font-bold cursor-pointer"
                >
                  Save Progress Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Change Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardBg}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-3">
              Change Incident Status
            </h3>
            <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Target Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                >
                  <option value="New">New</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Pending User">Pending User</option>
                  <option value="Pending Vendor">Pending Vendor</option>
                  <option value="Pending Internal Team">Pending Internal Team</option>
                  <option value="Resolved">Resolved (Requires Confirmation Dialog)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Reason / Remarks for Status Change
                </label>
                <input
                  type="text"
                  required
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Awaiting packet capture from customer..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#034DA1] text-white text-xs font-bold cursor-pointer"
                >
                  Apply Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Reopen Incident */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardBg}`}>
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase mb-3 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>Reopen Incident</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-3">
              This will change the status to <strong>Reopened</strong> and reactivate unresolved reminder notifications.
            </p>
            <form onSubmit={handleSaveReopen} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Reason for Reopening <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reopenRemarks}
                  onChange={(e) => setReopenRemarks(e.target.value)}
                  placeholder="Explain recurrence, additional user reports, or faulty verification..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsReopenModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
