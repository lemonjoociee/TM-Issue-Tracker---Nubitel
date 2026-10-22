import React, { useMemo } from 'react';
import { Incident, UserSession } from '../types/nocSystem';
import { isIncidentOverdue, calculateIncidentAge } from '../services/notificationService';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  Server,
  Layers,
  Activity,
  Flame,
  Search,
} from 'lucide-react';

interface NOCDashboardViewProps {
  incidents: Incident[];
  user: UserSession;
  onOpenCreateModal: () => void;
  onSelectIncident: (incident: Incident) => void;
  onNavigateToList: (filter?: { status?: string; priority?: string; onlyOverdue?: boolean; assignedToMe?: boolean }) => void;
  onOpenSharePointModal: () => void;
  isDarkMode: boolean;
}

export const NOCDashboardView: React.FC<NOCDashboardViewProps> = ({
  incidents,
  user,
  onOpenCreateModal,
  onSelectIncident,
  onNavigateToList,
  onOpenSharePointModal,
  isDarkMode,
}) => {
  // Summary Metrics
  const metrics = useMemo(() => {
    const total = incidents.length;
    const newCount = incidents.filter((i) => i.status === 'New').length;
    const ongoingCount = incidents.filter((i) => i.status === 'Ongoing').length;
    const pendingCount = incidents.filter((i) =>
      ['Pending User', 'Pending Vendor', 'Pending Internal Team'].includes(i.status)
    ).length;
    const resolvedCount = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
    const overdueCount = incidents.filter((i) => isIncidentOverdue(i)).length;
    const highPriorityCount = incidents.filter((i) => i.priority === 'P1' || i.priority === 'P2').length;

    return {
      total,
      newCount,
      ongoingCount,
      pendingCount,
      resolvedCount,
      overdueCount,
      highPriorityCount,
    };
  }, [incidents]);

  // Section Collections
  const recentlyCreated = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime())
      .slice(0, 5);
  }, [incidents]);

  const requiringAttention = useMemo(() => {
    return incidents
      .filter((i) => ['New', 'Pending Vendor', 'Pending Internal Team'].includes(i.status))
      .slice(0, 5);
  }, [incidents]);

  const overdueList = useMemo(() => {
    return incidents.filter((i) => isIncidentOverdue(i)).slice(0, 5);
  }, [incidents]);

  const assignedToMe = useMemo(() => {
    return incidents
      .filter((i) => i.status !== 'Resolved' && i.status !== 'Closed')
      .slice(0, 5);
  }, [incidents]);

  const recentlyResolved = useMemo(() => {
    return incidents
      .filter((i) => i.status === 'Resolved' || i.status === 'Closed')
      .slice(0, 5);
  }, [incidents]);

  // Chart Breakdowns
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return Object.entries(counts);
  }, [incidents]);

  const priorityBreakdown = useMemo(() => {
    const counts: Record<string, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
    incidents.forEach((i) => {
      counts[i.priority] = (counts[i.priority] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  const serviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      const s = i.serviceName || 'General';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).slice(0, 5);
  }, [incidents]);

  const locationBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      counts[i.siteLocation] = (counts[i.siteLocation] || 0) + 1;
    });
    return Object.entries(counts).slice(0, 5);
  }, [incidents]);

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800' : 'bg-white border-slate-200 shadow-sm';

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">New</span>;
      case 'Ongoing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Ongoing</span>;
      case 'Pending User':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">Pending User</span>;
      case 'Pending Vendor':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Pending Vendor</span>;
      case 'Pending Internal Team':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Pending Internal</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case 'Closed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-800/10 text-emerald-800 dark:text-emerald-300 border border-emerald-800/20">Closed</span>;
      case 'Reopened':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Reopened</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Draft</span>;
    }
  };

  const renderPriorityBadge = (p: string) => {
    if (p === 'P1') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white font-mono">P1 Critical</span>;
    }
    if (p === 'P2') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white font-mono">P2 High</span>;
    }
    if (p === 'P3') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white font-mono">P3 Medium</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-400 text-white font-mono">P4 Low</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              NOC Operational Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#034DA1] text-white">
              LIVE M365
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Manual Incident Entry, SharePoint Excel Database &amp; Automated Unresolved Email Reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSharePointModal}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-emerald-500'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-emerald-600 hover:bg-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>View SharePoint Workbook</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Incident</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Section 3 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Incidents */}
        <div
          onClick={() => onNavigateToList()}
          className={`p-4 rounded-xl border cursor-pointer hover:border-[#034DA1] transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Total Incidents
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>SharePoint records</span>
          </div>
        </div>

        {/* New Incidents */}
        <div
          onClick={() => onNavigateToList({ status: 'New' })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-blue-500 transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            New Incidents
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {metrics.newCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting triage</div>
        </div>

        {/* Ongoing Incidents */}
        <div
          onClick={() => onNavigateToList({ status: 'Ongoing' })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-amber-500 transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Ongoing
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.ongoingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active troubleshooting</div>
        </div>

        {/* Pending Incidents */}
        <div
          onClick={() => onNavigateToList({ status: 'Pending' })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-yellow-500 transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
            Pending
          </div>
          <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-1">
            {metrics.pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Vendor/User/Internal</div>
        </div>

        {/* Resolved Incidents */}
        <div
          onClick={() => onNavigateToList({ status: 'Resolved' })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Resolved
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.resolvedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Confirmed fixed</div>
        </div>

        {/* Overdue Incidents */}
        <div
          onClick={() => onNavigateToList({ onlyOverdue: true })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-red-500 transition-all ${
            metrics.overdueCount > 0 ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400' : cardBg
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Overdue</span>
            {metrics.overdueCount > 0 && <AlertOctagon className="w-3.5 h-3.5 text-[#D71920]" />}
          </div>
          <div className="text-2xl font-black mt-1 text-[#D71920]">
            {metrics.overdueCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Follow-up breached</div>
        </div>

        {/* High-Priority Incidents */}
        <div
          onClick={() => onNavigateToList({ priority: 'P1' })}
          className={`p-4 rounded-xl border cursor-pointer hover:border-[#D71920] transition-all ${cardBg}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#D71920] flex items-center justify-between">
            <span>High Priority</span>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-[#D71920] mt-1">
            {metrics.highPriorityCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">P1 &amp; P2 criticals</div>
        </div>
      </div>

      {/* Simple Distribution Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* By Priority */}
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
            <span>Incidents by Priority</span>
            <span className="text-[10px] text-slate-400">Impact level</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'P1 Critical', count: priorityBreakdown.P1, color: 'bg-red-600' },
              { label: 'P2 High', count: priorityBreakdown.P2, color: 'bg-amber-500' },
              { label: 'P3 Medium', count: priorityBreakdown.P3, color: 'bg-blue-500' },
              { label: 'P4 Low', count: priorityBreakdown.P4, color: 'bg-slate-400' },
            ].map((p) => {
              const pct = metrics.total > 0 ? Math.round((p.count / metrics.total) * 100) : 0;
              return (
                <div key={p.label} className="text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-neutral-300 font-medium mb-1">
                    <span>{p.label}</span>
                    <span className="font-mono font-bold">
                      {p.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
            <span>Incidents by Status</span>
            <span className="text-[10px] text-slate-400">Workflow stage</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {statusBreakdown.map(([st, count]) => (
              <div key={st} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-neutral-800/60 last:border-0">
                <span className="text-slate-600 dark:text-neutral-400 truncate">{st}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Category / Service */}
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
            <span>Top Affected Services</span>
            <span className="text-[10px] text-slate-400">Service Area</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {serviceBreakdown.map(([srv, count]) => (
              <div key={srv} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-neutral-800/60 last:border-0">
                <span className="text-slate-600 dark:text-neutral-400 truncate">{srv}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Location */}
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
            <span>Incidents by Location</span>
            <span className="text-[10px] text-slate-400">Sites &amp; Hubs</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {locationBreakdown.map(([loc, count]) => (
              <div key={loc} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-neutral-800/60 last:border-0">
                <span className="text-slate-600 dark:text-neutral-400 truncate">{loc}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Sections (Section 3 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Incidents Requiring Attention */}
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Incidents Requiring Attention
              </h2>
            </div>
            <button
              onClick={() => onNavigateToList({ status: 'New' })}
              className="text-xs text-[#034DA1] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {requiringAttention.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No pending attention items</div>
            ) : (
              requiringAttention.map((inc) => (
                <div
                  key={inc.incidentId}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'bg-neutral-900/40 border-neutral-800 hover:border-[#034DA1]'
                      : 'bg-slate-50 border-slate-200 hover:border-[#034DA1] hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#034DA1] dark:text-blue-400">
                        {inc.incidentId}
                      </span>
                      {renderPriorityBadge(inc.priority)}
                      {renderStatusBadge(inc.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">
                      {inc.issueTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                      {inc.customerName} &bull; {inc.siteLocation} &bull; Assigned: All NOC
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-slate-400">
                      Age: {calculateIncidentAge(inc.createdDateTime)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Overdue Incidents */}
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#D71920]" />
              <h2 className="text-sm font-bold text-[#D71920] uppercase tracking-tight">
                Overdue Incidents
              </h2>
            </div>
            <button
              onClick={() => onNavigateToList({ onlyOverdue: true })}
              className="text-xs text-[#D71920] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Overdue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {overdueList.length === 0 ? (
              <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero overdue incidents. All follow-up schedules on track!</span>
              </div>
            ) : (
              overdueList.map((inc) => (
                <div
                  key={inc.incidentId}
                  onClick={() => onSelectIncident(inc)}
                  className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 hover:border-red-500 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-red-600 dark:text-red-400">
                        {inc.incidentId}
                      </span>
                      {renderPriorityBadge(inc.priority)}
                      {renderStatusBadge(inc.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {inc.issueTitle}
                    </div>
                    <div className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 truncate font-mono">
                      Follow-up expired: {inc.nextFollowUpDateTime}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D71920] text-white font-mono">
                      Overdue
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Collaborative NOC Incidents Queue */}
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#034DA1]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Active NOC Incident Queue (Collaborative)
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Shared queue &bull; Everyone in NOC collaborates to resolve
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToList({})}
              className="text-xs text-[#034DA1] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {assignedToMe.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No open incidents in the collaborative queue</div>
            ) : (
              assignedToMe.map((inc) => (
                <div
                  key={inc.incidentId}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'bg-neutral-900/40 border-neutral-800 hover:border-[#034DA1]'
                      : 'bg-slate-50 border-slate-200 hover:border-[#034DA1] hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#034DA1] dark:text-blue-400">
                        {inc.incidentId}
                      </span>
                      {renderPriorityBadge(inc.priority)}
                      {renderStatusBadge(inc.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">
                      {inc.issueTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                      Next Follow-up: {inc.nextFollowUpDateTime} &bull; Assigned: All NOC
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {inc.reminderFrequency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Recently Resolved Incidents */}
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
                Recently Resolved Incidents
              </h2>
            </div>
            <button
              onClick={() => onNavigateToList({ status: 'Resolved' })}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Resolved</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentlyResolved.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No resolved incidents yet</div>
            ) : (
              recentlyResolved.map((inc) => (
                <div
                  key={inc.incidentId}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'bg-neutral-900/40 border-neutral-800 hover:border-emerald-500'
                      : 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-500 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {inc.incidentId}
                      </span>
                      {renderPriorityBadge(inc.priority)}
                      {renderStatusBadge(inc.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">
                      {inc.issueTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                      Resolved by: {inc.resolvedBy || 'NOC Engineer'} &bull; {inc.userConfirmation || 'Confirmed'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {inc.resolvedDateTime?.split(' ')[0] || inc.lastUpdatedDateTime.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
