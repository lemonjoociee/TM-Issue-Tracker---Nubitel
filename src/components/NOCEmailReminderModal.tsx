import React, { useState } from 'react';
import { Incident, UserSession } from '../types/nocSystem';
import { generateEmailPayload, calculateIncidentAge, isIncidentOverdue } from '../services/notificationService';
import {
  Mail,
  Send,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  FileSpreadsheet,
} from 'lucide-react';

interface NOCEmailReminderModalProps {
  incident: Incident;
  currentUser: UserSession;
  onSendReminder: (incident: Incident, customSubject: string, customBody: string, recipients: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const NOCEmailReminderModal: React.FC<NOCEmailReminderModalProps> = ({
  incident,
  currentUser,
  onSendReminder,
  onClose,
  isDarkMode,
}) => {
  const defaultPayload = generateEmailPayload('Reminder', incident);
  const age = calculateIncidentAge(incident.createdDateTime);
  const overdue = isIncidentOverdue(incident);

  const [recipients, setRecipients] = useState(
    defaultPayload.recipient || `${incident.assignedPersonEmail}, tmnoc@scicom.com.my`
  );
  const [subject, setSubject] = useState(defaultPayload.subject);
  const [body, setBody] = useState(defaultPayload.body);
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      onSendReminder(incident, subject, body, recipients);
      setIsSending(false);
      onClose();
    }, 400);
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
      : 'bg-white border-slate-300 text-slate-900 focus:border-[#D71920]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto ${cardBg}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D71920]/10 text-[#D71920] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Email Notification Reminder
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-[#D71920] text-white">
                  {incident.incidentId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Automated reminder for ongoing incident &bull; Sent to authorized NOC mailbox &amp; assignees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Pill Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-neutral-900/40 border-b border-slate-200 dark:border-neutral-800 flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">Status: </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{incident.status}</span>
          </div>
          <div>
            <span className="text-slate-400">Priority: </span>
            <span className="font-bold text-[#D71920]">{incident.priority}</span>
          </div>
          <div>
            <span className="text-slate-400">Age: </span>
            <span className="font-mono font-semibold">{age}</span>
          </div>
          <div>
            <span className="text-slate-400">Next Follow-up: </span>
            <span className={`font-mono font-semibold ${overdue ? 'text-red-500 font-bold' : ''}`}>
              {incident.nextFollowUpDateTime} {overdue ? '(Overdue)' : ''}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Syncs to SharePoint</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Recipients (NOC Credentials &amp; Stakeholders)
            </label>
            <input
              type="text"
              required
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="e.g. tmnoc@scicom.com.my, engineer@scicom.my"
              className={inputClass}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Comma-separated email addresses. Default includes NOC mailbox and assigned engineer.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Email Body (Official TM NOC Reminder Template)
            </label>
            <textarea
              required
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${inputClass} font-mono text-[11px] leading-relaxed`}
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This email notification reminder will be delivered and permanently recorded in Table 4 (<strong>NotificationHistory</strong>) of the SharePoint Excel workbook. Reminders continue at the configured frequency (<strong>{incident.reminderFrequency}</strong>) until marked Resolved.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#D71920] hover:bg-[#b01319] text-white flex items-center gap-1.5 shadow-sm shadow-[#D71920]/20 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Email Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
