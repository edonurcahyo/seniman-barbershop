// context/BranchContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============ TIPE DATA ============

// Tipe data untuk layanan
export interface BranchService {
  id: number;
  title: string;
  basePrice: number;
  description: string;
  duration: string;
  image: string;
  category?: string;
  exclusiveTo?: string; // Opsional: hanya tersedia di cabang tertentu
}

// Tipe data untuk cabang
export interface Branch {
  id: string;
  code: string;
  name: string;
  shortName: string;
  alias: string;
  
  // Alamat & Kontak
  address: string;
  fullAddress: string;
  postalCode?: string;
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
  
  // Konten Hero
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  
  // Konten About
  aboutDescription: string;
  aboutImage?: string;
  aboutHighlights?: string[];
  
  // Harga
  priceMultiplier: number;
  taxPercentage?: number;
  
  // Layanan Eksklusif
  exclusiveServices?: string[];
  
  // Tema
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  
  // Metadata
  isActive: boolean;
  openingDate?: string;
  features?: string[];
  gallery?: Array<{ id: number; image: string; title: string; description?: string }>;
  rating?: number;
  totalReviews?: number;
  coordinates?: { lat: number; lng: number };
}

// Interface untuk Context
interface BranchContextType {
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
  branches: Branch[];
  formatPrice: (basePrice: number) => string;
}

interface BranchProviderProps {
  children: ReactNode;
}

// ============ DATA STATIS ============

