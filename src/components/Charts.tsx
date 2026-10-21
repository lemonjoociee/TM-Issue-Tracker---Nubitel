import React from 'react';
import { Issue, MonthlySummary } from '../types/issue';

interface ChartsProps {
  issues: Issue[];
  summaries: MonthlySummary[];
  onSelectMonth?: (month: string) => void;
  onSelectArea?: (area: string) => void;
  onSelectPriority?: (priority: string) => void;
  isDarkMode?: boolean;
}

export const Charts: React.FC<ChartsProps> = ({
  issues,
  summaries,
  onSelectMonth,
  onSelectArea,
  onSelectPriority,
  isDarkMode = true,
}) => {
  // Aggregate area counts
  const areaCounts = issues.reduce((acc, issue) => {
    const normArea = issue.issueArea.toLowerCase().includes('email')
      ? 'Email'
      : issue.issueArea.toLowerCase().includes('socmed')
      ? 'SocMed'
      : issue.issueArea.toLowerCase().includes('rta')
      ? 'RTA Team'
      : issue.issueArea.toLowerCase().includes('fmc')
      ? 'FMC'
      : issue.issueArea.toLowerCase().includes('telephony')
      ? 'Telephony'
      : 'General Operations';
    acc[normArea] = (acc[normArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  // Aggregate RCA status counts
  const rcaCounts = issues.reduce((acc, issue) => {
    acc[issue.rcaStatus] = (acc[issue.rcaStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority counts
  const p1 = issues.filter((i) => i.priority === 'P1').length;
  const p2 = issues.filter((i) => i.priority === 'P2').length;
  const p3 = issues.filter((i) => i.priority === 'P3').length;
  const p4 = issues.filter((i) => i.priority === 'P4').length;

  const maxMonthTotal = Math.max(...summaries.map((s) => s.totalIssues), 50);

  const cardBgClass = isDarkMode
    ? 'bg-[#1e1e24] border-neutral-800'
    : 'bg-white border-neutral-200 shadow-sm';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Trend Bar Chart in TM Corporate Palette */}
      <div className={`${cardBgClass} rounded-2xl border p-5 flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-neutral-100">
                Monthly Incident Volume by Priority
              </h3>
              <p className="text-[11px] text-neutral-500">Telekom Malaysia SLA Severity</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#D71920]/10 text-[#D71920] border border-[#D71920]/20">
              P1–P4 Distribution
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            {summaries.map((s) => {
              const heightPercent = Math.round((s.totalIssues / maxMonthTotal) * 100);
              const p1H = s.totalIssues ? (s.p1 / s.totalIssues) * 100 : 0;
              const p2H = s.totalIssues ? (s.p2 / s.totalIssues) * 100 : 0;
              const p3H = s.totalIssues ? (s.p3 / s.totalIssues) * 100 : 0;
              const p4H = s.totalIssues ? (s.p4 / s.totalIssues) * 100 : 0;

              return (
                <div
                  key={s.month}
                  onClick={() => onSelectMonth && onSelectMonth(s.month)}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="text-xs font-mono font-bold text-neutral-500 group-hover:text-[#D71920] tabular-nums transition-colors">
                    {s.totalIssues}
                  </div>
                  <div
                    className="w-full max-w-[44px] rounded-t-lg flex flex-col justify-end overflow-hidden bg-neutral-200 dark:bg-neutral-800 transition-all group-hover:ring-2 group-hover:ring-[#D71920]/50"
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                  >
                    {/* TM Red Stacked Bars */}
                    {p1H > 0 && (
                      <div
                        style={{ height: `${p1H}%` }}
                        className="bg-[#D71920] transition-colors"
                        title={`P1 Critical: ${s.p1}`}
                      />
                    )}
                    {p2H > 0 && (
                      <div
                        style={{ height: `${p2H}%` }}
                        className="bg-[#F58220] transition-colors"
                        title={`P2 High: ${s.p2}`}
                      />
                    )}
                    {p3H > 0 && (
                      <div
                        style={{ height: `${p3H}%` }}
                        className="bg-[#4A4A4A] transition-colors"
                        title={`P3 Medium: ${s.p3}`}
                      />
                    )}
                    {p4H > 0 && (
                      <div
                        style={{ height: `${p4H}%` }}
                        className="bg-neutral-400 transition-colors"
                        title={`P4 Low: ${s.p4}`}
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-[#D71920] transition-colors">
                    {s.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-3">
          <button
            onClick={() => onSelectPriority && onSelectPriority('P1')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-[#D71920] transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D71920]" />
            <span className="font-semibold">P1 ({p1})</span>
          </button>
          <button
            onClick={() => onSelectPriority && onSelectPriority('P2')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-[#F58220] transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F58220]" />
            <span className="font-semibold">P2 ({p2})</span>
          </button>
          <button
            onClick={() => onSelectPriority && onSelectPriority('P3')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-[#4A4A4A] transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#4A4A4A]" />
            <span className="font-semibold">P3 ({p3})</span>
          </button>
          <button
            onClick={() => onSelectPriority && onSelectPriority('P4')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-500 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400" />
            <span className="font-semibold">P4 ({p4})</span>
          </button>
        </div>
      </div>

      {/* 2. Issue Area Distribution in TM Red / Dark Grey styling */}
      <div className={`${cardBgClass} rounded-2xl border p-5 flex flex-col justify-between transition-colors`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-neutral-100">
              Operational Area Distribution
            </h3>
            <p className="text-[11px] text-neutral-500">Incident volume by domain</p>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-500">
            Total {issues.length}
          </span>
        </div>

        <div className="space-y-3 my-auto pt-2">
          {sortedAreas.map(([area, count]) => {
            const percent = Math.round((count / Math.max(issues.length, 1)) * 100);
            return (
              <div
                key={area}
                onClick={() => onSelectArea && onSelectArea(area)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#D71920] transition-colors">
                    {area}
                  </span>
                  <span className="font-mono text-neutral-500 tabular-nums">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D71920] group-hover:bg-[#BF151B] h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <span>Primary operational load</span>
          <span className="font-semibold text-[#4A4A4A] dark:text-neutral-300">
            SocMed &amp; Email: 78% of volume
          </span>
        </div>
      </div>

      {/* 3. RCA Status & Resolution Health */}
      <div className={`${cardBgClass} rounded-2xl border p-5 flex flex-col justify-between transition-colors`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-neutral-100">
              RCA &amp; Resolution Health
            </h3>
            <p className="text-[11px] text-neutral-500">Operational root-cause governance</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            96.3% Resolved
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-auto py-2">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 block mb-1">RCA Included</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {rcaCounts['Included'] || 33}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Full root cause &amp; SOP</span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 block mb-1">Pending RCA</span>
            <div className="text-xl font-bold font-mono text-[#F58220] tabular-nums">
              {rcaCounts['Pending RCA'] || 23}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Under technical review</span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 block mb-1">In Progress / Review</span>
            <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              {(rcaCounts['In Progress'] || 32) + (rcaCounts['In Review'] || 0)}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Active investigation</span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 block mb-1">N/A / BAU Spam</span>
            <div className="text-xl font-bold font-mono text-neutral-500 tabular-nums">
              {rcaCounts['N/A'] || 16}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Standard operational spam</span>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
          <span>Avg SLA Resolution Time:</span>
          <span className="font-mono font-bold text-[#D71920] tabular-nums">
            72.8 Hours
          </span>
        </div>
      </div>
    </div>
  );
};
