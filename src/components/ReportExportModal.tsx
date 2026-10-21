import React, { useRef } from 'react';
import { Issue, MonthlySummary } from '../types/issue';
import { TMLogo } from './TMLogo';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  summaries: MonthlySummary[];
  activeFilter?: {
    month?: string;
    status?: string;
    priority?: string;
  };
  onExportExcel: () => void;
  isDarkMode?: boolean;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  issues,
  summaries,
  activeFilter = {},
  onExportExcel,
  isDarkMode = true,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const exportDate = new Date().toLocaleString('en-MY', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Filter issues based on active filter
  const filteredIssues = issues.filter((i) => {
    if (activeFilter.month && i.month !== activeFilter.month) return false;
    if (activeFilter.status && i.status !== activeFilter.status) return false;
    if (activeFilter.priority && i.priority !== activeFilter.priority) return false;
    return true;
  });

  const total = filteredIssues.length;
  const resolved = filteredIssues.filter((i) => i.status === 'Resolved').length;
  const open = filteredIssues.filter((i) => i.status !== 'Resolved').length;
  const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '100.0';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!reportRef.current) return;
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>TM NOC & OPS Incident Report - ${new Date().toISOString().slice(0, 10)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #4A4A4A; padding: 30px; }
            .header { border-bottom: 3px solid #D71920; padding-bottom: 20px; margin-bottom: 25px; }
            .title { color: #D71920; font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { color: #4A4A4A; font-size: 14px; margin-top: 5px; }
            .meta { font-size: 12px; color: #777; margin-top: 10px; }
            .kpi-row { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; }
            .kpi-num { font-size: 22px; font-weight: bold; color: #D71920; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #F5F5F5; text-align: left; padding: 8px; border-bottom: 2px solid #D71920; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          ${reportRef.current.innerHTML}
        </body>
      </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TM_NOC_OPS_Report_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalBg = isDarkMode
    ? 'bg-[#1e1e24] border-neutral-800 text-neutral-100'
    : 'bg-white border-neutral-200 text-[#4A4A4A]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${modalBg}`}>
        {/* Modal Toolbar */}
        <div className="p-4 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="sm" />
            <div className="border-l border-neutral-300 dark:border-neutral-700 pl-3">
              <span className="text-[10px] font-bold text-[#D71920] uppercase tracking-wider block">
                Official Report Generator
              </span>
              <h3 className="text-sm font-bold text-[#4A4A4A] dark:text-white">
                Telekom Malaysia Corporate Incident &amp; Assurance Report
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#4A4A4A] dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#4A4A4A] dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Preview */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-[#4A4A4A]">
          <div ref={reportRef} className="max-w-3xl mx-auto space-y-6">
            {/* Report Header with Official TM Logo */}
            <div className="border-b-2 border-[#D71920] pb-6 flex items-start justify-between">
              <div>
                <TMLogo variant="color" size="lg" />
                <h1 className="text-xl font-bold text-[#D71920] mt-3">
                  Telekom Malaysia NOC &amp; OPS Management Report
                </h1>
                <p className="text-xs text-[#4A4A4A] font-semibold mt-0.5">
                  Network Operations Center Incident Track &amp; Service Level Assurance
                </p>
              </div>

              <div className="text-right text-xs text-neutral-500 font-mono space-y-1">
                <div>
                  <strong>Report Ref:</strong> TM-NOC-{new Date().toISOString().slice(0, 10)}
                </div>
                <div>
                  <strong>Export Timestamp:</strong> {exportDate}
                </div>
                <div>
                  <strong>Classification:</strong> Internal Operations Only
                </div>
              </div>
            </div>

            {/* Active Filters Tag Bar */}
            <div className="p-3 bg-[#F5F5F5] rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#4A4A4A]">Active Filters:</span>
                <span className="px-2 py-0.5 rounded bg-white border border-neutral-300 font-semibold text-neutral-700">
                  Month: {activeFilter.month || 'All Recorded (July–October 2026)'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-neutral-300 font-semibold text-neutral-700">
                  Status: {activeFilter.status || 'All Statuses'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-neutral-300 font-semibold text-neutral-700">
                  Priority: {activeFilter.priority || 'All (P1–P4)'}
                </span>
              </div>
              <div className="font-bold text-[#D71920]">
                {filteredIssues.length} Incidents Included
              </div>
            </div>

            {/* Executive KPI Summary Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 bg-[#F5F5F5]">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Total Incidents
                </div>
                <div className="text-2xl font-bold font-mono text-[#4A4A4A] mt-1">{total}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Filter scope</div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-[#F5F5F5]">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Resolved
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{resolved}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">SLA Restored</div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-[#F5F5F5]">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Active / Open
                </div>
                <div className="text-2xl font-bold font-mono text-[#D71920] mt-1">{open}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Under NOC response</div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-[#F5F5F5]">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Resolution Rate
                </div>
                <div className="text-2xl font-bold font-mono text-[#D71920] mt-1">{resRate}%</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">&ge; 95% SLA Target</div>
              </div>
            </div>

            {/* Incidents Table */}
            <div>
              <h3 className="text-sm font-bold text-[#4A4A4A] mb-2 flex items-center justify-between">
                <span>Detailed Incident Records</span>
                <span className="text-xs font-normal text-neutral-500">
                  Showing top {Math.min(filteredIssues.length, 25)} of {filteredIssues.length} records
                </span>
              </h3>
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#F5F5F5] text-neutral-600 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                    <tr>
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Priority</th>
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Area</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">RCA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredIssues.slice(0, 25).map((issue) => (
                      <tr key={issue.id} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-mono font-bold text-[#D71920]">
                          #{issue.id}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              issue.priority === 'P1'
                                ? 'bg-[#D71920] text-white'
                                : issue.priority === 'P2'
                                ? 'bg-[#F58220] text-white'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-neutral-600">{issue.month}</td>
                        <td className="py-2 px-3 font-semibold text-[#4A4A4A]">
                          {issue.issueArea}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate text-neutral-700">
                          {issue.longDescription}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              issue.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-neutral-500">{issue.rcaStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Sign-off & Corporate Footer */}
            <div className="border-t border-neutral-300 pt-6 flex items-end justify-between text-xs text-neutral-500">
              <div className="space-y-1">
                <div className="font-bold text-[#4A4A4A]">Telekom Malaysia Berhad (128740-P)</div>
                <div>Network Operations Center &middot; Menara TM, Kuala Lumpur</div>
                <div className="text-[10px]">Confidential Document &middot; For Internal Operations Use Only</div>
              </div>

              <div className="text-right space-y-4">
                <div className="border-b border-neutral-400 w-44 pb-1 font-mono text-[11px] text-neutral-600">
                  Approved &amp; Certified
                </div>
                <div className="text-[10px] text-neutral-400">
                  Telekom Malaysia Operations Assurance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
