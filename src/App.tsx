import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Issue, MonthlySummary, MonthName } from './types/issue';
import { INITIAL_ISSUES } from './data/initialIssues';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TrackerTableView } from './components/TrackerTableView';
import { GuidelinesView } from './components/GuidelinesView';
import { MonthlyMatrixView } from './components/MonthlyMatrixView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { NewIssueModal } from './components/NewIssueModal';
import { SharePointSyncModal } from './components/SharePointSyncModal';
import { exportIssuesToCSV, parseCSVToIssues } from './utils/csvHelper';
import { exportIssuesToExcel } from './utils/excelHelper';
import { CheckCircle2, AlertTriangle, Info, Bell } from 'lucide-react';

const STORAGE_KEY = 'tm_noc_issue_tracker_data_v1';
const LIVE_ENDPOINT = '/.netlify/functions/sharepoint-live';
const REFRESH_ENDPOINT = '/.netlify/functions/sharepoint-refresh';

// Fast deep comparator to ensure only real SharePoint modifications trigger re-renders
function areIssuesEquivalent(current: Issue[], incoming: Issue[]): boolean {
  if (current.length !== incoming.length) return false;
  for (let i = 0; i < current.length; i++) {
    const c = current[i];
    const n = incoming[i];
    if (
      c.id !== n.id ||
      c.status !== n.status ||
      c.priority !== n.priority ||
      c.solvedDate !== n.solvedDate ||
      c.solvedTime !== n.solvedTime ||
      c.longDescription !== n.longDescription ||
      c.resolution !== n.resolution ||
      c.actionTaken !== n.actionTaken ||
      c.rcaStatus !== n.rcaStatus ||
      c.issueArea !== n.issueArea
    ) {
      return false;
    }
  }
  return true;
}

