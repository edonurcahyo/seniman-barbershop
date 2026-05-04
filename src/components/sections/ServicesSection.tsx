// src/components/sections/ServicesSection.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';
import { useBranch } from '@/context/BranchContext';
import axiosInstance from '@/lib/axios';

interface ServiceFromAPI {
  id_layanan: number;
  kode_layanan: string;
  nama_layanan: string;
  harga: number;
  durasi: number;
  deskripsi: string;
  status: string;
  gambar: string | null;
}

const ServicesSection = () => {
  const { currentBranch, formatPrice } = useBranch();
  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get('/layanan');
      let servicesData = [];
      if (response.data && response.data.data) {
        servicesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      }
      // Filter hanya yang status aktif
      const activeServices = servicesData.filter((s: ServiceFromAPI) => s.status === 'aktif');
      setServices(activeServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (gambar: string | null) => {
    if (!gambar) return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    if (gambar.startsWith('http')) return gambar;
    return `http://127.0.0.1:8000/storage/${gambar}`;
  };

  // Hanya tampilkan 3 layanan pertama di homepage
  const displayServices = services.slice(0, 3);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat layanan...</p>
        </div>
      </section>
    );
  }

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
            <ServiceCard 
              key={service.id_layanan}
              title={service.nama_layanan}
              price={formatPrice(service.harga)}
              description={service.deskripsi || 'Nikmati layanan terbaik dari barber profesional kami.'}
              duration={`${service.durasi} menit`}
              image={getImageUrl(service.gambar)}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/services">
            <Button className="bg-barber-brown hover:bg-barber-brown/90">
              Lihat Semua Layanan
            </Button>
          </Link>
        </div>

        {/* Informasi tambahan */}
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