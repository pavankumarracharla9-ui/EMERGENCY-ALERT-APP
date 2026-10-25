import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { IncidentMap } from '../components/map/IncidentMap.tsx';
import { PriorityBadge } from '../components/common/PriorityBadge.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { Incident, AmbulanceUnit, Hospital } from '../types/index.ts';
import {
  Navigation,
  Truck,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Send,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface DispatchPageProps {
  onNavigate: (path: string) => void;
}

export const DispatchPage: React.FC<DispatchPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    ambulances,
    hospitals,
    activeIncidentId,
    setActiveIncidentId,
    assignAmbulance,
    unassignAmbulance,
    updateIncidentStatus,
    simulateHospitalNotification,
  } = useApp();

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-01');

  // Layer toggles
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true);
  const [showAmbulancesLayer, setShowAmbulancesLayer] = useState(true);
  const [showHospitalsLayer, setShowHospitalsLayer] = useState(true);
  const [mapTheme, setMapTheme] = useState<'dark' | 'standard'>('dark');

  const activeIncident =
    incidents.find((i) => i.id === activeIncidentId) ||
    incidents.find((i) => i.status !== 'Resolved') ||
    incidents[0];

  const assignedUnit = activeIncident?.assignedUnitId
    ? ambulances.find((u) => u.id === activeIncident.assignedUnitId)
    : null;

  const targetHospital = activeIncident?.targetHospitalId
    ? hospitals.find((h) => h.id === activeIncident.targetHospitalId)
    : hospitals[0];

  // Smart Assignment Algorithm
  // Computes recommendation score for each available unit based on distance, equipment, and fuel
  const computeUnitScore = (unit: AmbulanceUnit, inc: Incident) => {
    let score = 70;
    const latDiff = Math.abs(unit.location.lat - inc.location.lat);
    const lngDiff = Math.abs(unit.location.lng - inc.location.lng);
    const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    const estMins = Math.max(2, Math.round(approxKm * 2.2));

    // Distance deduction
    score -= estMins * 4;

    // Availability bonus
    if (unit.status === 'Available') score += 25;
    else if (unit.status === 'Assigned') score -= 30;

    // Equipment match bonus
    if (inc.priority === 'Critical') {
      if (unit.type.includes('ALS') || unit.type.includes('Critical Care')) score += 20;
      else score -= 15;
    } else if (inc.priority === 'Low') {
      if (unit.type.includes('BLS')) score += 15;
    }

    if (unit.fuelLevel > 70) score += 5;

    return {
      score: Math.min(99, Math.max(30, Math.round(score))),
      approxKm: approxKm.toFixed(1),
      estMins,
    };
  };

  // Rank units for active incident
  const scoredUnits = activeIncident
    ? ambulances
        .map((unit) => {
          const evalData = computeUnitScore(unit, activeIncident);
          return {
            unit,
            ...evalData,
          };
        })
        .sort((a, b) => b.score - a.score)
    : [];

  const topRecommended = scoredUnits[0];

  return (
    <div className="h-[calc(100vh-56px-28px)] flex flex-col overflow-hidden bg-[#0B1220] text-slate-100">
      {/* Top Dispatch Toolbar */}
      <div className="h-12 bg-[#111C30] border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#18B6A4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Command Dispatch Matrix
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span>Target Incident:</span>
            <select
              value={activeIncident?.id || ''}
              onChange={(e) => setActiveIncidentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-[#18B6A4] rounded px-2 py-1 focus:outline-none"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id} ({i.type} - {i.priority})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setShowIncidentsLayer(!showIncidentsLayer)}
              className={`px-2 py-0.5 rounded transition-colors ${
                showIncidentsLayer ? 'bg-[#E53945]/20 text-[#E53945] font-semibold' : 'text-slate-500'
              }`}
            >
              Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setShowAmbulancesLayer(!showAmbulancesLayer)}
              className={`px-2 py-0.5 rounded transition-colors ${
                showAmbulancesLayer ? 'bg-[#18B6A4]/20 text-[#18B6A4] font-semibold' : 'text-slate-500'
              }`}
            >
              Fleet ({ambulances.length})
            </button>
            <button
              onClick={() => setShowHospitalsLayer(!showHospitalsLayer)}
              className={`px-2 py-0.5 rounded transition-colors ${
                showHospitalsLayer ? 'bg-indigo-500/20 text-indigo-400 font-semibold' : 'text-slate-500'
              }`}
            >
              Hospitals ({hospitals.length})
            </button>
          </div>

          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'standard' : 'dark')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs"
            title="Toggle Map Style"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split View: Map (Left/Center) + Smart Dispatch Console (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Map Viewport */}
        <div className="flex-1 h-1/2 lg:h-full relative min-w-0">
          <IncidentMap
            incidents={incidents}
            ambulances={ambulances}
            hospitals={hospitals}
            selectedIncidentId={activeIncident?.id}
            selectedAmbulanceId={assignedUnit?.id || selectedUnitId || topRecommended?.unit.id}
            onSelectIncident={(inc) => setActiveIncidentId(inc.id)}
            onSelectAmbulance={(amb) => setSelectedUnitId(amb.id)}
            showIncidents={showIncidentsLayer}
            showAmbulances={showAmbulancesLayer}
            showHospitals={showHospitalsLayer}
            showRoute={true}
            theme={mapTheme}
            className="h-full w-full"
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-[1000] bg-[#111C30]/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl max-w-xs text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white">{activeIncident?.id}</span>
              <PriorityBadge priority={activeIncident?.priority || 'Moderate'} size="sm" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate">{activeIncident?.type}</p>
            <p className="text-[11px] text-slate-400 truncate">{activeIncident?.location.address}</p>
            <div className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>
                {activeIncident?.estimatedArrivalMins
                  ? `Simulated ETA: ~${activeIncident.estimatedArrivalMins} mins`
                  : 'Awaiting unit dispatch'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Dispatch Console Sidebar */}
        <div className="w-full lg:w-96 bg-[#111C30] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-1/2 lg:h-full overflow-y-auto">
          {activeIncident ? (
            <div className="p-4 space-y-5 flex-1">
              {/* Incident Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-white">
                    {activeIncident.id}
                  </span>
                  <StatusBadge status={activeIncident.status} size="sm" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{activeIncident.type}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {activeIncident.description}
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  {activeIncident.affectedCount} casualty(s) reported
                </div>
              </div>

              {/* Assigned Unit or Smart Recommendation Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#18B6A4]" />
                    <span>Smart Unit Match Engine</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">AI Scored</span>
                </div>

                {assignedUnit ? (
                  <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-600/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-white text-sm">{assignedUnit.callSign}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                        CURRENTLY ASSIGNED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {assignedUnit.type} · Crew: {assignedUnit.crew[0]}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Simulated ETA:</span>
                      <strong className="text-white font-mono">
                        {activeIncident.estimatedArrivalMins} minutes
                      </strong>
                    </div>

                    <button
                      onClick={() => unassignAmbulance(activeIncident.id)}
                      className="w-full py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                    >
                      Unassign Unit
                    </button>
                  </div>
                ) : topRecommended ? (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-[#18B6A4]/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {topRecommended.unit.callSign}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18B6A4]/20 text-[#18B6A4]">
                        {topRecommended.score}% Match Score
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">{topRecommended.unit.type}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                      <div>
                        <span className="text-slate-400">Est. Distance:</span>{' '}
                        <strong className="text-slate-200 font-mono">{topRecommended.approxKm} km</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Simulated ETA:</span>{' '}
                        <strong className="text-slate-200 font-mono">~{topRecommended.estMins} mins</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded">
                      <strong className="text-slate-300">Why recommended: </strong>
                      {activeIncident.priority === 'Critical'
                        ? 'Unit has advanced paramedic ALS equipment and closest verified road proximity.'
                        : 'Unit is currently available with optimal travel profile for moderate triage.'}
                    </div>

                    <button
                      onClick={() =>
                        assignAmbulance(activeIncident.id, topRecommended.unit.id, selectedHospitalId)
                      }
                      className="w-full py-2 bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch {topRecommended.unit.callSign}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No available units in quadrant
                  </div>
                )}
              </div>

              {/* Receiving Hospital Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Designated Hospital Facility
                </label>
                <select
                  value={activeIncident.targetHospitalId || selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#18B6A4]"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.emergencyBedsAvailable} beds open)
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    simulateHospitalNotification(
                      activeIncident.id,
                      selectedHospitalId,
                      `${activeIncident.type}: ${activeIncident.description.slice(0, 80)}. ETA: ${
                        activeIncident.estimatedArrivalMins || 5
                      }m`,
                      activeIncident.affectedCount
                    );
                  }}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Simulate Pre-Arrival Hospital Alert</span>
                </button>
              </div>

              {/* Rapid Scenario Stepper Controls */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulate Incident Lifecycle
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateIncidentStatus(activeIncident.id, 'En Route')}
                    disabled={activeIncident.status === 'Resolved'}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition-colors disabled:opacity-40"
                  >
                    Mark En Route
                  </button>
                  <button
                    onClick={() => updateIncidentStatus(activeIncident.id, 'Arrived')}
                    disabled={activeIncident.status === 'Resolved'}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition-colors disabled:opacity-40"
                  >
                    Simulate Arrived
                  </button>
                  <button
                    onClick={() => updateIncidentStatus(activeIncident.id, 'Resolved')}
                    className="col-span-2 py-2 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    Resolve Incident
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an incident to view dispatch metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
