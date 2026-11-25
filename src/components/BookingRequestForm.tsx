import {useMemo, useState} from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import {
  CAREGIVERS,
  PERU_DISTRICTS,
  RECOMMENDATION_TEMPLATES,
  SERVICE_CATALOG,
  formatSoles,
} from '../data/peruData';
import type {
  BookingSummary,
  Caregiver,
  PaymentMethod,
  ServiceId,
  TrackerType,
} from '../types';
import {SafeImage} from './SafeImage';

interface BookingRequestFormProps {
  initialCaregiver: Caregiver;
  onConfirmBooking: (booking: BookingSummary, caregiver: Caregiver) => void;
  onLaunchActiveWalk: () => void;
}

export function BookingRequestForm({
  initialCaregiver,
  onConfirmBooking,
  onLaunchActiveWalk,
}: BookingRequestFormProps) {
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>(initialCaregiver.id);
  const [selectedServiceIds, setSelectedServiceIds] = useState<ServiceId[]>(['paseo-gps']);
  const [petName, setPetName] = useState('Rocky');
  const [petBreed, setPetBreed] = useState('Mestizo mediano');
  const [petAge, setPetAge] = useState('3 años');
  const [petWeightKg, setPetWeightKg] = useState('14');
  const [petColorMarks, setPetColorMarks] = useState(
    'Pelaje caramelo y blanco, arnés verde bosque y placa QR plateada'
  );
  const [ownerName, setOwnerName] = useState('Lucía Fernández');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('991234567');
  const [district, setDistrict] = useState(initialCaregiver.district);
  const [pickupAddress, setPickupAddress] = useState('Calle Schell 340, dpto. 402');
  const [scheduledDate, setScheduledDate] = useState('2026-11-20');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [trackerType, setTrackerType] = useState<TrackerType>('qr');
  const [recommendations, setRecommendations] = useState(
    'Le tiene miedo al ruido fuerte de motos y camiones: alejarse de avenidas principales. Alérgico al pollo (solo ofrecer agua filtrada). Usar siempre doble mosquetón.'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [paymentRef, setPaymentRef] = useState('482910');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submittedBooking, setSubmittedBooking] = useState<BookingSummary | null>(null);

  const activeCaregiver = useMemo(
    () => CAREGIVERS.find((c) => c.id === selectedCaregiverId) ?? CAREGIVERS[0],
    [selectedCaregiverId]
  );

  const toggleService = (serviceId: ServiceId) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.length > 1 ? prev.filter((id) => id !== serviceId) : prev;
      }
      return [...prev, serviceId];
    });
  };

  const getServicePrice = (serviceId: ServiceId): number => {
    const cgService = activeCaregiver.services.find((s) => s.id === serviceId);
    if (cgService) return cgService.pricePen;
    const cat = SERVICE_CATALOG.find((s) => s.id === serviceId);
    return cat ? cat.defaultPricePen : 25;
  };

  const itemizedServices = useMemo(
    () =>
      selectedServiceIds.map((id) => {
        const meta = SERVICE_CATALOG.find((s) => s.id === id);
        return {
          id,
          label: meta?.label ?? id,
          pricePen: getServicePrice(id),
        };
      }),
    [selectedServiceIds, activeCaregiver]
  );

  const totalPen = useMemo(
    () => itemizedServices.reduce((sum, item) => sum + item.pricePen, 0),
    [itemizedServices]
  );

  const appendRecommendationTemplate = (template: string) => {
    setRecommendations((prev) => {
      const trimmed = prev.trim();
      if (trimmed.toLowerCase().includes(template.slice(0, 24).toLowerCase())) {
        return prev;
      }
      return trimmed ? `${trimmed} ${template}` : template;
    });
    setValidationErrors((prev) => prev.filter((e) => !e.includes('Recomendaciones')));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (selectedServiceIds.length === 0) {
      errors.push('Selecciona al menos un servicio para continuar.');
    }
    if (!petName.trim()) {
      errors.push('Ingresa el nombre de tu mascota.');
    }
    if (!ownerName.trim()) {
      errors.push('Ingresa tu nombre completo como dueño responsable.');
    }
    if (ownerWhatsapp.replace(/\D/g, '').length < 9) {
      errors.push('Ingresa un número de WhatsApp válido en Perú (9 dígitos, ej. 991234567).');
    }
    if (!pickupAddress.trim()) {
      errors.push('Indica la dirección o referencia de recojo en tu distrito.');
    }
    if (recommendations.trim().length < 25) {
      errors.push(
        'El campo obligatorio "Recomendaciones e instrucciones según la mascota" debe detallar miedos, alergias o pautas de manejo (mínimo 25 caracteres).'
      );
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const summary: BookingSummary = {
      id: `PS-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      petName: petName.trim(),
      petBreed: petBreed.trim() || 'Mestizo',
      petAge: petAge.trim() || 'Adulto',
      petWeightKg: petWeightKg.trim() || '12',
      petColorMarks: petColorMarks.trim() || 'Arnés y collar identificador',
      ownerName: ownerName.trim(),
      ownerWhatsapp: ownerWhatsapp.replace(/\D/g, ''),
      district,
      pickupAddress: pickupAddress.trim(),
      scheduledDate,
      scheduledTime,
      selectedServices: itemizedServices,
      recommendations: recommendations.trim(),
      paymentMethod,
      paymentRef: paymentRef.trim() || 'YAPE-OK',
      trackerType,
      totalPen,
    };

    setSubmittedBooking(summary);
    onConfirmBooking(summary, activeCaregiver);
  };

  if (submittedBooking) {
    return (
      <div className="max-w-3xl mx-auto py-4 pb-24 md:pb-16 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0E6245]/10 text-[#0E6245] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono font-medium text-[#0E6245] tabular-nums">
                Reserva confirmada · Código {submittedBooking.id}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
                Solicitud registrada con protocolo de seguridad activo
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {submittedBooking.caregiverName} recibió las recomendaciones obligatorias de{' '}
                <strong className="text-slate-900">{submittedBooking.petName}</strong> y el enlace
                de rastreo GPS quedó vinculado a tu WhatsApp +51.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <p className="text-xs text-slate-500">Cuidador verificado (RENIEC + PNP)</p>
              <p className="font-semibold text-slate-900 mt-0.5">{submittedBooking.caregiverName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Recojo y horario</p>
              <p className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                {submittedBooking.district} · {submittedBooking.scheduledDate} a las{' '}
                {submittedBooking.scheduledTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Pago en custodia segura</p>
              <p className="font-semibold font-mono text-slate-900 mt-0.5 tabular-nums">
                {formatSoles(submittedBooking.totalPen)} vía{' '}
                {submittedBooking.paymentMethod.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Rastreo de collar seleccionado</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {submittedBooking.trackerType === 'qr' && 'Placa QR Inteligente PataSegura'}
                {submittedBooking.trackerType === 'airtag' && 'Apple AirTag vinculado'}
                {submittedBooking.trackerType === 'smarttag' && 'Samsung SmartTag2 vinculado'}
                {submittedBooking.trackerType === 'gps-only' && 'GPS del celular del cuidador'}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#F4F8F6] border border-[#0E6245]/15 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#0A4D36]">
              Instrucciones obligatorias enviadas al cuidador y al afiche de emergencia:
            </p>
            <p className="text-sm text-slate-800 leading-relaxed">
              {submittedBooking.recommendations}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchActiveWalk}
              className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-6 py-3 transition-colors whitespace-nowrap"
            >
              Iniciar Modo Paseo Activo con {submittedBooking.petName}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => setSubmittedBooking(null)}
              className="min-h-[48px] inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-5 py-3 transition-colors whitespace-nowrap"
            >
              Editar solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 md:pb-16 pt-2">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold text-[#0E6245]">
          Paso único · Custodia segura en Soles (S/)
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
          Solicitud de cuidado y ficha de seguridad de tu mascota
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Selecciona los servicios exactos, completa las recomendaciones obligatorias de conducta o
          salud y elige tu método de pago local (Yape, Plin o tarjeta).
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Main Form Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 border border-red-200 p-5 space-y-2 text-red-900"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                Completa los campos obligatorios antes de confirmar
              </div>
              <ul className="list-disc pl-6 space-y-1 text-sm text-red-800">
                {validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 01. Caregiver Selector */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-950">01. Cuidador verificado asignado</h2>
              <span className="text-xs text-slate-500">Todos validados con RENIEC y PNP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAREGIVERS.map((cg) => {
                const selected = cg.id === activeCaregiver.id;
                return (
                  <button
                    key={cg.id}
                    type="button"
                    onClick={() => {
                      setSelectedCaregiverId(cg.id);
                      setDistrict(cg.district);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-colors flex items-center gap-3.5 ${
                      selected
                        ? 'border-[#0E6245] bg-[#F4F8F6] ring-1 ring-[#0E6245]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <SafeImage
                      src={cg.avatarUrl}
                      alt={cg.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{cg.name}</p>
                      <p className="text-xs text-slate-600 tabular-nums">
                        {cg.district} · {cg.rating.toFixed(1)} ★ · Desde{' '}
                        {formatSoles(cg.baseWalkPricePen)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 02. Exact Services Selection */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                02. Selección exacta de servicios necesarios
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Marca uno o más cuidados; el total en Soles se actualiza al instante.
              </p>
            </div>

            <div className="space-y-2.5">
              {SERVICE_CATALOG.map((srv) => {
                const checked = selectedServiceIds.includes(srv.id);
                const price = getServicePrice(srv.id);
                return (
                  <label
                    key={srv.id}
                    className={`flex items-start justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#0E6245] bg-[#F4F8F6]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(srv.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0E6245] focus:ring-[#0E6245]"
                      />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          {srv.label}
                        </span>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {srv.description}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                      {formatSoles(price)}
                      <span className="text-xs font-sans font-normal text-slate-500">
                        /{srv.unit}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 03. Mandatory Pet Recommendations Field */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  03. Recomendaciones e instrucciones según la mascota{' '}
                  <span className="text-red-600" aria-hidden="true">
                    *
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Campo obligatorio: detalla miedos, alergias, comportamiento con otros perros,
                  medicación o pautas de correa. Se mostrará siempre en pantalla al cuidador y en el
                  afiche de emergencia.
                </p>
              </div>
              <span
                className={`text-xs font-mono font-medium tabular-nums ${
                  recommendations.trim().length >= 25 ? 'text-[#0E6245]' : 'text-red-600'
                }`}
              >
                {recommendations.trim().length} / 25 mín.
              </span>
            </div>

            <div>
              <label htmlFor="pet-recommendations" className="sr-only">
                Recomendaciones e instrucciones según la mascota (obligatorio)
              </label>
              <textarea
                id="pet-recommendations"
                required
                rows={4}
                value={recommendations}
                onChange={(e) => {
                  setRecommendations(e.target.value);
                  if (e.target.value.trim().length >= 25) {
                    setValidationErrors((prev) =>
                      prev.filter((err) => !err.includes('Recomendaciones'))
                    );
                  }
                }}
                placeholder="Ej: Se asusta con motos o pirotecnia; alérgico al pollo; usa doble mosquetón; no acercar a perros grandes..."
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 ${
                  recommendations.trim().length < 25 && validationErrors.length > 0
                    ? 'border-red-400 bg-red-50/40 focus:border-red-600 focus:ring-red-200'
                    : 'border-slate-300 bg-slate-50/40 focus:bg-white focus:border-[#0E6245] focus:ring-[#0E6245]/20'
                }`}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Agregar pautas rápidas frecuentes al texto:
              </p>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDATION_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendRecommendationTemplate(tpl)}
                    className="min-h-[38px] text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
                  >
                    + {tpl.split(';')[0]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 04. Pet, Pickup & Collar Tracker Details */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-950">
              04. Datos de la mascota, recojo en Perú y collar rastreador
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pet-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre de la mascota *
                </label>
                <input
                  id="pet-name"
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="pet-breed" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Raza / Tamaño
                </label>
                <input
                  id="pet-breed"
                  type="text"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="pet-age" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Edad
                </label>
                <input
                  id="pet-age"
                  type="text"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="pet-weight" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peso aproximado (kg)
                </label>
                <input
                  id="pet-weight"
                  type="text"
                  value={petWeightKg}
                  onChange={(e) => setPetWeightKg(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pet-marks" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Señas particulares y color de arnés/collar (útil para identificación)
                </label>
                <input
                  id="pet-marks"
                  type="text"
                  value={petColorMarks}
                  onChange={(e) => setPetColorMarks(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label htmlFor="owner-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre del dueño *
                </label>
                <input
                  id="owner-name"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="owner-wa" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Perú (+51) *
                </label>
                <div className="flex items-center">
                  <span className="min-h-[44px] inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-xs font-mono font-semibold text-slate-700">
                    +51
                  </span>
                  <input
                    id="owner-wa"
                    type="tel"
                    value={ownerWhatsapp}
                    onChange={(e) => setOwnerWhatsapp(e.target.value)}
                    placeholder="991234567"
                    className="w-full min-h-[44px] rounded-r-xl border border-slate-200 px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="booking-district" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Distrito
                </label>
                <select
                  id="booking-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                >
                  {PERU_DISTRICTS.filter((d) => d !== 'Todos los distritos').map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pickup-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dirección de recojo *
                </label>
                <input
                  id="pickup-address"
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="sched-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fecha
                </label>
                <input
                  id="sched-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
              <div>
                <label htmlFor="sched-time" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hora de inicio
                </label>
                <input
                  id="sched-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
                />
              </div>
            </div>

            {/* Collar Tracker Linking Option */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                Dispositivo de rastreo adicional en el collar (además del GPS del cuidador)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(
                  [
                    {id: 'qr', label: 'Placa QR PataSegura', sub: 'Escaneo WhatsApp'},
                    {id: 'airtag', label: 'Apple AirTag', sub: 'Red Encontrar'},
                    {id: 'smarttag', label: 'Samsung SmartTag2', sub: 'SmartThings Find'},
                    {id: 'gps-only', label: 'Solo GPS celular', sub: 'Ruta + fotos'},
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTrackerType(item.id)}
                    className={`min-h-[54px] text-left rounded-xl border px-3.5 py-2.5 transition-colors ${
                      trackerType === item.id
                        ? 'border-[#0E6245] bg-[#F4F8F6] text-slate-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 05. Local Peruvian Payment Methods */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-950">
              05. Método de pago local en Soles (S/)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    id: 'yape',
                    name: 'Yape',
                    desc: 'Inmediato con código de aprobación',
                    icon: Smartphone,
                  },
                  {
                    id: 'plin',
                    name: 'Plin',
                    desc: 'BBVA, Interbank, Scotiabank, BanBif',
                    icon: QrCode,
                  },
                  {
                    id: 'tarjeta',
                    name: 'Tarjeta S/',
                    desc: 'Visa, Mastercard o Amex sin recargo',
                    icon: CreditCard,
                  },
                ] as const
              ).map((pm) => {
                const Icon = pm.icon;
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      active
                        ? 'border-[#0E6245] bg-[#F4F8F6] ring-1 ring-[#0E6245]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5 text-[#0E6245]" />
                      {active && <Check className="w-4 h-4 text-[#0E6245]" />}
                    </div>
                    <p className="text-sm font-bold text-slate-950 mt-2.5">{pm.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{pm.desc}</p>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'yape' && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Pago protegido vía Yape (Perú)</p>
                  <p>
                    Número custodia PataSegura:{' '}
                    <span className="font-mono font-semibold text-slate-900">+51 901 234 567</span>
                  </p>
                  <p>
                    Monto exacto:{' '}
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatSoles(totalPen)}
                    </span>
                  </p>
                </div>
                <div>
                  <label htmlFor="yape-code" className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de aprobación Yape (6 dígitos)
                  </label>
                  <input
                    id="yape-code"
                    type="text"
                    maxLength={8}
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-[#0E6245] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'plin' && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Pago interoperable Plin en Soles</p>
                <p>
                  Transfiere{' '}
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {formatSoles(totalPen)}
                  </span>{' '}
                  al número verificado <span className="font-mono font-semibold">+51 901 234 567</span>{' '}
                  (titular PataSegura S.A.C.). El pago queda retenido hasta finalizar el paseo.
                </p>
              </div>
            )}

            {paymentMethod === 'tarjeta' && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Pago con tarjeta de débito o crédito en Soles</p>
                <p>
                  Procesamiento tokenizado en soles peruanos (sin conversión a dólares) con
                  liberación al cuidador tras confirmar entrega segura de {petName || 'tu mascota'}.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Summary Column */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <SafeImage
                src={activeCaregiver.avatarUrl}
                alt={activeCaregiver.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950 truncate">{activeCaregiver.name}</p>
                <p className="text-xs text-slate-600 tabular-nums">
                  {activeCaregiver.district} · {activeCaregiver.rating.toFixed(1)} ★
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-[#0A4D36] font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E6245] shrink-0" />
                DNI validado con RENIEC
              </li>
              <li className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0E6245] shrink-0" />
                Antecedentes Policiales (PNP)
              </li>
              <li className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0E6245] shrink-0" />
                Entrevista presencial aprobada
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-sm">
              <p className="text-xs font-semibold text-slate-500">Resumen del servicio</p>
              {itemizedServices.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatSoles(item.pricePen)}
                  </span>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 text-xs text-slate-600">
                <span>Rastreo GPS + Fotos c/30 min + Alerta 3 km</span>
                <span className="font-semibold text-[#0E6245]">Incluido</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-950">Total en Soles</span>
              <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
                {formatSoles(totalPen)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-5 py-3 transition-colors"
            >
              Confirmar solicitud con {paymentMethod.toUpperCase()}
            </button>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tu pago permanece en custodia y solo se libera cuando confirmas que {petName || 'tu mascota'}{' '}
              regresó a salvo.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
