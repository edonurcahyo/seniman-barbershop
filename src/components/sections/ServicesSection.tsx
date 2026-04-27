import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';
import { useBranch } from '@/context/BranchContext';
import { baseServices, getAvailableServices } from '@/config/branches';

const ServicesSection = () => {
  const { currentBranch, formatPrice } = useBranch();
  
  // Mendapatkan layanan yang tersedia untuk cabang ini
  const availableServices = getAvailableServices(currentBranch.id);
  
  // Menggunakan baseServices sebagai fallback jika availableServices kosong
  const servicesToShow = availableServices.length > 0 ? availableServices : baseServices;
  
  // Memformat harga berdasarkan cabang yang dipilih
  const services = servicesToShow.map(service => ({
    ...service,
    formattedPrice: formatPrice(service.basePrice),
    // Menambahkan indikator jika layanan ini exclusive untuk cabang tertentu
    isExclusive: 'exclusiveTo' in service && service.exclusiveTo === currentBranch.id
  }));

  // Filter untuk menampilkan hanya 3 layanan pertama di homepage (opsional)
  const displayServices = services.slice(0, 3);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 section-title inline-block">
            Layanan Kami di {currentBranch.shortName}
          </h2>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Kami menawarkan berbagai layanan perawatan untuk membuat Anda selalu tampil terbaik.
            {currentBranch.priceMultiplier !== 1.0 && (
              <span className="block text-sm text-barber-gold mt-2">
                *Harga untuk cabang {currentBranch.shortName} sudah termasuk biaya lokasi premium
              </span>
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <div key={service.id} className="relative">
              {service.isExclusive && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                    ✨ Eksklusif
                  </span>
                </div>
              )}
              <ServiceCard 
                title={service.title}
                price={service.formattedPrice}
                description={service.description}
                duration={service.duration}
                image={service.image}
              />
            </div>
          ))}
        </div>
        
        {/* Menampilkan pesan jika ada layanan eksklusif yang tidak ditampilkan di homepage */}
        {services.length > 3 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              + {services.length - 3} layanan lainnya tersedia
            </p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link to="/services">
            <Button className="bg-barber-brown hover:bg-barber-brown/90">
              Lihat Semua Layanan
            </Button>
          </Link>
        </div>

        {/* Informasi tambahan tentang harga (opsional) */}
        <div className="mt-16 p-4 bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Harga sudah termasuk PPN</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">Garansi kepuasan 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;