// Data layanan dasar
export const baseServices: BranchService[] = [
  {
    id: 1,
    title: 'Potong Rambut',
    basePrice: 40000,
    description: 'Ubah penampilan Anda dengan potongan rambut segar yang disesuaikan dengan gaya Anda.',
    duration: '30 menit',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Basic'
  },
  {
    id: 2,
    title: 'Rapihkan Jenggot',
    basePrice: 20000,
    description: 'Pembentukan dan penataan jenggot oleh ahli untuk meningkatkan penampilan Anda.',
    duration: '20 menit',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
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
    exclusiveTo: '2' // hanya di cabang Taman Asri (id: 2)
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

// Data kedua cabang
export const branches: Branch[] = [
  {
    id: '1',
    code: 'RKT',
    name: 'Seniman Barbershop - Rungkut',
    shortName: 'Rungkut',
    alias: 'Rungkut',
    
    address: 'Jl. Rungkut Madya No.29, Medokan Ayu',
    fullAddress: 'Jl. Rungkut Madya No.29, Medokan Ayu, Surabaya, Jawa Timur 60295',
    postalCode: '60295',
    phone: '(031) 1234-5678',
    email: 'rungkut@senimanbarbershop.com',
    mapsUrl: 'https://maps.google.com/?q=Jl.+Rungkut+Madya+No.29,+Medokan+Ayu,+Surabaya',
    
    operationalHours: {
      monday_friday: { open: '09:00', close: '19:00' },
      saturday: { open: '10:00', close: '18:00' },
      sunday: { open: '10:00', close: '16:00' }
    },
    
    heroTitle: 'Rancang Gaya Anda di Rungkut',
    heroSubtitle: 'Nikmati layanan perawatan premium di Seniman Barbershop cabang Rungkut. Tempat gaya bertemu tradisi.',
    
    aboutDescription: 'Di Barbershop Seniman cabang Rungkut, kami menggabungkan seni tradisional dengan teknik modern untuk memberikan pengalaman grooming yang tak tertandingi. Dengan tim barber berpengalaman, kami berkomitmen untuk membantu Anda menemukan gaya yang sempurna, menciptakan penampilan yang tidak hanya menarik tetapi juga mencerminkan kepribadian Anda.',
    aboutHighlights: [
      'Barber profesional dan berpengalaman',
      'Area parkir luas',
      'Pendingin ruangan',
      'WiFi gratis'
    ],
    
    priceMultiplier: 1.0,
    taxPercentage: 10,
    
    exclusiveServices: ['Hair Spa Basic'],
    
    theme: {
      primary: '#C6A43F',
      secondary: '#4A2C2A',
      accent: '#8B7355',
      background: '#F5F5DC'
    },
    
    isActive: true,
    openingDate: '2018-03-15',
    features: ['Parkir Luas', 'AC', 'WiFi', 'Ruangan Bersih'],
    rating: 4.8,
    totalReviews: 342,
    coordinates: { lat: -7.2987654, lng: 112.7654321 }
  },
  {
    id: '2',
    code: 'TAS',
    name: 'Seniman Barbershop - Taman Asri',
    shortName: 'Taman Asri',
    alias: 'Taman Asri',
    
    address: 'Jl. Taman Asri No.146, Pondok Tjandra Indah',
    fullAddress: 'Jl. Taman Asri No.146, Pondok Tjandra Indah, Surabaya, Jawa Timur 60294',
    postalCode: '60294',
    phone: '(031) 8765-4321',
    alternativePhone: '0812-9876-5432',
    email: 'tamanasri@senimanbarbershop.com',
    mapsUrl: 'https://maps.google.com/?q=Jl.+Taman+Asri+No.146,+Pondok+Tjandra+Indah,+Surabaya',
    
    operationalHours: {
      monday_friday: { open: '08:30', close: '20:00' },
      saturday: { open: '09:00', close: '19:00' },
      sunday: { open: '09:00', close: '17:00' },
      holiday: { open: '10:00', close: '16:00', note: 'Jam operasional khusus hari libur nasional' }
    },
    
    heroTitle: 'Tampil Gaya di Taman Asri',
    heroSubtitle: 'Pengalaman grooming eksklusif di Seniman Barbershop cabang Taman Asri. Kenyamanan dan gaya dalam satu tempat.',
    
    aboutDescription: 'Seniman Barbershop cabang Taman Asri hadir dengan konsep modern dan suasana yang lebih nyaman. Kami menghadirkan barber-barber terbaik yang siap memberikan layanan grooming terbaik untuk Anda. Dari potongan rambut klasik hingga gaya modern, semua kami kerjakan dengan penuh dedikasi dan keahlian.',
    aboutHighlights: [
      'Barber tersertifikasi internasional',
      'Area parkir VIP',
      'Ruangan premium dengan AC',
      'WiFi kecepatan tinggi',
      'Minuman gratis',
      'Majalah & hiburan'
    ],
    
    priceMultiplier: 1.1,
    taxPercentage: 10,
    
    exclusiveServices: ['Hair Tattoo', 'Royal Shave', 'Hair Spa Premium'],
    
    theme: {
      primary: '#D4AF37',
      secondary: '#5C3A2E',
      accent: '#9B7B5C',
      background: '#FFF8F0'
    },
    
    isActive: true,
    openingDate: '2021-11-20',
    features: ['Parkir VIP', 'AC Premium', 'WiFi Cepat', 'Minuman Gratis', 'Area Lounge', 'TV'],
    rating: 4.9,
    totalReviews: 187,
    coordinates: { lat: -7.2876543, lng: 112.7234567 }
  }
];

// ============ CREATE CONTEXT ============

const BranchContext = createContext<BranchContextType | undefined>(undefined);

// ============ PROVIDER COMPONENT ============

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [currentBranch, setCurrentBranch] = useState<Branch>(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (savedBranch) {
      try {
        const parsed = JSON.parse(savedBranch);
        const foundBranch = branches.find(b => b.id === parsed.id);
        if (foundBranch) return foundBranch;
      } catch (error) {
        console.error('Error parsing saved branch:', error);
      }
    }
    return branches[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedBranch', JSON.stringify(currentBranch));
  }, [currentBranch]);

  const formatPrice = (basePrice: number): string => {
    const multiplier = currentBranch.priceMultiplier || 1.0;
    const finalPrice = Math.round(basePrice * multiplier);
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(finalPrice);
  };

  const value = {
    currentBranch,
    setCurrentBranch,
    branches,
    formatPrice
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

// ============ CUSTOM HOOK ============

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

// ============ HELPER FUNCTIONS ============

export const getBranchById = (id: string): Branch | undefined => {
  return branches.find(branch => branch.id === id);
};

export const getBranchByCode = (code: string): Branch | undefined => {
  return branches.find(branch => branch.code === code);
};

export const formatPriceByBranch = (basePrice: number, branch: Branch): string => {
  const finalPrice = Math.round(basePrice * branch.priceMultiplier);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(finalPrice);
};

export const getAvailableServices = (branchId: string): BranchService[] => {
  const branch = getBranchById(branchId);
  if (!branch) return baseServices;
  
  return baseServices.filter(service => {
    if (service.exclusiveTo && service.exclusiveTo !== branchId) {
      return false;
    }
    return true;
  });
};

export const getOperationalHoursArray = (branch: Branch) => {
  return [
    { day: 'Senin - Jumat', hours: `${branch.operationalHours.monday_friday.open} - ${branch.operationalHours.monday_friday.close}` },
    { day: 'Sabtu', hours: `${branch.operationalHours.saturday.open} - ${branch.operationalHours.saturday.close}` },
    { day: 'Minggu', hours: `${branch.operationalHours.sunday.open} - ${branch.operationalHours.sunday.close}` }
  ];
};