import type {
  ActiveWalkSession,
  Caregiver,
  CheckInReport,
  CollarTrackerState,
  LatLngPoint,
  NearbyRescuer,
  PetQrProfile,
  ServiceId,
} from '../types';

export const GENERATED_IMAGES = {
  valeria: '/src/assets/images/caregiver_valeria_lima_1795103893166.jpg',
  diego: '/src/assets/images/caregiver_diego_lima_1795103892070.jpg',
  camila: '/src/assets/images/caregiver_camila_cats_1795103892939.jpg',
  mateo: '/src/assets/images/caregiver_mateo_park_1795103892298.jpg',
  rockyCheckin: '/src/assets/images/pet_rocky_checkin_1795103891655.jpg',
  rockyWalking: '/src/assets/images/pet_rocky_walking_1795103892250.jpg',
} as const;

export const PERU_DISTRICTS = [
  'Todos los distritos',
  'Miraflores',
  'San Isidro',
  'Barranco',
  'Santiago de Surco',
  'San Borja',
  'Magdalena del Mar',
  'Jesús María',
  'La Molina',
  'Arequipa — Cayma',
  'Cusco — Wanchaq',
] as const;

export const SERVICE_CATALOG: {
  id: ServiceId;
  label: string;
  shortLabel: string;
  description: string;
  defaultPricePen: number;
  unit: string;
}[] = [
  {
    id: 'paseo-gps',
    label: 'Paseo individual con rastreo GPS',
    shortLabel: 'Paseo GPS',
    description: 'Ruta en vivo 60 min con doble sujeción y check-in fotográfico cada 30 min.',
    defaultPricePen: 35,
    unit: 'hora',
  },
  {
    id: 'guarderia-dia',
    label: 'Guardería diurna en casa verificada',
    shortLabel: 'Guardería',
    description: 'Cuidado hasta 8 horas sin jaulas, reportes fotográficos y zona segura.',
    defaultPricePen: 65,
    unit: 'día',
  },
  {
    id: 'hospedaje-noche',
    label: 'Hospedaje nocturno con supervisión',
    shortLabel: 'Hospedaje',
    description: 'Estadía de 24 horas en domicilio auditado con reporte nocturno.',
    defaultPricePen: 90,
    unit: 'noche',
  },
  {
    id: 'medicamentos',
    label: 'Administración de medicamentos',
    shortLabel: 'Medicamentos',
    description: 'Suministro oral o tópico según receta veterinaria con registro horario.',
    defaultPricePen: 15,
    unit: 'dosis',
  },
  {
    id: 'higiene-patas',
    label: 'Limpieza de patas y cepillado',
    shortLabel: 'Higiene básica',
    description: 'Limpieza con paños hipoalergénicos y cepillado suave al terminar el paseo.',
    defaultPricePen: 12,
    unit: 'sesión',
  },
];

