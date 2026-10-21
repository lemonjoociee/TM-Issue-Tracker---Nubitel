import React, { useState } from 'react';
import {
  Incident,
  UserSession,
  UserConfirmationType,
  ConfirmationMethodType,
} from '../types/nocSystem';
import {
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface NOCResolutionModalProps {
  incident: Incident;
  currentUser: UserSession;
  onConfirmResolution: (resolutionData: {
    resolutionSummary: string;
    resolutionAction: string;
    rootCause: string;
    resolvedBy: string;
    resolvedDateTime: string;
    userConfirmation: UserConfirmationType;
    confirmationMethod: ConfirmationMethodType;
    finalRemarks: string;
  }) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const NOCResolutionModal: React.FC<NOCResolutionModalProps> = ({
  incident,
  currentUser,
  onConfirmResolution,
  onClose,
  isDarkMode,
}) => {
  const now = new Date();
  const currentTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [resolutionSummary, setResolutionSummary] = useState(
    incident.resolutionSummary || ''
  );
  const [resolutionAction, setResolutionAction] = useState(
    incident.resolutionAction || ''
  );
  const [rootCause, setRootCause] = useState(incident.rootCause || '');
  const [resolvedBy, setResolvedBy] = useState(currentUser.name);
  const [resolvedDateTime, setResolvedDateTime] = useState(currentTimestamp);
  const [userConfirmation, setUserConfirmation] = useState<UserConfirmationType>(
    incident.userConfirmation || 'Confirmed Resolved'
  );
  const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethodType>(
    incident.confirmationMethod || 'Email'
  );
  const [finalRemarks, setFinalRemarks] = useState(incident.finalRemarks || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resolutionSummary.trim()) {
      setErrorMsg('Resolution Summary is mandatory before marking as Resolved.');
      return;
    }
    if (!resolutionAction.trim()) {
      setErrorMsg('Resolution Action Taken is mandatory.');
      return;
    }
    if (!rootCause.trim()) {
      setErrorMsg('Root Cause analysis is mandatory.');
      return;
    }

    onConfirmResolution({
      resolutionSummary: resolutionSummary.trim(),
      resolutionAction: resolutionAction.trim(),
      rootCause: rootCause.trim(),
      resolvedBy: resolvedBy.trim(),
      resolvedDateTime,
      userConfirmation,
      confirmationMethod,
      finalRemarks: finalRemarks.trim(),
    });
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors font-medium ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-emerald-500'
      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${cardBg}`}>
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold leading-tight">Mandatory Resolution Confirmation</h2>
              <p className="text-xs text-emerald-100">
                {incident.incidentId} &bull; {incident.customerName} &bull; {incident.priority}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-700 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mandatory Confirmation Notice */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>“Please confirm that all necessary checks have been completed and the issue has been resolved.”</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D71920]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Resolution Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="State concise technical outcome and verification result..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Resolution Action Taken <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
              placeholder="List specific actions taken (e.g. cable replaced, configuration reloaded, service restarted)..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Root Cause Analysis <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Underlying root cause that originated the degradation or failure..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Resolved By
              </label>
              <input
                type="text"
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Resolution Date &amp; Time
              </label>
              <input
                type="text"
                value={resolvedDateTime}
                onChange={(e) => setResolvedDateTime(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                User / Requester Confirmation <span className="text-red-500">*</span>
              </label>
              <select
                value={userConfirmation}
                onChange={(e) => setUserConfirmation(e.target.value as UserConfirmationType)}
                className={inputClass}
              >
                <option value="Confirmed Resolved">Confirmed Resolved</option>
                <option value="Unable to Contact">Unable to Contact</option>
                <option value="Confirmation Pending">Confirmation Pending</option>
                <option value="Not Required">Not Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Confirmation Method <span className="text-red-500">*</span>
              </label>
              <select
                value={confirmationMethod}
                onChange={(e) => setConfirmationMethod(e.target.value as ConfirmationMethodType)}
                className={inputClass}
              >
                <option value="Email">Email</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="System Verification">System Verification</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Final Remarks &amp; Preventive Measures
            </label>
            <input
              type="text"
              value={finalRemarks}
              onChange={(e) => setFinalRemarks(e.target.value)}
              placeholder="e.g. Monitored for 2 hours post-fix. No recurrence observed."
              className={inputClass}
            />
          </div>

          {/* Workflow Note */}
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-1">
            <div className="font-bold text-slate-700 dark:text-neutral-300">Automated Resolution Actions:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Status will be updated to <strong>Resolved</strong> in SharePoint Excel.</li>
              <li>Unresolved reminder schedule will immediately <strong>Stop</strong>.</li>
              <li>Resolution notification email will be dispatched to requester and stakeholders.</li>
              <li>Complete resolution details will be permanently logged in <strong>IncidentHistory</strong>.</li>
            </ul>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Resolution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
