import React, { useState, useMemo } from 'react';
import { Incident, IncidentStatus, Priority, UserSession } from '../types/nocSystem';
import { isIncidentOverdue, calculateIncidentAge } from '../services/notificationService';
import { exportIncidentsToCSV } from '../services/sharepointExcelService';
import {
  Search,
  Filter,
  Download,
  AlertOctagon,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  Paperclip,
  MessageSquare,
  ArrowUpDown,
  RotateCcw,
  History,
  MoreVertical,
  PlusCircle,
  Mail,
} from 'lucide-react';

interface NOCIncidentListViewProps {
  incidents: Incident[];
  currentUser: UserSession;
  onSelectIncident: (incident: Incident, initialTab?: string) => void;
  onOpenCreateModal: () => void;
  onOpenResolveModal: (incident: Incident) => void;
  onOpenReminderModal?: (incident: Incident) => void;
  onChangeStatusQuick: (incident: Incident, newStatus: IncidentStatus) => void;
  initialFilter?: {
    status?: string;
    priority?: string;
    onlyOverdue?: boolean;
    assignedToMe?: boolean;
  };
  isDarkMode: boolean;
}

export const NOCIncidentListView: React.FC<NOCIncidentListViewProps> = ({
  incidents,
  currentUser,
  onSelectIncident,
  onOpenCreateModal,
  onOpenResolveModal,
  onOpenReminderModal,
  onChangeStatusQuick,
  initialFilter,
  isDarkMode,
}) => {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter?.status || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilter?.priority || 'all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>(
    initialFilter?.assignedToMe ? currentUser.name : 'all'
  );
  const [onlyOverdueFilter, setOnlyOverdueFilter] = useState<boolean>(
    initialFilter?.onlyOverdue || false
  );
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Sorting
  const [sortBy, setSortBy] = useState<'id' | 'date' | 'priority' | 'followup'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Locations, Teams, and Persons lists
  const locations = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.siteLocation).filter(Boolean)));
  }, [incidents]);

  const teams = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.assignedTeam).filter(Boolean)));
  }, [incidents]);

  const persons = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.assignedPerson).filter(Boolean)));
  }, [incidents]);

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Exclude archived unless requested
      if (inc.isArchived) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          inc.incidentId.toLowerCase().includes(q) ||
          inc.callId.toLowerCase().includes(q) ||
          inc.customerName.toLowerCase().includes(q) ||
          inc.userName.toLowerCase().includes(q) ||
          inc.issueTitle.toLowerCase().includes(q) ||
          inc.serviceName.toLowerCase().includes(q) ||
          inc.assignedPerson.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'Pending') {
          if (!['Pending User', 'Pending Vendor', 'Pending Internal Team'].includes(inc.status)) {
            return false;
          }
        } else if (inc.status !== statusFilter) {
          return false;
        }
      }

      // Priority
      if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;

      // Location
      if (locationFilter !== 'all' && inc.siteLocation !== locationFilter) return false;

      // Team
      if (teamFilter !== 'all' && inc.assignedTeam !== teamFilter) return false;

      // Person
      if (personFilter !== 'all' && !inc.assignedPerson.includes(personFilter)) return false;

      // Overdue
      if (onlyOverdueFilter && !isIncidentOverdue(inc)) return false;

      // Date Range
      if (startDateFilter) {
        const incDate = inc.escalationDateTime.split(' ')[0];
        if (incDate < startDateFilter) return false;
      }
      if (endDateFilter) {
        const incDate = inc.escalationDateTime.split(' ')[0];
        if (incDate > endDateFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(b.escalationDateTime).getTime() - new Date(a.escalationDateTime).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      }
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
        const diff = (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        return sortOrder === 'desc' ? diff : -diff;
      }
      if (sortBy === 'followup') {
        const diff = new Date(b.nextFollowUpDateTime).getTime() - new Date(a.nextFollowUpDateTime).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      }
      return sortOrder === 'desc' ? b.incidentId.localeCompare(a.incidentId) : a.incidentId.localeCompare(b.incidentId);
    });
  }, [
    incidents,
    searchTerm,
    statusFilter,
    priorityFilter,
    locationFilter,
    teamFilter,
    personFilter,
    onlyOverdueFilter,
    startDateFilter,
    endDateFilter,
    sortBy,
    sortOrder,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setLocationFilter('all');
    setTeamFilter('all');
    setPersonFilter('all');
    setOnlyOverdueFilter(false);
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const cardBg = isDarkMode ? 'bg-[#1C1C1F] border-neutral-800' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `px-3 py-1.5 rounded-xl border text-xs outline-none transition-colors font-medium ${
    isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
      : 'bg-white border-slate-300 text-slate-800 focus:border-[#D71920]'
  }`;

  const renderStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D71920] text-white font-mono shadow-xs">
          <AlertOctagon className="w-3 h-3" />
          <span>{status} (Overdue)</span>
        </span>
      );
    }

    switch (status) {
      case 'New':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">New</span>;
      case 'Ongoing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Ongoing</span>;
      case 'Pending User':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">Pending User</span>;
      case 'Pending Vendor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">Pending Vendor</span>;
      case 'Pending Internal Team':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">Pending Internal</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case 'Closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-800/10 text-emerald-800 dark:text-emerald-300 border border-emerald-800/20">Closed</span>;
      case 'Reopened':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Reopened</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Draft</span>;
    }
  };

  const renderPriorityBadge = (p: string) => {
    if (p === 'P1') return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white font-mono">P1</span>;
    if (p === 'P2') return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white font-mono">P2</span>;
    if (p === 'P3') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white font-mono">P3</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-400 text-white font-mono">P4</span>;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Export Bar */}
      <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Incident Master List
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
              {filteredIncidents.length} of {incidents.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Synchronized with SharePoint Excel: <code>TM_NOC_Incident_Tracker.xlsx</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportIncidentsToCSV(filteredIncidents)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-emerald-500'
                : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-600'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Section 8 Requirement) */}
      <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
        {/* Row 1: Search & Toggles */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Incident ID, Call ID, Customer, Title, User or Service..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:border-[#D71920]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setOnlyOverdueFilter(!onlyOverdueFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer border transition-colors ${
                onlyOverdueFilter
                  ? 'bg-[#D71920] text-white border-[#D71920]'
                  : isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-red-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-red-500'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Overdue Only</span>
            </button>

            <button
              onClick={handleResetFilters}
              className={`p-2 rounded-xl border text-xs cursor-pointer ${
                isDarkMode ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-black'
              }`}
              title="Reset All Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Granular Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">All Pending</option>
              <option value="Pending User">Pending User</option>
              <option value="Pending Vendor">Pending Vendor</option>
              <option value="Pending Internal Team">Pending Internal</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Site / Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Assignment</label>
            <div className={`${inputClass} w-full flex items-center justify-between text-slate-700 dark:text-neutral-300`}>
              <span className="font-bold text-[#034DA1] dark:text-blue-400">All NOC</span>
              <span className="text-[10px] text-slate-400">Collaborative</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`${inputClass} flex-1`}
              >
                <option value="date">Date</option>
                <option value="priority">Priority</option>
                <option value="followup">Follow-up</option>
                <option value="id">ID</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-mono"
                title="Toggle Sort Order"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incident List Table (Section 8 Column Specifications) */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800 text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Call ID</th>
                <th className="py-3 px-3">Escalation Date</th>
                <th className="py-3 px-3">Customer / User</th>
                <th className="py-3 px-3">Site / Location</th>
                <th className="py-3 px-3">Service / System</th>
                <th className="py-3 px-3 min-w-[200px]">Issue Title</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Assignment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Updated</th>
                <th className="py-3 px-3">Next Follow-up</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Reminder</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No matching incidents found. Adjust filters or register a new incident.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const overdue = isIncidentOverdue(inc);
                  const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';

                  return (
                    <tr
                      key={inc.incidentId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        overdue ? 'bg-red-500/5' : ''
                      }`}
                    >
                      {/* 1. Incident ID */}
                      <td className="py-3 px-3 font-mono font-bold text-[#034DA1] dark:text-blue-400 whitespace-nowrap">
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="hover:underline cursor-pointer"
                        >
                          {inc.incidentId}
                        </button>
                      </td>

                      {/* 2. Call ID */}
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-neutral-300 whitespace-nowrap">
                        {inc.callId}
                      </td>

                      {/* 3. Escalation Date */}
                      <td className="py-3 px-3 text-slate-600 dark:text-neutral-400 whitespace-nowrap text-[11px]">
                        {inc.escalationDateTime}
                      </td>

                      {/* 4. Customer / User */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-neutral-200">
                          {inc.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inc.userName}
                        </div>
                      </td>

                      {/* 5. Site / Location */}
                      <td className="py-3 px-3 text-slate-600 dark:text-neutral-400 whitespace-nowrap text-[11px]">
                        {inc.siteLocation}
                      </td>

                      {/* 6. Service / System */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-neutral-300">
                          {inc.serviceName}
                        </span>
                      </td>

                      {/* 7. Issue Title */}
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-neutral-100 max-w-xs truncate" title={inc.issueTitle}>
                        {inc.issueTitle}
                      </td>

                      {/* 8. Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderPriorityBadge(inc.priority)}
                      </td>

                      {/* 9. Assignment */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                        <span className="inline-flex items-center gap-1 font-bold text-[#034DA1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 px-2 py-0.5 rounded">
                          All NOC
                        </span>
                      </td>

                      {/* 11. Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(inc.status, overdue)}
                      </td>

                      {/* 12. Last Updated */}
                      <td className="py-3 px-3 text-slate-500 dark:text-neutral-400 whitespace-nowrap text-[11px]">
                        {inc.lastUpdatedDateTime}
                      </td>

                      {/* 13. Next Follow-up */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className={overdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-neutral-400'}>
                          {inc.nextFollowUpDateTime}
                        </span>
                      </td>

                      {/* 14. Age */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {calculateIncidentAge(inc.createdDateTime)}
                      </td>

                      {/* 15. Reminder Status */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                        {isResolved ? (
                          <span className="text-slate-400 font-medium">Stopped</span>
                        ) : (
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            Active ({inc.reminderFrequency.split(' ')[1] || '1h'})
                          </span>
                        )}
                      </td>

                      {/* 16. Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectIncident(inc)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-[#034DA1] dark:text-blue-400 cursor-pointer"
                            title="View Incident Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isResolved && (
                            <>
                              {onOpenReminderModal && (
                                <button
                                  onClick={() => onOpenReminderModal(inc)}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-700 text-[#D71920] cursor-pointer"
                                  title="Send Email Notification Reminder"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onOpenResolveModal(inc)}
                                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                                title="Confirm Resolution & Mark Resolved"
                              >
                                Resolve
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onSelectIncident(inc, 'history')}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-500 cursor-pointer"
                            title="View History Timeline"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
