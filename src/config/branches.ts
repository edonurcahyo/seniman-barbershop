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
// src/config/branches.ts - UPDATE baseServices
export const baseServices: BranchService[] = [
  {
    id: 1,
    title: 'Bald Cut',
    basePrice: 45000,
    description: 'Potongan rambut model bald cut yang rapi, bersih, dan modern. Cocok untuk tampilan yang tegas dan maskulin.',
    duration: '30 menit',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Haircut'
  },
  {
    id: 2,
    title: 'Haircut and Wash',
    basePrice: 40000,
    description: 'Potong rambut plus cuci rambut dengan pijatan ringan untuk relaksasi. Hasil rambut bersih, wangi, dan rapi.',
    duration: '40 menit',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Haircut'
  },
  {
    id: 3,
    title: 'Kids Haircut',
    basePrice: 30000,
    description: 'Potong rambut khusus anak dengan suasana menyenangkan dan barber yang ramah. Aman dan nyaman untuk si kecil.',
    duration: '25 menit',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Haircut'
  },
  {
    id: 4,
    title: 'Shaving',
    basePrice: 25000,
    description: 'Cukur jenggot atau kumis dengan handuk panas dan pisau cukur tajam. Hasil bersih tanpa iritasi.',
    duration: '20 menit',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Grooming'
  },
  {
    id: 5,
    title: 'Toning',
    basePrice: 50000,
    description: 'Pewarnaan rambut dengan teknik toning untuk hasil warna natural dan merata. Cocok untuk refreshing warna rambut.',
    duration: '60 menit',
    image: 'https://media.istockphoto.com/id/1182128730/photo/hairdresser-hand-in-black-gloves-paints-the-womans-hair-in-a-pink-color.webp?a=1&b=1&s=612x612&w=0&k=20&c=mVxgN3ejZb51InyKsTLENVePhhyEjlndVaowyF9N3WY=',
    category: 'Color'
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
    mapsUrl: 'https://maps.app.goo.gl/ckpsKfaaWgCLJjyi9',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.123456789!2d112.7654321!3d-7.2987654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTcnNTUuNSJTIDExMsKwNDUnNTYuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid',
    
    // Jam Operasional
    operationalHours: {
      monday_friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
      holiday: { open: '10:00', close: '22:00', note: 'Jam operasional khusus hari libur nasional' }
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
    totalReviews: 137,
    
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
    mapsUrl: 'https://maps.app.goo.gl/VCrFrW6xw85syp8A7',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.987654321!2d112.7234567!3d-7.2876543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTcnMTUuNSJTIDExMsKwNDMnMjEuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid',
    
    // Jam Operasional (lebih panjang)
    operationalHours: {
      monday_friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
      // holiday: { open: '10:00', close: '16:00', note: 'Jam operasional khusus hari libur nasional' }
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
    rating: 4.5,
    totalReviews: 67,
    
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