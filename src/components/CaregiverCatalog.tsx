import {useMemo, useState} from 'react';
import {
  ArrowRight,
  Camera,
  FileCheck2,
  MapPin,
  MessageCircle,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
} from 'lucide-react';
import {
  CAREGIVERS,
  GENERATED_IMAGES,
  PERU_DISTRICTS,
  SERVICE_CATALOG,
  formatSoles,
} from '../data/peruData';
import type {AppView, Caregiver, PetSpecies, ServiceId} from '../types';
import {SafeImage} from './SafeImage';

interface CaregiverCatalogProps {
  onSelectCaregiverForBooking: (caregiver: Caregiver) => void;
  onInspectCaregiver: (caregiver: Caregiver) => void;
  onOpenWhatsapp: (caregiver: Caregiver) => void;
  onNavigate: (view: AppView) => void;
}

type SortOption = 'rating' | 'price-asc' | 'reviews';

export function CaregiverCatalog({
  onSelectCaregiverForBooking,
  onInspectCaregiver,
  onOpenWhatsapp,
  onNavigate,
}: CaregiverCatalogProps) {
  const [districtFilter, setDistrictFilter] = useState<string>('Todos los distritos');
  const [speciesFilter, setSpeciesFilter] = useState<PetSpecies | 'Todos'>('Todos');
  const [serviceFilter, setServiceFilter] = useState<ServiceId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const filteredCaregivers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const list = CAREGIVERS.filter((cg) => {
      if (
        districtFilter !== 'Todos los distritos' &&
        !cg.district.toLowerCase().includes(districtFilter.toLowerCase())
      ) {
        return false;
      }
      if (speciesFilter !== 'Todos' && !cg.specialties.includes(speciesFilter)) {
        return false;
      }
      if (serviceFilter !== 'all' && !cg.services.some((s) => s.id === serviceFilter)) {
        return false;
      }
      if (normalizedQuery) {
        const haystack = `${cg.name} ${cg.district} ${cg.headline} ${cg.bio}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.baseWalkPricePen - b.baseWalkPricePen;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    });
  }, [districtFilter, speciesFilter, serviceFilter, searchQuery, sortBy]);

  const hasActiveFilters =
    districtFilter !== 'Todos los distritos' ||
    speciesFilter !== 'Todos' ||
    serviceFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setDistrictFilter('Todos los distritos');
    setSpeciesFilter('Todos');
    setServiceFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-12 pb-24 md:pb-16">
      {/* Split 2-Column Editorial Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch pt-4">
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <p className="text-sm font-medium text-[#0E6245]">
              Perú · Pagos en Soles (S/) con Yape, Plin y tarjetas
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-950 leading-[1.12]">
              Cuidadores verificados con RENIEC y rastreo GPS en vivo
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-[60ch]">
              Encuentra cuidadores independientes en Lima y regiones del Perú que han superado
              validación de identidad RENIEC, certificado de antecedentes policiales y entrevista
              presencial. Sigue cada paseo en mapa GPS con fotos cada 30 minutos y botón de alerta
              comunitaria de 3 km.
            </p>
          </div>

          <div className="pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('active-walk')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-6 py-3 transition-colors whitespace-nowrap"
              >
                Abrir Modo Paseo Activo
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold px-6 py-3 transition-colors whitespace-nowrap"
              >
                Crear Solicitud de Cuidado
              </button>
            </div>

            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 tabular-nums">
              <span>100% DNI validado con RENIEC</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Antecedentes Policiales PNP</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Contacto directo WhatsApp +51</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 min-h-[280px] lg:min-h-0">
          <SafeImage
            src={GENERATED_IMAGES.rockyWalking}
            alt="Rocky caminando seguro con arnés verde en el Malecón de Miraflores, Lima"
            className="w-full h-full object-cover aspect-[4/3] lg:aspect-auto"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-6 text-white">
            <p className="text-xs font-medium text-emerald-200">
              Paseo en curso · Miraflores, Lima
            </p>
            <p className="text-lg font-bold leading-snug mt-1">
              Ruta GPS en vivo, doble correa y placa QR activa
            </p>
            <p className="text-xs text-slate-200 mt-1 tabular-nums">
              Rocky con Valeria Mendoza · Check-in fotográfico cada 30 min
            </p>
          </div>
        </div>
      </section>

      {/* 3 Practical Peru Tracking Solutions Strip */}
      <section aria-labelledby="tracking-pillars-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tracking-pillars-heading" className="text-xl sm:text-2xl font-bold text-slate-950">
            Tres capas de rastreo realista pensadas para el Perú
          </h2>
          <p className="text-sm text-slate-600">
            Seguridad efectiva sin hardware costoso ni suscripciones mensuales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => onNavigate('active-walk')}
            className="text-left group bg-white border border-slate-200 hover:border-[#0E6245]/50 rounded-2xl p-6 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0E6245]/10 text-[#0E6245] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-[#0E6245] transition-colors">
                01. GPS del cuidador y fotos c/30 min
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                El teléfono del cuidador traza la ruta en Google Maps en vivo y solicita evidencia
                fotográfica obligatoria cada 30 minutos durante el paseo.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E6245]">
              Probar mapa en vivo
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('qr-tag')}
            className="text-left group bg-white border border-slate-200 hover:border-[#0E6245]/50 rounded-2xl p-6 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0E6245]/10 text-[#0E6245] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-[#0E6245] transition-colors">
                02. Placa con Código QR Inteligente
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Genera una placa QR única para el collar. Si alguien encuentra a tu mascota,
                escanea el QR y envía su ubicación GPS al instante a tu WhatsApp +51.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E6245]">
              Generar placa QR
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('active-walk')}
            className="text-left group bg-white border border-slate-200 hover:border-red-300 rounded-2xl p-6 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-red-700 transition-colors">
                03. Red de Alerta Comunitaria (3 km)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Si la mascota se suelta, el botón de emergencia alerta en segundos a cuidadores y
                vecinos en un radio de 3 km y crea el afiche digital de “Se Busca”.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
              Ver protocolo de emergencia
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>

      {/* Caregiver Directory + Filters */}
      <section id="catalogo-cuidadores" aria-labelledby="catalog-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 id="catalog-heading" className="text-2xl sm:text-3xl font-bold text-slate-950">
              Catálogo de cuidadores verificados
            </h2>
            <p className="text-sm text-slate-600 mt-1 tabular-nums">
              Mostrando {filteredCaregivers.length} de {CAREGIVERS.length} cuidadores con triple
              validación vigente · Tarifas en Soles (S/)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="sort-caregivers" className="text-xs font-medium text-slate-600">
              Ordenar por
            </label>
            <select
              id="sort-caregivers"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
            >
              <option value="rating">Mejor calificación</option>
              <option value="price-asc">Menor tarifa (S/)</option>
              <option value="reviews">Más reseñas verificadas</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search input */}
            <div className="md:col-span-5 relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, parque o especialidad..."
                aria-label="Buscar cuidador por nombre o especialidad"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
              />
            </div>

            {/* District Select */}
            <div className="md:col-span-4 relative">
              <MapPin
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                aria-label="Filtrar por distrito de Perú"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20"
              >
                {PERU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Pet Type Segmented Control */}
            <div className="md:col-span-3 flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              {(['Todos', 'Perros', 'Gatos'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSpeciesFilter(sp)}
                  className={`flex-1 min-h-[38px] px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    speciesFilter === sp
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Service Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setServiceFilter('all')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  serviceFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Todos los servicios
              </button>
              {SERVICE_CATALOG.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setServiceFilter(srv.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    serviceFilter === srv.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {srv.shortLabel}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#0E6245] hover:underline whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Caregiver Cards Grid */}
        {filteredCaregivers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <p className="text-lg font-bold text-slate-900">
              No encontramos cuidadores disponibles con ese filtro en este momento
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Prueba seleccionando “Todos los distritos” o amplía el servicio para ver los
              cuidadores verificados más cercanos a tu zona.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 min-h-[44px] inline-flex items-center justify-center rounded-xl bg-[#0E6245] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#0A4D36] transition-colors"
            >
              Ver todos los cuidadores verificados
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCaregivers.map((cg) => (
              <article
                key={cg.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Image & District overlay */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <SafeImage
                      src={cg.avatarUrl}
                      alt={`${cg.name} — Cuidador verificado en ${cg.district}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent px-5 pb-4 pt-10 flex items-end justify-between gap-3 text-white">
                      <div>
                        <p className="text-xs font-medium text-slate-200 tabular-nums">
                          {cg.district}, {cg.city} · a {cg.distanceKm.toFixed(1)} km
                        </p>
                        <h3 className="text-xl font-bold leading-tight mt-0.5">{cg.name}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 text-sm font-bold tabular-nums">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {cg.rating.toFixed(1)}
                        </div>
                        <p className="text-xs text-slate-200 tabular-nums">
                          {cg.reviewCount} reseñas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {cg.headline}
                      </p>
                      <p className="text-xs text-slate-600 mt-1.5">
                        Especialidad: {cg.specialties.join(' · ')} · Responde en ~
                        <span className="tabular-nums">{cg.responseTimeMin}</span> min
                      </p>
                    </div>

                    {/* Strict Security Verification Strip — Unboxed, Scannable, High Trust */}
                    <div className="pt-3.5 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          Verificación obligatoria aprobada
                        </span>
                        <button
                          type="button"
                          onClick={() => onInspectCaregiver(cg)}
                          className="text-xs font-semibold text-[#0E6245] hover:underline whitespace-nowrap"
                        >
                          Ver respaldo y reseñas
                        </button>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                        <li className="flex items-center gap-1.5 text-xs font-medium text-[#0A4D36]">
                          <ShieldCheck className="w-4 h-4 text-[#0E6245] shrink-0" />
                          <span>DNI validado RENIEC</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-xs font-medium text-[#0A4D36]">
                          <FileCheck2 className="w-4 h-4 text-[#0E6245] shrink-0" />
                          <span>Antecedentes PNP</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-xs font-medium text-[#0A4D36]">
                          <UserCheck className="w-4 h-4 text-[#0E6245] shrink-0" />
                          <span>Entrevista aprobada</span>
                        </li>
                      </ul>
                    </div>

                    {/* Services & Verified Snippet */}
                    <div className="pt-3.5 border-t border-slate-100 space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">Cuidados: </span>
                        {cg.services
                          .map((s) => `${s.label} (${formatSoles(s.pricePen)})`)
                          .join(' · ')}
                      </p>
                      {cg.reviews[0] && (
                        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-2">
                          “{cg.reviews[0].comment}” — {cg.reviews[0].ownerName},{' '}
                          {cg.reviews[0].district}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tariff + Primary/Secondary Actions */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Paseo GPS desde</p>
                    <p className="text-lg font-bold font-mono text-slate-950 tabular-nums">
                      {formatSoles(cg.baseWalkPricePen)}{' '}
                      <span className="text-xs font-sans font-normal text-slate-500">/ hora</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenWhatsapp(cg)}
                      aria-label={`Contactar por WhatsApp a ${cg.name}`}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold px-3.5 py-2 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 text-[#0E6245]" />
                      WhatsApp +51
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectCaregiverForBooking(cg)}
                      className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-xs sm:text-sm font-semibold px-4 py-2 transition-colors whitespace-nowrap"
                    >
                      Solicitar cuidado
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
