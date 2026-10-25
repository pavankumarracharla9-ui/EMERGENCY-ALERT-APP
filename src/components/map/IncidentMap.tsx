import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, AmbulanceUnit, Hospital } from '../../types/index.ts';

// Custom SVG Icon generators for Leaflet
const createIncidentIcon = (priority: string, isSelected: boolean) => {
  const color = priority === 'Critical' ? '#E53945' : priority === 'High' ? '#D97706' : '#2563EB';
  const size = isSelected ? 34 : 26;

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          background: ${color};
          opacity: 0.25;
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: ${size - 6}px;
          height: ${size - 6}px;
          background: ${color};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
        ">
          !
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createAmbulanceIcon = (status: string, isSelected: boolean) => {
  const color = status === 'Available' ? '#18B6A4' : status === 'Assigned' || status === 'En Route' ? '#3B82F6' : '#64748B';
  const size = isSelected ? 34 : 26;

  return L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 17h4V5H2v12h3"/>
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
          <circle cx="7.5" cy="17.5" r="2.5"/>
          <circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createHospitalIcon = () => {
  const size = 28;
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #4F46E5;
        border: 2px solid #ffffff;
        border-radius: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 13px;
      ">
        +
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

interface IncidentMapProps {
  incidents: Incident[];
  ambulances: AmbulanceUnit[];
  hospitals: Hospital[];
  selectedIncidentId?: string | null;
  selectedAmbulanceId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
  onSelectAmbulance?: (ambulance: AmbulanceUnit) => void;
  onSelectHospital?: (hospital: Hospital) => void;
  center?: [number, number];
  zoom?: number;
  showIncidents?: boolean;
  showAmbulances?: boolean;
  showHospitals?: boolean;
  showRoute?: boolean;
  theme?: 'dark' | 'standard';
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  ambulances,
  hospitals,
  selectedIncidentId,
  selectedAmbulanceId,
  onSelectIncident,
  onSelectAmbulance,
  onSelectHospital,
  center = [37.7749, -122.4194],
  zoom = 13,
  showIncidents = true,
  showAmbulances = true,
  showHospitals = true,
  showRoute = true,
  theme = 'dark',
  className = 'h-full w-full',
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      const initialTileUrl =
        theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const initialTileLayer = L.tileLayer(initialTileUrl, {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = initialTileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;

      // Click callback
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  // Recenter if center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [center[0], center[1], zoom]);

  // Render Markers and Routes into LayerGroup
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const activeIncident = incidents.find((i) => i.id === selectedIncidentId);
    const assignedAmbulance = activeIncident?.assignedUnitId
      ? ambulances.find((a) => a.id === activeIncident.assignedUnitId)
      : selectedAmbulanceId
      ? ambulances.find((a) => a.id === selectedAmbulanceId)
      : null;

    const targetHospital = activeIncident?.targetHospitalId
      ? hospitals.find((h) => h.id === activeIncident.targetHospitalId)
      : hospitals[0];

    // 1. Draw Route Polylines
    if (showRoute && activeIncident && assignedAmbulance) {
      const start: [number, number] = [assignedAmbulance.location.lat, assignedAmbulance.location.lng];
      const end: [number, number] = [activeIncident.location.lat, activeIncident.location.lng];
      const mid1: [number, number] = [start[0], end[1]];
      const poly = L.polyline([start, mid1, end], {
        color: '#3B82F6',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.9,
      });
      poly.addTo(layerGroup);
    }

    if (showRoute && activeIncident && targetHospital && activeIncident.status !== 'Reported') {
      const incPos: [number, number] = [activeIncident.location.lat, activeIncident.location.lng];
      const hospPos: [number, number] = [targetHospital.location.lat, targetHospital.location.lng];
      const mid2: [number, number] = [hospPos[0], incPos[1]];
      const hospPoly = L.polyline([incPos, mid2, hospPos], {
        color: '#18B6A4',
        weight: 3,
        dashArray: '4, 6',
        opacity: 0.8,
      });
      hospPoly.addTo(layerGroup);
    }

    // 2. Incident Markers
    if (showIncidents) {
      incidents.forEach((inc) => {
        const isSelected = inc.id === selectedIncidentId;
        const icon = createIncidentIcon(inc.priority, isSelected);
        const marker = L.marker([inc.location.lat, inc.location.lng], { icon });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #172033; max-width: 240px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              <strong>${inc.id}</strong>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${
                inc.priority === 'Critical' ? '#fee2e2; color: #b91c1c;' : '#fef3c7; color: #b45309;'
              }">${inc.priority}</span>
            </div>
            <div style="font-weight: 600; margin-bottom: 4px;">${inc.type}</div>
            <p style="margin: 0 0 6px 0; color: #475569; font-size: 11px; line-height: 1.4;">${inc.description}</p>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${inc.location.address}</div>
            <div style="font-size: 11px; font-weight: 500; color: #0f172a;">Status: ${inc.status}</div>
          </div>
        `);

        marker.on('click', () => {
          onSelectIncident?.(inc);
        });

        marker.addTo(layerGroup);
      });
    }

    // 3. Ambulance Markers
    if (showAmbulances) {
      ambulances.forEach((amb) => {
        const isSelected = amb.id === selectedAmbulanceId;
        const icon = createAmbulanceIcon(amb.status, isSelected);
        const marker = L.marker([amb.location.lat, amb.location.lng], { icon });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #172033; max-width: 240px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              <strong>${amb.callSign}</strong>
              <span style="font-size: 10px; font-family: monospace; color: #64748b;">${amb.id}</span>
            </div>
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${amb.type}</div>
            <div style="display: flex; gap: 8px; font-size: 11px; margin-bottom: 6px;">
              <span style="color: ${amb.status === 'Available' ? '#16a34a' : '#2563eb'}; font-weight: 600;">Status: ${amb.status}</span>
              <span>Fuel: ${amb.fuelLevel}%</span>
            </div>
            <div style="font-size: 11px; color: #64748b;">Station: ${amb.location.address}</div>
          </div>
        `);

        marker.on('click', () => {
          onSelectAmbulance?.(amb);
        });

        marker.addTo(layerGroup);
      });
    }

    // 4. Hospital Markers
    if (showHospitals) {
      hospitals.forEach((hosp) => {
        const icon = createHospitalIcon();
        const marker = L.marker([hosp.location.lat, hosp.location.lng], { icon });

        marker.bindPopup(`
          <div style="padding: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #172033; max-width: 240px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${hosp.name}</div>
            <div style="font-size: 11px; font-weight: 600; color: #4f46e5; margin-bottom: 6px;">${hosp.traumaLevel}</div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">
              <div>ER Beds: <strong>${hosp.emergencyBedsAvailable} / ${hosp.emergencyBedsTotal} Open</strong></div>
              <div>ICU Beds: <strong>${hosp.icuBedsAvailable} Available</strong></div>
            </div>
            <div style="font-size: 11px; color: #64748b;">${hosp.location.address}</div>
          </div>
        `);

        marker.on('click', () => {
          onSelectHospital?.(hosp);
        });

        marker.addTo(layerGroup);
      });
    }
  }, [
    incidents,
    ambulances,
    hospitals,
    selectedIncidentId,
    selectedAmbulanceId,
    showIncidents,
    showAmbulances,
    showHospitals,
    showRoute,
  ]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full rounded-inherit" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E53945] inline-block"></span>
          <span>Incidents</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-[#18B6A4] inline-block"></span>
          <span>Fleet</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-[#4F46E5] inline-block"></span>
          <span>Hospitals</span>
        </div>
        {showRoute && (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
            <span>Simulated Route</span>
          </div>
        )}
      </div>
    </div>
  );
};
