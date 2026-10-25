import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Navbar } from '../components/layout/Navbar.tsx';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { IncidentMap } from '../components/map/IncidentMap.tsx';
import {
  Siren,
  ShieldAlert,
  Cpu,
  MapPin,
  Send,
  Activity,
  Mic,
  BarChart3,
  Building2,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { incidents, ambulances, hospitals } = useApp();

  const totalReports = incidents.length + 142; // demonstration count
  const unitsAvailable = ambulances.filter((a) => a.status === 'Available').length;
  const connectedHospitals = hospitals.length;
  const incidentsResolved = incidents.filter((i) => i.status === 'Resolved').length + 89;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col antialiased selection:bg-[#18B6A4]/20 selection:text-[#0B1220]">
      {/* Top Navigation */}
      <Navbar currentPath="/" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#0B1220] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(24,182,164,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#18B6A4]"></span>
              <span>University Hackathon Demonstration Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight text-balance">
              Faster Response. Smarter Coordination.{' '}
              <span className="text-[#18B6A4]">Safer Communities.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              An intelligent emergency coordination platform connecting emergency reports, response teams,
              ambulance dispatch, and hospital readiness through one unified system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/report-emergency')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-[#E53945] hover:bg-[#d02e3a] rounded-xl transition-all shadow-lg shadow-[#E53945]/25 flex items-center justify-center gap-2"
              >
                <Siren className="w-4 h-4" />
                <span>Report an Emergency</span>
              </button>

              <button
                onClick={() => onNavigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <span>Explore Live Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#18B6A4]" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Interactive demonstration platform. Emergency dispatch and response data may be simulated.
            </p>
          </div>

          {/* Interactive Command Center Visual Preview */}
          <div className="mt-8 rounded-2xl bg-[#111C30] border border-slate-700/80 shadow-2xl overflow-hidden">
            {/* Window bar */}
            <div className="px-4 py-3 bg-[#0B1220] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">RESQ-AI Command Center · Operational Feed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#18B6A4] animate-pulse"></span>
                <span>Active Triage Stream</span>
              </div>
            </div>

            {/* Content split */}
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Map Preview */}
              <div className="lg:col-span-2 h-80 sm:h-96 relative">
                <IncidentMap
                  incidents={incidents}
                  ambulances={ambulances}
                  hospitals={hospitals}
                  selectedIncidentId="INC-2026-081"
                  selectedAmbulanceId="AMB-02"
                  showRoute={true}
                  theme="dark"
                  className="h-full w-full"
                />
              </div>

              {/* Live telemetry teaser */}
              <div className="p-5 bg-[#0e1726] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Critical Incident Queue</span>
                    <span className="text-[10px] text-rose-400 font-mono">1 Active ALS</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white">INC-2026-081</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E53945]/20 text-[#E53945] border border-[#E53945]/30">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mb-1">Road Accident · Market &amp; 8th St</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      2 casualties, driver trapped with labored breathing. Medic 02 en route (ETA 4m).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-300">Target Hospital: Metro General</span>
                      <span className="text-[10px] text-[#18B6A4] font-medium">Bed Reserved</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Pre-arrival clinical briefing sent. Trauma Bay 1 on standby.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#18B6A4] hover:bg-[#159f8f] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Open Command Operations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Impact Strip (Seeded Demo Data) */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Demonstration Platform Metrics · Simulated Scenario
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] font-mono tabular-nums mb-1">
                {totalReports}
              </div>
              <div className="text-xs font-semibold text-slate-600">Emergency Reports Tracked</div>
              <div className="text-[10px] text-slate-600 mt-1">Simulated logs</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#18B6A4] font-mono tabular-nums mb-1">
                {unitsAvailable} / {ambulances.length}
              </div>
              <div className="text-xs font-semibold text-slate-600">Response Units Available</div>
              <div className="text-[10px] text-slate-600 mt-1">ALS &amp; BLS fleet</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] font-mono tabular-nums mb-1">
                {connectedHospitals}
              </div>
              <div className="text-xs font-semibold text-slate-600">Hospitals Connected</div>
              <div className="text-[10px] text-slate-600 mt-1">Simulated readiness</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] font-mono tabular-nums mb-1">
                {incidentsResolved}
              </div>
              <div className="text-xs font-semibold text-slate-600">Incidents Resolved</div>
              <div className="text-[10px] text-slate-600 mt-1">Demonstration benchmark</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#18B6A4] mb-2">
              Workflow Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] mb-4">
              How RESQ-AI Coordinates Every Second
            </h3>
            <p className="text-sm text-slate-600">
              A rapid 5-step loop connecting public callers, AI evaluation algorithms, fleet dispatch, and receiving trauma centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Report',
                desc: 'Submit incident report via accessible web SOS button, voice recording, or geolocation input.',
                icon: Siren,
              },
              {
                step: '02',
                title: 'Analyze',
                desc: 'AI triage engine evaluates urgency, categorizes incident type, and identifies safety hazards.',
                icon: Cpu,
              },
              {
                step: '03',
                title: 'Locate',
                desc: 'Captures verified browser coordinates or user-selected map coordinates with street reference.',
                icon: MapPin,
              },
              {
                step: '04',
                title: 'Coordinate',
                desc: 'Recommends optimal ambulance based on capability (ALS vs BLS), distance, and traffic factor.',
                icon: Activity,
              },
              {
                step: '05',
                title: 'Track',
                desc: 'Pre-notifies trauma hospitals with patient summary before arrival and monitors response status.',
                icon: Building2,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#18B6A4] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 mb-1">{s.step}</div>
                  <h4 className="text-base font-bold text-[#0B1220] mb-2">{s.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#18B6A4] mb-2">
              System Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] mb-4">
              Built for Modern Emergency Response
            </h3>
            <p className="text-sm text-slate-600">
              Designed with human-in-the-loop oversight to accelerate dispatcher decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI Emergency Classification',
                desc: 'Automated urgency scoring (Critical, High, Moderate, Low) with structured risk factor extraction.',
                icon: Sparkles,
              },
              {
                title: 'GPS-Based Incident Location',
                desc: 'One-click geolocation capture with manual street lookup and interactive map coordinate picker.',
                icon: MapPin,
              },
              {
                title: 'Smart Ambulance Assignment',
                desc: 'Multi-criteria scoring factoring vehicle equipment (ALS/BLS), travel time, and availability.',
                icon: Send,
              },
              {
                title: 'Travel-Time-Aware Routing',
                desc: 'Simulated urban route generation and dynamic ETA calculations between station and incident.',
                icon: Clock,
              },
              {
                title: 'Hospital Pre-Notification',
                desc: 'Transmits pre-arrival clinical summaries and patient condition briefings to receiving ERs.',
                icon: Building2,
              },
              {
                title: 'Live Incident Monitoring',
                desc: 'Real-time state tracking from Reported to Unit Assigned, En Route, Arrived, and Resolved.',
                icon: Activity,
              },
              {
                title: 'Voice-Based Reporting',
                desc: 'Direct speech recognition captures spoken emergencies and auto-extracts incident details.',
                icon: Mic,
              },
              {
                title: 'Analytics & Compliance',
                desc: 'Operational charts for response times, incident volume, fleet utilization, and CSV data export.',
                icon: BarChart3,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-5 rounded-2xl bg-[#F5F7FA] border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0B1220] text-[#18B6A4] flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0B1220] mb-2">{f.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-[#0B1220] text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Every Second Counts.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Experience the full end-to-end emergency reporting and dispatch demonstration platform designed for collegiate presentation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-8 py-3.5 bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 font-bold rounded-xl transition-colors shadow-lg text-sm flex items-center gap-2"
            >
              <span>Open Emergency Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/report-emergency')}
              className="px-8 py-3.5 bg-[#E53945] hover:bg-[#d02e3a] text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <Siren className="w-4 h-4" />
              <span>Simulate Emergency SOS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#070b14] border-t border-slate-800/80 text-slate-400 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            <BrandLogo size="sm" variant="dark" showTagline={true} />
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <button onClick={() => onNavigate('/dashboard')} className="hover:text-white">
                Dashboard
              </button>
              <button onClick={() => onNavigate('/report-emergency')} className="hover:text-white">
                Report Emergency
              </button>
              <button onClick={() => onNavigate('/dispatch')} className="hover:text-white">
                Dispatch Console
              </button>
              <button onClick={() => onNavigate('/analytics')} className="hover:text-white">
                Analytics
              </button>
              <button onClick={() => onNavigate('/about')} className="hover:text-white">
                About Architecture
              </button>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              RESQ-AI is an academic hackathon prototype. Not affiliated with official municipal emergency 911/112 services or certified clinical triage programs.
            </p>
            <p className="font-mono text-slate-600">v1.0.0 · Hackathon Demo Build</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
