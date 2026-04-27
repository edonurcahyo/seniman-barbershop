// config/branches.ts

export interface OperationalHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface SocialMedia {
  name: string;
  url: string;
  icon: string;
}

export interface BranchGallery {
  id: number;
  image: string;
  title: string;
  description?: string;
}

export interface BranchService {
  id: number;
  title: string;
  basePrice: number; // harga dasar (akan dikalikan dengan multiplier cabang)
  description: string;
  duration: string;
  image: string;
  category?: string;
}

export interface Branch {
  id: string;
  code: string; // kode unik untuk booking reference
  name: string;
  shortName: string; // untuk tampilan di dropdown
  alias: string;
  
  // Alamat & Kontak
  address: string;
  fullAddress: string;
  postalCode: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  mapsUrl: string;
  mapsEmbedUrl?: string;
  
  // Jam Operasional
  operationalHours: {
    monday_friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
    holiday?: { open: string; close: string; note: string };
  };
  
  // Konten Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string; // gambar berbeda per cabang (opsional)
  
  // Konten About Section
  aboutDescription: string;
  aboutImage?: string;
  aboutHighlights?: string[]; // keunggulan cabang
  
  // Harga & Diskon
  priceMultiplier: number; // 1.0 = normal, 1.1 = +10%, 0.9 = -10%
  taxPercentage?: number; // pajak jika berbeda per cabang
  
  // Layanan Khusus (opsional)
  exclusiveServices?: string[]; // layanan yang hanya ada di cabang tertentu
  
  // Warna Tema (untuk kustomisasi tampilan per cabang)
  theme?: {
    primary: string;    // warna utama
    secondary: string;  // warna sekunder
    accent: string;     // warna aksen
    background: string; // warna background
  };
  
  // Metadata
  isActive: boolean;
  openingDate?: string; // tanggal pembukaan cabang
  features?: string[]; // fitur fasilitas (parkir, wifi, AC, dll)
  
  // Galeri
  gallery?: BranchGallery[];
  
  // Rating & Review
  rating?: number;
  totalReviews?: number;
  
