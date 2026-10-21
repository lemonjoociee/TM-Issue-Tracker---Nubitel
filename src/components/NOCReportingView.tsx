import React, { useState, useMemo } from 'react';
import { Incident } from '../types/nocSystem';
import { isIncidentOverdue, calculateIncidentAge } from '../services/notificationService';
import { exportIncidentsToCSV } from '../services/sharepointExcelService';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface NOCReportingViewProps {
  incidents: Incident[];
  onOpenSharePointModal: () => void;
  isDarkMode: boolean;
}

export const NOCReportingView: React.FC<NOCReportingViewProps> = ({
  incidents,
  onOpenSharePointModal,
  isDarkMode,
}) => {
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  // Filter options
  const locations = useMemo(() => Array.from(new Set(incidents.map((i) => i.siteLocation).filter(Boolean))), [incidents]);
  const services = useMemo(() => Array.from(new Set(incidents.map((i) => i.serviceName).filter(Boolean))), [incidents]);
  const teams = useMemo(() => Array.from(new Set(incidents.map((i) => i.assignedTeam).filter(Boolean))), [incidents]);
  const persons = useMemo(() => Array.from(new Set(incidents.map((i) => i.assignedPerson).filter(Boolean))), [incidents]);
  const vendors = useMemo(() => Array.from(new Set(incidents.map((i) => i.vendorName).filter(Boolean))), [incidents]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return incidents.filter((inc) => {
      if (startDate && inc.escalationDateTime.split(' ')[0] < startDate) return false;
      if (endDate && inc.escalationDateTime.split(' ')[0] > endDate) return false;
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
      if (locationFilter !== 'all' && inc.siteLocation !== locationFilter) return false;
      if (serviceFilter !== 'all' && inc.serviceName !== serviceFilter) return false;
      if (teamFilter !== 'all' && inc.assignedTeam !== teamFilter) return false;
      if (personFilter !== 'all' && inc.assignedPerson !== personFilter) return false;
      if (vendorFilter !== 'all' && inc.vendorName !== vendorFilter) return false;
      return true;
    });
  }, [
    incidents,
    startDate,
    endDate,
    statusFilter,
    priorityFilter,
    locationFilter,
    serviceFilter,
    teamFilter,
    personFilter,
    vendorFilter,
  ]);

  // KPIs
  const total = filteredData.length;
  const openCount = filteredData.filter((i) => !['Resolved', 'Closed', 'Draft'].includes(i.status)).length;
  const resolvedCount = filteredData.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;
  const overdueCount = filteredData.filter((i) => isIncidentOverdue(i)).length;

  // Average resolution time in hours
  const avgResolutionTimeHours = useMemo(() => {
    const resolvedItems = filteredData.filter((i) => i.resolvedDateTime && i.createdDateTime);
    if (resolvedItems.length === 0) return '0.0h';

    let totalMs = 0;
    resolvedItems.forEach((i) => {
      try {
        const start = new Date(i.createdDateTime.replace(/-/g, '/')).getTime();
        const end = new Date(i.resolvedDateTime!.replace(/-/g, '/')).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalMs += end - start;
        }
      } catch {
        // ignore
      }
    });

    const avgHours = totalMs / (resolvedItems.length * 3600 * 1000);
    return `${avgHours.toFixed(1)} hrs`;
  }, [filteredData]);

  // Breakdowns
  const countByField = (field: keyof Incident) => {
    const counts: Record<string, number> = {};
    filteredData.forEach((i) => {
      const val = (i[field] as string) || 'Unspecified';
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const byPriority = countByField('priority');
  const byLocation = countByField('siteLocation');
  const byService = countByField('serviceName');
  const byTeam = countByField('assignedTeam');
  const byVendor = countByField('vendorName');

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const subCardBg = isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200';
  const inputClass = `w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Export */}
      <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Operational Incident Reports &amp; SLA Metrics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#034DA1] text-white">
              KPI ANALYTICS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Official operational reporting metrics extracted from SharePoint Excel database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportIncidentsToCSV(filteredData, 'TM_NOC_Filtered_Report.csv')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Filtered Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Section 15 Requirements) */}
      <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-neutral-200">
          <Filter className="w-3.5 h-3.5 text-[#034DA1]" />
          <span>Report Filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              <option value="New">New</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending User">Pending User</option>
              <option value="Pending Vendor">Pending Vendor</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Service</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Vendor</label>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All</option>
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards (Section 15 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-neutral-400">Total Filtered</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total}</div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-[11px] font-bold uppercase text-[#034DA1] dark:text-blue-400">Open Incidents</div>
          <div className="text-2xl font-black text-[#034DA1] dark:text-blue-400 mt-1">{openCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Resolved Incidents</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-[11px] font-bold uppercase text-[#D71920]">Overdue Incidents</div>
          <div className="text-2xl font-black text-[#D71920] mt-1">{overdueCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-neutral-400">Avg Resolution Time</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{avgResolutionTimeHours}</div>
        </div>
      </div>

      {/* Detailed Breakdown Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Priority Breakdown */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Incidents by Priority
          </div>
          <div className="space-y-1.5 text-xs">
            {byPriority.map(([p, c]) => (
              <div key={p} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
                <span className="font-bold">{p}</span>
                <span className="font-mono">{c} incidents</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Breakdown */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Incidents by Location
          </div>
          <div className="space-y-1.5 text-xs">
            {byLocation.map(([loc, c]) => (
              <div key={loc} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
                <span className="truncate">{loc}</span>
                <span className="font-mono shrink-0 ml-2">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Incidents by Service
          </div>
          <div className="space-y-1.5 text-xs">
            {byService.map(([srv, c]) => (
              <div key={srv} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
                <span className="truncate">{srv}</span>
                <span className="font-mono shrink-0 ml-2">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Breakdown */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Incidents by Assigned Team
          </div>
          <div className="space-y-1.5 text-xs">
            {byTeam.map(([team, c]) => (
              <div key={team} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
                <span className="truncate">{team}</span>
                <span className="font-mono shrink-0 ml-2">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Breakdown */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Incidents by Vendor
          </div>
          <div className="space-y-1.5 text-xs">
            {byVendor.map(([v, c]) => (
              <div key={v} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
                <span className="truncate">{v}</span>
                <span className="font-mono shrink-0 ml-2">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className={`p-4 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-neutral-200">
            Monthly Incident Trend
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-900">
              <span>October 2026</span>
              <span className="font-mono font-bold text-[#034DA1] dark:text-blue-400">
                {filteredData.length} records
              </span>
            </div>
            <div className="text-[11px] text-slate-400 p-2">
              All records archived into <code>TM_NOC_Incident_Tracker.xlsx</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
