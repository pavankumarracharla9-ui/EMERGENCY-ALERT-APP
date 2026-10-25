import React from 'react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import {
  ShieldAlert,
  Cpu,
  Navigation,
  Building2,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-4xl mx-auto text-slate-100">
      {/* Brand Header */}
      <div className="text-center space-y-3 pb-8 border-b border-slate-800">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="dark" showTagline={false} />
        </div>
        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
          Every Second Matters. Every Emergency Deserves a Faster Response.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
          <span>University Hackathon Prototype</span>
          <span>·</span>
          <span>College of Engineering &amp; Computer Science</span>
        </div>
      </div>

      {/* Purpose & Mission */}
      <div className="p-6 rounded-2xl bg-[#111C30] border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-[#18B6A4]" />
          <span>Project Purpose &amp; Problem Statement</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In urban and regional emergency response, fragmented communication between 911 dispatchers,
          paramedic crews, and receiving trauma hospitals introduces critical delays. Traditional Computer-Aided
          Dispatch (CAD) systems often struggle with unstructured caller descriptions, lack real-time
          equipment capability matching, and fail to provide receiving hospitals with adequate clinical lead
          time.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>RESQ-AI</strong> bridges this gap by unifying rapid citizen emergency reporting (text, voice, GPS),
          automated AI-assisted triage prioritization, capability-aware ambulance assignment, and instant
          pre-arrival trauma center alerts.
        </p>
      </div>

      {/* 5-Stage System Architecture */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          System Architecture Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: 'Stage 1',
              title: 'Reporting Layer',
              desc: 'Public web SOS interface, browser Web Speech recognition, GPS coordinates capture, and interactive map picker.',
              icon: Users,
            },
            {
              step: 'Stage 2',
              title: 'AI Triage Engine',
              desc: 'Structured classification via Gemini API extracting priority, trauma risks, safety hazards, and missing info.',
              icon: Sparkles,
            },
            {
              step: 'Stage 3',
              title: 'Smart Dispatch',
              desc: 'Multi-criteria scoring matrix factoring distance, availability, ALS vs BLS equipment, and response ETA.',
              icon: Navigation,
            },
            {
              step: 'Stage 4',
              title: 'Fleet Telemetry',
              desc: 'Lifecycle state management (Reported, Assigned, En Route, Arrived, Resolved) with audit timestamps.',
              icon: Cpu,
            },
            {
              step: 'Stage 5',
              title: 'Hospital Readiness',
              desc: 'Instant pre-arrival trauma center alerts, bed availability tracking, and clinical specialty reservation.',
              icon: Building2,
            },
          ].map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-[#18B6A4] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 font-bold">{stage.step}</div>
                <h3 className="font-bold text-white text-xs">{stage.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ethical AI & Human-in-the-Loop Principles */}
      <div className="p-6 rounded-2xl bg-[#111C30] border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" />
          <span>Ethical AI, Safety &amp; Human-in-the-Loop Safeguards</span>
        </h2>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0 mt-0.5" />
            <span>
              <strong>Advisory Role Only:</strong> AI classifications are recommendations to assist human dispatchers and are never treated as automated medical diagnoses or unilateral dispatch triggers.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0 mt-0.5" />
            <span>
              <strong>Zero Auto-Downgrades:</strong> If details are vague or incomplete, the triage algorithm will not arbitrarily downgrade an emergency to Low, prompting instead for dispatcher follow-up.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0 mt-0.5" />
            <span>
              <strong>Audit Trail:</strong> Every status transition, note addition, and notification is recorded with actor roles and timestamps for post-incident review.
            </span>
          </li>
        </ul>
      </div>

      {/* Limitations & Academic Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1">
        <h3 className="font-bold text-slate-300">Academic &amp; Hackathon Disclaimer</h3>
        <p>
          RESQ-AI is created exclusively for demonstration purposes as part of a university hackathon showcase.
          It is not affiliated with, certified by, or integrated into actual municipal 911, 112, or civil defense infrastructure.
          Emergency vehicles, hospital capacities, and incident coordinates shown are simulated.
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs text-slate-400 hover:text-white"
        >
          Return to Public Landing Page
        </button>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-4 py-2 bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <span>Open Live Operations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