  // Koordinat (untuk map)
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Data layanan dasar (akan digunakan di ServicesSection)
export const baseServices: BranchService[] = [
  {
    id: 1,
    title: 'Potong Rambut',
    basePrice: 40000,
    description: 'Ubah penampilan Anda dengan potongan rambut segar yang disesuaikan dengan gaya Anda.',
    duration: '30 menit',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Basic'
  },
  {
    id: 2,
    title: 'Rapihkan Jenggot',
    basePrice: 20000,
    description: 'Pembentukan dan penataan jenggot oleh ahli untuk meningkatkan penampilan Anda.',
    duration: '20 menit',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Grooming'
  },
  {
    id: 3,
    title: 'Pewarnaan Rambut',
    basePrice: 100000,
    description: 'Warna yang hidup, sentuhan ahli - pewarnaan rambut profesional dengan hasil mewah.',
    duration: '60 menit',
    image: 'https://media.istockphoto.com/id/1182128730/photo/hairdresser-hand-in-black-gloves-paints-the-womans-hair-in-a-pink-color.webp?a=1&b=1&s=612x612&w=0&k=20&c=mVxgN3ejZb51InyKsTLENVePhhyEjlndVaowyF9N3WY=',
    category: 'Color'
  },
  {
    id: 4,
    title: 'Hair Tattoo',
    basePrice: 150000,
    description: 'Desain rambut kreatif dan unik untuk tampilan yang lebih berani.',
    duration: '45 menit',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Premium',
    // exclusiveTo?: '2' // hanya di cabang Taman Asri
  },
  {
    id: 5,
    title: 'Royal Shave',
    basePrice: 85000,
    description: 'Pengalaman cukur klasik dengan handuk panas dan produk premium.',
    duration: '45 menit',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Premium'
  },
  {
    id: 6,
    title: 'Hair Spa',
    basePrice: 120000,
    description: 'Perawatan rambut intensif dengan pijat kepala relaksasi.',
    duration: '50 menit',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Spa'
  }
];

// Data lengkap kedua cabang
export const branches: Branch[] = [
  {
    id: '1',
    code: 'RKT',
    name: 'Seniman Barbershop - Rungkut',
    shortName: 'Rungkut',
    alias: 'Rungkut',
    
    // Alamat & Kontak
    address: 'Jl. Rungkut Madya No.29, Medokan Ayu',
    fullAddress: 'Jl. Rungkut Madya No.29, Medokan Ayu, Surabaya, Jawa Timur 60295',
    postalCode: '60295',
    phone: '(031) 1234-5678',
    alternativePhone: '0812-3456-7890',
    email: 'rungkut@senimanbarbershop.com',
    mapsUrl: 'https://maps.google.com/?q=Jl.+Rungkut+Madya+No.29,+Medokan+Ayu,+Surabaya',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.123456789!2d112.7654321!3d-7.2987654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTcnNTUuNSJTIDExMsKwNDUnNTYuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid',
    
    // Jam Operasional
    operationalHours: {
      monday_friday: { open: '09:00', close: '19:00' },
      saturday: { open: '10:00', close: '18:00' },
      sunday: { open: '10:00', close: '16:00' },
      holiday: { open: '10:00', close: '15:00', note: 'Jam operasional khusus hari libur nasional' }
    },
    
    // Konten Hero
    heroTitle: 'Rancang Gaya Anda di Rungkut',
    heroSubtitle: 'Nikmati layanan perawatan premium di Seniman Barbershop cabang Rungkut. Tempat gaya bertemu tradisi.',
    
    // Konten About
    aboutDescription: 'Di Barbershop Seniman cabang Rungkut, kami menggabungkan seni tradisional dengan teknik modern untuk memberikan pengalaman grooming yang tak tertandingi. Dengan tim barber berpengalaman, kami berkomitmen untuk membantu Anda menemukan gaya yang sempurna, menciptakan penampilan yang tidak hanya menarik tetapi juga mencerminkan kepribadian Anda. Lokasi strategis di pusat kota memudahkan Anda untuk mengakses layanan kami.',
    aboutHighlights: [
      'Barber profesional dan berpengalaman',
      'Area parkir luas',
      'Pendingin ruangan',
      'WiFi gratis'
    ],
    
    // Harga
    priceMultiplier: 1.0,
    taxPercentage: 10,
    
    // Layanan Khusus
    exclusiveServices: ['Hair Spa Basic'],
    
    // Tema
    theme: {
      primary: '#C6A43F',  // barber-gold
      secondary: '#4A2C2A', // barber-brown
      accent: '#8B7355',
      background: '#F5F5DC' // barber-cream
    },
    
    // Metadata
    isActive: true,
    openingDate: '2018-03-15',
    features: ['Parkir Luas', 'AC', 'WiFi', 'Ruangan Bersih'],
    
    // Rating
    rating: 4.8,
    totalReviews: 342,
    
    // Koordinat
    coordinates: {
      lat: -7.2987654,
      lng: 112.7654321
    }
  },
  {
    id: '2',
    code: 'TAS',
    name: 'Seniman Barbershop - Taman Asri',
    shortName: 'Taman Asri',
    alias: 'Taman Asri',
    
    // Alamat & Kontak
    address: 'Jl. Taman Asri No.146, Pondok Tjandra Indah',
    fullAddress: 'Jl. Taman Asri No.146, Pondok Tjandra Indah, Surabaya, Jawa Timur 60294',
    postalCode: '60294',
    phone: '(031) 8765-4321',
    alternativePhone: '0812-9876-5432',
    email: 'tamanasri@senimanbarbershop.com',
    mapsUrl: 'https://maps.google.com/?q=Jl.+Taman+Asri+No.146,+Pondok+Tjandra+Indah,+Surabaya',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.987654321!2d112.7234567!3d-7.2876543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTcnMTUuNSJTIDExMsKwNDMnMjEuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid',
    
    // Jam Operasional (lebih panjang)
    operationalHours: {
      monday_friday: { open: '08:30', close: '20:00' },
      saturday: { open: '09:00', close: '19:00' },
      sunday: { open: '09:00', close: '17:00' },
      holiday: { open: '10:00', close: '16:00', note: 'Jam operasional khusus hari libur nasional' }
    },
    
    // Konten Hero
    heroTitle: 'Tampil Gaya di Taman Asri',
    heroSubtitle: 'Pengalaman grooming eksklusif di Seniman Barbershop cabang Taman Asri. Kenyamanan dan gaya dalam satu tempat.',
    
    // Konten About
    aboutDescription: 'Seniman Barbershop cabang Taman Asri hadir dengan konsep modern dan suasana yang lebih nyaman. Kami menghadirkan barber-barber terbaik yang siap memberikan layanan grooming terbaik untuk Anda. Dari potongan rambut klasik hingga gaya modern, semua kami kerjakan dengan penuh dedikasi dan keahlian. Nikmati pengalaman grooming yang berbeda dengan fasilitas premium dan pelayanan yang lebih personal.',
    aboutHighlights: [
      'Barber tersertifikasi internasional',
      'Area parkir VIP',
      'Ruangan premium dengan AC',
      'WiFi kecepatan tinggi',
      'Minuman gratis',
      'Majalah & hiburan'
    ],
    
    // Harga (lebih mahal 10%)
    priceMultiplier: 1.1,
    taxPercentage: 10,
    
    // Layanan Khusus
    exclusiveServices: ['Hair Tattoo', 'Royal Shave', 'Hair Spa Premium'],
    
    // Tema (sedikit berbeda untuk cabang premium)
    theme: {
      primary: '#D4AF37',  // gold lebih terang
      secondary: '#5C3A2E', // brown lebih gelap
      accent: '#9B7B5C',
      background: '#FFF8F0' // cream lebih terang
    },
    
    // Metadata
    isActive: true,
    openingDate: '2021-11-20',
    features: ['Parkir VIP', 'AC Premium', 'WiFi Cepat', 'Minuman Gratis', 'Area Lounge', 'TV'],
    
    // Rating (lebih tinggi karena cabang premium)
    rating: 4.9,
    totalReviews: 187,
    
    // Koordinat
    coordinates: {
      lat: -7.2876543,
      lng: 112.7234567
    },
    
    // Galeri khusus
    gallery: [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        title: 'Interior Premium',
        description: 'Suasana modern dan nyaman'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        title: 'Tim Profesional',
        description: 'Barber berpengalaman'
      }
    ]
  }
];