export const CAREGIVERS: Caregiver[] = [
  {
    id: 'cg-valeria',
    name: 'Valeria Mendoza Rojas',
    district: 'Miraflores',
    city: 'Lima',
    distanceKm: 0.7,
    headline: 'Paseos individuales con refuerzo positivo y protocolo antiescape',
    bio: 'Educadora canina certificada con 4 años paseando perros medianos y grandes por el Malecón y Parque Kennedy. Siempre uso correa de doble mosquetón, bebedero portátil y envío foto cada 30 minutos.',
    avatarUrl: GENERATED_IMAGES.valeria,
    whatsappNumber: '51984312790',
    rating: 4.9,
    reviewCount: 68,
    completedServices: 312,
    responseTimeMin: 6,
    specialties: ['Perros', 'Senior / Especiales'],
    services: [
      {id: 'paseo-gps', label: 'Paseo individual GPS', pricePen: 35, unit: 'hora'},
      {id: 'guarderia-dia', label: 'Guardería diurna', pricePen: 70, unit: 'día'},
      {id: 'medicamentos', label: 'Medicamentos orales', pricePen: 15, unit: 'dosis'},
      {id: 'higiene-patas', label: 'Limpieza de patas', pricePen: 12, unit: 'sesión'},
    ],
    baseWalkPricePen: 35,
    baseDaycarePricePen: 70,
    equipment: [
      'Correa antitirones doble mosquetón',
      'Lector NFC/QR en celular',
      'Botiquín de primeros auxilios caninos',
      'Bebedero plegable con agua filtrada',
    ],
    verification: {
      reniecDni: true,
      reniecVerifiedDate: '14 Oct 2026',
      reniecCode: 'REN-PE-88412',
      policeRecordPnp: true,
      policeRecordDate: '18 Oct 2026',
      policeCertCode: 'CERAP-PNP-2026-4410',
      interviewApproved: true,
      interviewDate: '21 Oct 2026',
      interviewerNote: 'Evaluación presencial y prueba práctica de manejo de correa aprobadas con 98/100.',
    },
    reviews: [
      {
        id: 'rev-1',
        ownerName: 'Lucía Fernández',
        district: 'Miraflores',
        petName: 'Rocky',
        petBreed: 'Mestizo mediano',
        rating: 5,
        date: '12 Nov 2026',
        serviceUsed: 'Paseo individual GPS',
        comment:
          'Rocky le teme a las motos y Valeria respetó cada indicación que dejé en el formulario. Pude ver todo el recorrido por el Malecón y recibió sus dos fotos puntuales.',
      },
      {
        id: 'rev-2',
        ownerName: 'Carlos Alarcón',
        district: 'Miraflores',
        petName: 'Bruno',
        petBreed: 'Golden Retriever',
        rating: 5,
        date: '04 Nov 2026',
        serviceUsed: 'Guardería diurna',
        comment:
          'Excelente trato y comunicación por WhatsApp. Me dio mucha paz saber que pasó verificación RENIEC y antecedentes policiales.',
      },
    ],
  },
  {
    id: 'cg-diego',
    name: 'Diego Quispe Huamán',
    district: 'San Isidro',
    city: 'Lima',
    distanceKm: 1.4,
    headline: 'Bachiller de Medicina Veterinaria especializado en perros senior y medicación',
    bio: 'Egresado de Medicina Veterinaria (UNMSM). Experiencia con perros convalecientes, insulina, pastillas con horario estricto y paseos tranquilos por El Olivar sin sobreexigencia.',
    avatarUrl: GENERATED_IMAGES.diego,
    whatsappNumber: '51971204833',
    rating: 5.0,
    reviewCount: 54,
    completedServices: 245,
    responseTimeMin: 8,
    specialties: ['Perros', 'Gatos', 'Senior / Especiales'],
    services: [
      {id: 'paseo-gps', label: 'Paseo terapéutico GPS', pricePen: 40, unit: 'hora'},
      {id: 'guarderia-dia', label: 'Guardería supervisada', pricePen: 75, unit: 'día'},
      {id: 'hospedaje-noche', label: 'Hospedaje nocturno', pricePen: 95, unit: 'noche'},
      {id: 'medicamentos', label: 'Medicación veterinaria', pricePen: 15, unit: 'dosis'},
    ],
    baseWalkPricePen: 40,
    baseDaycarePricePen: 75,
    equipment: [
      'Termómetro y kit veterinario básico',
      'Arneses de soporte para perros mayores',
      'Batería externa 20,000 mAh para GPS continuo',
    ],
    verification: {
      reniecDni: true,
      reniecVerifiedDate: '02 Oct 2026',
      reniecCode: 'REN-PE-73905',
      policeRecordPnp: true,
      policeRecordDate: '05 Oct 2026',
      policeCertCode: 'CERAP-PNP-2026-3921',
      interviewApproved: true,
      interviewDate: '09 Oct 2026',
      interviewerNote: 'Constancia universitaria verificada y entrevista clínica presencial aprobada.',
    },
    reviews: [
      {
        id: 'rev-3',
        ownerName: 'Mariana Delgado',
        district: 'San Isidro',
        petName: 'Kiko',
        petBreed: 'Shiba Inu (11 años)',
        rating: 5,
        date: '15 Nov 2026',
        serviceUsed: 'Paseo terapéutico + Medicamentos',
        comment:
          'Kiko toma medicación cardíaca cada 8 horas y Diego me mandó foto exacta del suministro y el mapa del paseo tranquilo en El Olivar.',
      },
      {
        id: 'rev-4',
        ownerName: 'Rodrigo Vega',
        district: 'San Isidro',
        petName: 'Lola',
        petBreed: 'Pug',
        rating: 5,
        date: '29 Oct 2026',
        serviceUsed: 'Hospedaje nocturno',
        comment:
          'Muy responsable con razas braquicéfalas. Reportó hidratación y temperatura cada dos horas.',
      },
    ],
  },
  {
    id: 'cg-camila',
    name: 'Camila Paredes Torres',
    district: 'Barranco',
    city: 'Lima',
    distanceKm: 1.9,
    headline: 'Especialista en cuidado felino a domicilio y mascotas con ansiedad por separación',
    bio: 'Cuidadora con departamento protegido con mallas anticaídas certificadas en Barranco. Trabajo principalmente con gatos y perros pequeños nerviosos que necesitan calma y rutinas predecibles.',
    avatarUrl: GENERATED_IMAGES.camila,
    whatsappNumber: '51962884110',
    rating: 4.9,
    reviewCount: 41,
    completedServices: 189,
    responseTimeMin: 10,
    specialties: ['Gatos', 'Perros', 'Senior / Especiales'],
    services: [
      {id: 'guarderia-dia', label: 'Guardería en casa con mallas', pricePen: 60, unit: 'día'},
      {id: 'hospedaje-noche', label: 'Hospedaje tranquilo', pricePen: 85, unit: 'noche'},
      {id: 'paseo-gps', label: 'Paseo calma razas pequeñas', pricePen: 32, unit: 'hora'},
      {id: 'medicamentos', label: 'Medicación felina/canina', pricePen: 15, unit: 'dosis'},
    ],
    baseWalkPricePen: 32,
    baseDaycarePricePen: 60,
    equipment: [
      'Departamento 100% enmallado (verificado)',
      'Difusores calmantes y areneros separados',
      'Transportador rígido de emergencia',
    ],
    verification: {
      reniecDni: true,
      reniecVerifiedDate: '19 Sep 2026',
      reniecCode: 'REN-PE-61284',
      policeRecordPnp: true,
      policeRecordDate: '22 Sep 2026',
      policeCertCode: 'CERAP-PNP-2026-2814',
      interviewApproved: true,
      interviewDate: '27 Sep 2026',
      interviewerNote: 'Inspección domiciliaria de mallas de seguridad en ventanas y balcón aprobada.',
    },
    reviews: [
      {
        id: 'rev-5',
        ownerName: 'Andrea Chávez',
        district: 'Barranco',
        petName: 'Milo',
        petBreed: 'Gato doméstico naranja',
        rating: 5,
        date: '10 Nov 2026',
        serviceUsed: 'Hospedaje tranquilo',
        comment:
          'Milo suele esconderse con desconocidos pero Camila tuvo paciencia infinita. Ver la inspección de mallas en su perfil me dio total tranquilidad.',
      },
    ],
  },
  {
    id: 'cg-mateo',
    name: 'Mateo Salazar Benites',
    district: 'Santiago de Surco',
    city: 'Lima',
    distanceKm: 3.6,
    headline: 'Paseos activos y trote seguro para perros de alta energía',
    bio: 'Entrenador físico canino con experiencia en pastores, labradores y perros jóvenes con mucha energía. Paseos estructurados en parques de Surco y San Borja con arnés de seguridad y pausas de hidratación.',
    avatarUrl: GENERATED_IMAGES.mateo,
    whatsappNumber: '51995401287',
    rating: 4.8,
    reviewCount: 49,
    completedServices: 276,
    responseTimeMin: 7,
    specialties: ['Perros'],
    services: [
      {id: 'paseo-gps', label: 'Paseo activo / trote GPS', pricePen: 38, unit: 'hora'},
      {id: 'guarderia-dia', label: 'Guardería con patio cerrado', pricePen: 68, unit: 'día'},
      {id: 'hospedaje-noche', label: 'Hospedaje nocturno', pricePen: 90, unit: 'noche'},
      {id: 'higiene-patas', label: 'Limpieza de patas', pricePen: 12, unit: 'sesión'},
    ],
    baseWalkPricePen: 38,
    baseDaycarePricePen: 68,
    equipment: [
      'Cinturón manos libres con amortiguador',
      'Doble correa de seguridad bloqueable',
      'Silbato de llamado y premios hipoalergénicos',
    ],
    verification: {
      reniecDni: true,
      reniecVerifiedDate: '08 Oct 2026',
      reniecCode: 'REN-PE-90531',
      policeRecordPnp: true,
      policeRecordDate: '11 Oct 2026',
      policeCertCode: 'CERAP-PNP-2026-4109',
      interviewApproved: true,
      interviewDate: '15 Oct 2026',
      interviewerNote: 'Entrevista presencial y validación de referencias vecinales en Surco aprobadas.',
    },
    reviews: [
      {
        id: 'rev-6',
        ownerName: 'Fernando Morales',
        district: 'Santiago de Surco',
        petName: 'Toby',
        petBreed: 'Pastor Australiano',
        rating: 5,
        date: '14 Nov 2026',
        serviceUsed: 'Paseo activo GPS',
        comment:
          'Toby regresa feliz y tranquilo. Pagué por Yape en segundos y vi el trazado completo de 3.2 km por el Parque de la Amistad.',
      },
    ],
  },
];

