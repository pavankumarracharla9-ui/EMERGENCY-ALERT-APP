import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { EmergencyType, PriorityLevel, AIAssessment, LocationCoordinates } from '../types/index.ts';
import { IncidentMap } from '../components/map/IncidentMap.tsx';
import { PriorityBadge } from '../components/common/PriorityBadge.tsx';
import {
  Siren,
  Mic,
  MicOff,
  MapPin,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  ShieldAlert,
  Info,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ReportEmergencyPageProps {
  onNavigate: (path: string) => void;
}

export const ReportEmergencyPage: React.FC<ReportEmergencyPageProps> = ({ onNavigate }) => {
  const { addIncident, incidents, ambulances, hospitals, setActiveIncidentId } = useApp();

  // Form states
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Road Accident');
  const [description, setDescription] = useState('');
  const [affectedCount, setAffectedCount] = useState<number>(2);
  const [reporterContact, setReporterContact] = useState('+1 (555) 234-9811');
  const [address, setAddress] = useState('Market St & 8th St, Downtown Hub');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7725,
    lng: -122.4158,
  });
  const [locationStatus, setLocationStatus] = useState<string>('Default Metro coordinates loaded');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<unknown>(null);

  // AI Assessment state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAssessment | null>(null);

  // Submission result state
  const [submittedIncidentId, setSubmittedIncidentId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Setup Web Speech API if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
          // Auto trigger AI evaluation on speech input
          triggerAiAssessment(transcript, emergencyType);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognitionInstance(recognition);
      } catch {
        setSpeechSupported(false);
      }
    }
  }, [emergencyType]);

  const toggleVoiceRecording = () => {
    if (!speechSupported || !recognitionInstance) return;
    if (isListening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionInstance as any).stop();
      setIsListening(false);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognitionInstance as any).start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice recognition start error:', err);
      }
    }
  };

  const useSampleSpokenText = (sample: string) => {
    setDescription(sample);
    triggerAiAssessment(sample, emergencyType);
  };

  // Browser Geolocation
  const requestCurrentLocation = () => {
    setLocationStatus('Locating device via GPS...');
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        setAddress(`GPS Lat: ${newCoords.lat.toFixed(4)}, Lng: ${newCoords.lng.toFixed(4)} (Verified Location)`);
        setLocationStatus('GPS Coordinates successfully acquired.');
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        setLocationStatus('Location access was denied or timed out. Default coordinates retained.');
      },
      { timeout: 8000 }
    );
  };

  // Trigger AI Classification via server-side endpoint
  const triggerAiAssessment = async (currentDesc?: string, currentType?: string) => {
    const textToAnalyze = currentDesc || description;
    const typeToAnalyze = currentType || emergencyType;

    if (!textToAnalyze.trim()) {
      setFormError('Please enter an incident description first to analyze.');
      return;
    }
    setFormError(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/classify-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: textToAnalyze,
          emergencyType: typeToAnalyze,
          affectedCount,
          locationText: address,
        }),
      });

      if (!res.ok) {
        throw new Error('AI classification endpoint returned non-200');
      }

      const data: AIAssessment = await res.json();
      setAiResult(data);
      if (data.extractedAffectedCount && data.extractedAffectedCount > 0) {
        setAffectedCount(data.extractedAffectedCount);
      }
    } catch (err) {
      console.warn('Server AI call failed, generating simulated assessment:', err);
      // Fallback
      setAiResult({
        priority: textToAnalyze.toLowerCase().includes('accident') || textToAnalyze.toLowerCase().includes('fire') ? 'Critical' : 'High',
        confidence: 0.92,
        category: typeToAnalyze,
        summary: textToAnalyze.slice(0, 120),
        extractedAffectedCount: affectedCount,
        hazards: ['Active urban roadway traffic', 'Airway protection check required'],
        recommendedEquipment: ['ALS Trauma Kit', 'Defibrillator Monitor'],
        missingInformation: ['Exact building floor or intersection', 'Patient conscious and breathing?'],
        priorityRationale: 'Simulated heuristic based on acute emergency keywords.',
        source: 'simulated-rules',
        isSimulated: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please provide a description of the incident.');
      return;
    }

    const loc: LocationCoordinates = {
      lat: coords.lat,
      lng: coords.lng,
      address,
      landmark: 'Reported Location',
    };

    const newInc = addIncident({
      type: emergencyType,
      priority: aiResult?.priority || (emergencyType === 'Road Accident' || emergencyType === 'Fire' ? 'Critical' : 'High'),
      description,
      affectedCount: Number(affectedCount) || 1,
      location: loc,
      reporterContact,
      aiAssessment: aiResult || undefined,
    });

    setSubmittedIncidentId(newInc.id);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Top Banner SOS Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111C30] to-[#16233d] border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E53945]/15 border border-[#E53945]/30 text-xs font-semibold text-[#E53945]">
              <Siren className="w-3.5 h-3.5" />
              <span>Emergency Reporting Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Report an Emergency Incident
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fast, structured emergency submission with automated AI triage evaluation and direct dispatcher coordination.
            </p>
          </div>

          {/* Rapid SOS Trigger Button */}
          <div className="shrink-0 text-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('emergency-desc-input');
                el?.focus();
              }}
              className="px-6 py-4 rounded-2xl bg-[#E53945] hover:bg-[#d02e3a] text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-[#E53945]/30 flex items-center justify-center gap-2 group active:scale-95"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
              <span>RAPID REPORT SOS</span>
            </button>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Demo Mode · Simulation Only
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Demonstration platform: Submitting this form creates a simulated incident in the university hackathon data store. It does NOT notify municipal 911, 112, or local fire/EMS departments.
          </span>
        </div>
      </div>

      {/* Main Grid: Form + AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reporting Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#111C30] border border-slate-800 p-5 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Incident Information</span>
            <span className="text-[11px] font-normal text-slate-400">Step 1 of 2</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emergency Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Emergency Type <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Road Accident',
                  'Medical Emergency',
                  'Fire',
                  'Security',
                  'Natural Disaster',
                  'Other',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setEmergencyType(type as EmergencyType);
                      if (description) triggerAiAssessment(description, type);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      emergencyType === type
                        ? 'bg-[#18B6A4]/15 border-[#18B6A4] text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Input Assistance Ribbon */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Mic className="w-3.5 h-3.5 text-[#18B6A4]" />
                  <span>Voice Emergency Reporting</span>
                </div>
                {speechSupported ? (
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Speak Incident</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500">Mic fallback mode</span>
                )}
              </div>

              {/* Sample Voice Prompts for Hackathon presenter */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Preset demo voice reports:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      useSampleSpokenText(
                        'Two-vehicle high-speed crash on Market Street near 8th. Two injured, driver trapped and bleeding heavily.'
                      )
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    Vehicle Collision (2 injured)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      useSampleSpokenText(
                        'Elderly person collapsed at community hall, slurred speech and left-sided paralysis. Suspected stroke.'
                      )
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    Stroke Protocol
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      useSampleSpokenText(
                        'Kitchen grease fire with thick black smoke spreading to apartments. Three people coughing from smoke inhalation.'
                      )
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    Structure Fire (3 coughing)
                  </button>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Incident Description <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => triggerAiAssessment()}
                  disabled={isAnalyzing || !description.trim()}
                  className="text-[11px] text-[#18B6A4] hover:text-[#2fe2cd] disabled:text-slate-600 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Analyze with AI</span>
                </button>
              </div>
              <textarea
                id="emergency-desc-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, visible injuries, hazards, hazards or entrapment..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#18B6A4]"
                required
              />
            </div>

            {/* Casualties & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  People Affected / Injured
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#18B6A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reporter Contact (Demo Optional)
                </label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#18B6A4]"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Incident Location <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  className="text-[11px] font-semibold text-[#18B6A4] hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Use Device GPS</span>
                </button>
              </div>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or intersection"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#18B6A4]"
                required
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">
                  Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
                <span>{locationStatus}</span>
              </div>
            </div>

            {/* Mini Map Picker */}
            <div className="rounded-xl overflow-hidden border border-slate-800 h-44 relative">
              <IncidentMap
                incidents={incidents}
                ambulances={ambulances}
                hospitals={hospitals}
                center={[coords.lat, coords.lng]}
                zoom={14}
                showRoute={false}
                theme="dark"
                onMapClick={(lat, lng) => {
                  setCoords({ lat, lng });
                  setAddress(`Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                  setLocationStatus('Location updated via map click.');
                }}
                className="h-full w-full"
              />
              <div className="absolute top-2 right-2 z-[1000] bg-slate-900/90 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700 pointer-events-none">
                Click map to reposition
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#E53945] hover:bg-[#d02e3a] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#E53945]/20 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>Submit Emergency Report</span>
              </button>
            </div>
          </form>
        </div>

        {/* AI Triage & Assessment Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#111C30] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#18B6A4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  AI Triage &amp; Risk Assessment
                </h2>
              </div>
              {aiResult && (
                <span className="text-[10px] font-mono text-slate-400">
                  {aiResult.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Simulated Engine'}
                </span>
              )}
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-7 h-7 text-[#18B6A4] animate-spin" />
                <p className="text-xs text-slate-300 font-medium">
                  Evaluating triage criteria, trauma risks, and priority level...
                </p>
                <p className="text-[11px] text-slate-500">
                  Invoking server-side AI evaluation model
                </p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4 text-xs">
                {/* Priority recommendation */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      Suggested Priority
                    </span>
                    <PriorityBadge priority={aiResult.priority} size="md" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Confidence</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(aiResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Triage Rationale */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Priority Rationale
                  </h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                    {aiResult.priorityRationale}
                  </p>
                </div>

                {/* Hazards Detected */}
                {aiResult.hazards && aiResult.hazards.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Identified Hazards</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.hazards.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Equipment */}
                {aiResult.recommendedEquipment && aiResult.recommendedEquipment.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                      Recommended Unit Equipment
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.recommendedEquipment.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-[#18B6A4]/10 text-[#18B6A4] border border-[#18B6A4]/25"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Info for Dispatcher */}
                {aiResult.missingInformation && aiResult.missingInformation.length > 0 && (
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/25">
                    <h4 className="text-[11px] font-bold text-sky-400 mb-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Dispatcher Follow-Up Questions</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {aiResult.missingInformation.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  Enter an incident description or use speech input to generate automated priority classification.
                </p>
                <button
                  type="button"
                  onClick={() => triggerAiAssessment()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Run Assessment Now
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              AI priority is an operational recommendation for human dispatcher verification. Not an authoritative medical diagnosis.
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Modal */}
      {submittedIncidentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111C30] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Emergency Report Registered</h3>
              <p className="text-xs text-slate-400">
                Incident has been logged into the live command dispatch store.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Incident ID</span>
                <span className="font-mono font-bold text-white">{submittedIncidentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Emergency Type</span>
                <span className="font-semibold text-slate-200">{emergencyType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Priority Level</span>
                <PriorityBadge priority={aiResult?.priority || 'Moderate'} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-300 truncate max-w-[220px]">{address}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              Notice: This simulated incident is active on your local Operations Center. No municipal emergency personnel were dispatched.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveIncidentId(submittedIncidentId);
                  onNavigate('/incidents');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                View in Incidents List
              </button>
              <button
                onClick={() => {
                  setActiveIncidentId(submittedIncidentId);
                  onNavigate('/dispatch');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#18B6A4] hover:bg-[#159a8b] text-xs font-bold text-slate-950 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Dispatch Ambulance Unit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
