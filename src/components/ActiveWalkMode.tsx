import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AlertTriangle,
  Battery,
  Bluetooth,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
  FileCheck2,
  FileImage,
  Link2,
  MapPin,
  MessageCircle,
  Pause,
  Play,
  QrCode,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Upload,
  UserCheck,
} from 'lucide-react';
import {
  GENERATED_IMAGES,
  INITIAL_CHECKINS,
  INITIAL_TRACKERS,
  MIRAFLORES_GPS_ROUTE,
  NEARBY_COMMUNITY_RESCUERS,
} from '../data/peruData';
import type {
  ActiveWalkSession,
  AppView,
  CheckInReport,
  CollarTrackerState,
  TrackerType,
} from '../types';
import {LiveWalkMap} from './LiveWalkMap';
import {LostPetPosterModal} from './LostPetPosterModal';
import {SafeImage} from './SafeImage';

interface ActiveWalkModeProps {
  session: ActiveWalkSession;
  mapsApiKey: string;
  quotaExceeded: boolean;
  initialTrackerType?: TrackerType;
  onOpenWhatsappCaregiver: () => void;
  onNavigate: (view: AppView) => void;
}

export function ActiveWalkMode({
  session,
  mapsApiKey,
  quotaExceeded,
  initialTrackerType,
  onOpenWhatsappCaregiver,
  onNavigate,
}: ActiveWalkModeProps) {
  const [stepIndex, setStepIndex] = useState(4); // Starts mid-walk near Parque del Amor
  const [isPlaying, setIsPlaying] = useState(true);
  const [followWalker, setFollowWalker] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(24 * 60 + 18);
  const [nextCheckInSeconds, setNextCheckInSeconds] = useState(5 * 60 + 42);
  const [checkIns, setCheckIns] = useState<CheckInReport[]>(INITIAL_CHECKINS);

  // Check-in composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState(
    'Hidratación completa a la sombra, caminando tranquilo con doble mosquetón.'
  );
  const [checkInMood, setCheckInMood] = useState('Tranquilo y feliz');
  const [checkInHydrated, setCheckInHydrated] = useState(true);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Collar trackers state
  const [trackers, setTrackers] = useState<CollarTrackerState[]>(() =>
    INITIAL_TRACKERS.map((t) =>
      initialTrackerType && t.id === initialTrackerType
        ? {...t, linked: true, lastPingLabel: 'Sincronizado con el servicio activo'}
        : t
    )
  );
  const [pairingInputId, setPairingInputId] = useState<TrackerType | null>(null);
  const [pairingCodeValue, setPairingCodeValue] = useState('');

  // Emergency Protocol State
  const [confirmEmergencyOpen, setConfirmEmergencyOpen] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyTimestamp, setEmergencyTimestamp] = useState<string>('');
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  const currentPoint = MIRAFLORES_GPS_ROUTE[Math.min(stepIndex, MIRAFLORES_GPS_ROUTE.length - 1)];

  // Live walk clock & GPS step progression
  useEffect(() => {
    if (!isPlaying || emergencyActive) return;

    const clockInterval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setNextCheckInSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const gpsInterval = window.setInterval(() => {
      setStepIndex((idx) => (idx < MIRAFLORES_GPS_ROUTE.length - 1 ? idx + 1 : 0));
    }, 3200);

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(gpsInterval);
    };
  }, [isPlaying, emergencyActive]);

  const distanceKm = useMemo(() => {
    return (0.28 * (stepIndex + 1)).toFixed(2);
  }, [stepIndex]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newReport: CheckInReport = {
      id: `chk-${Date.now()}`,
      timeLabel,
      note: checkInNote.trim() || 'Reporte fotográfico de control enviado sin novedad.',
      photoUrl:
        uploadedPreview ||
        (checkIns.length % 2 === 0 ? GENERATED_IMAGES.rockyWalking : GENERATED_IMAGES.rockyCheckin),
      locationLabel: currentPoint.landmark,
      position: {lat: currentPoint.lat, lng: currentPoint.lng},
      mood: checkInMood,
      hydrationDone: checkInHydrated,
    };

    setCheckIns((prev) => [newReport, ...prev]);
    setNextCheckInSeconds(30 * 60);
    setUploadedPreview(null);
    setComposerOpen(false);
  };

  const handleTriggerEmergency = () => {
    const now = new Date();
    const stamp = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setEmergencyActive(true);
    setIsPlaying(false);
    setConfirmEmergencyOpen(false);
    setEmergencyTimestamp(stamp);
    setPosterModalOpen(true);
  };

  const handleResolveEmergency = () => {
    setEmergencyActive(false);
    setConfirmEmergencyOpen(false);
    setPosterModalOpen(false);
    setIsPlaying(true);
  };

  const handleToggleTracker = (trackerId: TrackerType) => {
    const target = trackers.find((t) => t.id === trackerId);
    if (!target) return;
    if (target.linked) {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === trackerId
            ? {
                ...t,
                linked: false,
                lastPingLabel: 'Desvinculado temporalmente',
              }
            : t
        )
      );
      setPairingInputId(null);
    } else {
      setPairingInputId(trackerId);
      setPairingCodeValue(
        trackerId === 'smarttag' ? 'ST2-PE-774' : trackerId === 'airtag' ? 'AT-LIM-902' : 'PE-RCK-4829'
      );
    }
  };

  const handleConfirmPairing = (trackerId: TrackerType) => {
    setTrackers((prev) =>
      prev.map((t) =>
        t.id === trackerId
          ? {
              ...t,
              linked: true,
              code: pairingCodeValue.trim() || t.code,
              batteryPct: trackerId === 'qr' ? null : 92,
              lastPingLabel:
                trackerId === 'qr'
                  ? 'Activa en collar · Sin batería'
                  : 'Vinculado por Bluetooth · Señal óptima',
            }
          : t
      )
    );
    setPairingInputId(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16 pt-2">
      {/* Emergency Active Top Alert Strip */}
      {emergencyActive && (
        <section
          role="alert"
          className="rounded-2xl bg-red-600 text-white p-5 sm:p-6 shadow-md space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-7 h-7 shrink-0 mt-0.5" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  PROTOCOLO ACTIVO: ALERTA MASCOTA PERDIDA — {session.petName.toUpperCase()}
                </h1>
                <p className="text-sm text-red-100 mt-1 tabular-nums">
                  Activada a las {emergencyTimestamp} · Radio de geofencing 3.0 km desde{' '}
                  {currentPoint.landmark} ({currentPoint.lat.toFixed(5)},{' '}
                  {currentPoint.lng.toFixed(5)})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setPosterModalOpen(true)}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white text-red-700 hover:bg-red-50 text-sm font-bold px-4 py-2 transition-colors whitespace-nowrap"
              >
                <FileImage className="w-4 h-4 shrink-0" />
                Abrir Afiche “Se Busca”
              </button>
              <button
                type="button"
                onClick={handleResolveEmergency}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-4 py-2 transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Mascota encontrada a salvo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-red-500/70 text-xs sm:text-sm">
            <div className="bg-red-700/60 rounded-xl px-4 py-2.5">
              <p className="text-red-200 text-xs">Dueño notificado al instante</p>
              <p className="font-bold mt-0.5">
                {session.ownerName} · WhatsApp +51 y Push crítico
              </p>
            </div>
            <div className="bg-red-700/60 rounded-xl px-4 py-2.5 tabular-nums">
              <p className="text-red-200 text-xs">Red de Alerta Comunitaria (3 km)</p>
              <p className="font-bold mt-0.5">38 cuidadores y 142 vecinos alertados</p>
            </div>
            <div className="bg-red-700/60 rounded-xl px-4 py-2.5">
              <p className="text-red-200 text-xs">Afiche digital “Se Busca”</p>
              <p className="font-bold mt-0.5">Generado con foto, señas y código QR</p>
            </div>
          </div>
        </section>
      )}

      {/* Normal Mode Service Header + Primary Emergency Trigger */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <SafeImage
              src={session.petPhotoUrl}
              alt={session.petName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0E6245] tabular-nums">
                Modo Paseo Activo · Reserva {session.bookingId} · {session.district}, Lima
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 leading-tight mt-0.5">
                {session.petName} con {session.caregiver.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1 text-[#0A4D36] font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0E6245]" />
                  DNI RENIEC
                </span>
                <span className="inline-flex items-center gap-1 text-[#0A4D36] font-medium">
                  <FileCheck2 className="w-4 h-4 text-[#0E6245]" />
                  Antecedentes PNP
                </span>
                <span className="text-slate-500">· {session.serviceLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenWhatsappCaregiver}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold px-4 py-2.5 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-[#0E6245]" />
              WhatsApp cuidador
            </button>

            {!emergencyActive && (
              <button
                type="button"
                onClick={() => setConfirmEmergencyOpen(true)}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 shadow-sm transition-colors whitespace-nowrap"
              >
                <ShieldAlert className="w-5 h-5 shrink-0" />
                Alerta Mascota Perdida
              </button>
            )}
          </div>
        </div>

        {/* Inline 1-Step Confirmation Panel for Emergency Button */}
        {confirmEmergencyOpen && !emergencyActive && (
          <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                ¿Confirmar activación de “Alerta Mascota Perdida”?
              </p>
              <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                Al confirmar, fijaremos la última coordenada GPS ({currentPoint.landmark}),
                notificaremos al instante al dueño y a todos los cuidadores/usuarios en un radio de
                3 km, y generaremos automáticamente el afiche digital de “Se Busca” listo para
                WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmEmergencyOpen(false)}
                className="min-h-[44px] rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTriggerEmergency}
                className="min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2 transition-colors whitespace-nowrap"
              >
                Activar alerta 3 km ahora
              </button>
            </div>
          </div>
        )}

        {/* Live Telemetry Metrics Row (Clean Tabular Figures, No Pill Clutter) */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">Tiempo transcurrido</p>
            <p className="text-xl font-bold font-mono text-slate-950 tabular-nums mt-0.5">
              {formatTimer(elapsedSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Distancia recorrida</p>
            <p className="text-xl font-bold font-mono text-slate-950 tabular-nums mt-0.5">
              {distanceKm} km
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Próximo check-in obligatorio</p>
            <p className="text-xl font-bold font-mono text-[#0E6245] tabular-nums mt-0.5">
              {nextCheckInSeconds === 0 ? 'Solicitado' : formatTimer(nextCheckInSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Reportes enviados</p>
            <p className="text-xl font-bold font-mono text-slate-950 tabular-nums mt-0.5">
              {checkIns.length} fotos GPS
            </p>
          </div>
        </div>
      </section>

      {/* Main 12-Col Workspace: Map Left (8 cols) + Safety & Check-in Feed Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Google Map + Collar Trackers + Owner Instructions */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Map Container & Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  {emergencyActive
                    ? 'Mapa de búsqueda comunitaria (Geofencing 3 km)'
                    : 'Ruta GPS en tiempo real del cuidador'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Rastreo activo solo durante el servicio con consentimiento explícito y revocable.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!emergencyActive && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pausar ruta
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Reanudar ruta
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStepIndex((idx) => (idx < MIRAFLORES_GPS_ROUTE.length - 1 ? idx + 1 : 0))
                      }
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      Avanzar GPS
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepIndex(0)}
                      aria-label="Reiniciar recorrido simulado"
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setFollowWalker((f) => !f)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    followWalker
                      ? 'bg-[#0E6245] text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {followWalker ? 'Centrado automático' : 'Centrar cámara'}
                </button>
              </div>
            </div>

            <LiveWalkMap
              apiKey={mapsApiKey}
              quotaExceeded={quotaExceeded}
              route={MIRAFLORES_GPS_ROUTE}
              currentStepIndex={stepIndex}
              checkIns={checkIns}
              caregiverName={session.caregiver.name}
              caregiverPhotoUrl={session.caregiver.avatarUrl}
              petName={session.petName}
              emergencyActive={emergencyActive}
              nearbyRescuers={NEARBY_COMMUNITY_RESCUERS}
              followWalker={followWalker}
            />

            {/* Emergency Community Network Live Dispatch List (visible when emergency is active) */}
            {emergencyActive && (
              <div className="rounded-xl bg-red-50/70 border border-red-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-600" />
                    Red de Alerta Comunitaria respondiendo en radio de 3 km
                  </h3>
                  <span className="text-xs font-mono font-semibold text-red-700 tabular-nums">
                    {NEARBY_COMMUNITY_RESCUERS.length} respuestas confirmadas
                  </span>
                </div>
                <div className="divide-y divide-red-200/70">
                  {NEARBY_COMMUNITY_RESCUERS.map((r) => (
                    <div
                      key={r.id}
                      className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-slate-600">· {r.role}</span>
                      </div>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="font-medium text-red-800">{r.status}</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {r.distanceMeters} m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Linked Collar Devices (QR Tag / AirTag / SmartTag) */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Collares y etiquetas de rastreo vinculadas
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Combina el GPS del cuidador con AirTag, SmartTag o la placa QR de identificación.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('qr-tag')}
                className="text-xs font-semibold text-[#0E6245] hover:underline whitespace-nowrap"
              >
                Configurar placa QR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trackers.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                    t.linked ? 'border-[#0E6245]/35 bg-[#F4F8F6]/70' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                        {t.id === 'qr' ? (
                          <QrCode className="w-4 h-4 text-[#0E6245] shrink-0" />
                        ) : (
                          <Bluetooth className="w-4 h-4 text-[#0E6245] shrink-0" />
                        )}
                        {t.name}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 tabular-nums">
                      ID: {t.code}
                      {t.batteryPct !== null ? ` · ${t.batteryPct}%` : ''}
                    </p>
                    <p className="text-xs font-medium text-[#0A4D36] flex items-center gap-1.5">
                      {t.batteryPct !== null && <Battery className="w-3.5 h-3.5 shrink-0" />}
                      {t.lastPingLabel}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.detail}</p>
                  </div>

                  {pairingInputId === t.id ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={pairingCodeValue}
                        onChange={(e) => setPairingCodeValue(e.target.value)}
                        placeholder="Código o ID de collar"
                        aria-label={`Código de vinculación para ${t.name}`}
                        className="w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono text-slate-900 focus:border-[#0E6245] focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmPairing(t.id)}
                          className="flex-1 min-h-[36px] rounded-lg bg-[#0E6245] text-white text-xs font-semibold px-3 py-1 hover:bg-[#0A4D36] transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPairingInputId(null)}
                          className="min-h-[36px] rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium px-2.5 py-1 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleTracker(t.id)}
                      className={`min-h-[40px] w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-3 py-2 transition-colors ${
                        t.linked
                          ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {t.linked ? 'Desvincular' : 'Vincular dispositivo'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Mandatory Owner Recommendations Visible During Walk */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-950">
                Recomendaciones obligatorias de {session.ownerName} para {session.petName}
              </h2>
              <span className="text-xs text-slate-500">Lectura confirmada por el cuidador</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{session.recommendations}</p>
            <p className="text-xs text-slate-500 pt-1">
              Señas particulares registradas: {session.petColorMarks}
            </p>
          </section>
        </div>

        {/* Right Column: Check-in with Photo every 30 min */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-950">
                  Check-in fotográfico (c/30 min)
                </h2>
                <span className="text-xs font-mono font-medium text-[#0E6245] tabular-nums flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimer(nextCheckInSeconds)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Cada foto registra hora, ubicación GPS en el mapa y estado de hidratación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setComposerOpen((o) => !o)}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              <Camera className="w-4 h-4 shrink-0" />
              {composerOpen ? 'Ocultar formulario de check-in' : 'Enviar Check-in con foto ahora'}
            </button>

            {/* Interactive Check-In Composer */}
            {composerOpen && (
              <form
                onSubmit={handleSubmitCheckIn}
                className="rounded-xl bg-[#F4F8F6] border border-[#0E6245]/20 p-4 space-y-3.5"
              >
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-800">
                    Fotografía del momento (subir foto o usar captura de prueba)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 px-3 py-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadedPreview ? 'Cambiar foto cargada' : 'Subir foto del dispositivo'}
                    </button>
                  </div>
                  {uploadedPreview && (
                    <img
                      src={uploadedPreview}
                      alt="Vista previa del check-in"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 mt-2"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="checkin-mood" className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado de ánimo
                  </label>
                  <select
                    id="checkin-mood"
                    value={checkInMood}
                    onChange={(e) => setCheckInMood(e.target.value)}
                    className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-[#0E6245] focus:outline-none"
                  >
                    <option value="Tranquilo y feliz">Tranquilo y feliz</option>
                    <option value="Activo y curioso">Activo y curioso</option>
                    <option value="Descansando a la sombra">Descansando a la sombra</option>
                    <option value="Algo nervioso por ruido (controlado)">
                      Algo nervioso por ruido (controlado)
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="checkin-note" className="block text-xs font-semibold text-slate-700 mb-1">
                    Reporte para el dueño
                  </label>
                  <textarea
                    id="checkin-note"
                    rows={2}
                    value={checkInNote}
                    onChange={(e) => setCheckInNote(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0E6245] focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInHydrated}
                    onChange={(e) => setCheckInHydrated(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0E6245] focus:ring-[#0E6245]"
                  />
                  Confirmar pausa de hidratación con agua fresca
                </label>

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 transition-colors"
                >
                  Publicar reporte con pin GPS en el mapa
                </button>
              </form>
            )}

            {/* Check-in Feed Timeline */}
            <div className="space-y-4 divide-y divide-slate-100">
              {checkIns.map((report, idx) => (
                <article key={report.id} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 tabular-nums">
                      Reporte #{checkIns.length - idx} · {report.timeLabel}
                    </span>
                    <span className="text-slate-500 truncate max-w-[180px]">
                      {report.mood}
                    </span>
                  </div>

                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <SafeImage
                      src={report.photoUrl}
                      alt={`Reporte fotográfico de ${session.petName} en ${report.locationLabel}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{report.note}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0E6245]" />
                      {report.locationLabel}
                    </span>
                    {report.hydrationDone && (
                      <span className="inline-flex items-center gap-1 text-[#0E6245] font-medium">
                        <Droplets className="w-3.5 h-3.5" />
                        Hidratado
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Automatic Lost Pet Digital Poster Modal */}
      <LostPetPosterModal
        isOpen={posterModalOpen}
        session={session}
        lastLocation={{
          lat: currentPoint.lat,
          lng: currentPoint.lng,
          landmark: currentPoint.landmark,
        }}
        notifiedCount={{caregivers: 38, neighbors: 142}}
        onClose={() => setPosterModalOpen(false)}
      />
    </div>
  );
}
