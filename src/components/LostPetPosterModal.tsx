import {useEffect, useState} from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import {buildWhatsappUrl} from '../data/peruData';
import type {ActiveWalkSession} from '../types';
import {SafeImage} from './SafeImage';

interface LostPetPosterModalProps {
  isOpen: boolean;
  session: ActiveWalkSession;
  lastLocation: {lat: number; lng: number; landmark: string};
  notifiedCount: {caregivers: number; neighbors: number};
  onClose: () => void;
}

export function LostPetPosterModal({
  isOpen,
  session,
  lastLocation,
  notifiedCount,
  onClose,
}: LostPetPosterModalProps) {
  const [rewardText, setRewardText] = useState('RECOMPENSA INMEDIATA POR INFORMACIÓN O ENTREGA');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const mapsLink = `https://maps.google.com/?q=${lastLocation.lat.toFixed(5)},${lastLocation.lng.toFixed(5)}`;
  const formattedPhone = session.ownerWhatsapp.startsWith('51')
    ? `+51 ${session.ownerWhatsapp.slice(2, 5)} ${session.ownerWhatsapp.slice(5, 8)} ${session.ownerWhatsapp.slice(8)}`
    : `+51 ${session.ownerWhatsapp}`;

  const emergencyShareText = [
    `🚨 ALERTA MASCOTA PERDIDA — ${session.petName.toUpperCase()} (${session.district}, Lima)`,
    `Características: ${session.petBreed}. ${session.petColorMarks}.`,
    `Última ubicación GPS exacta: ${lastLocation.landmark} (${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)})`,
    `Ver en mapa: ${mapsLink}`,
    `Cómo acercarse: ${session.recommendations}`,
    `Contacto inmediato (WhatsApp/Llamada): ${formattedPhone} (${session.ownerName})`,
    rewardText ? `Nota: ${rewardText}` : '',
    `Enviado desde Red de Alerta 3 km PataSegura Perú.`,
  ]
    .filter(Boolean)
    .join('\n');

  const qrWhatsappUrl = buildWhatsappUrl(
    session.ownerWhatsapp,
    `Hola ${session.ownerName}, acabo de ver o encontrar a ${session.petName} cerca de ${lastLocation.landmark}. Mi ubicación actual es:`
  );

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(qrWhatsappUrl, {
      width: 200,
      margin: 1,
      color: {dark: '#0F172A', light: '#FFFFFF'},
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [isOpen, qrWhatsappUrl]);

  if (!isOpen) return null;

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(emergencyShareText);
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 2400);
    } catch {
      setCopiedText(false);
    }
  };

  const handleDownloadPosterPng = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White poster background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top red alert header
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(0, 0, canvas.width, 190);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 84px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SE BUSCA', 540, 108);
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(
        `ALERTA MASCOTA PERDIDA · ${session.district.toUpperCase()}, PERÚ`,
        540,
        158
      );

      // Load pet image
      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      try {
        const petImg = await loadImage(session.petPhotoUrl);
        // Center-crop photo into 960 x 520 area
        const targetX = 60;
        const targetY = 225;
        const targetW = 960;
        const targetH = 520;
        const scale = Math.max(targetW / petImg.width, targetH / petImg.height);
        const sw = targetW / scale;
        const sh = targetH / scale;
        const sx = (petImg.width - sw) / 2;
        const sy = (petImg.height - sh) / 2;
        ctx.drawImage(petImg, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
      } catch {
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(60, 225, 960, 520);
      }

      // Pet Name & Details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(session.petName.toUpperCase(), 60, 825);

      ctx.fillStyle = '#334155';
      ctx.font = '600 28px sans-serif';
      ctx.fillText(session.petBreed, 60, 868);

      // Wrap helper
      const drawWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number,
        maxLines: number
      ) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let linesDrawn = 0;
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
            linesDrawn += 1;
            if (linesDrawn >= maxLines) return currentY;
          } else {
            line = test;
          }
        }
        if (line && linesDrawn < maxLines) {
          ctx.fillText(line, x, currentY);
          currentY += lineHeight;
        }
        return currentY;
      };

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('SEÑAS PARTICULARES:', 60, 924);
      ctx.font = '400 24px sans-serif';
      ctx.fillStyle = '#334155';
      drawWrappedText(session.petColorMarks, 60, 958, 720, 32, 2);

      ctx.fillStyle = '#B91C1C';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('ÚLTIMA UBICACIÓN GPS:', 60, 1038);
      ctx.fillStyle = '#0F172A';
      ctx.font = '600 24px sans-serif';
      drawWrappedText(
        `${lastLocation.landmark} (${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)})`,
        60,
        1072,
        720,
        32,
        2
      );

      // QR code on right side
      if (qrDataUrl) {
        try {
          const qrImg = await loadImage(qrDataUrl);
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 3;
          ctx.strokeRect(816, 865, 204, 204);
          ctx.drawImage(qrImg, 824, 873, 188, 188);
          ctx.textAlign = 'center';
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('ESCANEA PARA', 918, 1098);
          ctx.fillText('WHATSAPP GPS', 918, 1120);
        } catch {
          // skip QR if unavailable
        }
      }

      // Bottom contact banner
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 1160, canvas.width, 190);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FCA5A5';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(rewardText.toUpperCase() || 'CONTACTO INMEDIATO WHATSAPP / LLAMADA', 540, 1210);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 58px sans-serif';
      ctx.fillText(formattedPhone, 540, 1280);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(`Dueño: ${session.ownerName} · Red Comunitaria PataSegura Perú`, 540, 1322);

      const link = document.createElement('a');
      link.download = `SE-BUSCA-${session.petName.replace(/\s+/g, '-')}-PataSegura.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-red-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h2 id="poster-modal-title" className="text-lg font-bold leading-tight">
                Afiche digital “Se Busca” generado automáticamente
              </h2>
              <p className="text-xs text-red-100 mt-0.5 tabular-nums">
                Alerta enviada a {notifiedCount.caregivers} cuidadores verificados y{' '}
                {notifiedCount.neighbors} vecinos en un radio de 3 km
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar afiche de emergencia"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-xl text-white/90 hover:bg-red-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split: Poster Preview + Sharing Controls */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Poster Card Preview */}
          <div className="lg:col-span-7">
            <div className="border-2 border-red-600 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="bg-red-600 text-white text-center py-4 px-4">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight leading-none">
                  SE BUSCA
                </p>
                <p className="text-xs font-semibold text-red-100 mt-1">
                  ALERTA MASCOTA PERDIDA · {session.district}, PERÚ
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <SafeImage
                    src={session.petPhotoUrl}
                    alt={`Fotografía de ${session.petName}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-2xl font-bold text-slate-950 leading-none">
                      {session.petName}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700">{session.petBreed}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-800">Señas: </span>
                      {session.petColorMarks}
                    </p>
                  </div>

                  {qrDataUrl && (
                    <div className="shrink-0 text-center border border-slate-200 rounded-xl p-1.5 bg-white">
                      <img
                        src={qrDataUrl}
                        alt="Código QR para contactar al dueño por WhatsApp"
                        className="w-20 h-20"
                      />
                      <span className="block text-[10px] font-semibold text-slate-600 mt-0.5">
                        QR WhatsApp
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 space-y-1">
                  <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    Última ubicación GPS: {lastLocation.landmark}
                  </p>
                  <p className="text-[11px] font-mono text-red-700 tabular-nums">
                    Coordenadas: {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
                  </p>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-900">Cómo acercarse con cuidado: </span>
                  {session.recommendations}
                </div>
              </div>

              <div className="bg-slate-950 text-white px-5 py-4 text-center space-y-1">
                {rewardText.trim() && (
                  <p className="text-[11px] font-semibold text-red-300">{rewardText}</p>
                )}
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5 text-red-400" />
                  {formattedPhone}
                </p>
                <p className="text-xs text-slate-300">
                  Contactar a {session.ownerName} · Red Comunitaria PataSegura
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls & WhatsApp / Social Share */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">
                  Listo para difundir en WhatsApp y redes
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Los primeros 15 minutos son críticos. Descarga la imagen en alta resolución para
                  Instagram Stories/Facebook o envía el texto con el enlace GPS exacto a grupos
                  vecinales de {session.district}.
                </p>
              </div>

              <div>
                <label
                  htmlFor="poster-reward"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Texto de recompensa o aviso destacado (editable)
                </label>
                <input
                  id="poster-reward"
                  type="text"
                  value={rewardText}
                  onChange={(e) => setRewardText(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-800">
                  Texto listo para grupos de WhatsApp:
                </p>
                <pre className="text-[11px] font-sans text-slate-700 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                  {emergencyShareText}
                </pre>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadPosterPng}
                disabled={downloading}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 transition-colors"
              >
                <Download className="w-4 h-4 shrink-0" />
                {downloading ? 'Generando afiche PNG...' : 'Descargar Afiche “Se Busca” (PNG)'}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(emergencyShareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                Compartir por WhatsApp (+51)
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </a>

              <button
                type="button"
                onClick={handleCopyShareText}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-[#0E6245]" />
                    Alerta copiada con coordenadas GPS
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    Copiar mensaje de alerta + mapa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
