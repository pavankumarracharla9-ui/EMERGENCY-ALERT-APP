import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AmbulanceUnit, AmbulanceStatus } from '../types/index.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Fuel,
  Users,
  Wrench,
  AlertTriangle,
  Eye,
  X,
  Radio,
} from 'lucide-react';

interface FleetPageProps {
  onNavigate: (path: string) => void;
}

export const FleetPage: React.FC<FleetPageProps> = ({ onNavigate }) => {
  const { ambulances, incidents, setActiveIncidentId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<AmbulanceUnit | null>(null);

  const availableCount = ambulances.filter((a) => a.status === 'Available').length;
  const assignedCount = ambulances.filter((a) => a.status === 'Assigned' || a.status === 'En Route').length;
  const onSceneCount = ambulances.filter((a) => a.status === 'At Scene').length;

  const filteredAmbulances = ambulances.filter((amb) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        amb.callSign.toLowerCase().includes(q) ||
        amb.id.toLowerCase().includes(q) ||
        amb.type.toLowerCase().includes(q) ||
        amb.equipment.some((eq) => eq.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'All' && amb.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Ambulance Fleet &amp; Resource Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time status monitoring, equipment rosters, and dispatch availability for all metropolitan response units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/dispatch')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Open Map Dispatch</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Fleet Size</span>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {ambulances.length} Units
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Simulated city quadrant</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Available for Dispatch</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {availableCount}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Immediate readiness</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-sky-500/30 bg-sky-500/5">
          <div className="flex items-center justify-between text-sky-400 text-xs mb-1">
            <span>Assigned / En Route</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
            {assignedCount}
          </div>
          <div className="text-[10px] text-sky-400/80 mt-1">Responding to emergency</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>At Emergency Scene</span>
            <Wrench className="w-4 h-4 text-[#18B6A4]" />
          </div>
          <div className="text-2xl font-bold text-[#18B6A4] font-mono tabular-nums">
            {onSceneCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Triage and extrication</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by callsign, vehicle type, or equipment..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#18B6A4]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#18B6A4]"
          >
            <option value="All">All Units</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="En Route">En Route</option>
            <option value="At Scene">At Scene</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAmbulances.map((unit) => {
          const assignedIncident = unit.assignedIncidentId
            ? incidents.find((i) => i.id === unit.assignedIncidentId)
            : null;

          return (
            <div
              key={unit.id}
              className="p-5 rounded-2xl bg-[#111C30] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">{unit.callSign}</span>
                    <span className="text-xs font-mono text-slate-500">{unit.id}</span>
                  </div>
                  <StatusBadge status={unit.status} size="sm" />
                </div>

                <p className="text-xs font-semibold text-[#18B6A4] mb-3">{unit.type}</p>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Station / Base:</span>
                    <span className="text-slate-200">{unit.location.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Fuel / Battery:</span>
                    <span className="font-mono font-semibold text-slate-200 flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-amber-400" />
                      <span>{unit.fuelLevel}%</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Crew:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{unit.crew[0]}</span>
                  </div>
                </div>

                {/* Assigned Incident Alert */}
                {assignedIncident && (
                  <div className="mt-3 p-2.5 rounded-lg bg-sky-950/40 border border-sky-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sky-300">Incident: {assignedIncident.id}</span>
                      <span className="text-[10px] text-sky-400 font-mono">
                        {assignedIncident.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {assignedIncident.location.address}
                    </p>
                  </div>
                )}

                {/* Equipment Tags */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Equipped With:</div>
                  <div className="flex flex-wrap gap-1">
                    {unit.equipment.slice(0, 3).map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {eq}
                      </span>
                    ))}
                    {unit.equipment.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400">
                        +{unit.equipment.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedUnit(unit)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Unit</span>
                </button>
                {unit.status === 'Available' && (
                  <button
                    onClick={() => onNavigate('/dispatch')}
                    className="py-1.5 px-3 rounded-lg bg-[#18B6A4]/20 hover:bg-[#18B6A4]/30 text-[#18B6A4] text-xs font-semibold transition-colors"
                  >
                    Dispatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#18B6A4]" />
                <h3 className="text-base font-bold text-white">
                  {selectedUnit.callSign} ({selectedUnit.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Classification</span>
                <span className="font-semibold text-white">{selectedUnit.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Status</span>
                <StatusBadge status={selectedUnit.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Base</span>
                <span className="text-slate-200">{selectedUnit.location.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fuel Tank / Range</span>
                <span className="font-mono text-slate-200">{selectedUnit.fuelLevel}% (~180 km remaining)</span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Assigned Paramedic Crew</span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  {selectedUnit.crew.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Onboard Medical &amp; Rescue Equipment</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {selectedUnit.equipment.map((eq, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
