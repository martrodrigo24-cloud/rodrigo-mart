import {useEffect, useMemo, useState} from 'react';
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  Circle,
  InfoWindow,
  Map as GoogleMap,
  Polyline,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import {Camera, MapPin, Navigation, Radio, ShieldAlert, UserCheck} from 'lucide-react';
import type {CheckInReport, LatLngPoint, NearbyRescuer} from '../types';
import {SafeImage} from './SafeImage';

interface LiveWalkMapProps {
  apiKey: string;
  quotaExceeded: boolean;
  route: LatLngPoint[];
  currentStepIndex: number;
  checkIns: CheckInReport[];
  caregiverName: string;
  caregiverPhotoUrl: string;
  petName: string;
  emergencyActive: boolean;
  nearbyRescuers: NearbyRescuer[];
  followWalker: boolean;
}

interface CameraControllerProps {
  target: {lat: number; lng: number};
  emergencyActive: boolean;
  followWalker: boolean;
}

function CameraController({target, emergencyActive, followWalker}: CameraControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (emergencyActive) {
      map.panTo(target);
      map.setZoom(13);
      return;
    }
    if (followWalker) {
      map.panTo(target);
    }
  }, [map, target, emergencyActive, followWalker]);

  return null;
}

function WalkerMarkerWithInfo({
  position,
  landmark,
  caregiverName,
  caregiverPhotoUrl,
  petName,
  emergencyActive,
}: {
  position: {lat: number; lng: number};
  landmark: string;
  caregiverName: string;
  caregiverPhotoUrl: string;
  petName: string;
  emergencyActive: boolean;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={
          emergencyActive
            ? `Última ubicación GPS de ${petName}`
            : `${caregiverName} paseando a ${petName}`
        }
        zIndex={40}
      >
        <div className="relative flex flex-col items-center cursor-pointer">
          <div
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md whitespace-nowrap mb-1 border ${
              emergencyActive
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {emergencyActive ? `Última señal: ${petName}` : `${petName} · En vivo`}
          </div>
          <div
            className={`w-11 h-11 rounded-full overflow-hidden border-[3px] shadow-lg bg-white ${
              emergencyActive ? 'border-red-600 ring-4 ring-red-500/35' : 'border-[#0E6245] ring-4 ring-[#0E6245]/25'
            }`}
          >
            <img
              src={caregiverPhotoUrl}
              alt={caregiverName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={250} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 space-y-1 text-slate-900">
            <p className="text-xs font-bold">
              {emergencyActive
                ? `Punto de alerta: ${petName}`
                : `${caregiverName} con ${petName}`}
            </p>
            <p className="text-xs text-slate-600">{landmark}</p>
            <p className="text-[11px] font-mono text-slate-500 tabular-nums">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function CheckInMapMarker({
  report,
  index,
}: {
  report: CheckInReport;
  index: number;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={report.position}
        onClick={() => setOpen((prev) => !prev)}
        title={`Foto check-in #${index + 1} (${report.timeLabel})`}
        zIndex={25}
      >
        <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0E6245] text-[#0E6245] shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <Camera className="w-4 h-4" />
        </div>
      </AdvancedMarker>
      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={() => setOpen(false)}>
          <div className="space-y-2 p-0.5 text-slate-900">
            <SafeImage
              src={report.photoUrl}
              alt={report.locationLabel}
              className="w-full h-28 object-cover rounded-lg"
            />
            <div>
              <p className="text-xs font-bold tabular-nums">
                Check-in #{index + 1} · {report.timeLabel}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">{report.locationLabel}</p>
              <p className="text-xs text-slate-800 mt-1 leading-snug">{report.note}</p>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function RescuerMarker({rescuer}: {rescuer: NearbyRescuer}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={rescuer.position}
        onClick={() => setOpen((prev) => !prev)}
        title={`${rescuer.name} (${rescuer.distanceMeters} m)`}
        zIndex={30}
      >
        <div className="flex items-center gap-1 rounded-lg bg-white border border-red-300 px-2 py-1 shadow-sm text-[11px] font-semibold text-red-700 cursor-pointer whitespace-nowrap">
          <UserCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="tabular-nums">{rescuer.distanceMeters} m</span>
        </div>
      </AdvancedMarker>
      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={230} onCloseClick={() => setOpen(false)}>
          <div className="p-1 space-y-1 text-slate-900">
            <p className="text-xs font-bold">{rescuer.name}</p>
            <p className="text-[11px] text-slate-600">
              {rescuer.role} · a {rescuer.distanceMeters} m
            </p>
            <p className="text-xs font-medium text-red-700">{rescuer.status}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function FallbackTacticalLimaMap({
  route,
  currentStepIndex,
  checkIns,
  petName,
  emergencyActive,
  nearbyRescuers,
}: Omit<LiveWalkMapProps, 'apiKey' | 'quotaExceeded' | 'followWalker' | 'caregiverPhotoUrl'>) {
  const currentPoint = route[Math.min(currentStepIndex, route.length - 1)];

  // Project lat/lng onto local SVG canvas (Miraflores bounding box)
  const project = (lat: number, lng: number) => {
    const minLat = -12.138;
    const maxLat = -12.111;
    const minLng = -77.046;
    const maxLng = -77.022;
    const x = ((lng - minLng) / (maxLng - minLng)) * 680 + 40;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 380 + 30;
    return {x, y};
  };

  const fullPts = route.map((p) => {
    const {x, y} = project(p.lat, p.lng);
    return `${x},${y}`;
  });
  const traversedPts = fullPts.slice(0, currentStepIndex + 1);
  const currentSvg = project(currentPoint.lat, currentPoint.lng);

  return (
    <div className="relative h-[440px] lg:h-[520px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-[#EEF3F0]">
      <svg
        viewBox="0 0 760 440"
        className="w-full h-full"
        role="img"
        aria-label={`Mapa GPS táctico de Miraflores mostrando la ruta de ${petName}`}
      >
        {/* Pacific Ocean Coastline */}
        <path
          d="M 0,440 L 0,210 Q 150,275 260,340 T 520,440 Z"
          fill="#CFE4F2"
          opacity="0.7"
        />
        {/* Miraflores Coastal Parks */}
        <path
          d="M 70,150 Q 170,220 280,295 L 325,260 Q 210,185 110,115 Z"
          fill="#CBE5D3"
        />
        {/* Street Grid Lines */}
        <g stroke="#DCE4DF" strokeWidth="1.5">
          <line x1="160" y1="0" x2="480" y2="390" />
          <line x1="250" y1="0" x2="590" y2="370" />
          <line x1="360" y1="0" x2="700" y2="330" />
          <line x1="120" y1="190" x2="740" y2="40" />
          <line x1="210" y1="275" x2="755" y2="120" />
          <line x1="320" y1="360" x2="760" y2="220" />
        </g>

        {/* Labels */}
        <text x="52" y="388" fill="#467291" fontSize="12" fontWeight="600">
          Océano Pacífico · Costa Verde
        </text>
        <text x="415" y="138" fill="#5B6E64" fontSize="11" fontWeight="600">
          Parque Kennedy · Miraflores
        </text>
        <text x="150" y="218" fill="#3B6B51" fontSize="11" fontWeight="600">
          Malecón de Miraflores
        </text>

        {/* 3km Geofencing Circle in Emergency Mode */}
        {emergencyActive && (
          <g>
            <circle
              cx={currentSvg.x}
              cy={currentSvg.y}
              r="165"
              fill="#DC2626"
              fillOpacity="0.12"
              stroke="#DC2626"
              strokeWidth="2.5"
              strokeDasharray="8 6"
            />
            <text
              x={currentSvg.x}
              y={Math.max(24, currentSvg.y - 172)}
              textAnchor="middle"
              fill="#B91C1C"
              fontSize="12"
              fontWeight="700"
            >
              Radio de Alerta Comunitaria: 3.0 km
            </text>
          </g>
        )}

        {/* Planned Route */}
        <polyline
          points={fullPts.join(' ')}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />

        {/* Traversed Live GPS Route */}
        <polyline
          points={traversedPts.join(' ')}
          fill="none"
          stroke={emergencyActive ? '#DC2626' : '#0E6245'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Check-in markers */}
        {checkIns.map((chk, idx) => {
          const pt = project(chk.position.lat, chk.position.lng);
          return (
            <g key={chk.id} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle r="11" fill="#FFFFFF" stroke="#0E6245" strokeWidth="2.5" />
              <text
                y="4"
                textAnchor="middle"
                fill="#0E6245"
                fontSize="10"
                fontWeight="700"
              >
                {idx + 1}
              </text>
            </g>
          );
        })}

        {/* Nearby rescuers in emergency mode */}
        {emergencyActive &&
          nearbyRescuers.map((r) => {
            const pt = project(r.position.lat, r.position.lng);
            return (
              <g key={r.id} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle r="7" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                <text y="-11" textAnchor="middle" fill="#991B1B" fontSize="10" fontWeight="700">
                  {r.distanceMeters} m
                </text>
              </g>
            );
          })}

        {/* Current Live Position */}
        <g transform={`translate(${currentSvg.x}, ${currentSvg.y})`}>
          <circle
            r="18"
            fill={emergencyActive ? '#DC2626' : '#0E6245'}
            fillOpacity="0.22"
          />
          <circle
            r="9"
            fill={emergencyActive ? '#DC2626' : '#0E6245'}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </g>
      </svg>

      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl px-3.5 py-2 shadow-xs">
        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          {emergencyActive ? (
            <ShieldAlert className="w-4 h-4 text-red-600" />
          ) : (
            <Navigation className="w-4 h-4 text-[#0E6245]" />
          )}
          {currentPoint.landmark}
        </p>
        <p className="text-[11px] font-mono text-slate-500 tabular-nums mt-0.5">
          {currentPoint.lat.toFixed(5)}, {currentPoint.lng.toFixed(5)} · Miraflores, Lima
        </p>
      </div>
    </div>
  );
}

function GoogleMapCanvas({
  route,
  currentStepIndex,
  checkIns,
  caregiverName,
  caregiverPhotoUrl,
  petName,
  emergencyActive,
  nearbyRescuers,
  followWalker,
}: Omit<LiveWalkMapProps, 'apiKey' | 'quotaExceeded'>) {
  const status = useApiLoadingStatus();
  const currentPoint = route[Math.min(currentStepIndex, route.length - 1)];

  const traversedPath = useMemo(
    () => route.slice(0, currentStepIndex + 1).map((p) => ({lat: p.lat, lng: p.lng})),
    [route, currentStepIndex]
  );

  const plannedPath = useMemo(
    () => route.map((p) => ({lat: p.lat, lng: p.lng})),
    [route]
  );

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <FallbackTacticalLimaMap
        route={route}
        currentStepIndex={currentStepIndex}
        checkIns={checkIns}
        caregiverName={caregiverName}
        petName={petName}
        emergencyActive={emergencyActive}
        nearbyRescuers={nearbyRescuers}
      />
    );
  }

  return (
    <div className="relative h-[440px] lg:h-[520px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={{lat: currentPoint.lat, lng: currentPoint.lng}}
        defaultZoom={15}
        gestureHandling="greedy"
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={true}
        className="w-full h-full"
      >
        <CameraController
          target={{lat: currentPoint.lat, lng: currentPoint.lng}}
          emergencyActive={emergencyActive}
          followWalker={followWalker}
        />

        {/* Planned full walk route (subtle reference line) */}
        <Polyline
          path={plannedPath}
          strokeColor="#64748B"
          strokeOpacity={0.35}
          strokeWeight={3}
        />

        {/* Actual GPS traversed path */}
        <Polyline
          path={traversedPath}
          strokeColor={emergencyActive ? '#DC2626' : '#0E6245'}
          strokeOpacity={0.95}
          strokeWeight={5}
        />

        {/* Start Marker */}
        <AdvancedMarker position={{lat: route[0].lat, lng: route[0].lng}} title="Punto de inicio">
          <div className="flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2 py-0.5 shadow-xs text-[11px] font-semibold text-slate-700">
            <MapPin className="w-3 h-3 text-[#0E6245]" />
            Inicio
          </div>
        </AdvancedMarker>

        {/* Check-in Photo Markers */}
        {checkIns.map((report, idx) => (
          <CheckInMapMarker key={report.id} report={report} index={idx} />
        ))}

        {/* Emergency 3 km Geofencing Radius Circle & Nearby Community Rescuers */}
        {emergencyActive && (
          <>
            <Circle
              center={{lat: currentPoint.lat, lng: currentPoint.lng}}
              radius={3000}
              strokeColor="#DC2626"
              strokeOpacity={0.85}
              strokeWeight={2}
              fillColor="#DC2626"
              fillOpacity={0.12}
            />
            {nearbyRescuers.map((rescuer) => (
              <RescuerMarker key={rescuer.id} rescuer={rescuer} />
            ))}
          </>
        )}

        {/* Active Live Walker / Last Seen Pin */}
        <WalkerMarkerWithInfo
          position={{lat: currentPoint.lat, lng: currentPoint.lng}}
          landmark={currentPoint.landmark}
          caregiverName={caregiverName}
          caregiverPhotoUrl={caregiverPhotoUrl}
          petName={petName}
          emergencyActive={emergencyActive}
        />
      </GoogleMap>

      {/* Compact Top-Left Coordinate Overlay */}
      <div className="pointer-events-none absolute top-3 left-3 max-w-[calc(100%-5rem)] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl px-3.5 py-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          {emergencyActive ? (
            <>
              <Radio className="w-4 h-4 text-red-600 shrink-0" />
              <span className="truncate text-red-700">
                Geofencing 3 km activo · {currentPoint.landmark}
              </span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-[#0E6245] shrink-0" />
              <span className="truncate">{currentPoint.landmark}</span>
            </>
          )}
        </div>
        <p className="text-[11px] font-mono text-slate-500 tabular-nums mt-0.5">
          GPS: {currentPoint.lat.toFixed(5)}, {currentPoint.lng.toFixed(5)} · Miraflores, Lima
        </p>
      </div>
    </div>
  );
}

export function LiveWalkMap(props: LiveWalkMapProps) {
  const {apiKey, quotaExceeded, ...rest} = props;

  if (!apiKey || quotaExceeded) {
    return (
      <FallbackTacticalLimaMap
        route={rest.route}
        currentStepIndex={rest.currentStepIndex}
        checkIns={rest.checkIns}
        caregiverName={rest.caregiverName}
        petName={rest.petName}
        emergencyActive={rest.emergencyActive}
        nearbyRescuers={rest.nearbyRescuers}
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="es" region="PE" libraries={['marker']}>
      <GoogleMapCanvas {...rest} />
    </APIProvider>
  );
}
