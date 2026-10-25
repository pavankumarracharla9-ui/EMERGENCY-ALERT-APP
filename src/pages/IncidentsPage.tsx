import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Incident, IncidentStatus, PriorityLevel } from '../types/index.ts';
import { PriorityBadge } from '../components/common/PriorityBadge.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { IncidentMap } from '../components/map/IncidentMap.tsx';
import {
  Search,
  Filter,
  Eye,
  Truck,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  X,
  FileText,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface IncidentsPageProps {
  onNavigate: (path: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    ambulances,
    hospitals,
    activeIncidentId,
    setActiveIncidentId,
    updateIncidentStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedIncidentModal, setSelectedIncidentModal] = useState<Incident | null>(() => {
    return incidents.find((i) => i.id === activeIncidentId) || null;
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [transitionPrompt, setTransitionPrompt] = useState<{
    incidentId: string;
    targetStatus: IncidentStatus;
  } | null>(null);

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Priority filter
    if (filterPriority !== 'All' && inc.priority !== filterPriority) return false;

    // Status filter
    if (filterStatus === 'Active' && inc.status === 'Resolved') return false;
    if (filterStatus === 'Resolved' && inc.status !== 'Resolved') return false;
    if (filterStatus === 'Unassigned' && inc.assignedUnitId) return false;
    if (
      filterStatus !== 'All' &&
      filterStatus !== 'Active' &&
      filterStatus !== 'Resolved' &&
      filterStatus !== 'Unassigned' &&
      inc.status !== filterStatus
    ) {
      return false;
    }

    return true;
  });

  const activeInc = selectedIncidentModal
    ? incidents.find((i) => i.id === selectedIncidentModal.id) || selectedIncidentModal
    : null;

  const assignedUnit = activeInc?.assignedUnitId
    ? ambulances.find((u) => u.id === activeInc.assignedUnitId)
    : null;

  const targetHospital = activeInc?.targetHospitalId
    ? hospitals.find((h) => h.id === activeInc.targetHospitalId)
    : null;

  // Status transitions
  const statusFlow: IncidentStatus[] = [
    'Reported',
    'Under Review',
    'Unit Assigned',
    'En Route',
    'Arrived',
    'Resolved',
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeInc) return;
    updateIncidentStatus(activeInc.id, activeInc.status, `Note added: "${newNoteText.trim()}"`);
    setNewNoteText('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Incident Management &amp; Case Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive audit registry with strict role-based status lifecycle tracking and event history.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/report-emergency')}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#E53945] hover:bg-[#d02e3a] text-white transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Emergency</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident ID, type, location..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#18B6A4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#18B6A4]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#18B6A4]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Unassigned">Unassigned</option>
              <option value="Reported">Reported</option>
              <option value="Under Review">Under Review</option>
              <option value="Unit Assigned">Unit Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Arrived">Arrived</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="text-xs font-mono text-slate-400 pl-2">
            Showing {filtered.length} of {incidents.length}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#111C30] border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Incident ID</th>
                <th className="py-3 px-4 font-semibold">Emergency Type</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Casualties</th>
                <th className="py-3 px-4 font-semibold">Assigned Unit</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Reported</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No emergency incidents found matching filter settings.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const unit = inc.assignedUnitId
                    ? ambulances.find((u) => u.id === inc.assignedUnitId)
                    : null;
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncidentModal(inc);
                        setActiveIncidentId(inc.id);
                      }}
                      className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-[#18B6A4]">
                        {inc.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{inc.type}</td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={inc.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                        {inc.location.address}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {inc.affectedCount} affected
                      </td>
                      <td className="py-3.5 px-4">
                        {unit ? (
                          <span className="text-sky-400 font-medium flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>{unit.callSign}</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {inc.reportedAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedIncidentModal(inc);
                              setActiveIncidentId(inc.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View Incident Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveIncidentId(inc.id);
                              onNavigate('/dispatch');
                            }}
                            className="px-2 py-1 rounded bg-[#18B6A4]/20 hover:bg-[#18B6A4]/30 text-[#18B6A4] font-semibold text-[11px]"
                            title="Open in Dispatch Console"
                          >
                            Dispatch
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

      {/* Incident Detail Modal / Drawer */}
      {activeInc && selectedIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-200 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-bold font-mono text-white">
                  {activeInc.id}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-sm font-semibold text-slate-200">{activeInc.type}</span>
                <PriorityBadge priority={activeInc.priority} size="sm" />
                <StatusBadge status={activeInc.status} size="sm" />
              </div>
              <button
                onClick={() => setSelectedIncidentModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Lifecycle Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Incident Response Lifecycle</span>
                  <span className="text-[11px] text-[#18B6A4]">Current: {activeInc.status}</span>
                </div>
                <div className="grid grid-cols-6 gap-1 sm:gap-2 text-center text-[10px]">
                  {statusFlow.map((st, idx) => {
                    const currentIdx = statusFlow.indexOf(activeInc.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={st}
                        onClick={() => {
                          if (st !== activeInc.status) {
                            setTransitionPrompt({ incidentId: activeInc.id, targetStatus: st });
                          }
                        }}
                        className={`p-2 rounded-lg border transition-all text-center ${
                          isCurrent
                            ? 'bg-[#18B6A4]/20 border-[#18B6A4] text-white font-bold'
                            : isPassed
                            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <div className="truncate">{st}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two Column Layout: Description & Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">
                      Incident Description
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {activeInc.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">People Affected</span>
                      <span className="font-bold text-white text-sm font-mono">
                        {activeInc.affectedCount} individuals
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Reported At</span>
                      <span className="font-bold text-white text-sm font-mono">
                        {activeInc.reportedAt}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Unit & Target Hospital */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Response Unit:</span>
                      {assignedUnit ? (
                        <span className="font-bold text-sky-400 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{assignedUnit.callSign} ({assignedUnit.type.split(' ')[0]})</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">None Assigned</span>
                      )}
                    </div>

                    {activeInc.estimatedArrivalMins && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Estimated Travel Time:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ~{activeInc.estimatedArrivalMins} mins
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Receiving Trauma Facility:</span>
                      <span className="text-indigo-400 font-semibold">
                        {targetHospital?.name || 'Metro General Trauma Center'}
                      </span>
                    </div>
                  </div>

                  {/* AI Triage Rationale if available */}
                  {activeInc.aiAssessment && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300 font-semibold">
                        <span>AI Triage Recommendation</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Confidence: {(activeInc.aiAssessment.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {activeInc.aiAssessment.priorityRationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Mini Map & Event Timeline */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                      <span>Location Map</span>
                      <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                        {activeInc.location.address}
                      </span>
                    </h4>
                    <div className="h-48 rounded-xl overflow-hidden border border-slate-800">
                      <IncidentMap
                        incidents={[activeInc]}
                        ambulances={assignedUnit ? [assignedUnit] : []}
                        hospitals={targetHospital ? [targetHospital] : []}
                        center={[activeInc.location.lat, activeInc.location.lng]}
                        zoom={14}
                        showRoute={Boolean(assignedUnit)}
                        theme="dark"
                        className="h-full w-full"
                      />
                    </div>
                  </div>

                  {/* Audit Event Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                      Event History &amp; Timestamps
                    </h4>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {activeInc.events.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                            <span className="font-semibold text-slate-200">{evt.type}</span>
                            <span className="font-mono text-slate-500">{evt.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{evt.description}</p>
                          <div className="text-[10px] text-slate-500 mt-1">Actor: {evt.actor}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Operational Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add dispatcher note to permanent record..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#18B6A4]"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 bg-[#18B6A4] hover:bg-[#159a8b] disabled:bg-slate-800 text-slate-950 font-semibold rounded-lg text-xs transition-colors shrink-0"
                    >
                      Add Note
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setSelectedIncidentModal(null);
                  setActiveIncidentId(activeInc.id);
                  onNavigate('/dispatch');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-[#18B6A4]" />
                <span>Open in Map Dispatch Console</span>
              </button>

              <button
                onClick={() => setSelectedIncidentModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Confirmation Modal */}
      {transitionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Lifecycle Transition</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to transition incident <strong>{transitionPrompt.incidentId}</strong> to{' '}
              <strong className="text-[#18B6A4]">"{transitionPrompt.targetStatus}"</strong>?
              This action will append a verified audit event to the permanent log.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTransitionPrompt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateIncidentStatus(transitionPrompt.incidentId, transitionPrompt.targetStatus);
                  setTransitionPrompt(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
