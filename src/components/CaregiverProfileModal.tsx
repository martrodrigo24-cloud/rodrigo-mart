import {
  CheckCircle2,
  FileCheck2,
  MessageCircle,
  ShieldCheck,
  Star,
  UserCheck,
  X,
} from 'lucide-react';
import {formatSoles} from '../data/peruData';
import type {Caregiver} from '../types';
import {SafeImage} from './SafeImage';

interface CaregiverProfileModalProps {
  caregiver: Caregiver | null;
  onClose: () => void;
  onRequestBooking: (caregiver: Caregiver) => void;
  onOpenWhatsapp: (caregiver: Caregiver) => void;
}

export function CaregiverProfileModal({
  caregiver,
  onClose,
  onRequestBooking,
  onOpenWhatsapp,
}: CaregiverProfileModalProps) {
  if (!caregiver) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <SafeImage
              src={caregiver.avatarUrl}
              alt={caregiver.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
            />
            <div className="min-w-0">
              <h2
                id="caregiver-modal-title"
                className="text-xl font-bold text-slate-900 truncate"
              >
                {caregiver.name}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
                {caregiver.district}, {caregiver.city} · {caregiver.rating.toFixed(1)} ★ (
                {caregiver.reviewCount} reseñas verificadas) · {caregiver.completedServices}{' '}
                servicios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar perfil del cuidador"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          <div>
            <p className="text-base font-semibold text-slate-900">{caregiver.headline}</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">{caregiver.bio}</p>
          </div>

          {/* Strict Verification Ledger */}
          <section className="rounded-xl bg-[#F4F8F6] border border-[#0E6245]/15 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Respaldo de verificación de seguridad (Perú)
              </h3>
              <span className="text-xs font-medium text-[#0E6245] tabular-nums">
                3 de 3 filtros aprobados
              </span>
            </div>

            <div className="divide-y divide-[#0E6245]/10">
              <div className="py-3 first:pt-0 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0E6245] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-sm font-semibold text-slate-900">
                      DNI validado con RENIEC
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {caregiver.verification.reniecCode} · {caregiver.verification.reniecVerifiedDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Identidad biométrica y vigencia de documento contrastada con padrón RENIEC.
                  </p>
                </div>
              </div>

              <div className="py-3 flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-[#0E6245] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-sm font-semibold text-slate-900">
                      Certificado de Antecedentes Policiales (PNP)
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {caregiver.verification.policeCertCode} · {caregiver.verification.policeRecordDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Certificado CERAP digital sin registros ni observaciones vigentes.
                  </p>
                </div>
              </div>

              <div className="py-3 last:pb-0 flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-[#0E6245] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-sm font-semibold text-slate-900">
                      Entrevista presencial aprobada
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {caregiver.verification.interviewDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {caregiver.verification.interviewerNote}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tariffs in Soles */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Tarifas transparentes en Soles (S/)</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {caregiver.services.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-white text-sm"
                >
                  <span className="font-medium text-slate-800">{srv.label}</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatSoles(srv.pricePen)}{' '}
                    <span className="text-xs font-sans font-normal text-slate-500">/ {srv.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Safety Equipment */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Equipamiento de seguridad en cada servicio</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {caregiver.equipment.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0E6245] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Verified Reviews */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Comentarios verificados de dueños ({caregiver.reviews.length} destacados)
            </h3>
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {caregiver.reviews.map((rev) => (
                <article key={rev.id} className="py-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {rev.ownerName}{' '}
                      <span className="font-normal text-slate-500">
                        · {rev.district} · Mascota: {rev.petName} ({rev.petBreed})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {rev.rating.toFixed(1)} · <span className="text-slate-500 font-normal">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">“{rev.comment}”</p>
                  <p className="text-xs text-slate-500">Servicio verificado: {rev.serviceUsed}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestBooking(caregiver);
            }}
            className="flex-1 min-h-[46px] rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-5 py-2.5 transition-colors whitespace-nowrap"
          >
            Solicitar cuidado desde {formatSoles(caregiver.baseWalkPricePen)}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWhatsapp(caregiver);
            }}
            className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold px-4 py-2.5 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-[#0E6245]" />
            WhatsApp +51
          </button>
        </div>
      </div>
    </div>
  );
}
