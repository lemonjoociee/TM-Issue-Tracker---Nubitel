import React, { useState, useId } from 'react';
import {
  Incident,
  IncidentStatus,
  Priority,
  BusinessImpact,
  SystemChannel,
  LoginAccessStatus,
  WorkLocationType,
  NetworkConnectionType,
  UsersAffectedType,
  IssueBehaviorType,
  InternetVPNConnectedType,
  ReminderFrequencyType,
  EscalationLevelType,
  AttachmentRecord,
  UserSession,
} from '../types/nocSystem';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
  FileText,
  AlertTriangle,
  HelpCircle,
  Save,
  Send,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NOCIncidentEntryFormProps {
  existingIncidents: Incident[];
  currentUser: UserSession;
  onSubmit: (incident: Incident, attachments: AttachmentRecord[], isDraft: boolean) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export const NOCIncidentEntryForm: React.FC<NOCIncidentEntryFormProps> = ({
  existingIncidents,
  currentUser,
  onSubmit,
  onCancel,
  isDarkMode,
}) => {
  // Generate next automatic Incident ID: INC-YYYY-XXXXX
  const now = new Date();
  const yyyy = now.getFullYear();
  const nextNum = (existingIncidents.length + 1).toString().padStart(5, '0');
  const autoIncidentId = `INC-${yyyy}-${nextNum}`;

  const defaultDateTimeStr = `${yyyy}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // SECTION A: Basic Incident Information
  const [incidentId] = useState<string>(autoIncidentId);
  const [callId, setCallId] = useState('');
  const [escalationDate, setEscalationDate] = useState(defaultDateTimeStr.split(' ')[0]);
  const [escalationTime, setEscalationTime] = useState(defaultDateTimeStr.split(' ')[1]);
  const [reportedBy, setReportedBy] = useState('');
  const [reporterContactNumber, setReporterContactNumber] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [assignedNOCUser, setAssignedNOCUser] = useState(currentUser.name);
  const [status, setStatus] = useState<IncidentStatus>('New');
  const [priority, setPriority] = useState<Priority>('P2');

  // SECTION B: User and Site Information
  const [userName, setUserName] = useState('');
  const [userContactNumber, setUserContactNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [siteLocation, setSiteLocation] = useState('Kuala Lumpur (HQ)');
  const [customerName, setCustomerName] = useState('Nubitel Enterprise');
  const [customerNumberANI, setCustomerNumberANI] = useState('');
  const [department, setDepartment] = useState('Operations Support');

  // SECTION C: System and Service Information
  const [systemChannels, setSystemChannels] = useState<SystemChannel[]>(['Voice']);
  const [loginAccess, setLoginAccess] = useState<LoginAccessStatus>('Able to login/access');
  const [workLocation, setWorkLocation] = useState<WorkLocationType>('WFH & WFO');
  const [networkConnection, setNetworkConnection] = useState<NetworkConnectionType>('LAN & VPN');
  const [businessImpact, setBusinessImpact] = useState<BusinessImpact>('P2 – High');
  const [serviceName, setServiceName] = useState('Voice & Contact Centre IVR');
  const [applicationName, setApplicationName] = useState('Cisco Unified CCX');
  const [vendorName, setVendorName] = useState('Cisco Systems / SciCom UCC');
  const [dnsNumber, setDnsNumber] = useState('NA');
  const [vrOutcome, setVrOutcome] = useState('Transferred to Queue');

  // SECTION D: Issue Description
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [hasErrorMessage, setHasErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('No error code displayed');
  const [usersAffected, setUsersAffected] = useState<UsersAffectedType>('Multiple Users');
  const [issueBehavior, setIssueBehavior] = useState<IssueBehaviorType>('Continuous');
  const [issueOccurredDate, setIssueOccurredDate] = useState(defaultDateTimeStr.split(' ')[0]);
  const [issueOccurredTime, setIssueOccurredTime] = useState(defaultDateTimeStr.split(' ')[1]);
  const [internetVPNConnected, setInternetVPNConnected] = useState<InternetVPNConnectedType>('Yes');
  const [troubleshootingPerformed, setTroubleshootingPerformed] = useState('');
  const [additionalRemarks, setAdditionalRemarks] = useState('');

  // SECTION E: Inbound Information
  const [inboundCallId, setInboundCallId] = useState('');
  const [inboundCustomerNumberANI, setInboundCustomerNumberANI] = useState('');
  const [inboundCallTimestamp, setInboundCallTimestamp] = useState(defaultDateTimeStr);
  const [inboundDNIS, setInboundDNIS] = useState('');
  const [inboundIVROutcome, setInboundIVROutcome] = useState('Transferred to Queue');

  // SECTION F: Assignment and Follow-up
  const [assignedTeam, setAssignedTeam] = useState('Tier 2 NOC Operations');
  const [assignedPerson, setAssignedPerson] = useState(currentUser.name);
  const [assignedPersonEmail, setAssignedPersonEmail] = useState(currentUser.email);
  const [vendorPIC, setVendorPIC] = useState('Cisco TAC Specialist');
  const [picEmail, setPicEmail] = useState('cisco-tac@vendor.com');
  const [picContactNumber, setPicContactNumber] = useState('+603-77218900');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [nextFollowUpTime, setNextFollowUpTime] = useState('16:00');
  const [latestUpdate, setLatestUpdate] = useState('Initial escalation received and logged into NOC tracker.');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequencyType>('Every 1 hour');
  const [escalationLevel, setEscalationLevel] = useState<EscalationLevelType>('L2');

  // SECTION G: Supporting Documents
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);

  // Validation & Duplicate State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [duplicateIncidentMatch, setDuplicateIncidentMatch] = useState<Incident | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDraftState, setPendingDraftState] = useState(false);

  // Check Call ID duplicate in real-time
  const handleCallIdChange = (val: string) => {
    setCallId(val);
    const trimmed = val.trim();
    if (trimmed) {
      const match = existingIncidents.find(
        (i) => i.callId.toLowerCase() === trimmed.toLowerCase() || i.inboundCallId.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        setDuplicateWarning(`Call ID "${trimmed}" already exists in ${match.incidentId} (${match.customerName} - ${match.issueTitle}).`);
        setDuplicateIncidentMatch(match);
      } else {
        setDuplicateWarning(null);
        setDuplicateIncidentMatch(null);
      }
    } else {
      setDuplicateWarning(null);
      setDuplicateIncidentMatch(null);
    }
  };

  // Toggle multi-select system channel
  const handleToggleChannel = (ch: SystemChannel) => {
    if (systemChannels.includes(ch)) {
      if (systemChannels.length > 1) {
        setSystemChannels(systemChannels.filter((c) => c !== ch));
      }
    } else {
      setSystemChannels([...systemChannels, ch]);
    }
  };

  // Quick simulated file upload
  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newRecords: AttachmentRecord[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ymd = defaultDateTimeStr.split(' ')[0].replace(/-/g, '');
      const attId = `ATT-${ymd}-${Math.floor(100 + Math.random() * 900)}`;

      newRecords.push({
        attachmentId: attId,
        incidentId,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        sharePointFileURL: `https://scicom.sharepoint.com/sites/tmnoc/Attachments/${incidentId}/${file.name}`,
        uploadedBy: currentUser.name,
        uploadedDateTime: defaultDateTimeStr,
      });
    }

    setAttachments([...attachments, ...newRecords]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.attachmentId !== id));
  };

  // Load Fictional Reference Example matching the uploaded template
  const handleLoadReferenceExample = () => {
    setCallId('CALL-2026-2832101');
    setInboundCallId('CALL-2026-2832101');
    setEscalationDate('2026-10-15');
    setEscalationTime('11:25');
    setReportedBy('Mohd Norzhafran Bin Ismail');
    setReporterContactNumber('+6017-7510741');
    setReporterEmail('norzhafran.i@scicom.com.my');
    setUserName('Farah Nuryuhana Binti Hamid');
    setUserContactNumber('+6012-5598480');
    setUserEmail('nuryuhana.hamid@client.tm.com.my');
    setSiteLocation('Kuala Lumpur (HQ)');
    setCustomerName('Nubitel Enterprise');
    setCustomerNumberANI('+6017-7710506');
    setDepartment('Enterprise UCC Operations');
    setSystemChannels(['Voice']);
    setLoginAccess('Able to login/access');
    setWorkLocation('WFH & WFO');
    setNetworkConnection('LAN & VPN');
    setBusinessImpact('P2 – High');
    setPriority('P2');
    setServiceName('Voice & Contact Centre IVR');
    setApplicationName('Cisco Unified CCX / Main IVR');
    setVendorName('SciCom UCC / Cisco');
    setDnsNumber('NA');
    setVrOutcome('Transferred to Queue');
    setIssueTitle('Nubitel Voice Raw Data - Scicom Main IVR appearing in Final Queue');
    setIssueDescription(
      'Seek assistance to investigate issue with Nubitel voice raw data stream. Scicom Main IVR should not appear in the Final Queue for October 2026 raw data. Inbound calls routing to default queue during overflow.'
    );
    setHasErrorMessage(false);
    setErrorMessageText('No error code displayed');
    setUsersAffected('Multiple Users');
    setIssueBehavior('Continuous');
    setIssueOccurredDate('2026-10-15');
    setIssueOccurredTime('11:00');
    setInternetVPNConnected('Yes');
    setTroubleshootingPerformed(
      'Verified PRI D-Channel signaling. Checked Cisco UCCX routing script queue assignment. Confirmed trunk availability.'
    );
    setInboundCustomerNumberANI('+6017-7710506');
    setInboundCallTimestamp('2026-10-12 15:09');
    setInboundDNIS('+603-88734900');
    setInboundIVROutcome('Transferred to Queue');
    setAssignedTeam('Tier 2 NOC Operations');
    setAssignedPerson(currentUser.name);
    setAssignedPersonEmail(currentUser.email);
    setVendorPIC('Lee Chee Keong (TAC Lead)');
    setPicEmail('tac-lead@vendor.com');
    setPicContactNumber('+603-77218900');
    setNextFollowUpDate('2026-10-20');
    setNextFollowUpTime('15:00');
    setReminderFrequency('Every 1 hour');
    setEscalationLevel('L2');
    setLatestUpdate('Escalation form received from RTA Command Centre. Active triage initiated.');

    // Add sample attachment metadata
    setAttachments([
      {
        attachmentId: 'ATT-20261015-091',
        incidentId,
        fileName: 'TM_UCC_Escalation_Form_Ref2832101.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: '38.4 KB',
        sharePointFileURL: `https://scicom.sharepoint.com/sites/tmnoc/Attachments/${incidentId}/TM_UCC_Escalation_Form_Ref2832101.xlsx`,
        uploadedBy: currentUser.name,
        uploadedDateTime: defaultDateTimeStr,
      },
    ]);

    setValidationErrors([]);
    setDuplicateWarning(null);
  };

  // Validate form based on Section 5 rules
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!escalationDate || !escalationTime) errors.push('Escalation Date and Time is mandatory.');
    if (!reportedBy.trim()) errors.push('Reported By is mandatory.');
    if (!userName.trim()) errors.push('User Name is mandatory.');
    if (!siteLocation.trim()) errors.push('Site / Location is mandatory.');
    if (systemChannels.length === 0) errors.push('At least one System / Channel Affected must be selected.');
    if (!businessImpact) errors.push('Business Impact / Priority is mandatory.');
    if (!issueTitle.trim()) errors.push('Issue Title is mandatory.');
    if (!issueDescription.trim()) errors.push('Detailed Issue Description is mandatory.');
    if (!issueOccurredDate || !issueOccurredTime) errors.push('Issue Occurrence Date and Time is mandatory.');

    // Email format validation
    if (reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
      errors.push('Reporter Email Address has an invalid format.');
    }
    if (userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      errors.push('User Email Address has an invalid format.');
    }

    // Future occurrence date prevention
    try {
      const occurrenceDateTime = new Date(`${issueOccurredDate}T${issueOccurredTime}`);
      if (occurrenceDateTime.getTime() > Date.now() + 60000) {
        errors.push('Issue Occurrence Date/Time cannot be in the future.');
      }
    } catch {
      // Ignore date parse issues
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleTriggerSubmit = (isDraft: boolean) => {
    if (isDraft) {
      setPendingDraftState(true);
      setShowConfirmModal(true);
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      // Scroll to top to see validation messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setPendingDraftState(false);
    setShowConfirmModal(true);
  };

  const handleFinalConfirmSubmit = () => {
    const isDraft = pendingDraftState;
    const finalStatus: IncidentStatus = isDraft ? 'Draft' : 'New';

    const p: Priority =
      businessImpact.startsWith('P1') ? 'P1' : businessImpact.startsWith('P2') ? 'P2' : businessImpact.startsWith('P3') ? 'P3' : 'P4';

    const newIncident: Incident = {
      incidentId,
      callId: callId.trim() || 'CALL-UNASSIGNED',
      escalationDateTime: `${escalationDate} ${escalationTime}`,
      reportedBy: reportedBy.trim(),
      reporterContactNumber: reporterContactNumber.trim(),
      reporterEmail: reporterEmail.trim(),
      userName: userName.trim(),
      userContactNumber: userContactNumber.trim(),
      userEmail: userEmail.trim(),
      siteLocation: siteLocation.trim(),
      customerName: customerName.trim(),
      customerNumberANI: customerNumberANI.trim(),
      department: department.trim(),
      systemChannelAffected: systemChannels,
      serviceName: serviceName.trim(),
      applicationName: applicationName.trim(),
      vendorName: vendorName.trim(),
      loginAccess,
      workLocation,
      networkConnection,
      businessImpact,
      priority: p,
      dnsNumber: dnsNumber.trim(),
      vrOutcome: vrOutcome.trim(),
      issueTitle: issueTitle.trim(),
      issueDescription: issueDescription.trim(),
      errorMessage: hasErrorMessage ? errorMessageText.trim() : 'No error code displayed',
      usersAffected,
      issueBehavior,
      issueOccurredDateTime: `${issueOccurredDate} ${issueOccurredTime}`,
      internetVPNConnected,
      troubleshootingPerformed: troubleshootingPerformed.trim(),
      additionalRemarks: additionalRemarks.trim(),
      inboundCallId: inboundCallId.trim() || callId.trim() || 'NA',
      inboundCustomerNumberANI: inboundCustomerNumberANI.trim() || customerNumberANI.trim() || 'NA',
      inboundCallTimestamp: inboundCallTimestamp.trim() || defaultDateTimeStr,
      inboundDNIS: inboundDNIS.trim() || 'NA',
      inboundIVROutcome: inboundIVROutcome.trim(),
      assignedTeam: 'NOC',
      assignedPerson: 'All NOC',
      assignedPersonEmail: 'tmnoc@scicom.com.my',
      vendorPIC: vendorPIC.trim() || '',
      picEmail: picEmail.trim() || '',
      picContactNumber: picContactNumber.trim() || '',
      status: finalStatus,
      nextFollowUpDateTime: (nextFollowUpDate && nextFollowUpTime) ? `${nextFollowUpDate} ${nextFollowUpTime}` : defaultDateTimeStr,
      latestUpdate: latestUpdate.trim() || 'Incident manually registered by NOC engineer.',
      reminderFrequency: reminderFrequency || 'Every 1 hour',
      escalationLevel: escalationLevel || 'L2',
      createdBy: currentUser.name,
      createdDateTime: defaultDateTimeStr,
      lastUpdatedBy: currentUser.name,
      lastUpdatedDateTime: defaultDateTimeStr,
    };

    setShowConfirmModal(false);
    onSubmit(newIncident, attachments, isDraft);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setCallId('');
      setReportedBy('');
      setReporterContactNumber('');
      setReporterEmail('');
      setUserName('');
      setUserContactNumber('');
      setUserEmail('');
      setIssueTitle('');
      setIssueDescription('');
      setTroubleshootingPerformed('');
      setAttachments([]);
      setValidationErrors([]);
      setDuplicateWarning(null);
    }
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors font-medium ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
      : 'bg-white border-slate-300 text-slate-900 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
  }`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              TM UCC System Issue Escalation Template (SCICOM related only)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D71920] text-white">
              MANUAL DATA ENTRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Manual incident registration based on email escalation form. Data is automatically recorded into SharePoint Excel database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLoadReferenceExample}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                : 'bg-blue-50 border-blue-200 text-[#034DA1] hover:bg-blue-100'
            }`}
            title="Load fictional sample data based on the TM UCC escalation template"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#034DA1]" />
            <span>Load Template Example</span>
          </button>
        </div>
      </div>

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs space-y-1 animate-in fade-in">
          <div className="font-bold flex items-center gap-2 mb-1 text-sm text-[#D71920]">
            <AlertCircle className="w-4 h-4" />
            <span>Please complete all mandatory fields:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Duplicate Call ID Warning Box */}
      {duplicateWarning && duplicateIncidentMatch && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Duplicate Call ID Detected</div>
            <p>{duplicateWarning}</p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 mt-1">
              Existing Record: {duplicateIncidentMatch.incidentId} | Status: {duplicateIncidentMatch.status} | Reported by: {duplicateIncidentMatch.reportedBy}
            </div>
            <p className="text-[11px] italic text-slate-500">
              You may continue if this is an intentional re-escalation, but review the existing record first.
            </p>
          </div>
        </div>
      )}

      {/* Main Multi-Section Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleTriggerSubmit(false); }} className="space-y-6">
        {/* SECTION A: Basic Incident Information */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-bold text-xs">
                A
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section A: Basic Incident Information
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Auto ID &amp; Reporter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Incident ID <span className="text-slate-400 font-normal">(Auto Generated)</span>
              </label>
              <input
                type="text"
                readOnly
                value={incidentId}
                className={`${inputClass} bg-slate-100 dark:bg-neutral-800 text-[#034DA1] dark:text-blue-400 font-mono font-bold cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Call ID / Ticket Ref <span className="text-slate-400 font-normal">(Manual Entry)</span>
              </label>
              <input
                type="text"
                value={callId}
                onChange={(e) => handleCallIdChange(e.target.value)}
                placeholder="e.g. CALL-2026-89102"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Priority / Severity <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as Priority;
                  setPriority(p);
                  setBusinessImpact(
                    p === 'P1' ? 'P1 – Critical' : p === 'P2' ? 'P2 – High' : p === 'P3' ? 'P3 – Medium' : 'P4 – Low'
                  );
                }}
                className={inputClass}
              >
                <option value="P1">P1 – Critical (Total Outage)</option>
                <option value="P2">P2 – High (Major Impact)</option>
                <option value="P3">P3 – Medium (Partial Degradation)</option>
                <option value="P4">P4 – Low (Minor Request)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Escalation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={escalationDate}
                onChange={(e) => setEscalationDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Escalation Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={escalationTime}
                onChange={(e) => setEscalationTime(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Reported By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Mohd Syahir Bin Ismail"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Reporter Contact Number
              </label>
              <input
                type="text"
                value={reporterContactNumber}
                onChange={(e) => setReporterContactNumber(e.target.value)}
                placeholder="e.g. +6012-3450912"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Reporter Email Address
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="e.g. syahir.ismail@scicom.my"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Incident Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                className={inputClass}
              >
                <option value="New">New (Default for submission)</option>
                <option value="Draft">Draft (Unfinished record)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION B: User and Site Information */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#034DA1] text-white flex items-center justify-center font-bold text-xs">
                B
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section B: User and Site Information
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Requester &amp; Location</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Impacted User Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Farah Nadia Binti Osman"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                User Contact Number
              </label>
              <input
                type="text"
                value={userContactNumber}
                onChange={(e) => setUserContactNumber(e.target.value)}
                placeholder="e.g. +6017-8890123"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                User Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="e.g. farah.nadia@customer.tm.com.my"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Site / Location <span className="text-red-500">*</span>
              </label>
              <select
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className={inputClass}
              >
                <option value="Kuala Lumpur (HQ)">Kuala Lumpur (HQ)</option>
                <option value="Cyberjaya Data Centre">Cyberjaya Data Centre</option>
                <option value="Menara TM (Bangsar)">Menara TM (Bangsar)</option>
                <option value="Penang Regional Hub">Penang Regional Hub</option>
                <option value="Johor Bahru Hub">Johor Bahru Hub</option>
                <option value="Kuantan Operations Center">Kuantan Operations Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Customer Name / Account
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Nubitel Enterprise"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Customer Number / ANI
              </label>
              <input
                type="text"
                value={customerNumberANI}
                onChange={(e) => setCustomerNumberANI(e.target.value)}
                placeholder="e.g. +603-22894000 or +6017-7710506"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Department / Business Unit
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Customer Contact Operations"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* SECTION C: System and Service Information */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                C
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section C: System and Service Information
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Channels &amp; Technical Scope</span>
          </div>

          <div className="space-y-4">
            {/* Multi-Select Channels */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                System / Channel Affected <span className="text-red-500">*</span> (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Voice', 'Email', 'Chat', 'Social Media', 'Other Channel'] as SystemChannel[]).map((ch) => {
                  const isChecked = systemChannels.includes(ch);
                  return (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => handleToggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-[#034DA1] text-white border-[#034DA1]'
                          : isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{ch}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Login / Access Status
                </label>
                <select
                  value={loginAccess}
                  onChange={(e) => setLoginAccess(e.target.value as LoginAccessStatus)}
                  className={inputClass}
                >
                  <option value="Able to login/access">Able to login/access</option>
                  <option value="Unable to login/access">Unable to login/access</option>
                  <option value="Intermittent">Intermittent login/access</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Work Location (WFO / WFH)
                </label>
                <select
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value as WorkLocationType)}
                  className={inputClass}
                >
                  <option value="WFH & WFO">WFH &amp; WFO</option>
                  <option value="WFO">WFO (Work From Office)</option>
                  <option value="WFH">WFH (Work From Home)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Network Connection (LAN / VPN)
                </label>
                <select
                  value={networkConnection}
                  onChange={(e) => setNetworkConnection(e.target.value as NetworkConnectionType)}
                  className={inputClass}
                >
                  <option value="LAN & VPN">LAN &amp; VPN</option>
                  <option value="LAN">LAN (Direct Corporate Office)</option>
                  <option value="VPN">VPN (Remote Client)</option>
                  <option value="Direct">Direct Carrier Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Voice & Contact Centre IVR"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  value={applicationName}
                  onChange={(e) => setApplicationName(e.target.value)}
                  placeholder="e.g. Cisco Unified CCX"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Cisco Systems / SciCom UCC"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  DNS / AnyDesk ID
                </label>
                <input
                  type="text"
                  value={dnsNumber}
                  onChange={(e) => setDnsNumber(e.target.value)}
                  placeholder="e.g. ANYDESK-901-224 or NA"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  VR / IVR Outcome
                </label>
                <input
                  type="text"
                  value={vrOutcome}
                  onChange={(e) => setVrOutcome(e.target.value)}
                  placeholder="e.g. Transferred to Queue"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: Issue Description */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-bold text-xs">
                D
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section D: Issue Description &amp; Behavior
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Core Incident Scope</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Concise, professional title (e.g. Nubitel Voice Raw Data - Scicom Main IVR appearing in Final Queue)"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Detailed Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Provide complete breakdown of symptom, impacted call flows, queues, and affected callers..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Users Affected
                </label>
                <select
                  value={usersAffected}
                  onChange={(e) => setUsersAffected(e.target.value as UsersAffectedType)}
                  className={inputClass}
                >
                  <option value="Single User">Single User</option>
                  <option value="Multiple Users">Multiple Users</option>
                  <option value="All Users">All Users</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Issue Behavior
                </label>
                <select
                  value={issueBehavior}
                  onChange={(e) => setIssueBehavior(e.target.value as IssueBehaviorType)}
                  className={inputClass}
                >
                  <option value="Continuous">Continuous</option>
                  <option value="Intermittent">Intermittent</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Date Issue Occurred <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={issueOccurredDate}
                  onChange={(e) => setIssueOccurredDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Time Issue Occurred <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={issueOccurredTime}
                  onChange={(e) => setIssueOccurredTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Internet / VPN Connected?
                </label>
                <select
                  value={internetVPNConnected}
                  onChange={(e) => setInternetVPNConnected(e.target.value as InternetVPNConnectedType)}
                  className={inputClass}
                >
                  <option value="Yes">Yes (Normal)</option>
                  <option value="No">No (Disconnected)</option>
                  <option value="Degraded">Degraded / High Packet Loss</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Error Message Displayed
                </label>
                <div className="flex gap-2">
                  <select
                    value={hasErrorMessage ? 'yes' : 'no'}
                    onChange={(e) => setHasErrorMessage(e.target.value === 'yes')}
                    className="w-24 shrink-0 px-2 py-2 rounded-xl border text-xs bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                  <input
                    type="text"
                    disabled={!hasErrorMessage}
                    value={hasErrorMessage ? errorMessageText : 'No error prompt'}
                    onChange={(e) => setErrorMessageText(e.target.value)}
                    placeholder="Enter displayed error text or prompt..."
                    className={`${inputClass} disabled:opacity-50`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Troubleshooting Performed
              </label>
              <textarea
                rows={2}
                value={troubleshootingPerformed}
                onChange={(e) => setTroubleshootingPerformed(e.target.value)}
                placeholder="Diagnostic steps taken: trunk check, gateway restart, script validation, ping traces..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* SECTION E: Inbound Information */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#034DA1] text-white flex items-center justify-center font-bold text-xs">
                E
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section E: Inbound Call Information
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Telephony Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Inbound[Call ID]
              </label>
              <input
                type="text"
                value={inboundCallId}
                onChange={(e) => setInboundCallId(e.target.value)}
                placeholder="e.g. 2832101"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Inbound[Customer Number / ANI]
              </label>
              <input
                type="text"
                value={inboundCustomerNumberANI}
                onChange={(e) => setInboundCustomerNumberANI(e.target.value)}
                placeholder="e.g. +60177710506"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Inbound[Call Timestamp]
              </label>
              <input
                type="text"
                value={inboundCallTimestamp}
                onChange={(e) => setInboundCallTimestamp(e.target.value)}
                placeholder="e.g. 2026-10-12 15:09"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Inbound[DNIS]
              </label>
              <input
                type="text"
                value={inboundDNIS}
                onChange={(e) => setInboundDNIS(e.target.value)}
                placeholder="e.g. +60388734900"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Inbound[IVR Outcome]
              </label>
              <input
                type="text"
                value={inboundIVROutcome}
                onChange={(e) => setInboundIVROutcome(e.target.value)}
                placeholder="e.g. Transferred to Queue"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* SECTION F: Supporting Documents (SharePoint Document Library) */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                F
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Section F: Supporting Documents (SharePoint Library)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Attachment Metadata</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Upload email escalation forms, screenshots, logs, or reports. Files are stored in the dedicated SharePoint document library.
            </p>

            <div className="flex items-center gap-3">
              <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Choose Files to Upload</span>
                <input
                  type="file"
                  multiple
                  onChange={handleSimulateFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                Supports: .xlsx, .msg, .pdf, .docx, .png, .jpg, .log (Max 25MB)
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                  Attached Documents ({attachments.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.attachmentId}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold truncate text-slate-800 dark:text-neutral-200">
                            {att.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {att.fileSize} &bull; {att.uploadedBy}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.attachmentId)}
                        className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 shadow-xl z-20`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isDarkMode ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-black'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTriggerSubmit(true)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-slate-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
              }`}
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save as Draft</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Incident</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#034DA1] dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">
                  {pendingDraftState ? 'Confirm Save as Draft' : 'Confirm Incident Submission'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {incidentId} &bull; {customerName}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-neutral-300 space-y-2 mb-6">
              <p>
                {pendingDraftState
                  ? 'This record will be saved in Draft status and will not trigger active reminder notifications.'
                  : 'Are you sure you want to register this incident in the SharePoint Excel database and initiate the notification workflow?'}
              </p>
              <div
                className={`p-3 rounded-xl border font-mono text-[11px] ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div><strong>Incident ID:</strong> {incidentId}</div>
                <div><strong>Title:</strong> {issueTitle || 'Untitled'}</div>
                <div><strong>Priority:</strong> {priority} ({businessImpact})</div>
                <div><strong>Reported By:</strong> {reportedBy}</div>
                <div><strong>Impacted User:</strong> {userName} ({siteLocation})</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold cursor-pointer shadow"
              >
                {pendingDraftState ? 'Confirm Save Draft' : 'Confirm & Submit to SharePoint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