// Helper function untuk mendapatkan cabang berdasarkan ID
export const getBranchById = (id: string): Branch | undefined => {
  return branches.find(branch => branch.id === id);
};

// Helper function untuk mendapatkan cabang berdasarkan kode
export const getBranchByCode = (code: string): Branch | undefined => {
  return branches.find(branch => branch.code === code);
};

// Helper function untuk format harga berdasarkan cabang
export const formatPriceByBranch = (basePrice: number, branch: Branch): string => {
  const finalPrice = Math.round(basePrice * branch.priceMultiplier);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(finalPrice);
};

// Helper function untuk mendapatkan layanan yang tersedia di cabang tertentu
export const getAvailableServices = (branchId: string): BranchService[] => {
  const branch = getBranchById(branchId);
  if (!branch) return baseServices;
  
  // Filter layanan yang exclusive untuk cabang lain
  return baseServices.filter(service => {
    // Jika service memiliki exclusiveTo dan tidak sesuai dengan branchId, exclude
    if ('exclusiveTo' in service && service.exclusiveTo !== branchId) {
      return false;
    }
    return true;
  });
};

// Data statis untuk jam operasional dalam format array (mudah untuk ditampilkan)
export const getOperationalHoursArray = (branch: Branch) => {
  return [
    { day: 'Senin - Jumat', hours: `${branch.operationalHours.monday_friday.open} - ${branch.operationalHours.monday_friday.close}` },
    { day: 'Sabtu', hours: `${branch.operationalHours.saturday.open} - ${branch.operationalHours.saturday.close}` },
    { day: 'Minggu', hours: `${branch.operationalHours.sunday.open} - ${branch.operationalHours.sunday.close}` }
  ];
};