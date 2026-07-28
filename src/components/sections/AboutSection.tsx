import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Award, 
  Shield,
  Users,
  Scissors,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const AboutSection = () => {
  const { currentBranch } = useBranch();

  const highlights = currentBranch.aboutHighlights || [
    'Barber profesional dan berpengalaman',
    'Produk berkualitas premium',
    'Layanan terpersonalisasi',
    'Lingkungan nyaman dan bersih'
  ];

  // Ikon untuk keunggulan
  const highlightIcons = [
    <Users className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />,
    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />,
    <Scissors className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />,
    <Shield className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />
  ];

  const branchImages = {
    '1': [
      'https://images.unsplash.com/photo-1587270613291-b5c7042fc104?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1677444546739-21b8aad351d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://media.istockphoto.com/id/1244833615/photo/barbershop-working-place-interior-3d-illustration.webp?a=1&b=1&s=612x612&w=0&k=20&c=-Mnbcti1uLomLNUNX97ZpOUh-ulAUneih1ii39O8_tU='
    ],
    '2': [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };

  const currentImages = branchImages[currentBranch.id as keyof typeof branchImages] || branchImages['1'];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-barber-gold/10 rounded-full border border-barber-gold/20 mb-3 md:mb-4">
            <Scissors className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold" />
            <span className="text-xs md:text-sm font-medium text-barber-gold">
              Tentang Kami
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Tentang {currentBranch.name}
          </h2>
          
          <div className="w-16 h-1 bg-barber-gold mx-auto mt-3 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Kolom Kiri - Teks */}
          <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
            {/* Deskripsi */}
            <div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {currentBranch.aboutDescription}
              </p>
            </div>

            {/* Informasi Lokasi - Card lebih menarik */}
            <div className="bg-gradient-to-br from-gray-50 to-amber-50/50 p-4 md:p-5 rounded-2xl border border-amber-100/50 shadow-sm">
              <h3 className="font-semibold text-barber-brown mb-3 flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />
                Lokasi Kami
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-2">
                {currentBranch.fullAddress}
              </p>
              <a
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-barber-gold text-xs md:text-sm font-medium hover:underline min-h-[44px] py-2 px-1 -mx-1"
              >
                Buka di Google Maps
                <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </a>
            </div>

            {/* Keunggulan Cabang - Grid lebih rapi */}
            <div>
              <h3 className="font-semibold text-barber-brown mb-3 flex items-center gap-2 text-sm md:text-base">
                <Award className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0" />
                Keunggulan {currentBranch.shortName}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {highlights.map((highlight, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2.5 bg-white p-2.5 md:p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {highlightIcons[index % highlightIcons.length]}
                    <span className="text-xs md:text-sm text-gray-700 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kontak Cepat - Card berwarna */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${currentBranch.phone}`}
                className="flex items-center gap-2 px-4 md:px-5 py-3 md:py-3.5 bg-barber-gold/10 hover:bg-barber-gold/20 rounded-xl transition-all duration-300 flex-1 min-w-[120px] justify-center group"
              >
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-medium text-gray-700">{currentBranch.phone}</span>
              </a>
              <a
                href={`mailto:${currentBranch.email}`}
                className="flex items-center gap-2 px-4 md:px-5 py-3 md:py-3.5 bg-barber-gold/10 hover:bg-barber-gold/20 rounded-xl transition-all duration-300 flex-1 min-w-[120px] justify-center group"
              >
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-barber-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Email</span>
              </a>
            </div>

            {/* Tombol Pelajari Lebih Lanjut */}
            {/* <div className="pt-2">
              <Link to="/about">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-barber-brown text-barber-brown hover:bg-barber-brown hover:text-white text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 group"
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div> */}
          </div>

          {/* Kolom Kanan - Galeri Gambar - Responsive + Lazy Load */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {/* Gambar 1 - Full width di grid */}
              <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={currentImages[0]}
                  alt={`${currentBranch.shortName} interior`}
                  loading="eager"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Gambar 2 */}
              <div className="aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={currentImages[1]}
                  alt={`${currentBranch.shortName} services`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Gambar 3 */}
              <div className="aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={currentImages[2]}
                  alt={`${currentBranch.shortName} haircut`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Gambar 4 - Full width di grid */}
              <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={currentImages[3]}
                  alt={`${currentBranch.shortName} detail`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jam Operasional - Card lebih menarik */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-200">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              🕐 Jam Operasional
            </h3>
            <p className="text-sm text-gray-500 mt-1">{currentBranch.shortName}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
            {/* Senin - Jumat */}
            <div className="text-center p-4 md:p-5 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-barber-gold" />
                <p className="font-semibold text-barber-brown text-sm md:text-base">Senin - Jumat</p>
              </div>
              <p className="text-sm md:text-base text-gray-700 font-medium">
                {currentBranch.operationalHours.monday_friday.open} - {currentBranch.operationalHours.monday_friday.close}
              </p>
            </div>
            
            {/* Sabtu */}
            <div className="text-center p-4 md:p-5 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-barber-gold" />
                <p className="font-semibold text-barber-brown text-sm md:text-base">Sabtu</p>
              </div>
              <p className="text-sm md:text-base text-gray-700 font-medium">
                {currentBranch.operationalHours.saturday.open} - {currentBranch.operationalHours.saturday.close}
              </p>
            </div>
            
            {/* Minggu */}
            <div className="text-center p-4 md:p-5 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-barber-gold" />
                <p className="font-semibold text-barber-brown text-sm md:text-base">Minggu</p>
              </div>
              <p className="text-sm md:text-base text-gray-700 font-medium">
                {currentBranch.operationalHours.sunday.open} - {currentBranch.operationalHours.sunday.close}
              </p>
            </div>
          </div>

          {/* Status Buka/Tutup */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-green-700 font-medium">
                {new Date().getDay() === 0 ? 'Minggu' : 
                 new Date().getDay() === 6 ? 'Sabtu' : 'Hari Kerja'} — 
                Buka Sekarang
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;