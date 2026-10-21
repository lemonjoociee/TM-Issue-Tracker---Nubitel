import React, { useState } from 'react';
import { Issue, Priority, IssueStatus } from '../types/issue';
import { OPERATIONAL_GUIDELINES } from '../data/guidelines';
import { X, Plus, AlertCircle, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextId: number;
  onAddIssue: (newIssue: Issue) => void;
  existingIssues?: Issue[];
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  isOpen,
  onClose,
  nextId,
  onAddIssue,
  existingIssues = [],
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const defaultDate = `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-26`;
  const defaultTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [priority, setPriority] = useState<Priority>('P2');
  const [issueArea, setIssueArea] = useState('Email');
  const [callId, setCallId] = useState('');
  const [customer, setCustomer] = useState('Telekom Malaysia');
  const [location, setLocation] = useState('Kuala Lumpur NOC');
  const [reportedBy, setReportedBy] = useState('Nurul Atikah Binti Ustaz Yaakop');
  const [contactTeam, setContactTeam] = useState('Harveet');
  const [affectedUser, setAffectedUser] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState<IssueStatus>('Open');
  const [longDescription, setLongDescription] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [impact, setImpact] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [trackerLabel, setTrackerLabel] = useState('System / Application level issue');

  // Duplicate Call ID detection
  const duplicateMatch = callId.trim()
    ? existingIssues.find(
        (i) => i.callId && i.callId.trim().toLowerCase() === callId.trim().toLowerCase()
      )
    : null;

  // Suggest relevant guideline as user types
  const matchingPlaybooks = OPERATIONAL_GUIDELINES.filter((g) => {
    if (!longDescription.trim()) return false;
    const descLower = longDescription.toLowerCase();
    return (
      g.symptoms.some((s) => descLower.includes(s.toLowerCase().slice(0, 10))) ||
      g.vendorOrModule.toLowerCase().includes(issueArea.toLowerCase()) ||
      g.title.toLowerCase().includes(descLower.slice(0, 8))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longDescription.trim()) return;

    let month: Issue['month'] = 'October';
    const monthIndex = today.getMonth();
    if (monthIndex === 6) month = 'July';
    else if (monthIndex === 7) month = 'August';
    else if (monthIndex === 8) month = 'September';
    else if (monthIndex === 9) month = 'October';

    const newIssue: Issue = {
      id: nextId,
      ticketId: `INC-2026-${String(nextId).padStart(5, '0')}`,
      callId: callId.trim() || undefined,
      customer: customer.trim() || 'Telekom Malaysia',
      location: location.trim() || 'Kuala Lumpur NOC',
      affectedUser: affectedUser.trim() || undefined,
      userEmail: userEmail.trim() || undefined,
      reportedDate: defaultDate,
      reportedTime: defaultTime,
      solvedDate: '',
      solvedTime: '',
      reportedBy,
      contactTeam,
      priority,
      issueArea,
      service: issueArea,
      status,
      longDescription,
      expectedResult,
      impact: impact.trim() || `${priority} operational impact`,
      businessImpact: impact.trim() || undefined,
      evidenceLink,
      resolvedDateTime: '',
      resolution: '',
      rootCause: '',
      actionTaken: '',
      trackerLabel,
      lastUpdated: new Date().toLocaleString(),
      ageHours: 'Just logged (Active)',
      month,
      rcaStatus: 'In Progress',
    };

    onAddIssue(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920] animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Log Present Incident (#{nextId})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Duplicate Call ID Warning Alert */}
          {duplicateMatch && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Duplicate Call ID Detected:</span> Call ID{' '}
                <span className="font-mono font-bold text-white bg-amber-900/40 px-1 py-0.5 rounded">
                  {callId}
                </span>{' '}
                already exists in Incident #{duplicateMatch.id} ({duplicateMatch.issueArea} - {duplicateMatch.status}). Authorized NOC users may continue or review the existing record before continuing.
              </div>
            </div>
          )}

          {/* Section A: Call ID & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Call ID / Ticket Ref
              </label>
              <input
                type="text"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="e.g. CALL-98421 or ESC-001"
                className={`w-full bg-slate-950 border rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none ${
                  duplicateMatch
                    ? 'border-amber-500 focus:border-amber-400'
                    : 'border-slate-700 focus:border-[#D71920]'
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Telekom Malaysia, Nubitel"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Site / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Menara TM, Cyberjaya, JB"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>
          </div>

          {/* Priority & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920] cursor-pointer"
              >
                <option value="P1">P1 - Critical (Immediate SLA Triage)</option>
                <option value="P2">P2 - High (Degraded Service)</option>
                <option value="P3">P3 - Medium (Operational Workaround)</option>
                <option value="P4">P4 - Low (Cosmetic / Minor Inquiry)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Issue Area / Channel
              </label>
              <select
                value={issueArea}
                onChange={(e) => setIssueArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920] cursor-pointer"
              >
                <option value="Email">Email Team</option>
                <option value="SocMed">SocMed (Social Media / X / Meta)</option>
                <option value="RTA Team">RTA Team (Adherence & Reporting)</option>
                <option value="FMC">FMC Live Chat</option>
                <option value="Telephony">Telephony / SIP Trunk</option>
                <option value="Campaign">Campaign & Supervisor Queue</option>
              </select>
            </div>
          </div>

          {/* Reported By & NOC PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Reported By (Operator / Agent)
              </label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Staff full name"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Contact / NOC Lead (PIC)
              </label>
              <select
                value={contactTeam}
                onChange={(e) => setContactTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920] cursor-pointer"
              >
                <option value="Harveet">Harveet (NOC Operations Lead)</option>
                <option value="Nath">Nath (NOC Technical Lead)</option>
                <option value="Hargobind">Hargobind (NOC Systems Lead)</option>
                <option value="Rajeev">Rajeev (NOC Escalations Lead)</option>
              </select>
            </div>
          </div>

          {/* Long Description / Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Long Description / Problem Enquiry *
            </label>
            <textarea
              required
              rows={2}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="e.g. Unable to send/reply emails, delay in receiving incoming TM_X DMs, memory limit crash on report template..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D71920]"
            />
          </div>

          {/* Live Guideline Matcher Assistant */}
          {matchingPlaybooks.length > 0 && (
            <div className="bg-[#D71920]/[0.08] p-3 rounded-xl border border-[#D71920]/30">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920] mb-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Recommended Historical Guideline Match</span>
              </div>
              <div className="text-[11px] text-slate-300">
                <strong className="text-white">{matchingPlaybooks[0].title}</strong> ({matchingPlaybooks[0].id})
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                <strong>Likely Cause:</strong> {matchingPlaybooks[0].rootCauseSummary}
              </p>
            </div>
          )}

          {/* Expected Result & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Expected Result
              </label>
              <input
                type="text"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                placeholder="e.g. Sub-minute message delivery"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Impact / Affected Users
              </label>
              <input
                type="text"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="e.g. Email Team (45 agents impacted)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>
          </div>

          {/* Evidence Link & Tracker Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Evidence Link / Filename
              </label>
              <input
                type="text"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="e.g. Re_ Nubitel_Error.msg or Sharepoint URL"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Tracker Label
              </label>
              <select
                value={trackerLabel}
                onChange={(e) => setTrackerLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D71920] cursor-pointer"
              >
                <option value="System / Application level issue">System / Application level issue</option>
                <option value="Vendor / DevOps issue">Vendor / DevOps issue</option>
                <option value="Upstream 3rd Party issue">Upstream 3rd Party issue</option>
                <option value="Configuration / Licensing issue">Configuration / Licensing issue</option>
                <option value="BAU / Spam handling">BAU / Spam handling</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#D71920] hover:bg-[#BF151B] transition-colors shadow-sm shadow-[#D71920]/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Present Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
