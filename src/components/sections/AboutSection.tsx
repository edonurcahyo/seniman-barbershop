import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';

const AboutSection = () => {
  const { currentBranch } = useBranch();

  // Daftar keunggulan/fitur cabang
  const highlights = currentBranch.aboutHighlights || [
    'Barber profesional dan berpengalaman',
    'Produk berkualitas premium',
    'Layanan terpersonalisasi',
    'Lingkungan nyaman dan bersih'
  ];

  // Gambar berbeda per cabang (opsional)
  const branchImages = {
    '1': [ // Rungkut
      'https://images.unsplash.com/photo-1587270613291-b5c7042fc104?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1677444546739-21b8aad351d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://media.istockphoto.com/id/1244833615/photo/barbershop-working-place-interior-3d-illustration.webp?a=1&b=1&s=612x612&w=0&k=20&c=-Mnbcti1uLomLNUNX97ZpOUh-ulAUneih1ii39O8_tU='
    ],
    '2': [ // Taman Asri - gambar lebih premium
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };

  const currentImages = branchImages[currentBranch.id as keyof typeof branchImages] || branchImages['1'];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Kolom Kiri - Teks */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tentang {currentBranch.name}
            </h2>
            
            {/* Deskripsi dinamis per cabang */}
            <p className="text-gray-600 mb-6">
              {currentBranch.aboutDescription}
            </p>
            
            {/* Informasi Lokasi */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-barber-brown mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lokasi Kami
              </h3>
              <p className="text-gray-700">{currentBranch.fullAddress}</p>
              <a 
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-barber-gold text-sm mt-2 inline-block hover:underline"
              >
                Buka di Google Maps →
              </a>
            </div>

            {/* Keunggulan Cabang */}
            <div className="mb-6">
              <h3 className="font-semibold text-barber-brown mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Keunggulan {currentBranch.shortName}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informasi Kontak Cepat */}
            <div className="flex flex-wrap gap-4 mb-6">
              <a 
                href={`tel:${currentBranch.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-barber-gold/10 rounded-lg hover:bg-barber-gold/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">{currentBranch.phone}</span>
              </a>
              <a 
                href={`mailto:${currentBranch.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-barber-gold/10 rounded-lg hover:bg-barber-gold/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Email</span>
              </a>
            </div>

            <Link to="/about">
              <Button variant="outline" className="border-barber-brown text-barber-brown hover:bg-barber-brown hover:text-white">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>

          {/* Kolom Kanan - Galeri Gambar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src={currentImages[0]} 
                alt={`${currentBranch.shortName} interior`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg mt-8 shadow-md hover:shadow-xl transition-shadow">
              <img 
                src={currentImages[1]} 
                alt={`${currentBranch.shortName} services`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src={currentImages[2]} 
                alt={`${currentBranch.shortName} haircut`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg mt-8 shadow-md hover:shadow-xl transition-shadow">
              <img 
                src={currentImages[3]} 
                alt={`${currentBranch.shortName} detail`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Jam Operasional Section (ditambahkan di bawah) */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-8">Jam Operasional {currentBranch.shortName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-barber-brown">Senin - Jumat</p>
              <p className="text-gray-600">{currentBranch.operationalHours.monday_friday.open} - {currentBranch.operationalHours.monday_friday.close}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-barber-brown">Sabtu</p>
              <p className="text-gray-600">{currentBranch.operationalHours.saturday.open} - {currentBranch.operationalHours.saturday.close}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-barber-brown">Minggu</p>
              <p className="text-gray-600">{currentBranch.operationalHours.sunday.open} - {currentBranch.operationalHours.sunday.close}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;