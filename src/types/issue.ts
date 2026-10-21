export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type IssueStatus =
  | 'Resolved'
  | 'In Progress'
  | 'In Review'
  | 'On Hold'
  | 'Open'
  | 'Monitoring'
  | 'Closed';

export type RcaStatus =
  | 'Included'
  | 'Pending RCA'
  | 'In Progress'
  | 'In Review'
  | 'Resolved'
  | 'N/A';

export type MonthName = 'July' | 'August' | 'September' | 'October';

export interface Issue {
  id: number;
  reportedDate: string; // e.g. "15-Jul-26"
  reportedTime: string; // e.g. "1.50PM"
  solvedDate: string; // e.g. "15-Jul-26" or ""
  solvedTime: string; // e.g. "2.35PM" or ""
  reportedBy: string;
  contactTeam: string; // NOC Lead/PIC e.g. "Harveet", "Nath", "Hargobind"
  priority: Priority;
  issueArea: string; // "Email", "SocMed", "RTA Team", "FMC", "Voice", "SIP", etc.
  status: IssueStatus;
  longDescription: string;
  expectedResult: string;
  impact: string;
  evidenceLink: string;
  resolvedDateTime: string;
  resolution: string;
  rootCause: string;
  actionTaken: string;
  trackerLabel: string;
  lastUpdated: string;
  ageHours: string;
  month: MonthName;
  rcaStatus: RcaStatus;

  // Standard NOC Incident Management fields
  ticketId?: string; // e.g. INC-2026-00001 or NOC-20261019-001
  customer?: string; // e.g. "Nubitel", "Telekom Malaysia", "CelcomDigi", "Maxis"
  location?: string; // e.g. "KL", "Cyberjaya", "JB", "Menara TM"
  service?: string; // "Voice", "SIP", "PRI", "Contact Center", "IVR", "SMS", "Network", etc.
  callId?: string; // Incident ID, Ticket Number, Call ID, Reference Number
  affectedUser?: string; // Affected user, team, or business unit
  userEmail?: string; // Relevant user email
  businessImpact?: string; // Operational impact
  latestUpdate?: string; // Latest status update
  category?: string; // "Service Incident", "Service Monitoring", "Service Recovery"
}

export interface MonthlySummary {
  month: MonthName;
  totalIssues: number;
  resolved: number;
  open: number;
  resolutionRate: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  rcaIncluded: number;
  pendingRca: number;
  issuesWithResTime: number;
  avgResolutionHours: number;
}

export interface GuidelinePlaybook {
  id: string;
  title: string;
  category: string;
  severityDefault: Priority;
  symptoms: string[];
  rootCauseSummary: string;
  recommendedResolution: string;
  preventiveAction: string;
  historicalTicketIds: number[];
  vendorOrModule: string;
}
