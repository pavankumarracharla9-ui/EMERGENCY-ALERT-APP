import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Incident,
  AmbulanceUnit,
  Hospital,
  NotificationItem,
  HospitalNotificationRecord,
  UserRole,
  IncidentStatus,
  AIAssessment,
  EmergencyType,
  PriorityLevel,
} from '../types/index.ts';
import {
  INITIAL_INCIDENTS,
  INITIAL_AMBULANCES,
  INITIAL_HOSPITALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOSPITAL_NOTIFICATIONS,
} from '../data/initialData.ts';

interface AppContextType {
  incidents: Incident[];
  ambulances: AmbulanceUnit[];
  hospitals: Hospital[];
  notifications: NotificationItem[];
  hospitalNotifications: HospitalNotificationRecord[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
  selectedAmbulanceId: string | null;
  setSelectedAmbulanceId: (id: string | null) => void;
  selectedHospitalId: string | null;
  setSelectedHospitalId: (id: string | null) => void;
  aiConfigured: boolean;
  soundAlerts: boolean;
  setSoundAlerts: (enabled: boolean) => void;
  mapLayerStyle: 'dark' | 'standard';
  setMapLayerStyle: (style: 'dark' | 'standard') => void;

  // Actions
  addIncident: (data: {
    type: EmergencyType;
    priority?: PriorityLevel;
    description: string;
    affectedCount: number;
    location: { lat: number; lng: number; address: string; landmark?: string };
    reporterContact?: string;
    aiAssessment?: AIAssessment;
  }) => Incident;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => void;
  assignAmbulance: (incidentId: string, ambulanceId: string, targetHospitalId?: string) => void;
  unassignAmbulance: (incidentId: string) => void;
  simulateHospitalNotification: (
    incidentId: string,
    hospitalId: string,
    patientConditionSummary: string,
    patientCount: number,
    specialtiesRequested?: string[]
  ) => HospitalNotificationRecord;
  loadDemoScenario: () => void;
  resetDemoData: () => void;
  addRandomDemoIncident: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INCIDENTS: 'resq_ai_incidents_v2',
  AMBULANCES: 'resq_ai_ambulances_v2',
  HOSPITALS: 'resq_ai_hospitals_v2',
  NOTIFICATIONS: 'resq_ai_notifications_v2',
  HOSPITAL_NOTIFS: 'resq_ai_hospital_notifs_v2',
  ROLE: 'resq_ai_role_v2',
  SOUND: 'resq_ai_sound_v2',
  MAP_STYLE: 'resq_ai_map_style_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AMBULANCES);
      return saved ? JSON.parse(saved) : INITIAL_AMBULANCES;
    } catch {
      return INITIAL_AMBULANCES;
    }
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [hospitalNotifications, setHospitalNotifications] = useState<HospitalNotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITAL_NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITAL_NOTIFICATIONS;
    } catch {
      return INITIAL_HOSPITAL_NOTIFICATIONS;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'Dispatcher';
  });

  const [activeIncidentId, setActiveIncidentId] = useState<string | null>('INC-2026-081');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
  });
  const [mapLayerStyle, setMapLayerStyle] = useState<'dark' | 'standard'>('dark');

  // Check backend AI availability on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.aiConfigured) {
          setAiConfigured(true);
        }
      })
      .catch(() => {
        // Dev server or proxy offline; use rule-based fallback
        setAiConfigured(false);
      });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(ambulances));
  }, [ambulances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSPITAL_NOTIFS, JSON.stringify(hospitalNotifications));
  }, [hospitalNotifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundAlerts));
  }, [soundAlerts]);

  // Actions
  const addIncident = (data: {
    type: EmergencyType;
    priority?: PriorityLevel;
    description: string;
    affectedCount: number;
    location: { lat: number; lng: number; address: string; landmark?: string };
    reporterContact?: string;
    aiAssessment?: AIAssessment;
  }): Incident => {
    const nextSeq = 85 + incidents.length;
    const newId = `INC-2026-0${nextSeq}`;
    const priority = data.priority || data.aiAssessment?.priority || 'Moderate';

    const newIncident: Incident = {
      id: newId,
      type: data.type,
      priority,
      status: 'Reported',
      description: data.description,
      affectedCount: data.affectedCount || 1,
      location: data.location,
      reportedAt: 'Just now',
      reporterContact: data.reporterContact,
      aiAssessment: data.aiAssessment,
      events: [
        {
          id: `evt-${Date.now()}-1`,
          timestamp: 'Just now',
          type: 'Reported',
          description: `Emergency reported: ${data.type} with ${data.affectedCount || 1} person(s) affected.`,
          actor: currentRole,
        },
        ...(data.aiAssessment
          ? [
              {
                id: `evt-${Date.now()}-2`,
                timestamp: 'Just now',
                type: 'AI Assessed',
                description: `Triage evaluation completed: ${priority} priority (${data.aiAssessment.source}).`,
                actor: 'AI Assessment Engine',
              },
            ]
          : []),
      ],
      notes: [],
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setActiveIncidentId(newId);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Emergency Reported: ${data.type}`,
      message: `${data.description.slice(0, 80)}... Location: ${data.location.address}`,
      type: 'incident',
      severity: priority === 'Critical' ? 'critical' : priority === 'High' ? 'warning' : 'info',
      timestamp: 'Just now',
      read: false,
      relatedIncidentId: newId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newIncident;
  };

  const updateIncidentStatus = (incidentId: string, status: IncidentStatus, note?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const updatedEvents = [
          ...inc.events,
          {
            id: `evt-${Date.now()}`,
            timestamp: 'Just now',
            type: status,
            description: note || `Status transitioned to ${status}.`,
            actor: currentRole,
          },
        ];

        // If resolving, clear assigned unit and reduce arrival time
        return {
          ...inc,
          status,
          events: updatedEvents,
          notes: note ? [...(inc.notes || []), note] : inc.notes,
        };
      })
    );

    // Update assigned ambulance status synchronously
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident?.assignedUnitId) {
      setAmbulances((prev) =>
        prev.map((unit) => {
          if (unit.id !== incident.assignedUnitId) return unit;

          if (status === 'Resolved') {
            return {
              ...unit,
              status: 'Available',
              assignedIncidentId: undefined,
              lastUpdated: 'Just now',
            };
          }
          if (status === 'En Route') {
            return { ...unit, status: 'En Route', lastUpdated: 'Just now' };
          }
          if (status === 'Arrived') {
            return { ...unit, status: 'At Scene', lastUpdated: 'Just now' };
          }
          return unit;
        })
      );
    }

    // Add status notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Incident ${incidentId} Status Updated`,
      message: `Emergency marked as "${status}" by ${currentRole}.`,
      type: 'dispatch',
      severity: status === 'Resolved' ? 'success' : 'info',
      timestamp: 'Just now',
      read: false,
      relatedIncidentId: incidentId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const assignAmbulance = (incidentId: string, ambulanceId: string, targetHospitalId?: string) => {
    const unit = ambulances.find((u) => u.id === ambulanceId);
    const incident = incidents.find((i) => i.id === incidentId);

    if (!unit || !incident) return;

    // Estimate travel time based on distance (simplified realistic formula)
    const latDiff = Math.abs(unit.location.lat - incident.location.lat);
    const lngDiff = Math.abs(unit.location.lng - incident.location.lng);
    const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    const estMins = Math.max(2, Math.round(approxKm * 2.2));

    // Update incident
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'Unit Assigned',
          assignedUnitId: ambulanceId,
          targetHospitalId: targetHospitalId || inc.targetHospitalId || 'HOSP-01',
          estimatedArrivalMins: estMins,
          events: [
            ...inc.events,
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              type: 'Unit Assigned',
              description: `Unit ${unit.callSign} (${unit.type}) assigned. Estimated response: ${estMins} mins.`,
              actor: currentRole,
            },
          ],
        };
      })
    );

    // Update ambulance
    setAmbulances((prev) =>
      prev.map((u) => {
        if (u.id === ambulanceId) {
          return {
            ...u,
            status: 'Assigned',
            assignedIncidentId: incidentId,
            lastUpdated: 'Just now',
          };
        }
        // If it was assigned to this incident before, unassign it
        if (u.assignedIncidentId === incidentId && u.id !== ambulanceId) {
          return {
            ...u,
            status: 'Available',
            assignedIncidentId: undefined,
            lastUpdated: 'Just now',
          };
        }
        return u;
      })
    );

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Unit ${unit.callSign} Assigned`,
      message: `Dispatched to incident ${incidentId} (${incident.location.address}). Estimated ETA: ${estMins} mins.`,
      type: 'dispatch',
      severity: 'info',
      timestamp: 'Just now',
      read: false,
      relatedIncidentId: incidentId,
      relatedUnitId: ambulanceId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const unassignAmbulance = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident || !incident.assignedUnitId) return;

    const unitId = incident.assignedUnitId;
    const unit = ambulances.find((u) => u.id === unitId);

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'Under Review',
          assignedUnitId: undefined,
          estimatedArrivalMins: undefined,
          events: [
            ...inc.events,
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              type: 'Unit Unassigned',
              description: `Unit ${unit?.callSign || unitId} unassigned from incident. Returned to review queue.`,
              actor: currentRole,
            },
          ],
        };
      })
    );

    setAmbulances((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status: 'Available',
            assignedIncidentId: undefined,
            lastUpdated: 'Just now',
          };
        }
        return u;
      })
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Unit Unassigned`,
        message: `${unit?.callSign || 'Unit'} has been unassigned from incident ${incidentId}.`,
        type: 'dispatch',
        severity: 'info',
        timestamp: 'Just now',
        read: false,
        relatedIncidentId: incidentId,
      },
      ...prev,
    ]);
  };

  const simulateHospitalNotification = (
    incidentId: string,
    hospitalId: string,
    patientConditionSummary: string,
    patientCount: number,
    specialtiesRequested?: string[]
  ): HospitalNotificationRecord => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    const incident = incidents.find((i) => i.id === incidentId);
    const unit = incident?.assignedUnitId
      ? ambulances.find((u) => u.id === incident.assignedUnitId)
      : null;

    const record: HospitalNotificationRecord = {
      id: `HN-${Date.now()}`,
      incidentId,
      hospitalId,
      hospitalName: hospital?.name || 'Emergency Receiving Facility',
      timestamp: 'Just now',
      patientConditionSummary,
      patientCount,
      assignedUnitCallSign: unit?.callSign || 'Rapid Response Medic',
      estimatedArrivalMins: incident?.estimatedArrivalMins || 6,
      specialtiesRequested: specialtiesRequested || ['Trauma Bay', 'Emergency Physician Evaluation'],
      status: 'Sent',
    };

    setHospitalNotifications((prev) => [record, ...prev]);

    // Update incident target hospital and add event
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          targetHospitalId: hospitalId,
          events: [
            ...inc.events,
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              type: 'Hospital Notified',
              description: `Pre-arrival notification sent to ${hospital?.name || hospitalId}.`,
              actor: currentRole,
            },
          ],
        };
      })
    );

    // Notification item
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Hospital Pre-Arrival Alert Sent`,
        message: `Simulated clinical notification transmitted to ${hospital?.name || hospitalId} for incident ${incidentId}.`,
        type: 'hospital',
        severity: 'warning',
        timestamp: 'Just now',
        read: false,
        relatedIncidentId: incidentId,
      },
      ...prev,
    ]);

    return record;
  };

  const loadDemoScenario = () => {
    setIncidents(INITIAL_INCIDENTS);
    setAmbulances(INITIAL_AMBULANCES);
    setHospitals(INITIAL_HOSPITALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setHospitalNotifications(INITIAL_HOSPITAL_NOTIFICATIONS);
    setActiveIncidentId('INC-2026-081');
    setSelectedAmbulanceId('AMB-02');
    setSelectedHospitalId('HOSP-01');
    setCurrentRole('Dispatcher');

    // Add confirmation notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Demo Scenario Loaded',
        message: '12-step hackathon presentation workflow scenario successfully initialized.',
        type: 'system',
        severity: 'info',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.AMBULANCES);
    localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.HOSPITAL_NOTIFS);

    setIncidents(INITIAL_INCIDENTS);
    setAmbulances(INITIAL_AMBULANCES);
    setHospitals(INITIAL_HOSPITALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setHospitalNotifications(INITIAL_HOSPITAL_NOTIFICATIONS);
    setActiveIncidentId(INITIAL_INCIDENTS[0]?.id || null);
    setSelectedAmbulanceId(null);
    setSelectedHospitalId(null);
  };

  const addRandomDemoIncident = () => {
    const templates = [
      {
        type: 'Medical Emergency' as EmergencyType,
        priority: 'Critical' as PriorityLevel,
        description: 'Sudden collapse with suspected cardiac arrest in downtown transit plaza. Bystander CPR initiated.',
        affectedCount: 1,
        address: 'Civic Center Plaza & Grove St',
        lat: 37.7792,
        lng: -122.4178,
      },
      {
        type: 'Road Accident' as EmergencyType,
        priority: 'High' as PriorityLevel,
        description: 'Cyclist struck by delivery truck at high-traffic corner. Conscious with visible leg fracture.',
        affectedCount: 1,
        address: 'Valencia St & 16th St',
        lat: 37.7649,
        lng: -122.4219,
      },
      {
        type: 'Fire' as EmergencyType,
        priority: 'High' as PriorityLevel,
        description: 'Electrical transformer sparking on commercial warehouse rooftop. Visible flame containment needed.',
        affectedCount: 2,
        address: '880 Folsom St, SOMA District',
        lat: 37.7801,
        lng: -122.4031,
      },
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    addIncident({
      type: pick.type,
      priority: pick.priority,
      description: pick.description,
      affectedCount: pick.affectedCount,
      location: {
        lat: pick.lat + (Math.random() - 0.5) * 0.005,
        lng: pick.lng + (Math.random() - 0.5) * 0.005,
        address: pick.address,
        landmark: 'Simulated Demo Location',
      },
      reporterContact: '+1 (555) 019-4821',
      aiAssessment: {
        priority: pick.priority,
        confidence: 0.93,
        category: pick.type,
        summary: pick.description,
        extractedAffectedCount: pick.affectedCount,
        hazards: ['Simulated urban traffic hazard', 'Patient stability monitoring required'],
        recommendedEquipment: ['ALS Trauma Monitor', 'Splints and Stabilization Pack'],
        missingInformation: ['Exact building unit access code'],
        priorityRationale: 'Evaluated against automated triage dispatch criteria.',
        source: 'simulated-rules',
        isSimulated: true,
      },
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        incidents,
        ambulances,
        hospitals,
        notifications,
        hospitalNotifications,
        currentRole,
        setCurrentRole,
        activeIncidentId,
        setActiveIncidentId,
        selectedAmbulanceId,
        setSelectedAmbulanceId,
        selectedHospitalId,
        setSelectedHospitalId,
        aiConfigured,
        soundAlerts,
        setSoundAlerts,
        mapLayerStyle,
        setMapLayerStyle,
        addIncident,
        updateIncidentStatus,
        assignAmbulance,
        unassignAmbulance,
        simulateHospitalNotification,
        loadDemoScenario,
        resetDemoData,
        addRandomDemoIncident,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
