import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { UserRole } from '../types/index.ts';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Cpu,
  MapPin,
  Volume2,
  VolumeX,
  Layers,
  Database,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const {
    currentRole,
    setCurrentRole,
    loadDemoScenario,
    resetDemoData,
    aiConfigured,
    soundAlerts,
    setSoundAlerts,
    mapLayerStyle,
    setMapLayerStyle,
    incidents,
    ambulances,
    hospitals,
  } = useApp();

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const roles: { role: UserRole; desc: string }[] = [
    {
      role: 'Dispatcher',
      desc: 'Full dispatch rights: review incoming cases, evaluate AI triage, dispatch ambulances, and coordinate hospitals.',
    },
    {
      role: 'Administrator',
      desc: 'System oversight: audit logs, data exports, fleet configuration, and simulated backend management.',
    },
    {
      role: 'Hospital Viewer',
      desc: 'Receiving facility staff: view incoming trauma admissions, bed capacities, and pre-arrival alerts.',
    },
    {
      role: 'Public Reporter',
      desc: 'Citizen access: emergency reporting, voice SOS submission, and public safety status guides.',
    },
  ];

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setSavedFeedback(`Operator demo role updated to: ${role}`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#18B6A4]" />
          <span>System Settings &amp; Simulation Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage operational roles, demo scenarios, map layers, and AI pipeline integration status.
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Role Selection */}
      <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-[#18B6A4]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Demonstration User Role
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((item) => (
            <button
              key={item.role}
              onClick={() => handleRoleChange(item.role)}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentRole === item.role
                  ? 'bg-slate-900 border-[#18B6A4] shadow-sm ring-1 ring-[#18B6A4]/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-white">{item.role}</span>
                {currentRole === item.role && (
                  <span className="w-2 h-2 rounded-full bg-[#18B6A4]" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-[#18B6A4]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Demo Data &amp; Presentation Controls
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Use these one-click buttons to prepare and control your presentation during judging or showcase evaluations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-sm text-white mb-1">Load 12-Step Demo Scenario</h3>
              <p className="text-xs text-slate-400">
                Initializes the complete road accident, medical stroke, structure fire, ambulance fleet, and hospital readiness scenario.
              </p>
            </div>
            <button
              onClick={() => {
                loadDemoScenario();
                setSavedFeedback('Demo scenario loaded into active store.');
                setTimeout(() => setSavedFeedback(null), 3000);
              }}
              className="py-2.5 px-4 bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Full Scenario</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-sm text-white mb-1">Reset Local Demo Storage</h3>
              <p className="text-xs text-slate-400">
                Purges localStorage cache and restores pristine baseline seeded records.
              </p>
            </div>
            <button
              onClick={() => {
                resetDemoData();
                setSavedFeedback('All stored demo data cleared and reset.');
                setTimeout(() => setSavedFeedback(null), 3000);
              }}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration & System Status */}
      <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Cpu className="w-4 h-4 text-[#18B6A4]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            System &amp; Pipeline Status
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Express API Gateway</span>
            <span className="font-mono text-emerald-400 font-bold">Online (Port 3000)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">AI Triage Model</span>
            <span className="font-mono text-slate-200 font-semibold">
              {aiConfigured ? 'Gemini 3.8 Flash (Active)' : 'Simulated Rules (Demo Active)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Interactive Cartography</span>
            <span className="font-mono text-emerald-400 font-bold">Leaflet &amp; OpenStreetMap</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Telemetry Storage</span>
            <span className="font-mono text-emerald-400 font-bold">Browser LocalStorage + State</span>
          </div>
        </div>
      </div>
    </div>
  );
};