// Simulated live GPS walk route in Miraflores, Lima (device telemetry trajectory)
export const MIRAFLORES_GPS_ROUTE: LatLngPoint[] = [
  {lat: -12.1219, lng: -77.0305, landmark: 'Inicio — Calle Schell, Miraflores', timestampOffsetMin: 0},
  {lat: -12.1227, lng: -77.0321, landmark: 'Cruce Av. José Pardo', timestampOffsetMin: 4},
  {lat: -12.1235, lng: -77.0342, landmark: 'Parque Tradiciones / Baja hacia el Malecón', timestampOffsetMin: 9},
  {lat: -12.1246, lng: -77.0363, landmark: 'Malecón Balta — Zona peatonal verde', timestampOffsetMin: 14},
  {lat: -12.1262, lng: -77.0372, landmark: 'Parque del Amor — Pausa de hidratación', timestampOffsetMin: 19},
  {lat: -12.1277, lng: -77.0358, landmark: 'Malecón de la Reserva — Vista al mar', timestampOffsetMin: 24},
  {lat: -12.1255, lng: -77.0384, landmark: 'Parque Antonio Raimondi — Camino norte', timestampOffsetMin: 29},
  {lat: -12.1228, lng: -77.0397, landmark: 'Malecón Cisneros — Área canina', timestampOffsetMin: 35},
  {lat: -12.1206, lng: -77.0385, landmark: 'Parque Grau — Tramo de regreso', timestampOffsetMin: 41},
  {lat: -12.1211, lng: -77.0346, landmark: 'Av. Pardo (berma central arbolada)', timestampOffsetMin: 48},
  {lat: -12.1219, lng: -77.0312, landmark: 'Llegada a punto de entrega', timestampOffsetMin: 55},
];

