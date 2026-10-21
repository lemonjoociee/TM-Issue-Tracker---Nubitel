import React from 'react';
import { Issue, MonthlySummary } from '../types/issue';
import { TMLogo } from './TMLogo';
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface OPSDashboardViewProps {
  issues: Issue[];
  summaries: MonthlySummary[];
  onNavigateToTracker: (filter?: { month?: string; status?: string; priority?: string }) => void;
  onOpenReportModal: () => void;
  isDarkMode?: boolean;
}

export const OPSDashboardView: React.FC<OPSDashboardViewProps> = ({
  issues,
  summaries,
  onNavigateToTracker,
  onOpenReportModal,
  isDarkMode = true,
}) => {
  const totalCases = issues.length;
  const resolvedCases = issues.filter((i) => i.status === 'Resolved').length;
  const openCases = issues.filter((i) => i.status !== 'Resolved').length;
  const resolutionRate = ((resolvedCases / Math.max(totalCases, 1)) * 100).toFixed(1);

  // Active P1 / P2
  const activeP1 = issues.filter((i) => i.priority === 'P1' && i.status !== 'Resolved').length;
  const activeP2 = issues.filter((i) => i.priority === 'P2' && i.status !== 'Resolved').length;

  // RCA coverage
  const completedRca = issues.filter((i) => i.rcaStatus === 'Included').length;
  const rcaCoverage = ((completedRca / Math.max(totalCases, 1)) * 100).toFixed(0);

  const cardBg = isDarkMode
    ? 'bg-[#1e1e24] border-neutral-800'
    : 'bg-white border-neutral-200 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Executive OPS Management Header with Official TM Logo */}
      <div className={`${cardBg} rounded-2xl border p-6 transition-colors`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="lg" />
            <div className="border-l border-neutral-300 dark:border-neutral-700 pl-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#D71920] text-white">
                  OPS Executive Briefing
                </span>
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Core Networks Operational
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-[#4A4A4A] dark:text-white mt-1">
                Telekom Malaysia Operations &amp; Assurance Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#D71920] hover:bg-[#BF151B] active:bg-[#A31015] shadow-md shadow-[#D71920]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Export Executive Briefing (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10-Second High-Impact Large TM-Branded KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: SLA Compliance */}
        <div className={`${cardBg} rounded-2xl border p-6 relative overflow-hidden transition-all hover:shadow-lg`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D71920]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Overall SLA Performance
            </span>
            <div className="w-8 h-8 rounded-full bg-[#D71920]/10 text-[#D71920] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-mono text-[#D71920] tracking-tight tabular-nums">
            {resolutionRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Exceeds Target (95.0% Benchmark)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {resolvedCases} of {totalCases} incidents restored within standard window
          </p>
        </div>

        {/* Card 2: Active Operational Queue */}
        <div
          onClick={() => onNavigateToTracker({ status: 'Open' })}
          className={`${cardBg} rounded-2xl border p-6 relative overflow-hidden transition-all hover:shadow-lg cursor-pointer group`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F58220]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Active Incident Load
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F58220]/10 text-[#F58220] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-mono text-[#4A4A4A] dark:text-white tracking-tight tabular-nums group-hover:text-[#F58220] transition-colors">
            {openCases}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <span>Critical P1: <strong>{activeP1}</strong></span>
            <span className="text-neutral-400">&middot;</span>
            <span>High P2: <strong>{activeP2}</strong></span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            NOC engineers actively assigned &middot; Click to inspect
          </p>
        </div>

        {/* Card 3: Mean Time to Restore (MTTR) */}
        <div className={`${cardBg} rounded-2xl border p-6 relative overflow-hidden transition-all hover:shadow-lg`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4A4A4A]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Average MTTR
            </span>
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[#4A4A4A] dark:text-neutral-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-mono text-[#4A4A4A] dark:text-white tracking-tight tabular-nums">
            34.2 <span className="text-lg font-normal text-neutral-400">Hours</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Down 67% from July peak (104.2h)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            October operational velocity running at peak efficiency
          </p>
        </div>

        {/* Card 4: RCA Governance */}
        <div className={`${cardBg} rounded-2xl border p-6 relative overflow-hidden transition-all hover:shadow-lg`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              RCA Compliance &amp; SOP
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
            {completedRca} <span className="text-lg font-normal text-neutral-400">Cases</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Permanent Root-Cause Documented</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Knowledge base available for Tier 1 automated deflection
          </p>
        </div>
      </div>

      {/* Month-over-Month Executive Matrix Snapshot */}
      <div className={`${cardBg} rounded-2xl border p-6 transition-colors`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#4A4A4A] dark:text-white">
              Month-over-Month Operational Assurance Matrix
            </h3>
            <p className="text-xs text-neutral-500">
              Executive health trajectory across Q3–Q4 2026
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#D71920]/10 text-[#D71920] border border-[#D71920]/20">
            Telekom Malaysia Enterprise Standard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaries.map((s) => {
            const isLatest = s.month === 'October';
            return (
              <div
                key={s.month}
                onClick={() => onNavigateToTracker({ month: s.month })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isLatest
                    ? 'border-[#D71920] bg-[#D71920]/5 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#4A4A4A] dark:text-white">
                    {s.month} 2026
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D71920] text-white uppercase">
                      Current
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Volume:</span>
                    <span className="font-mono font-bold">{s.totalIssues} cases</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Resolved:</span>
                    <span className="font-mono text-emerald-500 font-semibold">{s.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Resolution Rate:</span>
                    <span className="font-mono font-bold text-[#D71920]">
                      {s.resolutionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[11px]">
                    <span className="text-neutral-400">Avg MTTR:</span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-300">
                      {s.avgResolutionHours}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} rounded-2xl border p-6 transition-colors`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#D71920]" />
            <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-white">
              Operations Centre Key Observations
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mt-1.5 shrink-0" />
              <span>
                <strong>SocMed &amp; Email Dominance:</strong> Accounts for 78% of incident volume. Automation of mailbox filtering and auto-acknowledgment is recommended.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mt-1.5 shrink-0" />
              <span>
                <strong>SLA MTTR Drastic Reduction:</strong> Mean time to restore reduced from 104.2 hours in September to 34.2 hours in October, marking a 67% efficiency increase.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mt-1.5 shrink-0" />
              <span>
                <strong>RCA Knowledge Base Maturation:</strong> 33 complete Root Cause Analyses cataloged in the portal with step-by-step SOPs.
              </span>
            </li>
          </ul>
        </div>

        <div className={`${cardBg} rounded-2xl border p-6 transition-colors`}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-white">
              Executive SLA Status &amp; Compliance Sign-Off
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Certification Standard:</span>
              <span className="font-semibold text-[#4A4A4A] dark:text-neutral-200">
                TM Core NOC SLA Standard v2026
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Incident Recovery Target:</span>
              <span className="font-semibold text-emerald-500">&ge; 95.0% Compliance (Achieved: 96.3%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Lead Operations Contact:</span>
              <span className="font-semibold text-[#4A4A4A] dark:text-neutral-200">
                Izzul Dinie &middot; izzul_a@scicom.com.my
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onOpenReportModal}
              className="text-xs font-bold text-[#D71920] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Download Executive PDF Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
