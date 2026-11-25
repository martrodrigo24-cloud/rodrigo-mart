import {useEffect, useState} from 'react';
import {ClipboardList, Navigation, QrCode, Users} from 'lucide-react';
import {ActiveWalkMode} from './components/ActiveWalkMode';
import {BookingRequestForm} from './components/BookingRequestForm';
import {CaregiverCatalog} from './components/CaregiverCatalog';
import {CaregiverProfileModal} from './components/CaregiverProfileModal';
import {SmartQrTagView} from './components/SmartQrTagView';
import {WhatsappModal} from './components/WhatsappModal';
import {
  CAREGIVERS,
  DEFAULT_ACTIVE_WALK,
  DEFAULT_QR_PROFILE,
  GENERATED_IMAGES,
} from './data/peruData';
import type {
  ActiveWalkSession,
  AppView,
  BookingSummary,
  Caregiver,
  PetQrProfile,
  TrackerType,
} from './types';

function resolveMapsApiKey(): string {
  const fromVite = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (fromVite && fromVite !== 'MY_GOOGLE_MAPS_API_KEY') return fromVite;
  if (typeof __GMP_API_KEY__ !== 'undefined' && __GMP_API_KEY__) return __GMP_API_KEY__;
  return '';
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('catalog');
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver>(CAREGIVERS[0]);
  const [inspectedCaregiver, setInspectedCaregiver] = useState<Caregiver | null>(null);
  const [activeWalkSession, setActiveWalkSession] =
    useState<ActiveWalkSession>(DEFAULT_ACTIVE_WALK);
  const [preferredTrackerType, setPreferredTrackerType] = useState<TrackerType>('qr');
  const [qrProfile, setQrProfile] = useState<PetQrProfile>(DEFAULT_QR_PROFILE);

  // WhatsApp direct contact modal state
  const [whatsappTarget, setWhatsappTarget] = useState<{
    name: string;
    phone: string;
    subtitle: string;
    message: string;
  } | null>(null);

  // Google Maps Platform Demo Key Quota Defense (top-level state persists across views)
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);
  const mapsApiKey = resolveMapsApiKey();

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSelectCaregiverForBooking = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    navigateTo('booking');
  };

  const handleOpenWhatsappCaregiver = (caregiver: Caregiver) => {
    setWhatsappTarget({
      name: caregiver.name,
      phone: caregiver.whatsappNumber,
      subtitle: `${caregiver.district} · Verificado RENIEC y PNP`,
      message: `Hola ${caregiver.name.split(' ')[0]}, vi tu perfil verificado en PataSegura (${caregiver.district}). Quisiera consultar disponibilidad y tarifas en Soles para cuidar a mi mascota.`,
    });
  };

  const handleConfirmBooking = (booking: BookingSummary, caregiver: Caregiver) => {
    setPreferredTrackerType(booking.trackerType);
    setActiveWalkSession({
      bookingId: booking.id,
      caregiver,
      petName: booking.petName,
      petBreed: `${booking.petBreed} (${booking.petWeightKg} kg)`,
      petColorMarks: booking.petColorMarks,
      petPhotoUrl: GENERATED_IMAGES.rockyCheckin,
      ownerName: booking.ownerName,
      ownerWhatsapp: booking.ownerWhatsapp.startsWith('51')
        ? booking.ownerWhatsapp
        : `51${booking.ownerWhatsapp}`,
      district: booking.district,
      recommendations: booking.recommendations,
      startedAtLabel: booking.scheduledTime,
      serviceLabel: booking.selectedServices.map((s) => s.label).join(' + '),
      totalPaidPen: booking.totalPen,
      paymentMethod: booking.paymentMethod,
    });
    setQrProfile((prev) => ({
      ...prev,
      petName: booking.petName,
      breed: `${booking.petBreed} · ${booking.petWeightKg} kg`,
      distinctiveMarks: booking.petColorMarks,
      medicalOrBehaviorNote: booking.recommendations,
      ownerName: booking.ownerName,
      ownerWhatsapp: booking.ownerWhatsapp.startsWith('51')
        ? booking.ownerWhatsapp
        : `51${booking.ownerWhatsapp}`,
      district: `${booking.district}, Perú`,
    }));
  };

  const navItems: {id: AppView; label: string; mobileLabel: string; icon: typeof Users}[] = [
    {id: 'catalog', label: 'Cuidadores', mobileLabel: 'Cuidadores', icon: Users},
    {id: 'booking', label: 'Solicitar', mobileLabel: 'Solicitar', icon: ClipboardList},
    {id: 'active-walk', label: 'Paseo en Vivo', mobileLabel: 'Paseo GPS', icon: Navigation},
    {id: 'qr-tag', label: 'Placa QR', mobileLabel: 'Placa QR', icon: QrCode},
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F7] text-slate-900">
      {/* Mandatory Demo Key Quota Banner (Google Maps Platform Case A) */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[52px] md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('catalog')}
            className="font-display text-xl font-bold tracking-tight text-slate-950 hover:text-[#0E6245] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            PataSegura
          </button>

          {/* Zone 2: 4 clean single-line text nav links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#0E6245] text-slate-950 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() =>
                navigateTo(activeView === 'active-walk' ? 'booking' : 'active-walk')
              }
              className="min-h-[38px] md:min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0E6245] hover:bg-[#0A4D36] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeView === 'active-walk' ? 'Nueva Solicitud' : 'Modo Paseo Activo'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (Full 1440px desktop rhythm, responsive mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'catalog' && (
          <CaregiverCatalog
            onSelectCaregiverForBooking={handleSelectCaregiverForBooking}
            onInspectCaregiver={(cg) => setInspectedCaregiver(cg)}
            onOpenWhatsapp={handleOpenWhatsappCaregiver}
            onNavigate={navigateTo}
          />
        )}

        {activeView === 'booking' && (
          <BookingRequestForm
            initialCaregiver={selectedCaregiver}
            onConfirmBooking={handleConfirmBooking}
            onLaunchActiveWalk={() => navigateTo('active-walk')}
          />
        )}

        {activeView === 'active-walk' && (
          <ActiveWalkMode
            session={activeWalkSession}
            mapsApiKey={mapsApiKey}
            quotaExceeded={gmpQuotaExceeded}
            initialTrackerType={preferredTrackerType}
            onOpenWhatsappCaregiver={() =>
              setWhatsappTarget({
                name: activeWalkSession.caregiver.name,
                phone: activeWalkSession.caregiver.whatsappNumber,
                subtitle: `Paseo activo de ${activeWalkSession.petName}`,
                message: `Hola ${activeWalkSession.caregiver.name.split(' ')[0]}, estoy siguiendo el paseo de ${activeWalkSession.petName} en PataSegura. ¿Todo bien por ${activeWalkSession.district}?`,
              })
            }
            onNavigate={navigateTo}
          />
        )}

        {activeView === 'qr-tag' && (
          <SmartQrTagView profile={qrProfile} onUpdateProfile={setQrProfile} />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">
              PataSegura Perú · Cuidado verificado y rastreo comunitario de mascotas
            </p>
            <p>
              Precios en Soles (S/) · Yape, Plin y tarjetas · Cobertura en Lima Metropolitana,
              Arequipa y Cusco.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 underline-offset-2 hover:underline"
            >
              Términos de Google Maps
            </a>
            <a
              href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 underline-offset-2 hover:underline"
            >
              Privacidad de ubicación
            </a>
            <button
              type="button"
              onClick={() => navigateTo('active-walk')}
              className="font-semibold text-[#0E6245] hover:underline"
            >
              Ir al Modo Paseo Activo
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Tab Bar (Thumb-Zone Ergonomics, <= 15% Sticky Cap with Header) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="grid grid-cols-4 h-[58px] items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#0E6245] font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <CaregiverProfileModal
        caregiver={inspectedCaregiver}
        onClose={() => setInspectedCaregiver(null)}
        onRequestBooking={handleSelectCaregiverForBooking}
        onOpenWhatsapp={handleOpenWhatsappCaregiver}
      />

      <WhatsappModal
        isOpen={Boolean(whatsappTarget)}
        recipientName={whatsappTarget?.name ?? ''}
        phone={whatsappTarget?.phone ?? ''}
        subtitle={whatsappTarget?.subtitle}
        initialMessage={whatsappTarget?.message ?? ''}
        onClose={() => setWhatsappTarget(null)}
      />
    </div>
  );
}