export const INITIAL_CHECKINS: CheckInReport[] = [
  {
    id: 'chk-1',
    timeLabel: '09:15',
    note: 'Inicio de paseo con arnés verde y doble mosquetón asegurados. Placa QR y AirTag sincronizados sin novedad.',
    photoUrl: GENERATED_IMAGES.rockyWalking,
    locationLabel: 'Malecón Balta, Miraflores',
    position: {lat: -12.1246, lng: -77.0363},
    mood: 'Tranquilo y atento',
    hydrationDone: false,
  },
  {
    id: 'chk-2',
    timeLabel: '09:45',
    note: 'Reporte obligatorio de 30 min: pausa a la sombra con agua fresca. Evitamos la zona de motos en Av. Larco según tus indicaciones.',
    photoUrl: GENERATED_IMAGES.rockyCheckin,
    locationLabel: 'Parque del Amor, Miraflores',
    position: {lat: -12.1262, lng: -77.0372},
    mood: 'Hidratado y contento',
    hydrationDone: true,
  },
];

export const INITIAL_TRACKERS: CollarTrackerState[] = [
  {
    id: 'qr',
    name: 'Placa QR PataSegura',
    provider: 'Escaneo cámara + WhatsApp GPS',
    code: 'PE-RCK-4829',
    linked: true,
    batteryPct: null,
    lastPingLabel: 'Activa en collar · Sin batería',
    detail: 'Cualquier persona que escanee la placa envía su ubicación GPS exacta a tu WhatsApp +51.',
  },
  {
    id: 'airtag',
    name: 'Apple AirTag',
    provider: 'Red Encontrar (UWB / Bluetooth)',
    code: 'AT-LIM-902',
    linked: true,
    batteryPct: 86,
    lastPingLabel: 'Detectado a 1.2 m del cuidador',
    detail: 'Vinculado al collar principal; alerta si se aleja más de 40 m del celular del cuidador.',
  },
  {
    id: 'smarttag',
    name: 'Samsung SmartTag2',
    provider: 'SmartThings Find',
    code: 'Sin vincular',
    linked: false,
    batteryPct: null,
    lastPingLabel: 'Disponible para vincular',
    detail: 'Compatible con dispositivos Galaxy en Lima para rastreo comunitario sin suscripción mensual.',
  },
];

