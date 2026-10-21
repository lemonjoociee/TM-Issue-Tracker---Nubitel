export type IncidentStatus =
  | 'Draft'
  | 'New'
  | 'Ongoing'
  | 'Pending User'
  | 'Pending Vendor'
  | 'Pending Internal Team'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type BusinessImpact =
  | 'P1 – Critical'
  | 'P2 – High'
  | 'P3 – Medium'
  | 'P4 – Low';

export type SystemChannel =
  | 'Voice'
  | 'Email'
  | 'Chat'
  | 'Social Media'
  | 'Other Channel';

export type LoginAccessStatus =
  | 'Able to login/access'
  | 'Unable to login/access'
  | 'Intermittent';

export type WorkLocationType = 'WFH' | 'WFO' | 'WFH & WFO';

export type NetworkConnectionType = 'LAN' | 'VPN' | 'LAN & VPN' | 'Direct';

export type UsersAffectedType =
  | 'Single User'
  | 'Multiple Users'
  | 'All Users'
  | 'Unknown';

export type IssueBehaviorType = 'Continuous' | 'Intermittent' | 'Unknown';

export type InternetVPNConnectedType = 'Yes' | 'No' | 'Degraded';

export type UserConfirmationType =
  | 'Confirmed Resolved'
  | 'Unable to Contact'
  | 'Confirmation Pending'
  | 'Not Required';

export type ConfirmationMethodType =
  | 'Email'
  | 'Phone Call'
  | 'Microsoft Teams'
  | 'System Verification'
  | 'Other';

export type ReminderFrequencyType =
  | 'Every 30 minutes'
  | 'Every 1 hour'
  | 'Every 4 hours'
  | 'Once per business day';

export type EscalationLevelType = 'L1' | 'L2' | 'L3' | 'Executive';

export type UserRole = 'NOC_USER' | 'ADMIN' | 'OPS_EXECUTIVE';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  team: string;
  isPermitted: boolean;
}

/**
 * Complete Incident Record representing TABLE 1: Incidents in SharePoint Excel
 * TM_NOC_Incident_Tracker.xlsx
 */
export interface Incident {
  // Identification
  incidentId: string; // e.g., "INC-2026-00001"
  callId: string; // Fictional placeholder for call / ticket reference
  escalationDateTime: string; // "YYYY-MM-DD HH:mm"

  // Reporter Details
  reportedBy: string;
  reporterContactNumber: string;
  reporterEmail: string;

  // Impacted User & Site
  userName: string;
  userContactNumber: string;
  userEmail: string;
  siteLocation: string;
  customerName: string;
  customerNumberANI: string;
  department: string;

  // System & Service
  systemChannelAffected: SystemChannel[];
  serviceName: string;
  applicationName: string;
  vendorName: string;
  loginAccess: LoginAccessStatus;
  workLocation: WorkLocationType;
  networkConnection: NetworkConnectionType;
  businessImpact: BusinessImpact;
  priority: Priority;
  dnsNumber?: string; // AnyDesk / DNS
  vrOutcome?: string;

  // Issue Details
  issueTitle: string;
  issueDescription: string;
  errorMessage: string;
  usersAffected: UsersAffectedType;
  issueBehavior: IssueBehaviorType;
  issueOccurredDateTime: string;
  internetVPNConnected: InternetVPNConnectedType;
  troubleshootingPerformed: string;
  additionalRemarks?: string;

  // Inbound Call Information
  inboundCallId: string;
  inboundCustomerNumberANI: string;
  inboundCallTimestamp: string;
  inboundDNIS: string;
  inboundIVROutcome: string;

  // Assignment & Follow-up
  assignedTeam: string;
  assignedPerson: string;
  assignedPersonEmail: string;
  vendorPIC: string;
  picEmail: string;
  picContactNumber: string;
  status: IncidentStatus;
  nextFollowUpDateTime: string;
  latestUpdate: string;
  reminderFrequency: ReminderFrequencyType;
  escalationLevel: EscalationLevelType;

  // Metadata & Audit
  createdBy: string;
  createdDateTime: string;
  lastUpdatedBy: string;
  lastUpdatedDateTime: string;

  // Resolution Confirmation Details
  resolvedBy?: string;
  resolvedDateTime?: string;
  resolutionSummary?: string;
  resolutionAction?: string;
  rootCause?: string;
  userConfirmation?: UserConfirmationType;
  confirmationMethod?: ConfirmationMethodType;
  finalRemarks?: string;

  // Admin archive state (records cannot be permanently deleted)
  isArchived?: boolean;
}

/**
 * TABLE 2: IncidentHistory
 */
export interface IncidentHistory {
  historyId: string;
  incidentId: string;
  actionType:
    | 'CREATED'
    | 'UPDATED'
    | 'ASSIGNED'
    | 'STATUS_CHANGE'
    | 'PROGRESS_UPDATE'
    | 'RESOLVED'
    | 'REOPENED'
    | 'ARCHIVED';
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  remarks: string;
  updatedBy: string;
  updatedDateTime: string;
}

/**
 * TABLE 3: Attachments
 */
export interface AttachmentRecord {
  attachmentId: string;
  incidentId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sharePointFileURL: string;
  uploadedBy: string;
  uploadedDateTime: string;
}

/**
 * TABLE 4: NotificationHistory
 */
export interface NotificationRecord {
  notificationId: string;
  incidentId: string;
  notificationType:
    | 'New Incident'
    | 'Assignment'
    | 'Update'
    | 'Status Change'
    | 'Reminder'
    | 'Overdue'
    | 'Resolved'
    | 'Reopened';
  recipient: string;
  emailSubject: string;
  emailBody: string;
  sentDateTime: string;
  deliveryStatus: 'Delivered' | 'Pending' | 'Failed';
  errorDetails?: string;
}

/**
 * TABLE 5: SystemSettings
 */
export interface SystemSetting {
  settingName: string;
  settingValue: string;
  description: string;
  lastUpdatedBy: string;
  lastUpdatedDateTime: string;
}

/**
 * Admin Configuration Settings
 */
export interface AdminSystemConfig {
  sharePointWorkbookPath: string;
  sharePointLibraryUrl: string;
  powerAutomateEndpoint: string;
  reminderCheckIntervalMinutes: number; // default: 60
  reminderSchedule: {
    p1Minutes: number; // default: 30
    p2Minutes: number; // default: 60
    p3Hours: number; // default: 4
    p4Hours: number; // default: 24 (once per business day)
  };
  businessHours: {
    is24x7: boolean;
    start: string;
    end: string;
    workDays: string[];
  };
  teams: string[];
  sites: string[];
  services: string[];
  vendors: { name: string; contact: string; email: string }[];
  authorizedUsers: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    team: string;
    isActive: boolean;
    isPermitted: boolean;
  }[];
  invitations?: UserInvitationRecord[];
}

export interface UserInvitationRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  team: string;
  invitedBy: string;
  invitedAt: string;
  status: 'Delivered' | 'Pending Activation' | 'Accepted';
  token: string;
  customNote?: string;
}
