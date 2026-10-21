import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Incident,
  IncidentHistory,
  AttachmentRecord,
  NotificationRecord,
  SystemSetting,
  AdminSystemConfig,
  UserSession,
  IncidentStatus,
  UserConfirmationType,
  ConfirmationMethodType,
} from './types/nocSystem';
import {
  INITIAL_NOC_INCIDENTS,
  INITIAL_INCIDENT_HISTORIES,
  INITIAL_ATTACHMENTS,
  INITIAL_NOTIFICATION_RECORDS,
  INITIAL_SYSTEM_SETTINGS,
  DEFAULT_ADMIN_CONFIG,
} from './data/initialNOCIncidents';
import { NOCLoginPage } from './components/NOCLoginPage';
import { UnauthorizedAccessPage } from './components/UnauthorizedAccessPage';
import { NOCHeader } from './components/NOCHeader';
import { NOCSidebar, NOCTab } from './components/NOCSidebar';
import { NOCDashboardView } from './components/NOCDashboardView';
import { NOCOpsDashboardView } from './components/NOCOpsDashboardView';
import { NOCIncidentEntryForm } from './components/NOCIncidentEntryForm';
import { NOCIncidentListView } from './components/NOCIncidentListView';
import { NOCIncidentDetailModal } from './components/NOCIncidentDetailModal';
import { NOCResolutionModal } from './components/NOCResolutionModal';
import { NOCEmailReminderModal } from './components/NOCEmailReminderModal';
import { NOCReportingView } from './components/NOCReportingView';
import { NOCAdminPageView } from './components/NOCAdminPageView';
import { NOCSharePointManagerModal } from './components/NOCSharePointManagerModal';
import { isIncidentOverdue, createNotificationRecord } from './services/notificationService';
import { CheckCircle2, AlertTriangle, Info, Bell, X, Mail } from 'lucide-react';

