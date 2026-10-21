import * as XLSX from 'xlsx';
import {
  Incident,
  IncidentHistory,
  AttachmentRecord,
  NotificationRecord,
  SystemSetting,
} from '../types/nocSystem';

/**
 * Generates an Excel workbook containing all 5 required tables
 * representing TM_NOC_Incident_Tracker.xlsx in SharePoint.
 */
export function generateSharePointWorkbook(
  incidents: Incident[],
  histories: IncidentHistory[],
  attachments: AttachmentRecord[],
  notifications: NotificationRecord[],
  settings: SystemSetting[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Table 1: Incidents (all 57 columns)
  const incidentRows = incidents.map((inc) => ({
    IncidentID: inc.incidentId,
    CallID: inc.callId,
    EscalationDateTime: inc.escalationDateTime,
    ReportedBy: inc.reportedBy,
    ReporterContactNumber: inc.reporterContactNumber,
    ReporterEmail: inc.reporterEmail,
    UserName: inc.userName,
    UserContactNumber: inc.userContactNumber,
    UserEmail: inc.userEmail,
    SiteLocation: inc.siteLocation,
    CustomerName: inc.customerName,
    CustomerNumberANI: inc.customerNumberANI,
    Department: inc.department,
    SystemChannelAffected: inc.systemChannelAffected.join(', '),
    ServiceName: inc.serviceName,
    ApplicationName: inc.applicationName,
    VendorName: inc.vendorName,
    LoginAccess: inc.loginAccess,
    WorkLocation: inc.workLocation,
    NetworkConnection: inc.networkConnection,
    BusinessImpact: inc.businessImpact,
    Priority: inc.priority,
    IssueTitle: inc.issueTitle,
    IssueDescription: inc.issueDescription,
    ErrorMessage: inc.errorMessage,
    UsersAffected: inc.usersAffected,
    IssueBehavior: inc.issueBehavior,
    IssueOccurredDateTime: inc.issueOccurredDateTime,
    InternetVPNConnected: inc.internetVPNConnected,
    TroubleshootingPerformed: inc.troubleshootingPerformed,
    InboundCallID: inc.inboundCallId,
    InboundCustomerNumberANI: inc.inboundCustomerNumberANI,
    InboundCallTimestamp: inc.inboundCallTimestamp,
    InboundDNIS: inc.inboundDNIS,
    InboundIVROutcome: inc.inboundIVROutcome,
    AssignedTeam: inc.assignedTeam,
    AssignedPerson: inc.assignedPerson,
    AssignedPersonEmail: inc.assignedPersonEmail,
    VendorPIC: inc.vendorPIC,
    PICEmail: inc.picEmail,
    PICContactNumber: inc.picContactNumber,
    Status: inc.status,
    NextFollowUpDateTime: inc.nextFollowUpDateTime,
    LatestUpdate: inc.latestUpdate,
    ReminderFrequency: inc.reminderFrequency,
    EscalationLevel: inc.escalationLevel,
    CreatedBy: inc.createdBy,
    CreatedDateTime: inc.createdDateTime,
    LastUpdatedBy: inc.lastUpdatedBy,
    LastUpdatedDateTime: inc.lastUpdatedDateTime,
    ResolvedBy: inc.resolvedBy || '',
    ResolvedDateTime: inc.resolvedDateTime || '',
    ResolutionSummary: inc.resolutionSummary || '',
    ResolutionAction: inc.resolutionAction || '',
    RootCause: inc.rootCause || '',
    UserConfirmation: inc.userConfirmation || '',
    ConfirmationMethod: inc.confirmationMethod || '',
    FinalRemarks: inc.finalRemarks || '',
  }));
  const wsIncidents = XLSX.utils.json_to_sheet(incidentRows);
  XLSX.utils.book_append_sheet(wb, wsIncidents, 'Incidents');

  // Table 2: IncidentHistory
  const historyRows = histories.map((h) => ({
    HistoryID: h.historyId,
    IncidentID: h.incidentId,
    ActionType: h.actionType,
    FieldChanged: h.fieldChanged,
    PreviousValue: h.previousValue,
    NewValue: h.newValue,
    Remarks: h.remarks,
    UpdatedBy: h.updatedBy,
    UpdatedDateTime: h.updatedDateTime,
  }));
  const wsHistory = XLSX.utils.json_to_sheet(historyRows);
  XLSX.utils.book_append_sheet(wb, wsHistory, 'IncidentHistory');

  // Table 3: Attachments
  const attachmentRows = attachments.map((a) => ({
    AttachmentID: a.attachmentId,
    IncidentID: a.incidentId,
    FileName: a.fileName,
    FileType: a.fileType,
    SharePointFileURL: a.sharePointFileURL,
    UploadedBy: a.uploadedBy,
    UploadedDateTime: a.uploadedDateTime,
  }));
  const wsAttachments = XLSX.utils.json_to_sheet(attachmentRows);
  XLSX.utils.book_append_sheet(wb, wsAttachments, 'Attachments');

  // Table 4: NotificationHistory
  const notificationRows = notifications.map((n) => ({
    NotificationID: n.notificationId,
    IncidentID: n.incidentId,
    NotificationType: n.notificationType,
    Recipient: n.recipient,
    EmailSubject: n.emailSubject,
    SentDateTime: n.sentDateTime,
    DeliveryStatus: n.deliveryStatus,
    ErrorDetails: n.errorDetails || '',
  }));
  const wsNotifications = XLSX.utils.json_to_sheet(notificationRows);
  XLSX.utils.book_append_sheet(wb, wsNotifications, 'NotificationHistory');

  // Table 5: SystemSettings
  const settingRows = settings.map((s) => ({
    SettingName: s.settingName,
    SettingValue: s.settingValue,
    Description: s.description,
    LastUpdatedBy: s.lastUpdatedBy,
    LastUpdatedDateTime: s.lastUpdatedDateTime,
  }));
  const wsSettings = XLSX.utils.json_to_sheet(settingRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'SystemSettings');

  return wb;
}

/**
 * Downloads the full SharePoint Excel workbook TM_NOC_Incident_Tracker.xlsx
 */
export function downloadSharePointExcel(
  incidents: Incident[],
  histories: IncidentHistory[],
  attachments: AttachmentRecord[],
  notifications: NotificationRecord[],
  settings: SystemSetting[]
) {
  const wb = generateSharePointWorkbook(incidents, histories, attachments, notifications, settings);
  XLSX.writeFile(wb, 'TM_NOC_Incident_Tracker.xlsx');
}

/**
 * Exports current incident view to CSV
 */
export function exportIncidentsToCSV(incidents: Incident[], filename = 'TM_NOC_Incidents_Export.csv') {
  const rows = incidents.map((inc) => ({
    'Incident ID': inc.incidentId,
    'Call ID': inc.callId,
    'Escalation Date/Time': inc.escalationDateTime,
    'Reported By': inc.reportedBy,
    'Reporter Email': inc.reporterEmail,
    'Impacted User': inc.userName,
    'Customer': inc.customerName,
    'Site Location': inc.siteLocation,
    'Service': inc.serviceName,
    'Priority': inc.priority,
    'Status': inc.status,
    'Assigned Team': inc.assignedTeam,
    'Assigned Person': inc.assignedPerson,
    'Issue Title': inc.issueTitle,
    'Latest Update': inc.latestUpdate,
    'Next Follow-up': inc.nextFollowUpDateTime,
    'Last Updated': inc.lastUpdatedDateTime,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
