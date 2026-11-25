export type AppView = 'catalog' | 'booking' | 'active-walk' | 'qr-tag';

export type PetSpecies = 'Perros' | 'Gatos' | 'Senior / Especiales';

export type ServiceId =
  | 'paseo-gps'
  | 'guarderia-dia'
  | 'hospedaje-noche'
  | 'medicamentos'
  | 'higiene-patas';

export type PaymentMethod = 'yape' | 'plin' | 'tarjeta';

export type TrackerType = 'qr' | 'airtag' | 'smarttag' | 'gps-only';

export interface CaregiverReview {
  id: string;
  ownerName: string;
  district: string;
  petName: string;
  petBreed: string;
  rating: number;
  date: string;
  comment: string;
  serviceUsed: string;
}

export interface VerificationCredentials {
  reniecDni: boolean;
  reniecVerifiedDate: string;
  reniecCode: string;
  policeRecordPnp: boolean;
  policeRecordDate: string;
  policeCertCode: string;
  interviewApproved: boolean;
  interviewDate: string;
  interviewerNote: string;
}

export interface Caregiver {
  id: string;
  name: string;
  district: string;
  city: string;
  distanceKm: number;
  headline: string;
  bio: string;
  avatarUrl: string;
  whatsappNumber: string; // e.g. '51987654321'
  rating: number;
  reviewCount: number;
  completedServices: number;
  responseTimeMin: number;
  specialties: PetSpecies[];
  services: {
    id: ServiceId;
    label: string;
    pricePen: number;
    unit: string;
  }[];
  baseWalkPricePen: number;
  baseDaycarePricePen: number;
  verification: VerificationCredentials;
  reviews: CaregiverReview[];
  equipment: string[];
}

export interface LatLngPoint {
  lat: number;
  lng: number;
  landmark: string;
  timestampOffsetMin: number;
}

export interface CheckInReport {
  id: string;
  timeLabel: string;
  note: string;
  photoUrl: string;
  locationLabel: string;
  position: {lat: number; lng: number};
  mood: string;
  hydrationDone: boolean;
}

export interface CollarTrackerState {
  id: TrackerType;
  name: string;
  provider: string;
  code: string;
  linked: boolean;
  batteryPct: number | null;
  lastPingLabel: string;
  detail: string;
}

export interface NearbyRescuer {
  id: string;
  name: string;
  role: 'Cuidador verificado' | 'Usuario comunidad';
  distanceMeters: number;
  position: {lat: number; lng: number};
  status: string;
  verified: boolean;
}

export interface BookingSummary {
  id: string;
  caregiverId: string;
  caregiverName: string;
  petName: string;
  petBreed: string;
  petAge: string;
  petWeightKg: string;
  petColorMarks: string;
  ownerName: string;
  ownerWhatsapp: string;
  district: string;
  pickupAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  selectedServices: {id: ServiceId; label: string; pricePen: number}[];
  recommendations: string;
  paymentMethod: PaymentMethod;
  paymentRef: string;
  trackerType: TrackerType;
  totalPen: number;
}

export interface ActiveWalkSession {
  bookingId: string;
  caregiver: Caregiver;
  petName: string;
  petBreed: string;
  petColorMarks: string;
  petPhotoUrl: string;
  ownerName: string;
  ownerWhatsapp: string;
  district: string;
  recommendations: string;
  startedAtLabel: string;
  serviceLabel: string;
  totalPaidPen: number;
  paymentMethod: PaymentMethod;
}

export interface PetQrProfile {
  tagCode: string;
  petName: string;
  breed: string;
  distinctiveMarks: string;
  medicalOrBehaviorNote: string;
  ownerName: string;
  ownerWhatsapp: string;
  district: string;
  rewardText: string;
  photoUrl: string;
}
