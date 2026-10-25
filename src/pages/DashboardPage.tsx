import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { IncidentMap } from '../components/map/IncidentMap.tsx';
import { PriorityBadge } from '../components/common/PriorityBadge.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { Incident, PriorityLevel, EmergencyType, IncidentStatus } from '../types/index.ts';
import {
  AlertTriangle,
  Flame,
  Truck,
  Activity,
  Building2,
  Clock,
  PlusCircle,
  RotateCcw,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  MapPin,
  Check,
  AlertCircle,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    ambulances,
    hospitals,
    notifications,
    activeIncidentId,
    setActiveIncidentId,
    addRandomDemoIncident,
    resetDemoData,
    updateIncidentStatus,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Dynamic calculated metrics
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const criticalCount = activeIncidents.filter((i) => i.priority === 'Critical').length;
  const availableAmbulances = ambulances.filter((a) => a.status === 'Available').length;
  const respondingUnits = ambulances.filter(
    (a) => a.status === 'Assigned' || a.status === 'En Route' || a.status === 'At Scene'
  ).length;
  const connectedHospitals = hospitals.length;

  // Average simulated response time calculation
  const times = incidents
    .filter((i) => i.estimatedArrivalMins)
    .map((i) => i.estimatedArrivalMins as number);
  const avgResponseTime =
    times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : '4.8';

  // Filtered incident list
  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter !== 'All' && inc.type !== typeFilter) return false;
    if (priorityFilter !== 'All' && inc.priority !== priorityFilter) return false;
    if (statusFilter === 'Active' && inc.status === 'Resolved') return false;
    if (statusFilter === 'Resolved' && inc.status !== 'Resolved') return false;
    if (statusFilter === 'Unassigned' && inc.assignedUnitId) return false;
    return true;
  });

  const selectedIncident = incidents.find((i) => i.id === activeIncidentId) || incidents[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Emergency Operations Center
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              EOC ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor incidents, coordinate resources, and track response progress in simulated real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={addRandomDemoIncident}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#18B6A4] hover:bg-[#159f8f] text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Demo Incident</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {activeIncidents.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Requiring attention</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111C30] border border-[#E53945]/30 bg-[#E53945]/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-rose-300">Critical Incidents</span>
            <Flame className="w-4 h-4 text-[#E53945]" />
          </div>
          <div className="text-2xl font-bold text-[#E53945] font-mono tabular-nums">
            {criticalCount}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Immediate ALS priority</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Available Units</span>
            <Truck className="w-4 h-4 text-[#18B6A4]" />
          </div>
          <div className="text-2xl font-bold text-[#18B6A4] font-mono tabular-nums">
            {availableAmbulances} <span className="text-xs text-slate-400 font-normal">/ {ambulances.length}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ready for dispatch</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Units Responding</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
            {respondingUnits}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">En route or on scene</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Hospitals Connected</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {connectedHospitals}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Trauma readiness live</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Avg Response ETA</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {avgResponseTime} <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Simulated urban fleet</div>
        </div>
      </div>

      {/* Main Operations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Map Box */}
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Incident &amp; Fleet Map
                </span>
                <span className="text-[11px] text-slate-400">· Metro Innovation District</span>
              </div>
              <button
                onClick={() => onNavigate('/dispatch')}
                className="text-xs font-semibold text-[#18B6A4] hover:text-[#22d3ee] flex items-center gap-1 transition-colors"
              >
                <span>Full Dispatch View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-80 sm:h-96 relative">
              <IncidentMap
                incidents={incidents}
                ambulances={ambulances}
                hospitals={hospitals}
                selectedIncidentId={activeIncidentId}
                onSelectIncident={(inc) => setActiveIncidentId(inc.id)}
                showRoute={true}
                theme="dark"
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Incident Filter Bar & List */}
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Live Incident Queue</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {filteredIncidents.length}
                </span>
              </div>

              {/* Segmented Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  {['Active', 'All', 'Unassigned', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        statusFilter === st
                          ? 'bg-slate-800 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#18B6A4]"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#18B6A4]"
                >
                  <option value="All">All Categories</option>
                  <option value="Road Accident">Road Accident</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Fire">Fire</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>

            {/* Incidents Table / Cards */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No incidents match the selected filter criteria.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = inc.id === activeIncidentId;
                  const assignedUnit = inc.assignedUnitId
                    ? ambulances.find((u) => u.id === inc.assignedUnitId)
                    : null;

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setActiveIncidentId(inc.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900/90 border-[#18B6A4]/60 shadow-md ring-1 ring-[#18B6A4]/30'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">{inc.id}</span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="text-xs font-semibold text-slate-200">{inc.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={inc.priority} size="sm" />
                          <StatusBadge status={inc.status} size="sm" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-1 mb-2 leading-relaxed">
                        {inc.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5 truncate max-w-sm">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{inc.location.address}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {assignedUnit ? (
                            <span className="text-sky-400 font-medium flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{assignedUnit.callSign}</span>
                              {inc.estimatedArrivalMins && (
                                <span className="font-mono text-[10px]">({inc.estimatedArrivalMins}m ETA)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium">Unassigned</span>
                          )}
                          <span className="font-mono text-slate-500">{inc.reportedAt}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveIncidentId(inc.id);
                              onNavigate('/dispatch');
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#18B6A4]/20 text-[#18B6A4] hover:bg-[#18B6A4]/30 transition-colors"
                          >
                            Dispatch
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Incident Event Timeline */}
          {selectedIncident && (
            <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Incident History &amp; Event Log: {selectedIncident.id}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">{selectedIncident.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIncident.status !== 'Resolved' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'Resolved')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      Resolve Incident
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('/incidents')}
                    className="text-xs text-[#18B6A4] hover:underline flex items-center gap-1"
                  >
                    <span>Full Incident View</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {selectedIncident.events.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#18B6A4] mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5">
                        <span className="font-semibold text-slate-300">{evt.type} · by {evt.actor}</span>
                        <span className="font-mono text-slate-500">{evt.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns - Resource Coordination Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Available Ambulances Card */}
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#18B6A4]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Available Fleet Units
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/fleet')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Manage Fleet ({ambulances.length})
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ambulances.map((unit) => (
                <div
                  key={unit.id}
                  className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">{unit.callSign}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{unit.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{unit.type.split(' ')[0]} · Fuel: {unit.fuelLevel}%</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={unit.status} size="sm" />
                    {unit.status === 'Available' && selectedIncident && selectedIncident.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          onNavigate('/dispatch');
                        }}
                        className="text-[10px] text-[#18B6A4] hover:underline font-medium"
                      >
                        Quick Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Readiness Card */}
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Hospital Readiness
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/hospitals')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                All Facilities
              </button>
            </div>

            <div className="space-y-2.5">
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{hosp.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        hosp.readinessStatus === 'Normal'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {hosp.readinessStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{hosp.traumaLevel}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded">
                    <div>
                      <span className="text-slate-500">ER Beds Avail:</span>{' '}
                      <span className="font-mono font-bold text-slate-200">
                        {hosp.emergencyBedsAvailable}/{hosp.emergencyBedsTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ICU Capacity:</span>{' '}
                      <span className="font-mono font-bold text-slate-200">{hosp.icuBedsAvailable} Open</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notifications Widget */}
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Recent Operations Feed
              </h3>
              <button
                onClick={() => onNavigate('/notifications')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                View Center ({notifications.length})
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{n.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Reset Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reset Demo Data</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This will restore the application to the initial seeded demonstration state. Any newly submitted incidents, custom dispatches, or simulated hospital alerts will be refreshed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