const STORAGE_INCIDENTS = 'tm_noc_incidents_v3';
const STORAGE_HISTORIES = 'tm_noc_histories_v3';
const STORAGE_ATTACHMENTS = 'tm_noc_attachments_v3';
const STORAGE_NOTIFICATIONS = 'tm_noc_notifications_v3';
const STORAGE_SETTINGS = 'tm_noc_settings_v3';
const STORAGE_ADMIN_CONFIG = 'tm_noc_admin_config_v3';
const STORAGE_USER_AUTH = 'tm_noc_user_auth_v3';
const STORAGE_THEME = 'tm_noc_theme_v3';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export default function App() {
  // Theme state: dark / light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME);
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    } catch {
      // fallback
    }
    return false; // Default to clean corporate light mode per TM enterprise design
  });

  // Current authenticated user session (starts null so Login Page is the landing point)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_USER_AUTH);
      if (savedAuth) {
        return JSON.parse(savedAuth);
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Unauthorized access attempt state
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  // Active navigation tab (Ops Executive defaults to 'ops')
  const [activeTab, setActiveTab] = useState<NOCTab>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_USER_AUTH);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.role === 'OPS_EXECUTIVE') return 'ops';
      }
    } catch {
      // fallback
    }
    return 'dashboard';
  });

  // Incidents Database (Table 1 in SharePoint)
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INCIDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_NOC_INCIDENTS;
  });

  // Incident Histories (Table 2 in SharePoint)
  const [histories, setHistories] = useState<IncidentHistory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_INCIDENT_HISTORIES;
  });

  // Attachments Records (Table 3 in SharePoint)
  const [attachments, setAttachments] = useState<AttachmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ATTACHMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_ATTACHMENTS;
  });

  // Notification History Records (Table 4 in SharePoint)
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATION_RECORDS;
  });

  // System Settings (Table 5 in SharePoint)
  const [settings, setSettings] = useState<SystemSetting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  // Admin System Configuration
  const [adminConfig, setAdminConfig] = useState<AdminSystemConfig>(() => {
    let base = DEFAULT_ADMIN_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_CONFIG);
      if (saved) {
        base = JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    const sanitizedUsers = (base.authorizedUsers || []).map((u) => {
      if (u.role === 'NOC_USER' || u.team?.includes('Tier 2') || u.team?.includes('NOC Operations')) {
        return { ...u, team: 'NOC' };
      }
      return u;
    });
    return { ...base, authorizedUsers: sanitizedUsers };
  });

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [initialDetailTab, setInitialDetailTab] = useState<string>('overview');
  const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);
  const [remindingIncident, setRemindingIncident] = useState<Incident | null>(null);
  const [isSharePointModalOpen, setIsSharePointModalOpen] = useState(false);
  const [isCheckingReminders, setIsCheckingReminders] = useState(false);

  // List filter state
  const [listFilter, setListFilter] = useState<
    | {
        status?: string;
        priority?: string;
        onlyOverdue?: boolean;
        assignedToMe?: boolean;
      }
    | undefined
  >(undefined);

  // Toast stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error(e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORIES, JSON.stringify(histories));
    } catch (e) {
      console.error(e);
    }
  }, [histories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ATTACHMENTS, JSON.stringify(attachments));
    } catch (e) {
      console.error(e);
    }
  }, [attachments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ADMIN_CONFIG, JSON.stringify(adminConfig));
    } catch (e) {
      console.error(e);
    }
  }, [adminConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME, isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Derived counts
  const overdueCount = useMemo(() => {
    return incidents.filter((i) => isIncidentOverdue(i)).length;
  }, [incidents]);

  const myAssignedCount = useMemo(() => {
    if (!currentUser) return 0;
    const nameKey = currentUser.name.toLowerCase().split(' ')[0];
    return incidents.filter(
      (i) =>
        i.assignedPerson.toLowerCase().includes(nameKey) ||
        i.assignedPersonEmail.toLowerCase() === currentUser.email.toLowerCase()
    ).length;
  }, [incidents, currentUser]);

  // 1. Authentication Handlers
  const handleLogin = (session: UserSession, remember: boolean) => {
    setCurrentUser(session);
    setUnauthorizedEmail(null);
    if (remember) {
      try {
        localStorage.setItem(STORAGE_USER_AUTH, JSON.stringify(session));
      } catch (e) {
        console.error(e);
      }
    }
    if (session.role === 'OPS_EXECUTIVE') {
      setActiveTab('ops');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Welcome back, ${session.name}! Signed in with ${session.roleTitle}.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUnauthorizedEmail(null);
    try {
      localStorage.removeItem(STORAGE_USER_AUTH);
    } catch (e) {
      console.error(e);
    }
    showToast('Signed out of TM One / SciCom NOC Incident Tracking System.', 'info');
  };

  const handleUnauthorizedAttempt = (attemptedEmail: string) => {
    setUnauthorizedEmail(attemptedEmail);
  };

  // 2. Manual Incident Registration (From attached TM UCC template)
  const handleCreateIncident = (
    newIncident: Incident,
    newAttachments: AttachmentRecord[],
    isDraft: boolean
  ) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Add to Incidents Table
    setIncidents((prev) => [newIncident, ...prev]);

    // Record in IncidentHistory Table
    const historyEntry: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId: newIncident.incidentId,
      actionType: 'CREATED',
      fieldChanged: 'Initial Creation',
      previousValue: 'None',
      newValue: newIncident.status,
      remarks: `Manual incident entry recorded by ${currentUser?.name || 'NOC User'} based on TM UCC Escalation Form.`,
      updatedBy: currentUser?.name || 'NOC User',
      updatedDateTime: dateStr,
    };
    setHistories((prev) => [historyEntry, ...prev]);

    // Record Attachments in Table 3
    if (newAttachments.length > 0) {
      setAttachments((prev) => [...newAttachments, ...prev]);
    }

    // Auto-generate New Incident Email notification record in Table 4
    if (!isDraft) {
      const notifRecord = createNotificationRecord(newIncident, 'New Incident');
      setNotifications((prev) => [notifRecord, ...prev]);
    }

    setActiveTab('list');
    showToast(
      `Incident ${newIncident.incidentId} (${newIncident.customerName}) registered and stored in SharePoint Excel.`,
      'success'
    );
  };

  // 3. Confirm Resolution & Mark Resolved Workflow
  const handleConfirmResolution = (resolutionData: {
    resolutionSummary: string;
    resolutionAction: string;
    rootCause: string;
    resolvedBy: string;
    resolvedDateTime: string;
    userConfirmation: UserConfirmationType;
    confirmationMethod: ConfirmationMethodType;
    finalRemarks: string;
  }) => {
    if (!resolvingIncident) return;

    const targetId = resolvingIncident.incidentId;
    const previousStatus = resolvingIncident.status;

    // Update Incident Record in Table 1
    const updatedIncidents = incidents.map((inc) => {
      if (inc.incidentId === targetId) {
        return {
          ...inc,
          status: 'Resolved' as IncidentStatus,
          resolvedBy: resolutionData.resolvedBy,
          resolvedDateTime: resolutionData.resolvedDateTime,
          resolutionSummary: resolutionData.resolutionSummary,
          resolutionAction: resolutionData.resolutionAction,
          rootCause: resolutionData.rootCause,
          userConfirmation: resolutionData.userConfirmation,
          confirmationMethod: resolutionData.confirmationMethod,
          finalRemarks: resolutionData.finalRemarks,
          latestUpdate: `Issue marked Resolved by ${resolutionData.resolvedBy}. User Confirmation: ${resolutionData.userConfirmation} (${resolutionData.confirmationMethod}).`,
          lastUpdatedBy: currentUser?.name || 'NOC User',
          lastUpdatedDateTime: resolutionData.resolvedDateTime,
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);

    // Update currently selected modal view if open
    if (selectedIncident?.incidentId === targetId) {
      const updatedMatch = updatedIncidents.find((i) => i.incidentId === targetId);
      if (updatedMatch) setSelectedIncident(updatedMatch);
    }

    // Record in IncidentHistory Table 2
    const historyEntry: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId: targetId,
      actionType: 'RESOLVED',
      fieldChanged: 'Status',
      previousValue: previousStatus,
      newValue: 'Resolved',
      remarks: `Resolution confirmed by ${resolutionData.resolvedBy}. Root Cause: ${resolutionData.rootCause}. Action: ${resolutionData.resolutionAction}. Confirmation: ${resolutionData.userConfirmation} via ${resolutionData.confirmationMethod}.`,
      updatedBy: resolutionData.resolvedBy,
      updatedDateTime: resolutionData.resolvedDateTime,
    };
    setHistories((prev) => [historyEntry, ...prev]);

    // Record Resolved Notification in Table 4 (SharePoint)
    const resolvedMatch = updatedIncidents.find((i) => i.incidentId === targetId);
    if (resolvedMatch) {
      const notifRecord = createNotificationRecord(resolvedMatch, 'Resolved');
      setNotifications((prev) => [notifRecord, ...prev]);
    }

    setResolvingIncident(null);
    showToast(
      `Incident ${targetId} successfully resolved and recorded into SharePoint Excel. Reminders halted.`,
      'success'
    );
  };

  // 4. Send Email Notification Reminder for Ongoing Issue
  const handleSendReminder = (
    targetIncident: Incident,
    customSubject: string,
    customBody: string,
    recipients: string
  ) => {
    const now = new Date();
    const sentDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Create Notification Record in Table 4
    const newNotif: NotificationRecord = {
      notificationId: `NOTIF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      incidentId: targetIncident.incidentId,
      notificationType: 'Reminder',
      recipient: recipients,
      emailSubject: customSubject,
      emailBody: customBody,
      sentDateTime,
      deliveryStatus: 'Delivered',
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Record in History Table 2
    const histEntry: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId: targetIncident.incidentId,
      actionType: 'STATUS_CHANGE',
      fieldChanged: 'Email Reminder',
      previousValue: 'None',
      newValue: 'Reminder Sent',
      remarks: `Notification reminder sent for ongoing status (${targetIncident.status}) to ${recipients}.`,
      updatedBy: currentUser?.name || 'NOC System',
      updatedDateTime: sentDateTime,
    };
    setHistories((prev) => [histEntry, ...prev]);

    showToast(
      `Email reminder dispatched to ${recipients} for ongoing incident ${targetIncident.incidentId}.`,
      'success'
    );
  };

  // 5. Automated / Manual Reminder Check Execution
  const handleTriggerReminderCheck = () => {
    setIsCheckingReminders(true);
    setTimeout(() => {
      setIsCheckingReminders(false);
      const ongoingIncidents = incidents.filter(
        (i) => i.status !== 'Resolved' && i.status !== 'Closed' && !i.isArchived
      );

      if (ongoingIncidents.length === 0) {
        showToast('All incidents are resolved. No ongoing reminders required.', 'info');
        return;
      }

      // Check overdue or ongoing
      const overdueOrPending = ongoingIncidents.filter((i) => isIncidentOverdue(i) || i.status === 'Ongoing');
      const count = overdueOrPending.length;

      showToast(
        `Scanned ${ongoingIncidents.length} active incidents: ${count} ongoing/overdue items verified for notification schedules.`,
        'info'
      );
    }, 700);
  };

  // 6. Incident Updates from Detail Modal
  const handleAddProgressUpdate = (incidentId: string, updateText: string, newFollowUp?: string) => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = incidents.map((inc) => {
      if (inc.incidentId === incidentId) {
        return {
          ...inc,
          latestUpdate: updateText,
          nextFollowUpDateTime: newFollowUp || inc.nextFollowUpDateTime,
          lastUpdatedBy: currentUser?.name || 'NOC User',
          lastUpdatedDateTime: ts,
        };
      }
      return inc;
    });

    setIncidents(updated);
    if (selectedIncident?.incidentId === incidentId) {
      const match = updated.find((i) => i.incidentId === incidentId);
      if (match) setSelectedIncident(match);
    }

    const hist: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId,
      actionType: 'PROGRESS_UPDATE',
      fieldChanged: 'LatestUpdate',
      previousValue: selectedIncident?.latestUpdate || 'None',
      newValue: updateText,
      remarks: updateText,
      updatedBy: currentUser?.name || 'NOC User',
      updatedDateTime: ts,
    };
    setHistories((prev) => [hist, ...prev]);
    showToast(`Progress update added to ${incidentId} and synchronized to SharePoint.`, 'success');
  };

  const handleChangeStatus = (incidentId: string, newStatus: IncidentStatus, remarks: string) => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = incidents.map((inc) => {
      if (inc.incidentId === incidentId) {
        return {
          ...inc,
          status: newStatus,
          lastUpdatedBy: currentUser?.name || 'NOC User',
          lastUpdatedDateTime: ts,
        };
      }
      return inc;
    });

    setIncidents(updated);
    if (selectedIncident?.incidentId === incidentId) {
      const match = updated.find((i) => i.incidentId === incidentId);
      if (match) setSelectedIncident(match);
    }

    const hist: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId,
      actionType: 'STATUS_CHANGE',
      fieldChanged: 'Status',
      previousValue: selectedIncident?.status || 'Unknown',
      newValue: newStatus,
      remarks: remarks || `Status transitioned to ${newStatus}`,
      updatedBy: currentUser?.name || 'NOC User',
      updatedDateTime: ts,
    };
    setHistories((prev) => [hist, ...prev]);
    showToast(`Status of ${incidentId} changed to ${newStatus}.`, 'info');
  };

  const handleChangeAssignment = (
    incidentId: string,
    newPerson: string,
    newTeam: string,
    remarks: string
  ) => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = incidents.map((inc) => {
      if (inc.incidentId === incidentId) {
        return {
          ...inc,
          assignedPerson: newPerson,
          assignedTeam: newTeam,
          lastUpdatedBy: currentUser?.name || 'NOC User',
          lastUpdatedDateTime: ts,
        };
      }
      return inc;
    });

    setIncidents(updated);
    if (selectedIncident?.incidentId === incidentId) {
      const match = updated.find((i) => i.incidentId === incidentId);
      if (match) setSelectedIncident(match);
    }

    const hist: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId,
      actionType: 'ASSIGNED',
      fieldChanged: 'AssignedPerson',
      previousValue: selectedIncident?.assignedPerson || 'None',
      newValue: `${newPerson} (${newTeam})`,
      remarks: remarks || `Assigned to ${newPerson}`,
      updatedBy: currentUser?.name || 'NOC User',
      updatedDateTime: ts,
    };
    setHistories((prev) => [hist, ...prev]);
    showToast(`Incident ${incidentId} reassigned to ${newPerson} (${newTeam}).`, 'info');
  };

  const handleReopenIncident = (incidentId: string, remarks: string) => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = incidents.map((inc) => {
      if (inc.incidentId === incidentId) {
        return {
          ...inc,
          status: 'Reopened' as IncidentStatus,
          resolvedBy: '',
          resolvedDateTime: '',
          latestUpdate: `Incident Reopened: ${remarks}`,
          lastUpdatedBy: currentUser?.name || 'NOC User',
          lastUpdatedDateTime: ts,
        };
      }
      return inc;
    });

    setIncidents(updated);
    if (selectedIncident?.incidentId === incidentId) {
      const match = updated.find((i) => i.incidentId === incidentId);
      if (match) setSelectedIncident(match);
    }

    const hist: IncidentHistory = {
      historyId: `HIST-${Date.now()}`,
      incidentId,
      actionType: 'REOPENED',
      fieldChanged: 'Status',
      previousValue: 'Resolved',
      newValue: 'Reopened',
      remarks: `Incident reopened by ${currentUser?.name || 'NOC User'}: ${remarks}`,
      updatedBy: currentUser?.name || 'NOC User',
      updatedDateTime: ts,
    };
    setHistories((prev) => [hist, ...prev]);
    showToast(`Incident ${incidentId} has been reopened. Reminders resumed.`, 'warning');
  };

  // 7. Navigation helper
  const handleNavigateToList = (filter?: {
    status?: string;
    priority?: string;
    onlyOverdue?: boolean;
    assignedToMe?: boolean;
  }) => {
    setListFilter(filter);
    setActiveTab('list');
  };

  // RENDER: Unauthorized Access Page
  if (unauthorizedEmail) {
    return (
      <UnauthorizedAccessPage
        attemptedEmail={unauthorizedEmail}
        onReturnToLogin={() => setUnauthorizedEmail(null)}
        isDarkMode={isDarkMode}
      />
    );
  }

  // RENDER: Login Landing Page
  if (!currentUser) {
    return (
      <NOCLoginPage
        onLogin={handleLogin}
        onUnauthorizedAttempt={handleUnauthorizedAttempt}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 ${
        isDarkMode ? 'bg-[#121214] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Sidebar Navigation */}
      <NOCSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'list') setListFilter(undefined);
        }}
        user={currentUser}
        totalIncidentsCount={incidents.filter((i) => !i.isArchived).length}
        myAssignedCount={myAssignedCount}
        overdueCount={overdueCount}
        onOpenCreateModal={() => setActiveTab('create')}
        onOpenSharePointModal={() => setIsSharePointModalOpen(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <NOCHeader
          user={currentUser}
          overdueCount={overdueCount}
          onOpenSharePointModal={() => setIsSharePointModalOpen(true)}
          onTriggerReminderCheck={handleTriggerReminderCheck}
          isCheckingReminders={isCheckingReminders}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 0: Ops Executive Monthly Summary (For Ops role or when selected) */}
          {(activeTab === 'ops' || currentUser.role === 'OPS_EXECUTIVE') && (
            <NOCOpsDashboardView
              incidents={incidents}
              user={currentUser}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 1: Main NOC Dashboard (Technical NOC only) */}
          {activeTab === 'dashboard' && currentUser.role !== 'OPS_EXECUTIVE' && (
            <NOCDashboardView
              incidents={incidents}
              user={currentUser}
              onOpenCreateModal={() => setActiveTab('create')}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                setInitialDetailTab('overview');
              }}
              onNavigateToList={handleNavigateToList}
              onOpenSharePointModal={() => setIsSharePointModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 2: Manual Incident Registration Form (TM UCC Escalation Template) */}
          {activeTab === 'create' && (
            <NOCIncidentEntryForm
              existingIncidents={incidents}
              currentUser={currentUser}
              onSubmit={handleCreateIncident}
              onCancel={() => setActiveTab('dashboard')}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 3: Incident List Table */}
          {activeTab === 'list' && (
            <NOCIncidentListView
              incidents={incidents}
              currentUser={currentUser}
              onSelectIncident={(inc, tab) => {
                setSelectedIncident(inc);
                setInitialDetailTab(tab || 'overview');
              }}
              onOpenCreateModal={() => setActiveTab('create')}
              onOpenResolveModal={(inc) => setResolvingIncident(inc)}
              onOpenReminderModal={(inc) => setRemindingIncident(inc)}
              onChangeStatusQuick={(inc, newStatus) =>
                handleChangeStatus(inc.incidentId, newStatus, 'Quick status change via list')
              }
              initialFilter={listFilter}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 4: My Assigned Incidents */}
          {activeTab === 'my-assigned' && (
            <NOCIncidentListView
              incidents={incidents}
              currentUser={currentUser}
              onSelectIncident={(inc, tab) => {
                setSelectedIncident(inc);
                setInitialDetailTab(tab || 'overview');
              }}
              onOpenCreateModal={() => setActiveTab('create')}
              onOpenResolveModal={(inc) => setResolvingIncident(inc)}
              onOpenReminderModal={(inc) => setRemindingIncident(inc)}
              onChangeStatusQuick={(inc, newStatus) =>
                handleChangeStatus(inc.incidentId, newStatus, 'Quick status change via list')
              }
              initialFilter={{ assignedToMe: true }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 5: Overdue Incidents */}
          {activeTab === 'overdue' && (
            <NOCIncidentListView
              incidents={incidents}
              currentUser={currentUser}
              onSelectIncident={(inc, tab) => {
                setSelectedIncident(inc);
                setInitialDetailTab(tab || 'overview');
              }}
              onOpenCreateModal={() => setActiveTab('create')}
              onOpenResolveModal={(inc) => setResolvingIncident(inc)}
              onOpenReminderModal={(inc) => setRemindingIncident(inc)}
              onChangeStatusQuick={(inc, newStatus) =>
                handleChangeStatus(inc.incidentId, newStatus, 'Quick status change via list')
              }
              initialFilter={{ onlyOverdue: true }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 6: Reports & Export */}
          {activeTab === 'reports' && (
            <NOCReportingView
              incidents={incidents}
              onOpenSharePointModal={() => setIsSharePointModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 7: Admin Configuration (Admin credentials required) */}
          {activeTab === 'admin' && (
            <NOCAdminPageView
              currentUser={currentUser}
              config={adminConfig}
              onUpdateConfig={(newConfig: AdminSystemConfig) => {
                setAdminConfig(newConfig);
                showToast('Admin configuration successfully saved.', 'success');
              }}
              onTestSharePointConnection={() => {
                showToast('SharePoint document library connection active and verified.', 'success');
              }}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <NOCIncidentDetailModal
          incident={selectedIncident}
          histories={histories}
          attachments={attachments}
          notifications={notifications}
          currentUser={currentUser}
          initialTab={initialDetailTab}
          onClose={() => setSelectedIncident(null)}
          onOpenResolveModal={(inc) => setResolvingIncident(inc)}
          onOpenReminderModal={(inc) => setRemindingIncident(inc)}
          onAddProgressUpdate={handleAddProgressUpdate}
          onChangeStatus={handleChangeStatus}
          onChangeAssignment={handleChangeAssignment}
          onReopenIncident={handleReopenIncident}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Resolution Confirmation Modal */}
      {resolvingIncident && (
        <NOCResolutionModal
          incident={resolvingIncident}
          currentUser={currentUser}
          onConfirmResolution={handleConfirmResolution}
          onClose={() => setResolvingIncident(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Email Notification Reminder Dispatch Modal */}
      {remindingIncident && (
        <NOCEmailReminderModal
          incident={remindingIncident}
          currentUser={currentUser}
          onSendReminder={handleSendReminder}
          onClose={() => setRemindingIncident(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SharePoint Excel Storage Manager Modal */}
      {isSharePointModalOpen && (
        <NOCSharePointManagerModal
          incidents={incidents}
          histories={histories}
          attachments={attachments}
          notifications={notifications}
          settings={settings}
          onClose={() => setIsSharePointModalOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-2xl border shadow-xl flex items-start gap-2.5 text-xs pointer-events-auto animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : t.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
            <span className="flex-1 font-medium">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
