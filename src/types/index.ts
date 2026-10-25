export type EmergencyType =
  | 'Road Accident'
  | 'Medical Emergency'
  | 'Fire'
  | 'Security'
  | 'Natural Disaster'
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Moderate' | 'Low';

export type IncidentStatus =
  | 'Reported'
  | 'Under Review'
  | 'Unit Assigned'
  | 'En Route'
  | 'Arrived'
  | 'Resolved';

export type AmbulanceStatus =
  | 'Available'
  | 'Assigned'
  | 'En Route'
  | 'At Scene'
  | 'Out of Service';

export type AmbulanceType =
  | 'Advanced Life Support (ALS)'
  | 'Basic Life Support (BLS)'
  | 'Critical Care Transport (CCT)'
  | 'Rapid Response Unit';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

export interface AIAssessment {
  priority: PriorityLevel;
  confidence: number;
  category: string;
  summary: string;
  extractedAffectedCount: number;
  extractedLocation?: string;
  hazards: string[];
  recommendedEquipment: string[];
  missingInformation: string[];
  priorityRationale: string;
  source: 'gemini-3.8-flash' | 'simulated-rules';
  isSimulated: boolean;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  actor: string;
}

export interface Incident {
  id: string;
  type: EmergencyType;
  priority: PriorityLevel;
  status: IncidentStatus;
  description: string;
  affectedCount: number;
  location: LocationCoordinates;
  reportedAt: string;
  reporterContact?: string;
  assignedUnitId?: string;
  targetHospitalId?: string;
  aiAssessment?: AIAssessment;
  events: IncidentEvent[];
  estimatedArrivalMins?: number;
  notes?: string[];
}

export interface AmbulanceUnit {
  id: string;
  callSign: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  location: LocationCoordinates;
  crew: string[];
  equipment: string[];
  fuelLevel: number;
  assignedIncidentId?: string;
  lastUpdated: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: LocationCoordinates;
  traumaLevel: string; // e.g. 'Level 1 Trauma Center'
  emergencyBedsTotal: number;
  emergencyBedsAvailable: number;
  icuBedsAvailable: number;
  burnUnitAvailable: boolean;
  cathLabActive: boolean;
  readinessStatus: 'Normal' | 'High Demand' | 'Diverting Non-Critical';
  phone: string;
  specialties: string[];
  lastStatusUpdate: string;
}

export interface HospitalNotificationRecord {
  id: string;
  incidentId: string;
  hospitalId: string;
  hospitalName: string;
  timestamp: string;
  patientConditionSummary: string;
  patientCount: number;
  assignedUnitCallSign: string;
  estimatedArrivalMins: number;
  specialtiesRequested: string[];
  status: 'Sent' | 'Acknowledged' | 'Bed Reserved';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'incident' | 'dispatch' | 'hospital' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  relatedIncidentId?: string;
  relatedUnitId?: string;
}

export type UserRole =
  | 'Administrator'
  | 'Dispatcher'
  | 'Hospital Viewer'
  | 'Public Reporter';

export interface UserProfile {
  name: string;
  role: UserRole;
  badgeId: string;
  department: string;
}