export const NEARBY_COMMUNITY_RESCUERS: NearbyRescuer[] = [
  {
    id: 'res-1',
    name: 'Diego Quispe (Cuidador)',
    role: 'Cuidador verificado',
    distanceMeters: 420,
    position: {lat: -12.1215, lng: -77.0352},
    status: 'Alerta recibida · En camino al Malecón',
    verified: true,
  },
  {
    id: 'res-2',
    name: 'Camila Paredes (Cuidadora)',
    role: 'Cuidador verificado',
    distanceMeters: 1180,
    position: {lat: -12.1338, lng: -77.0289},
    status: 'Alerta recibida · Revisando Bajada Armendáriz',
    verified: true,
  },
  {
    id: 'res-3',
    name: 'Sofía G. (Vecina PataSegura)',
    role: 'Usuario comunidad',
    distanceMeters: 640,
    position: {lat: -12.1194, lng: -77.0334},
    status: 'Alerta recibida · Atenta en Parque Kennedy',
    verified: false,
  },
  {
    id: 'res-4',
    name: 'Luis M. (Cuidador)',
    role: 'Cuidador verificado',
    distanceMeters: 1520,
    position: {lat: -12.1142, lng: -77.0418},
    status: 'Alerta recibida · Recorriendo Malecón Cisneros',
    verified: true,
  },
  {
    id: 'res-5',
    name: 'Veterinaria Aliada Miraflores',
    role: 'Usuario comunidad',
    distanceMeters: 890,
    position: {lat: -12.1268, lng: -77.0261},
    status: 'Aviso en recepción · Afiche impreso',
    verified: true,
  },
];

export const DEFAULT_ACTIVE_WALK: ActiveWalkSession = {
  bookingId: 'PS-2026-4829',
  caregiver: CAREGIVERS[0],
  petName: 'Rocky',
  petBreed: 'Mestizo mediano (caramelo y blanco)',
  petColorMarks: 'Arnés verde bosque, placa plateada con QR y patitas blancas',
  petPhotoUrl: GENERATED_IMAGES.rockyCheckin,
  ownerName: 'Lucía Fernández',
  ownerWhatsapp: '51991234567',
  district: 'Miraflores',
  recommendations:
    'Le tiene miedo al ruido fuerte de motos y camiones de basura: cruzar a la vereda del parque si pasan cerca. Alérgico al pollo (solo dar agua o premios de cordero). Usar siempre doble mosquetón.',
  startedAtLabel: '09:10',
  serviceLabel: 'Paseo individual con rastreo GPS (60 min)',
  totalPaidPen: 35,
  paymentMethod: 'yape',
};

export const DEFAULT_QR_PROFILE: PetQrProfile = {
  tagCode: 'PE-RCK-4829',
  petName: 'Rocky',
  breed: 'Mestizo mediano · 14 kg',
  distinctiveMarks: 'Pelaje caramelo con pecho y patitas blancas, arnés verde.',
  medicalOrBehaviorNote:
    'Amigable pero se asusta con motos. No correr detrás de él; agacharse y ofrecer agua. Alérgico al pollo.',
  ownerName: 'Lucía Fernández',
  ownerWhatsapp: '51991234567',
  district: 'Miraflores, Lima',
  rewardText: 'Recompensa inmediata por entrega segura',
  photoUrl: GENERATED_IMAGES.rockyCheckin,
};

export const RECOMMENDATION_TEMPLATES = [
  'Se asusta con el ruido de motos, bocinas o pirotecnia; alejarlo de avenidas principales.',
  'Alergia alimentaria (no ofrecer snacks con pollo ni premios de terceros en el parque).',
  'Usar siempre arnés antitirones con doble mosquetón; no soltar la correa fuera de casa.',
  'Reactivo con perros grandes desconocidos; mantener distancia de 3 metros al cruzar.',
  'Toma medicación oral con horario estricto según receta adjunta.',
];

export function formatSoles(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

export function buildWhatsappUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const full = digits.startsWith('51') ? digits : `51${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}
