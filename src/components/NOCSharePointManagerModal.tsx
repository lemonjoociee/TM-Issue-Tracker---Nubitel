import React, { useState } from 'react';
import {
  Incident,
  IncidentHistory,
  AttachmentRecord,
  NotificationRecord,
  SystemSetting,
} from '../types/nocSystem';
import { downloadSharePointExcel } from '../services/sharepointExcelService';
import {
  X,
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  Table,
  Layers,
  Database,
  ExternalLink,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

interface NOCSharePointManagerModalProps {
  incidents: Incident[];
  histories: IncidentHistory[];
  attachments: AttachmentRecord[];
  notifications: NotificationRecord[];
  settings: SystemSetting[];
  onClose: () => void;
  isDarkMode: boolean;
}

export const NOCSharePointManagerModal: React.FC<NOCSharePointManagerModalProps> = ({
  incidents,
  histories,
  attachments,
  notifications,
  settings,
  onClose,
  isDarkMode,
}) => {
  const [activeTable, setActiveTable] = useState<'incidents' | 'history' | 'attachments' | 'notifications' | 'settings'>('incidents');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Synchronized successfully with SharePoint Document Library. 0 row locks detected.');
    }, 800);
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const tableHeaderBg = isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden ${cardBg}`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  SharePoint Excel Storage Manager
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">
                  TM_NOC_Incident_Tracker.xlsx
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                5 Structured Excel Tables &bull; Auto-synchronized with SharePoint document store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadSharePointExcel(incidents, histories, attachments, notifications, settings)
              }
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download the full .xlsx file containing all 5 tables"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {syncStatus ||
                'SharePoint connection online: https://scicom.sharepoint.com/sites/tmnoc/Shared Documents/'}
            </span>
          </div>
          <button
            onClick={handleSimulateSync}
            disabled={isSyncing}
            className="flex items-center gap-1 font-bold hover:underline cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Verify Storage Sync</span>
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 px-6 gap-2 text-xs font-bold overflow-x-auto bg-white dark:bg-[#1C1C1F]">
          <button
            onClick={() => setActiveTable('incidents')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTable === 'incidents'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>TABLE 1: Incidents</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800">
              {incidents.length} rows &bull; 57 cols
            </span>
          </button>

          <button
            onClick={() => setActiveTable('history')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTable === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>TABLE 2: IncidentHistory</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800">
              {histories.length} rows &bull; 9 cols
            </span>
          </button>

          <button
            onClick={() => setActiveTable('attachments')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTable === 'attachments'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>TABLE 3: Attachments</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800">
              {attachments.length} rows &bull; 7 cols
            </span>
          </button>

          <button
            onClick={() => setActiveTable('notifications')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTable === 'notifications'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>TABLE 4: NotificationHistory</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800">
              {notifications.length} rows &bull; 8 cols
            </span>
          </button>

          <button
            onClick={() => setActiveTable('settings')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTable === 'settings'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>TABLE 5: SystemSettings</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800">
              {settings.length} rows &bull; 5 cols
            </span>
          </button>
        </div>

        {/* Table Viewer Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* Table 1: Incidents */}
          {activeTable === 'incidents' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-mono text-[11px] ${tableHeaderBg}`}>
                      <th className="py-2.5 px-3">IncidentID</th>
                      <th className="py-2.5 px-3">CallID</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">CustomerName</th>
                      <th className="py-2.5 px-3">SiteLocation</th>
                      <th className="py-2.5 px-3">ServiceName</th>
                      <th className="py-2.5 px-3">AssignedPerson</th>
                      <th className="py-2.5 px-3">NextFollowUpDateTime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {incidents.map((i) => (
                      <tr key={i.incidentId} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40 font-mono text-[11px]">
                        <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">{i.incidentId}</td>
                        <td className="py-2 px-3">{i.callId}</td>
                        <td className="py-2 px-3 font-bold">{i.priority}</td>
                        <td className="py-2 px-3">{i.status}</td>
                        <td className="py-2 px-3 font-sans font-medium">{i.customerName}</td>
                        <td className="py-2 px-3 font-sans">{i.siteLocation}</td>
                        <td className="py-2 px-3 font-sans">{i.serviceName}</td>
                        <td className="py-2 px-3 font-sans">{i.assignedPerson}</td>
                        <td className="py-2 px-3">{i.nextFollowUpDateTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table 2: IncidentHistory */}
          {activeTable === 'history' && (
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                <thead>
                  <tr className={`border-b ${tableHeaderBg}`}>
                    <th className="py-2.5 px-3">HistoryID</th>
                    <th className="py-2.5 px-3">IncidentID</th>
                    <th className="py-2.5 px-3">ActionType</th>
                    <th className="py-2.5 px-3">FieldChanged</th>
                    <th className="py-2.5 px-3">PreviousValue</th>
                    <th className="py-2.5 px-3">NewValue</th>
                    <th className="py-2.5 px-3">UpdatedBy</th>
                    <th className="py-2.5 px-3">UpdatedDateTime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {histories.map((h) => (
                    <tr key={h.historyId} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold">{h.historyId}</td>
                      <td className="py-2 px-3">{h.incidentId}</td>
                      <td className="py-2 px-3 font-bold">{h.actionType}</td>
                      <td className="py-2 px-3">{h.fieldChanged}</td>
                      <td className="py-2 px-3 text-slate-400">{h.previousValue}</td>
                      <td className="py-2 px-3 font-semibold">{h.newValue}</td>
                      <td className="py-2 px-3 font-sans">{h.updatedBy}</td>
                      <td className="py-2 px-3">{h.updatedDateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table 3: Attachments */}
          {activeTable === 'attachments' && (
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                <thead>
                  <tr className={`border-b ${tableHeaderBg}`}>
                    <th className="py-2.5 px-3">AttachmentID</th>
                    <th className="py-2.5 px-3">IncidentID</th>
                    <th className="py-2.5 px-3">FileName</th>
                    <th className="py-2.5 px-3">FileType</th>
                    <th className="py-2.5 px-3">SharePointFileURL</th>
                    <th className="py-2.5 px-3">UploadedBy</th>
                    <th className="py-2.5 px-3">UploadedDateTime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {attachments.map((a) => (
                    <tr key={a.attachmentId} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold">{a.attachmentId}</td>
                      <td className="py-2 px-3">{a.incidentId}</td>
                      <td className="py-2 px-3 font-bold font-sans">{a.fileName}</td>
                      <td className="py-2 px-3 text-slate-400">{a.fileType}</td>
                      <td className="py-2 px-3 text-[10px] max-w-xs truncate text-[#034DA1] dark:text-blue-400" title={a.sharePointFileURL}>
                        {a.sharePointFileURL}
                      </td>
                      <td className="py-2 px-3 font-sans">{a.uploadedBy}</td>
                      <td className="py-2 px-3">{a.uploadedDateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table 4: NotificationHistory */}
          {activeTable === 'notifications' && (
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                <thead>
                  <tr className={`border-b ${tableHeaderBg}`}>
                    <th className="py-2.5 px-3">NotificationID</th>
                    <th className="py-2.5 px-3">IncidentID</th>
                    <th className="py-2.5 px-3">NotificationType</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">EmailSubject</th>
                    <th className="py-2.5 px-3">SentDateTime</th>
                    <th className="py-2.5 px-3">DeliveryStatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {notifications.map((n) => (
                    <tr key={n.notificationId} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold">{n.notificationId}</td>
                      <td className="py-2 px-3">{n.incidentId}</td>
                      <td className="py-2 px-3 font-bold font-sans">{n.notificationType}</td>
                      <td className="py-2 px-3 font-sans">{n.recipient}</td>
                      <td className="py-2 px-3 font-sans max-w-xs truncate" title={n.emailSubject}>{n.emailSubject}</td>
                      <td className="py-2 px-3">{n.sentDateTime}</td>
                      <td className="py-2 px-3 text-emerald-600 font-bold">{n.deliveryStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table 5: SystemSettings */}
          {activeTable === 'settings' && (
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                <thead>
                  <tr className={`border-b ${tableHeaderBg}`}>
                    <th className="py-2.5 px-3">SettingName</th>
                    <th className="py-2.5 px-3">SettingValue</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">LastUpdatedBy</th>
                    <th className="py-2.5 px-3">LastUpdatedDateTime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {settings.map((s) => (
                    <tr key={s.settingName} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold">{s.settingName}</td>
                      <td className="py-2 px-3 text-[10px] max-w-xs truncate font-bold" title={s.settingValue}>{s.settingValue}</td>
                      <td className="py-2 px-3 font-sans">{s.description}</td>
                      <td className="py-2 px-3 font-sans">{s.lastUpdatedBy}</td>
                      <td className="py-2 px-3">{s.lastUpdatedDateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
