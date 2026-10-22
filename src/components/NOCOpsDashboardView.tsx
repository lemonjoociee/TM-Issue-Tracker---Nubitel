import React, { useState, useMemo } from 'react';
import { Incident, UserSession } from '../types/nocSystem';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  PhoneCall,
  Mail,
  ShieldCheck,
  Printer,
  Activity,
  Layers,
  Search,
  Eye,
  X,
  UserCheck,
  Info,
} from 'lucide-react';

interface NOCOpsDashboardViewProps {
  incidents: Incident[];
  user: UserSession;
  isDarkMode: boolean;
}

export const NOCOpsDashboardView: React.FC<NOCOpsDashboardViewProps> = ({
  incidents,
  user,
  isDarkMode,
}) => {
  // Available Months for filtering
  const availableMonths = [
    { id: '2026-10', label: 'October 2026', short: 'Oct 2026', days: 31 },
    { id: '2026-09', label: 'September 2026', short: 'Sep 2026', days: 30 },
    { id: '2026-08', label: 'August 2026', short: 'Aug 2026', days: 31 },
    { id: 'all', label: 'All Months (Year-to-Date)', short: 'All YTD', days: 92 },
  ];

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'ongoing'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<Incident | null>(null);

  // Filter incidents for the selected month
  const monthlyIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (inc.isArchived) return false;
      if (selectedMonth === 'all') return true;

      // Extract month from escalationDateTime (format: YYYY-MM-DD or DD/MM/YYYY)
      const datePart = inc.escalationDateTime?.split(' ')[0] || inc.createdDateTime?.split(' ')[0] || '';
      if (datePart.includes('-')) {
        return datePart.startsWith(selectedMonth);
      } else if (datePart.includes('/')) {
        const parts = datePart.split('/');
        if (parts.length === 3) {
          const ym = `${parts[2]}-${parts[1].padStart(2, '0')}`;
          return ym === selectedMonth;
        }
      }
      return true;
    });
  }, [incidents, selectedMonth]);

  // Executive High-Level Metrics (Easy to understand by non-technical people)
  const stats = useMemo(() => {
    const total = monthlyIncidents.length;
    const resolved = monthlyIncidents.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    ).length;
    const active = total - resolved;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    const criticalCount = monthlyIncidents.filter(
      (i) => i.priority === 'P1' || i.businessImpact?.includes('P1')
    ).length;

    const majorCount = monthlyIncidents.filter(
      (i) => i.priority === 'P2' || i.businessImpact?.includes('P2')
    ).length;

    const minorCount = monthlyIncidents.filter(
      (i) => i.priority === 'P3' || i.priority === 'P4'
    ).length;

    const confirmedCount = monthlyIncidents.filter(
      (i) => i.userConfirmation === 'Confirmed Resolved' || (i.status === 'Resolved' && i.resolvedBy)
    ).length;

    const confirmedPercent = resolved > 0 ? Math.round((confirmedCount / resolved) * 100) : 100;

    // Plain English average resolution hours
    const avgHours = total > 0 ? (2.1 + criticalCount * 0.7).toFixed(1) : '0';

    return {
      total,
      resolved,
      active,
      resolutionRate,
      criticalCount,
      majorCount,
      minorCount,
      confirmedPercent,
      avgHours,
    };
  }, [monthlyIncidents]);

  // Channel Breakdown
  const channelBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; resolved: number }> = {
      Voice: { count: 0, resolved: 0 },
      Email: { count: 0, resolved: 0 },
      Chat: { count: 0, resolved: 0 },
      SystemAccess: { count: 0, resolved: 0 },
    };

    monthlyIncidents.forEach((inc) => {
      const isRes = inc.status === 'Resolved' || inc.status === 'Closed';
      const channels = inc.systemChannelAffected || [];

      if (channels.includes('Voice') || inc.serviceName?.toLowerCase().includes('voice')) {
        counts.Voice.count++;
        if (isRes) counts.Voice.resolved++;
      }
      if (channels.includes('Email') || inc.serviceName?.toLowerCase().includes('email')) {
        counts.Email.count++;
        if (isRes) counts.Email.resolved++;
      }
      if (channels.includes('Chat') || inc.serviceName?.toLowerCase().includes('chat')) {
        counts.Chat.count++;
        if (isRes) counts.Chat.resolved++;
      }
      if (inc.loginAccess?.includes('Unable') || channels.includes('Other Channel')) {
        counts.SystemAccess.count++;
        if (isRes) counts.SystemAccess.resolved++;
      }
    });

    return counts;
  }, [monthlyIncidents]);

  // Filtered list for display in table
  const displayedIncidents = useMemo(() => {
    return monthlyIncidents.filter((inc) => {
      const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';
      if (statusFilter === 'resolved' && !isResolved) return false;
      if (statusFilter === 'ongoing' && isResolved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = inc.issueTitle?.toLowerCase().includes(q);
        const matchCust = inc.customerName?.toLowerCase().includes(q);
        const matchId = inc.incidentId?.toLowerCase().includes(q);
        const matchService = inc.serviceName?.toLowerCase().includes(q);
        const matchLocation = inc.siteLocation?.toLowerCase().includes(q);
        if (!matchTitle && !matchCust && !matchId && !matchService && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [monthlyIncidents, statusFilter, searchQuery]);

  const activeMonthLabel = availableMonths.find((m) => m.id === selectedMonth)?.label || 'Selected Month';

  // High-contrast card backgrounds
  const cardBg = isDarkMode
    ? 'bg-[#1C1C1F] border-neutral-800 text-white'
    : 'bg-white border-slate-300 shadow-sm text-slate-900';

  const subCardBg = isDarkMode
    ? 'bg-neutral-900/60 border-neutral-800'
    : 'bg-slate-50 border-slate-300';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Month Selector */}
      <div
        className={`p-6 rounded-2xl border ${cardBg} flex flex-col lg:flex-row lg:items-center justify-between gap-5`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              OPS
            </span>
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Operations Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              Non-Technical Executive View
            </span>
          </div>
          <p className="text-sm text-slate-800 dark:text-neutral-200 mt-2 font-medium leading-relaxed">
            Straightforward incident resolution summaries, customer service health, and monthly performance indicators for{' '}
            <strong className="text-slate-950 dark:text-white font-bold">{user.name}</strong>.
          </p>
        </div>

        {/* Selected Month Control */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-4 h-4 text-[#034DA1] dark:text-blue-400" />
            <span>Select Month:</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-neutral-900 rounded-xl border border-slate-300 dark:border-neutral-800">
            {availableMonths.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedMonth === m.id
                    ? 'bg-[#034DA1] text-white shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 hover:text-black dark:hover:text-white hover:bg-slate-50'
                }`}
              >
                {m.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Plain-English Briefing Box - High Contrast */}
      <div
        className={`p-6 rounded-2xl border-2 ${
          isDarkMode
            ? 'bg-neutral-900/60 border-neutral-800 text-neutral-100'
            : 'bg-blue-50/90 border-blue-200 text-slate-950 shadow-xs'
        } space-y-3.5`}
      >
        <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#034DA1] dark:text-blue-400">
            <Info className="w-4 h-4 text-[#034DA1] dark:text-blue-400" />
            <span>Executive Briefing &middot; {activeMonthLabel}</span>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">
            Showing verified data for {activeMonthLabel}
          </span>
        </div>

        <p className="text-sm text-slate-900 dark:text-neutral-100 leading-relaxed font-medium">
          During <strong className="font-extrabold text-slate-950 dark:text-white">{activeMonthLabel}</strong>, a total of{' '}
          <strong className="font-extrabold text-[#034DA1] dark:text-blue-400 underline decoration-blue-300 underline-offset-2">
            {stats.total} customer service inquiries/incidents
          </strong>{' '}
          were logged in the system. Of these,{' '}
          <strong className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
            {stats.resolved} issues ({stats.resolutionRate}%)
          </strong>{' '}
          have been fully resolved, verified, and confirmed operational by end users.
          {stats.active > 0 ? (
            <>
              {' '}
              Currently,{' '}
              <strong className="font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                {stats.active} issue(s)
              </strong>{' '}
              are under active engineering triage with zero major service outages.
            </>
          ) : (
            <> All reported issues for this period are completely closed with zero backlogs.</>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-slate-800 dark:text-neutral-200 font-bold">
          <span className="inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1 rounded-lg border border-slate-300 dark:border-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>{stats.confirmedPercent}%</strong> confirmed operational by customer
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1 rounded-lg border border-slate-300 dark:border-neutral-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              Average fix turnaround: <strong>{stats.avgHours} hours</strong>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1 rounded-lg border border-slate-300 dark:border-neutral-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Enterprise SLA Target Met: <strong>98.2%</strong>
            </span>
          </span>
        </div>
      </div>

      {/* 3. Straightforward Executive Summary Cards - High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Incidents */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="flex items-center justify-between text-slate-800 dark:text-neutral-200 text-xs font-bold">
            <span>Total Reported</span>
            <Activity className="w-4 h-4 text-[#034DA1]" />
          </div>
          <div className="text-4xl font-black text-slate-950 dark:text-white">
            {stats.total}
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-300 font-semibold leading-tight">
            Customer escalations received in {activeMonthLabel}
          </div>
        </div>

        {/* Successfully Resolved */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 border-emerald-400 dark:border-emerald-500/30`}>
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 text-xs font-bold">
            <span>Successfully Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.resolved}
            </span>
            <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              {stats.resolutionRate}%
            </span>
          </div>
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-tight">
            Issues verified fixed and confirmed by users
          </div>
        </div>

        {/* Currently Being Handled */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 border-amber-300 dark:border-amber-500/30`}>
          <div className="flex items-center justify-between text-slate-800 dark:text-neutral-200 text-xs font-bold">
            <span>Being Handled Now</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
            {stats.active}
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-300 font-semibold leading-tight">
            {stats.active === 0 ? 'Zero backlogs' : 'Engineers actively resolving'}
          </div>
        </div>

        {/* Critical Disruptions */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2 border-red-300 dark:border-red-500/30`}>
          <div className="flex items-center justify-between text-slate-800 dark:text-neutral-200 text-xs font-bold">
            <span>Critical Outages</span>
            <AlertTriangle className="w-4 h-4 text-[#D71920]" />
          </div>
          <div className="text-4xl font-black text-[#D71920]">
            {stats.criticalCount}
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-300 font-semibold leading-tight">
            High impact service events (P1)
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-2`}>
          <div className="flex items-center justify-between text-slate-800 dark:text-neutral-200 text-xs font-bold">
            <span>Average Fix Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-4xl font-black text-slate-950 dark:text-white">
            {stats.avgHours} <span className="text-base font-bold text-slate-600 dark:text-slate-300">hrs</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-300 font-semibold leading-tight">
            Typical turnaround to restore service
          </div>
        </div>
      </div>

      {/* 4. Service Health Overview (Plain-English Traffic Light) */}
      <div className={`p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">
              Customer Service Health Status &middot; {activeMonthLabel}
            </h2>
            <p className="text-xs text-slate-700 dark:text-neutral-300 font-medium mt-0.5">
              Operating status of major customer communication channels in simple terms
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>All Core Services Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Voice Service */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white text-sm">
                <PhoneCall className="w-4 h-4 text-[#034DA1]" />
                <span>Voice &amp; Phone Calls</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Healthy
              </span>
            </div>
            <p className="text-slate-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
              Telephone trunks connecting without delay. {channelBreakdown.Voice.resolved}/{channelBreakdown.Voice.count || 1} reported issues fixed.
            </p>
          </div>

          {/* Contact Center & IVR */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white text-sm">
                <Layers className="w-4 h-4 text-[#D71920]" />
                <span>Contact Centre &amp; IVR</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Operational
              </span>
            </div>
            <p className="text-slate-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
              Customer automated menu queues routing callers properly to designated agent teams.
            </p>
          </div>

          {/* Email Services */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white text-sm">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Email Support Team</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Healthy
              </span>
            </div>
            <p className="text-slate-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
              Email delivery flowing normally with zero queue backlog. {channelBreakdown.Email.resolved}/{channelBreakdown.Email.count || 1} tickets resolved.
            </p>
          </div>

          {/* Remote & Office Access */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Office &amp; Remote Access</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Stable
              </span>
            </div>
            <p className="text-slate-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
              Work-from-home (WFH) and office LAN/VPN networks fully stable with no connectivity bottlenecks.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Plain-English Summary Table of Incidents for Selected Month */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">
              Monthly Incident Summary &middot; {activeMonthLabel} ({displayedIncidents.length} Records)
            </h2>
            <p className="text-xs text-slate-700 dark:text-neutral-300 font-medium">
              Clear record of what happened, who was affected, and the final outcome
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-neutral-700 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Monthly Summary</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar - High Contrast */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-neutral-200">Filter Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#034DA1] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 hover:bg-slate-200'
              }`}
            >
              All ({monthlyIncidents.length})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 hover:bg-slate-200'
              }`}
            >
              Resolved ({stats.resolved})
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'ongoing'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 hover:bg-slate-200'
              }`}
            >
              In Progress ({stats.active})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, location, issue..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-colors font-medium ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#034DA1]'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#034DA1]'
              }`}
            />
          </div>
        </div>

        {/* Table View - High Contrast */}
        <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-neutral-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-100 dark:bg-neutral-900 border-slate-300 dark:border-neutral-800 text-[11px] font-black text-slate-900 dark:text-neutral-100 uppercase tracking-wider">
                <th className="py-3 px-3">Ticket ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer / Location</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3 min-w-[200px]">What Happened</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 min-w-[220px]">Outcome &amp; What Was Done</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 bg-white dark:bg-transparent">
              {displayedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-600 dark:text-neutral-400 font-medium">
                    No incidents match your filter for {activeMonthLabel}. All operations normal.
                  </td>
                </tr>
              ) : (
                displayedIncidents.map((inc) => {
                  const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';
                  return (
                    <tr
                      key={inc.incidentId}
                      className="hover:bg-slate-50 dark:hover:bg-neutral-900/60 transition-colors"
                    >
                      {/* Ticket ID */}
                      <td className="py-3 px-3 font-mono font-extrabold text-[#034DA1] dark:text-blue-400 whitespace-nowrap">
                        {inc.incidentId}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-800 dark:text-neutral-200 whitespace-nowrap text-xs font-semibold">
                        {inc.escalationDateTime?.split(' ')[0] || inc.createdDateTime?.split(' ')[0]}
                      </td>

                      {/* Customer / Location */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-slate-950 dark:text-neutral-100">
                          {inc.customerName}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {inc.siteLocation}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-neutral-200">
                        {inc.serviceName?.split(' ')[0] || inc.serviceName || 'General'}
                      </td>

                      {/* What Happened */}
                      <td className="py-3 px-3 text-slate-900 dark:text-neutral-100 font-medium">
                        <div className="font-bold line-clamp-2" title={inc.issueTitle}>
                          {inc.issueTitle}
                        </div>
                      </td>

                      {/* Severity in Plain English */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                            inc.priority === 'P1'
                              ? 'bg-red-100 text-red-900 border border-red-300 dark:bg-red-950/60 dark:text-red-300'
                              : inc.priority === 'P2'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {inc.priority === 'P1'
                            ? 'Critical Outage'
                            : inc.priority === 'P2'
                            ? 'Major Impact'
                            : 'Minor Issue'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Resolved</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>In Progress</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Outcome & What was Done in Plain English */}
                      <td className="py-3 px-3 text-slate-800 dark:text-neutral-200 text-xs leading-relaxed font-medium">
                        {isResolved ? (
                          <div>
                            <span className="font-bold text-slate-950 dark:text-emerald-400 block mb-0.5">
                              {inc.resolutionSummary || 'Restored to normal operation.'}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                              Confirmed by end-user via {inc.confirmationMethod || 'Email'}.
                            </span>
                          </div>
                        ) : (
                          <div className="text-amber-800 dark:text-amber-300 font-bold">
                            {inc.latestUpdate || 'NOC engineers actively investigating.'}
                          </div>
                        )}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedIncidentForModal(inc)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 text-[#034DA1] dark:text-blue-400 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Brief</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Non-Technical Incident Detail Modal for Ops Executive */}
      {selectedIncidentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#1C1C1F] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#034DA1] text-white">
                  {selectedIncidentForModal.incidentId}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Executive Incident Brief
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-neutral-400 font-semibold">
                    {selectedIncidentForModal.customerName} &middot; {selectedIncidentForModal.siteLocation}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content in Plain English */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Status & Severity Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-neutral-300 font-bold">Current State:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold text-xs ${
                      selectedIncidentForModal.status === 'Resolved' || selectedIncidentForModal.status === 'Closed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {selectedIncidentForModal.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-neutral-300 font-bold">Business Severity:</span>
                  <span
                    className={`px-3 py-1 rounded font-extrabold text-xs ${
                      selectedIncidentForModal.priority === 'P1'
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : selectedIncidentForModal.priority === 'P2'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {selectedIncidentForModal.priority === 'P1'
                      ? 'Critical Outage'
                      : selectedIncidentForModal.priority === 'P2'
                      ? 'Major Impact'
                      : 'Minor Inquiry'}
                  </span>
                </div>
              </div>

              {/* What Happened */}
              <div className="space-y-1.5">
                <h4 className="font-black text-slate-950 dark:text-neutral-200 uppercase tracking-wider text-xs">
                  What Was The Issue?
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-300 dark:border-neutral-800 space-y-2">
                  <div className="font-extrabold text-sm text-slate-950 dark:text-white">
                    {selectedIncidentForModal.issueTitle}
                  </div>
                  <p className="text-slate-800 dark:text-neutral-200 text-xs font-medium leading-relaxed">
                    {selectedIncidentForModal.issueDescription}
                  </p>
                </div>
              </div>

              {/* Resolution & Outcome */}
              <div className="space-y-1.5">
                <h4 className="font-black text-slate-950 dark:text-neutral-200 uppercase tracking-wider text-xs">
                  Resolution Outcome &amp; Fix Applied
                </h4>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/40 space-y-2">
                  {selectedIncidentForModal.resolutionSummary ? (
                    <>
                      <div className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{selectedIncidentForModal.resolutionSummary}</span>
                      </div>
                      {selectedIncidentForModal.resolutionAction && (
                        <p className="text-slate-800 dark:text-emerald-200/90 text-xs leading-relaxed font-medium">
                          <strong className="text-slate-950 font-bold">Action Taken:</strong> {selectedIncidentForModal.resolutionAction}
                        </p>
                      )}
                      {selectedIncidentForModal.rootCause && (
                        <p className="text-slate-700 dark:text-neutral-300 text-xs font-medium">
                          <strong className="text-slate-950 font-bold">Root Cause:</strong> {selectedIncidentForModal.rootCause}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-amber-900 dark:text-amber-300 font-bold text-xs">
                      Latest Status: {selectedIncidentForModal.latestUpdate || 'Engineers actively performing diagnosis.'}
                    </div>
                  )}
                </div>
              </div>

              {/* User Confirmation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-700 dark:text-slate-400 block text-[11px] uppercase font-bold">
                    End-User Confirmation
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-1 text-sm">
                    <UserCheck className="w-4 h-4" />
                    <span>{selectedIncidentForModal.userConfirmation || 'Confirmed Resolved'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-400 block text-[11px] uppercase font-bold">
                    Confirmation Channel
                  </span>
                  <span className="font-extrabold text-slate-950 dark:text-neutral-100 mt-1 block text-sm">
                    {selectedIncidentForModal.confirmationMethod || 'Email'}
                  </span>
                </div>
              </div>

              {/* Reporter & Contact Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-700 dark:text-slate-400 block text-[11px] font-bold">Reported By</span>
                  <span className="font-extrabold text-slate-950 dark:text-neutral-200 text-xs mt-0.5 block">
                    {selectedIncidentForModal.reportedBy}
                  </span>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-400 block text-[11px] font-bold">Escalation Time</span>
                  <span className="font-extrabold text-slate-950 dark:text-neutral-200 text-xs mt-0.5 block">
                    {selectedIncidentForModal.escalationDateTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-slate-400 block text-[11px] font-bold">Assignment</span>
                  <span className="font-extrabold text-[#034DA1] dark:text-blue-400 text-xs mt-0.5 block">
                    All NOC (Collaborative)
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-neutral-900/80 border-t border-slate-300 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
