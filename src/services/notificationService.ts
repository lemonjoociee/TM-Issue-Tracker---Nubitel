import { Incident, NotificationRecord } from '../types/nocSystem';

/**
 * Calculates human-readable incident age from creation date/time to now.
 */
export function calculateIncidentAge(createdDateTime: string): string {
  try {
    const created = new Date(createdDateTime.replace(/-/g, '/'));
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours < 1) {
      return `${mins}m`;
    }
    const days = Math.floor(hours / 24);
    if (days >= 1) {
      const remHours = hours % 24;
      return `${days}d ${remHours}h`;
    }
    return `${hours}h ${mins}m`;
  } catch {
    return '0m';
  }
}

/**
 * Checks if an incident is currently overdue based on next follow-up date and time.
 */
export function isIncidentOverdue(incident: Incident): boolean {
  if (incident.status === 'Resolved' || incident.status === 'Closed' || incident.status === 'Draft') {
    return false;
  }
  if (!incident.nextFollowUpDateTime) return false;

  try {
    const followUp = new Date(incident.nextFollowUpDateTime.replace(/-/g, '/'));
    const now = new Date();
    return now.getTime() > followUp.getTime();
  } catch {
    return false;
  }
}

/**
 * Generates the official email content and subject matching Section 12 requirements.
 */
export function generateEmailPayload(
  type: 'New Incident' | 'Reminder' | 'Resolved' | 'Update' | 'Assignment' | 'Reopened',
  incident: Incident
): { subject: string; body: string; recipient: string } {
  const age = calculateIncidentAge(incident.createdDateTime);
  const recipient = [incident.assignedPersonEmail, incident.reporterEmail, incident.picEmail]
    .filter(Boolean)
    .join(', ');

  if (type === 'New Incident') {
    const subject = `[New Incident] ${incident.incidentId} | ${incident.priority} | ${incident.issueTitle}`;
    const body = `A new NOC incident has been registered.

Incident ID: ${incident.incidentId}
Call ID: ${incident.callId}
Reported By: ${incident.reportedBy}
User/Customer: ${incident.userName}
Site/Location: ${incident.siteLocation}
System/Service: ${incident.serviceName}
Priority: ${incident.priority}
Status: ${incident.status}
Assigned To: ${incident.assignedPerson}
Issue: ${incident.issueDescription}
Created Date and Time: ${incident.createdDateTime}

Please access the NOC Incident Tracking System for full details.`;
    return { subject, body, recipient };
  }

  if (type === 'Reminder') {
    const subject = `[Reminder] ${incident.incidentId} is still ${incident.status}`;
    const body = `This is an automated reminder that the following incident is still unresolved.

Incident ID: ${incident.incidentId}
Call ID: ${incident.callId}
Priority: ${incident.priority}
Current Status: ${incident.status}
Assigned To: ${incident.assignedPerson}
Issue: ${incident.issueTitle}
Latest Update: ${incident.latestUpdate || 'No recent progress updates'}
Next Follow-up: ${incident.nextFollowUpDateTime}
Incident Age: ${age}

Please review the incident and provide an update.

This reminder will continue until the incident is marked Resolved or Closed.`;
    return { subject, body, recipient };
  }

  if (type === 'Resolved') {
    const subject = `[Resolved] ${incident.incidentId} | ${incident.issueTitle}`;
    const body = `The following incident has been marked as resolved.

Incident ID: ${incident.incidentId}
Call ID: ${incident.callId}
User/Customer: ${incident.userName}
Site/Location: ${incident.siteLocation}
Issue: ${incident.issueTitle}
Resolution Summary: ${incident.resolutionSummary || 'Resolution completed'}
Resolution Action: ${incident.resolutionAction || 'Action confirmed by NOC'}
Resolved By: ${incident.resolvedBy || 'Authorized NOC Engineer'}
Resolved Date and Time: ${incident.resolvedDateTime || new Date().toISOString()}
User Confirmation: ${incident.userConfirmation || 'Confirmed Resolved'}

Please contact the NOC team if the issue occurs again.`;
    return { subject, body, recipient };
  }

  // Fallback for status change or update
  const subject = `[Update] ${incident.incidentId} | Status: ${incident.status}`;
  const body = `Incident ${incident.incidentId} (${incident.issueTitle}) has been updated.
Current Status: ${incident.status}
Assigned To: ${incident.assignedPerson}
Latest Update: ${incident.latestUpdate}
Next Follow-up: ${incident.nextFollowUpDateTime}`;

  return { subject, body, recipient };
}

/**
 * Creates a notification record for TABLE 4: NotificationHistory
 */
export function createNotificationRecord(
  incident: Incident,
  type: 'New Incident' | 'Assignment' | 'Update' | 'Status Change' | 'Reminder' | 'Overdue' | 'Resolved' | 'Reopened'
): NotificationRecord {
  const { subject, body, recipient } = generateEmailPayload(type as any, incident);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);

  return {
    notificationId: `NOTIF-${yyyy}${mm}${dd}-${rand}`,
    incidentId: incident.incidentId,
    notificationType: type,
    recipient: recipient || 'tmnoc@scicom.com.my',
    emailSubject: subject,
    emailBody: body,
    sentDateTime: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
    deliveryStatus: 'Delivered',
  };
}
