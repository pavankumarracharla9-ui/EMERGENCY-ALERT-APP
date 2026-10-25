import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Hospital, Incident } from '../types/index.ts';
import { PriorityBadge } from '../components/common/PriorityBadge.tsx';
import {
  Building2,
  Bed,
  HeartPulse,
  Flame,
  AlertTriangle,
  Send,
  Clock,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  X,
  Radio,
} from 'lucide-react';

interface HospitalsPageProps {
  onNavigate: (path: string) => void;
}

export const HospitalsPage: React.FC<HospitalsPageProps> = ({ onNavigate }) => {
  const {
    hospitals,
    incidents,
    ambulances,
    hospitalNotifications,
    simulateHospitalNotification,
  } = useApp();

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [targetIncidentId, setTargetIncidentId] = useState<string>(incidents[0]?.id || '');
  const [conditionSummary, setConditionSummary] = useState(
    'Driver trapped with multiple blunt trauma injuries. Conscious, GCS 13, labored breathing. IV fluids administered.'
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Trauma Surgery',
    'Emergency Radiology (CT)',
  ]);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital || !targetIncidentId) return;

    const incident = incidents.find((i) => i.id === targetIncidentId);

    simulateHospitalNotification(
      targetIncidentId,
      selectedHospital.id,
      conditionSummary,
      incident?.affectedCount || 1,
      selectedSpecialties
    );

    setNotificationModalOpen(false);
    setFeedbackNotice(`Simulated pre-arrival transmission dispatched to ${selectedHospital.name}!`);
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Hospital Trauma Readiness &amp; Incoming Case Coordination
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor receiving trauma capacities, ICU beds, and coordinate simulated pre-arrival clinical briefings.
          </p>
        </div>

        <div className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          Simulated clinical capacity · Academic demonstration
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hospitals.map((hosp) => {
          // Find incoming incidents assigned to this hospital
          const incoming = incidents.filter(
            (i) => i.targetHospitalId === hosp.id && i.status !== 'Resolved'
          );

          // Find notification history for this hospital
          const notificationsForHosp = hospitalNotifications.filter(
            (n) => n.hospitalId === hosp.id
          );

          return (
            <div
              key={hosp.id}
              className="p-5 rounded-2xl bg-[#111C30] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-white">{hosp.name}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{hosp.traumaLevel}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      hosp.readinessStatus === 'Normal'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {hosp.readinessStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">{hosp.location.address}</p>

                {/* Capacity Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">ER Trauma Bays</span>
                    <div className="font-mono font-bold text-slate-100 text-sm">
                      {hosp.emergencyBedsAvailable}{' '}
                      <span className="text-slate-400 text-xs font-normal">/ {hosp.emergencyBedsTotal} Open</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">ICU Availability</span>
                    <div className="font-mono font-bold text-slate-100 text-sm">
                      {hosp.icuBedsAvailable} Beds Free
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Burn Unit</span>
                    <span className={`text-[11px] font-semibold ${hosp.burnUnitAvailable ? 'text-[#18B6A4]' : 'text-slate-500'}`}>
                      {hosp.burnUnitAvailable ? 'Active & Ready' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Cardiac Cath Lab</span>
                    <span className={`text-[11px] font-semibold ${hosp.cathLabActive ? 'text-rose-400' : 'text-slate-500'}`}>
                      {hosp.cathLabActive ? '24/7 STEMI Ready' : 'Standby'}
                    </span>
                  </div>
                </div>

                {/* Clinical Specialties */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] text-slate-400 font-medium block">Specialty Centers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {hosp.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Incoming Cases */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>Incoming En Route Cases</span>
                    <span className="text-sky-400 font-mono text-[11px]">{incoming.length} active</span>
                  </div>

                  {incoming.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-2 text-center bg-slate-900/40 rounded-lg">
                      No inbound ambulance transports at this moment.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incoming.map((inc) => {
                        const unit = inc.assignedUnitId
                          ? ambulances.find((u) => u.id === inc.assignedUnitId)
                          : null;
                        return (
                          <div
                            key={inc.id}
                            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-bold text-white">{inc.id}</span>
                              <PriorityBadge priority={inc.priority} size="sm" />
                            </div>
                            <p className="text-[11px] text-slate-300 truncate">{inc.type}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                              <span>Unit: {unit?.callSign || 'Assigned'}</span>
                              <span className="text-emerald-400 font-bold">
                                ETA ~{inc.estimatedArrivalMins || 5} min
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedHospital(hosp);
                    setNotificationModalOpen(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simulate Pre-Alert</span>
                </button>

                <button
                  onClick={() => setSelectedHospital(hosp)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Dossier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Records Registry */}
      <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Simulated Hospital Pre-Arrival Notification Registry</span>
          <span className="text-xs font-mono text-slate-400">
            {hospitalNotifications.length} Records Transmitted
          </span>
        </h3>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {hospitalNotifications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No hospital notifications logged yet. Click "Simulate Pre-Alert" above.
            </div>
          ) : (
            hospitalNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{notif.hospitalName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono">Incident: {notif.incidentId}</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                      {notif.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {notif.patientConditionSummary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {notif.specialtiesRequested.map((sp, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 text-slate-400 text-[11px] font-mono">
                  <div>Unit: {notif.assignedUnitCallSign}</div>
                  <div className="text-emerald-400 font-bold">ETA: ~{notif.estimatedArrivalMins}m</div>
                  <div className="text-slate-500 text-[10px]">{notif.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Simulate Pre-Arrival Notification Modal */}
      {notificationModalOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Simulate Hospital Pre-Arrival Notification
                </h3>
              </div>
              <button
                onClick={() => setNotificationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Hospital</label>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-semibold">
                  {selectedHospital.name} ({selectedHospital.traumaLevel})
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Link to Incident</label>
                <select
                  value={targetIncidentId}
                  onChange={(e) => setTargetIncidentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#18B6A4]"
                >
                  {incidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} - {i.type} ({i.priority})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Pre-Arrival Clinical Briefing Summary
                </label>
                <textarea
                  rows={3}
                  value={conditionSummary}
                  onChange={(e) => setConditionSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#18B6A4]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Emergency Resources Requested on Standby
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Trauma Surgery Team',
                    'CT Angiography',
                    'Blood Bank Crossmatch (O-Neg)',
                    'Pediatric Intensivist',
                    'Burn Bay Dressing Protocol',
                    'Cardiac Catheterization Lab',
                  ].map((spec) => {
                    const checked = selectedSpecialties.includes(spec);
                    return (
                      <label
                        key={spec}
                        className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                          checked
                            ? 'bg-indigo-950/60 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSpecialties([...selectedSpecialties, spec]);
                            } else {
                              setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
                            }
                          }}
                          className="accent-indigo-500 rounded"
                        />
                        <span className="text-[11px]">{spec}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                This transmits a simulated digital alert into the RESQ-AI notification feed for demonstrational purposes.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNotificationModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
