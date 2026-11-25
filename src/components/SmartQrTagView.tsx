import {useEffect, useState} from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import {buildWhatsappUrl} from '../data/peruData';
import type {PetQrProfile} from '../types';
import {SafeImage} from './SafeImage';

interface SmartQrTagViewProps {
  profile: PetQrProfile;
  onUpdateProfile: (profile: PetQrProfile) => void;
}

export function SmartQrTagView({profile, onUpdateProfile}: SmartQrTagViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [finderCoords, setFinderCoords] = useState<{
    lat: number;
    lng: number;
    source: string;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const formattedPhone = profile.ownerWhatsapp.startsWith('51')
    ? `+51 ${profile.ownerWhatsapp.slice(2, 5)} ${profile.ownerWhatsapp.slice(5, 8)} ${profile.ownerWhatsapp.slice(8)}`
    : `+51 ${profile.ownerWhatsapp}`;

  const finderWhatsappMessage = finderCoords
    ? `Hola ${profile.ownerName}, acabo de escanear la placa QR (${profile.tagCode}) de ${profile.petName}. Lo tengo a salvo en esta ubicación GPS exacta: https://maps.google.com/?q=${finderCoords.lat.toFixed(5)},${finderCoords.lng.toFixed(5)} (${finderCoords.source}).`
    : `Hola ${profile.ownerName}, encontré a ${profile.petName} y escaneé su placa QR PataSegura (${profile.tagCode}). Por favor contáctame para coordinar la entrega.`;

  const qrEncodedUrl = buildWhatsappUrl(profile.ownerWhatsapp, finderWhatsappMessage);

  useEffect(() => {
    QRCode.toDataURL(qrEncodedUrl, {
      width: 280,
      margin: 2,
      color: {dark: '#0F172A', light: '#FFFFFF'},
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [qrEncodedUrl]);

  const handleLocateFinder = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFinderCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: 'GPS del celular de quien encontró la placa',
          });
          setLocating(false);
        },
        () => {
          // Graceful fallback to Parque Kennedy, Miraflores if browser denies geolocation
          setFinderCoords({
            lat: -12.1219,
            lng: -77.0305,
            source: 'Referencia Parque Kennedy, Miraflores (simulado)',
          });
          setLocating(false);
        },
        {timeout: 4500}
      );
    } else {
      setFinderCoords({
        lat: -12.1219,
        lng: -77.0305,
        source: 'Referencia Parque Kennedy, Miraflores (simulado)',
      });
      setLocating(false);
    }
  };

  const handleCopyFinderMsg = async () => {
    try {
      await navigator.clipboard.writeText(finderWhatsappMessage);
      setCopiedMsg(true);
      window.setTimeout(() => setCopiedMsg(false), 2200);
    } catch {
      setCopiedMsg(false);
    }
  };

  const handleDownloadQrPlate = () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Circular stainless tag guide
    ctx.beginPath();
    ctx.arc(360, 390, 315, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#0E6245';
    ctx.stroke();

    // Collar ring hole
    ctx.beginPath();
    ctx.arc(360, 118, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();

    ctx.fillStyle = '#0E6245';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCANÉAME SI ME PERDÍ', 360, 190);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 200, 215, 320, 320);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(profile.petName.toUpperCase(), 360, 588);

      ctx.fillStyle = '#475569';
      ctx.font = '600 22px monospace';
      ctx.fillText(`ID ${profile.tagCode} · PATASEGURA PERÚ`, 360, 628);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`WhatsApp Dueño: ${formattedPhone}`, 360, 795);

      ctx.fillStyle = '#64748B';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('Imprime o graba en láser (3.2 cm diámetro) para el collar.', 360, 835);

      const link = document.createElement('a');
      link.download = `Placa-QR-${profile.petName.replace(/\s+/g, '-')}-${profile.tagCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  return (
    <div className="space-y-8 pb-24 md:pb-16 pt-2">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold text-[#0E6245]">
          Rastreo inteligente sin batería ni suscripción mensual
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
          Placa con Código QR Inteligente para el collar
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Genera un código QR único listo para grabar o imprimir en la placa de tu mascota. Si se
          escapa, cualquier persona que la encuentre escanea el QR con su celular y envía su
          ubicación GPS directa a tu WhatsApp +51.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Profile Form & Physical Tag Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Circular Collar Tag Preview */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-56 h-56 rounded-full border-4 border-[#0E6245] bg-slate-50 flex flex-col items-center justify-center p-4 shadow-sm relative">
                <div
                  className="w-4 h-4 rounded-full bg-white border-2 border-slate-400 absolute top-2.5"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-bold text-[#0E6245] tracking-tight mt-2">
                  ESCANÉAME SI ME PERDÍ
                </span>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR de identificación para ${profile.petName}`}
                    className="w-28 h-28 my-1 rounded-md"
                  />
                ) : (
                  <div className="w-28 h-28 my-1 flex items-center justify-center bg-slate-100 rounded-md">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <span className="text-sm font-bold text-slate-950 leading-none">
                  {profile.petName}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums">
                  {profile.tagCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadQrPlate}
                className="mt-4 w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4 shrink-0" />
                Descargar Placa QR (PNG)
              </button>
            </div>

            {/* Tag Editable Metadata */}
            <div className="sm:col-span-7 space-y-3.5">
              <div>
                <label htmlFor="qr-pet-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la mascota
                </label>
                <input
                  id="qr-pet-name"
                  type="text"
                  value={profile.petName}
                  onChange={(e) => onUpdateProfile({...profile, petName: e.target.value})}
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="qr-owner" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del dueño
                  </label>
                  <input
                    id="qr-owner"
                    type="text"
                    value={profile.ownerName}
                    onChange={(e) => onUpdateProfile({...profile, ownerName: e.target.value})}
                    className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="qr-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp (+51)
                  </label>
                  <input
                    id="qr-phone"
                    type="tel"
                    value={profile.ownerWhatsapp}
                    onChange={(e) => onUpdateProfile({...profile, ownerWhatsapp: e.target.value})}
                    className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="qr-marks" className="block text-xs font-semibold text-slate-700 mb-1">
                  Señas particulares y distrito
                </label>
                <input
                  id="qr-marks"
                  type="text"
                  value={profile.distinctiveMarks}
                  onChange={(e) => onUpdateProfile({...profile, distinctiveMarks: e.target.value})}
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="qr-behavior" className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrucciones de acercamiento / alergias (visible al escanear)
                </label>
                <textarea
                  id="qr-behavior"
                  rows={3}
                  value={profile.medicalOrBehaviorNote}
                  onChange={(e) =>
                    onUpdateProfile({...profile, medicalOrBehaviorNote: e.target.value})
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 leading-relaxed focus:border-[#0E6245] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-950">
              Cómo funciona esta solución en Perú a bajo costo
            </h2>
            <ol className="space-y-2.5 text-sm text-slate-700 list-decimal pl-5 leading-relaxed">
              <li>
                Descarga la placa QR y grábala en acero inoxidable o acrílico resistente al agua
                (costo local aproximado S/ 15 a S/ 25 en Lima).
              </li>
              <li>
                No requiere baterías, chip SIM ni mensualidades; funciona con la cámara de cualquier
                celular Android o iPhone.
              </li>
              <li>
                Al escanearse, la persona ve las instrucciones de acercamiento y con un toque envía
                su coordenada GPS exacta a tu WhatsApp +51.
              </li>
            </ol>
          </div>
        </div>

        {/* Right: Interactive "Finder Phone" Simulation */}
        <aside className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-emerald-300">
                  Simulador · Pantalla al escanear el collar
                </p>
                <h2 className="text-base font-bold leading-snug mt-0.5">
                  ¿Encontraste a {profile.petName}?
                </h2>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <SafeImage
                  src={profile.photoUrl}
                  alt={profile.petName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-950">{profile.petName}</p>
                  <p className="text-xs text-slate-600">{profile.breed}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{profile.district}</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F4F8F6] border border-[#0E6245]/20 p-3.5 space-y-1">
                <p className="text-xs font-bold text-[#0A4D36]">
                  Importante al acercarte (alergias / miedos):
                </p>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {profile.medicalOrBehaviorNote}
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleLocateFinder}
                  disabled={locating}
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2.5 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#0E6245] shrink-0" />
                  {locating
                    ? 'Obteniendo ubicación GPS...'
                    : finderCoords
                      ? 'Actualizar mi ubicación GPS'
                      : '1. Capturar mi ubicación GPS actual'}
                </button>

                {finderCoords && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs space-y-0.5">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0E6245]" />
                      Ubicación lista para enviar al dueño
                    </p>
                    <p className="font-mono text-slate-600 tabular-nums">
                      {finderCoords.lat.toFixed(5)}, {finderCoords.lng.toFixed(5)}
                    </p>
                    <p className="text-[11px] text-slate-500">{finderCoords.source}</p>
                  </div>
                )}

                <a
                  href={qrEncodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-4 py-3 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  2. Enviar ubicación por WhatsApp ({formattedPhone})
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyFinderMsg}
                  className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 transition-colors"
                >
                  {copiedMsg ? (
                    <>
                      <Check className="w-4 h-4 text-[#0E6245]" />
                      Mensaje con enlace GPS copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      Copiar mensaje de aviso
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