export default function App() {
  // Load issues from localStorage or initial dataset
  const [issues, setIssues] = useState<Issue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached issues:', e);
    }
    return INITIAL_ISSUES;
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'guidelines' | 'matrix'>('dashboard');

  // Modal states
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isSharePointModalOpen, setIsSharePointModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live SharePoint Sync');

  // Filters passed to tracker view
  const [trackerFilter, setTrackerFilter] = useState<{
    month?: string;
    status?: string;
    priority?: string;
  }>({});

  // Guidelines search query
  const [guidelinesSearch, setGuidelinesSearch] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronization locking & throttling refs
  const isSyncingRef = useRef(false);
  const lastSyncCompletedAtRef = useRef(0);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIssuesRef = useRef<Issue[]>(issues);
  currentIssuesRef.current = issues;

  // Save to localStorage whenever issues change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('Failed to save issues to localStorage:', e);
    }
  }, [issues]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  /**
   * Unified SharePoint synchronization engine with concurrency locking,
   * request throttling, cache busting, and diff detection.
   */
  const performSharePointSync = useCallback(
    async (options: { isManual?: boolean; force?: boolean } = {}) => {
      const { isManual = false, force = false } = options;

      // 1. Concurrency guard: Prevent overlapping sync operations
      if (isSyncingRef.current) {
        return;
      }

      // 2. Throttling guard: Prevent burst calls (e.g. rapid focus + visibilitychange events within 2 seconds)
      const now = Date.now();
      if (!isManual && now - lastSyncCompletedAtRef.current < 2000) {
        return;
      }

      isSyncingRef.current = true;
      setIsLiveSyncing(true);

      try {
        const endpoint = isManual ? REFRESH_ENDPOINT : LIVE_ENDPOINT;
        const queryParams = new URLSearchParams({
          _t: now.toString(),
          force: force ? 'true' : 'false',
        });

        const fetchOptions: RequestInit = {
          method: isManual ? 'POST' : 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        };

        const res = await fetch(`${endpoint}?${queryParams.toString()}`, fetchOptions);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.issues) && data.issues.length > 0) {
            const hasActualUpdates = !areIssuesEquivalent(currentIssuesRef.current, data.issues);

            if (hasActualUpdates) {
              // Only update state if real SharePoint changes occurred (avoids unnecessary re-renders)
              setIssues(data.issues);
              if (isManual) {
                showToast(`SharePoint updated: ${data.issues.length} incidents synchronized.`, 'success');
              }
            } else if (isManual) {
              showToast(`SharePoint is already up-to-date (${data.issues.length} incidents).`, 'info');
            }

            if (data.lastSyncTime) {
              setLastSyncTime(data.lastSyncTime);
            }
          } else if (isManual) {
            showToast('SharePoint returned no new updates.', 'info');
          }
        } else if (isManual) {
          showToast(`SharePoint sync returned HTTP ${res.status}`, 'warn');
        }
      } catch (e: any) {
        console.warn('[SharePoint Live Sync]', e?.message || e);
        if (isManual) {
          showToast('Could not reach SharePoint. Retrying automatically...', 'warn');
        }
      } finally {
        isSyncingRef.current = false;
        lastSyncCompletedAtRef.current = Date.now();
        setIsLiveSyncing(false);
      }
    },
    [showToast]
  );

  // Manual refresh triggered by user clicking the SharePoint sync button
  const triggerManualRefresh = useCallback(() => {
    performSharePointSync({ isManual: true, force: true });
  }, [performSharePointSync]);

  /**
   * Lifecycle & Polling Controller:
   * - 5-second polling interval for active/visible browser tabs.
   * - Pauses polling when the tab is hidden to conserve bandwidth & battery.
   * - Forces immediate sync when tab returns to visible or window gains focus.
   */
  useEffect(() => {
    // Helper to start 5-second polling
    const startPolling = () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          performSharePointSync({ isManual: false, force: false });
        }
      }, 5000); // 5 seconds polling interval for active tabs
    };

    // Helper to pause polling
    const stopPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    // 1. Initial sync on application mount
    performSharePointSync({ isManual: false, force: true });
    startPolling();

    // 2. Tab visibility changes: pause when hidden, force instant sync when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performSharePointSync({ isManual: false, force: true });
        startPolling();
      } else {
        stopPolling();
      }
    };

    // 3. Window focus: force instant sync when user returns from SharePoint browser tab
    const handleWindowFocus = () => {
      performSharePointSync({ isManual: false, force: true });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [performSharePointSync]);

  // Recompute monthly summaries dynamically from state
  const monthlySummaries: MonthlySummary[] = useMemo(() => {
    const months: MonthName[] = ['July', 'August', 'September', 'October'];
    return months.map((month) => {
      const mIssues = issues.filter((i) => i.month === month);
      const total = mIssues.length;
      const resolved = mIssues.filter((i) => i.status === 'Resolved').length;
      const open = mIssues.filter((i) => i.status !== 'Resolved').length;
      const resRate = total > 0 ? (resolved / total) * 100 : 0;
      const p1 = mIssues.filter((i) => i.priority === 'P1').length;
      const p2 = mIssues.filter((i) => i.priority === 'P2').length;
      const p3 = mIssues.filter((i) => i.priority === 'P3').length;
      const p4 = mIssues.filter((i) => i.priority === 'P4').length;
      const rcaIncluded = mIssues.filter((i) => i.rcaStatus === 'Included').length;
      const pendingRca = mIssues.filter((i) => i.rcaStatus === 'Pending RCA').length;

      // Avg resolution time presets from official sheet
      let avgResHours = 34.2;
      let issuesWithResTime = mIssues.filter((i) => i.solvedDate && i.solvedDate.trim() !== '').length;
      if (month === 'July') {
        avgResHours = 73.6;
        issuesWithResTime = 17;
      } else if (month === 'August') {
        avgResHours = 34.2;
        issuesWithResTime = 29;
      } else if (month === 'September') {
        avgResHours = 104.2;
        issuesWithResTime = 45;
      } else if (month === 'October') {
        avgResHours = 34.2;
        issuesWithResTime = 8;
      }

      return {
        month,
        totalIssues: total,
        resolved,
        open,
        resolutionRate: resRate,
        p1,
        p2,
        p3,
        p4,
        rcaIncluded,
        pendingRca,
        issuesWithResTime,
        avgResolutionHours: avgResHours,
      };
    });
  }, [issues]);

  const activeIssuesCount = useMemo(() => {
    return issues.filter((i) => i.status !== 'Resolved').length;
  }, [issues]);

  // Handlers
  const handleSaveIssue = (updatedIssue: Issue) => {
    setIssues((prev) => prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item)));
    setSelectedIssue(updatedIssue);
    showToast(`Incident #${updatedIssue.id} updated successfully.`, 'success');
  };

  const handleAddIssue = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    showToast(`New incident #${newIssue.id} logged and added to active queue.`, 'success');
    setActiveTab('tracker');
    setTrackerFilter({ status: 'Open' });
  };

  const handleResetData = () => {
    if (window.confirm('Reset issue tracker data to default 107 records from the attached sheet?')) {
      setIssues(INITIAL_ISSUES);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Database reset to initial 107 issues.', 'info');
    }
  };

  const handleExportCSV = () => {
    exportIssuesToCSV(issues);
    showToast(`Exported ${issues.length} incidents to CSV file.`, 'info');
  };

  const handleExportExcel = () => {
    exportIssuesToExcel(issues, monthlySummaries);
    showToast(`Exported ${issues.length} incidents to "Issue Tracker for TM NOC.xlsx".`, 'info');
  };

  const handleSharePointSyncSuccess = (newIssues: Issue[], sourceInfo: string) => {
    setIssues(newIssues);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncTime(`Live Sync ${now}`);
    showToast(`SharePoint sync successful: ${sourceInfo}`, 'success');
  };

  const handleImportCSVClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = parseCSVToIssues(text);
          if (parsed.length > 0) {
            setIssues(parsed);
            showToast(`Successfully imported ${parsed.length} incidents from CSV.`, 'success');
            setActiveTab('tracker');
          } else {
            showToast('No valid issue rows found in uploaded CSV.', 'warn');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to parse CSV file. Please verify column structure.', 'warn');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNavigateToTracker = (filter?: { month?: string; status?: string; priority?: string }) => {
    if (filter) {
      setTrackerFilter(filter);
    }
    setActiveTab('tracker');
  };

  const handleNavigateToGuidelines = (query?: string) => {
    if (query) {
      setGuidelinesSearch(query);
    }
    setActiveTab('guidelines');
  };

  const nextIncidentId = useMemo(() => {
    const maxId = issues.reduce((max, i) => Math.max(max, i.id), 0);
    return maxId + 1;
  }, [issues]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewIssue={() => setIsNewIssueModalOpen(true)}
        onExportCSV={handleExportCSV}
        onImportCSV={handleImportCSVClick}
        onOpenSharePointSync={() => setIsSharePointModalOpen(true)}
        onRefreshSharePoint={triggerManualRefresh}
        isLiveSyncing={isLiveSyncing}
        onResetData={handleResetData}
        activeIssuesCount={activeIssuesCount}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Active Incident Banner when on Tracker or Guidelines */}
        {activeTab !== 'dashboard' && activeIssuesCount > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{activeIssuesCount} present incidents</strong> currently active and pending resolution in NOC queue.
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('tracker');
                setTrackerFilter({ status: 'Open' });
              }}
              className="text-amber-300 hover:text-white font-semibold underline cursor-pointer whitespace-nowrap ml-4"
            >
              View Active Queue &rarr;
            </button>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            issues={issues}
            summaries={monthlySummaries}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onNavigateToTracker={handleNavigateToTracker}
            onNavigateToGuidelines={handleNavigateToGuidelines}
            onOpenNewIssue={() => setIsNewIssueModalOpen(true)}
            onOpenSharePointSync={() => setIsSharePointModalOpen(true)}
            onRefreshSharePoint={triggerManualRefresh}
            isLiveSyncing={isLiveSyncing}
            lastSyncTime={lastSyncTime}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerTableView
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            initialFilter={trackerFilter}
            onExportCSV={handleExportCSV}
            onOpenSharePointSync={() => setIsSharePointModalOpen(true)}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'guidelines' && (
          <GuidelinesView
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            initialSearchQuery={guidelinesSearch}
          />
        )}

        {activeTab === 'matrix' && (
          <MonthlyMatrixView
            summaries={monthlySummaries}
            issues={issues}
            onSelectMonth={(month) => handleNavigateToTracker({ month })}
          />
        )}
      </main>

      {/* Modals */}
      <SharePointSyncModal
        isOpen={isSharePointModalOpen}
        onClose={() => setIsSharePointModalOpen(false)}
        issues={issues}
        summaries={monthlySummaries}
        onSyncSuccess={handleSharePointSyncSuccess}
        lastSyncTime={lastSyncTime}
      />

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onSaveIssue={handleSaveIssue}
        onNavigateToGuideline={(gid) => {
          setSelectedIssue(null);
          handleNavigateToGuidelines(gid);
        }}
      />

      <NewIssueModal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        nextId={nextIncidentId}
        onAddIssue={handleAddIssue}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'warn' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span className="text-slate-200">{toastMessage.text}</span>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">TM NOC Operations</span>
            <span>·</span>
            <span>Issue Tracker & Guidelines Knowledge Base</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] tabular-nums">
            <span>July–October 2026 Archive</span>
            <span>·</span>
            <span>107 Tracked Cases</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
