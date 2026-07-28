// src/components/sections/ServicesSection.tsx - FULL CODE RESPONSIVE MOBILE

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';
import { useBranch } from '@/context/BranchContext';
import axiosInstance from '@/lib/axios';
import { Scissors, Sparkles, ArrowRight } from 'lucide-react';

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

  const displayServices = services.slice(0, 3);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-sm md:text-base text-gray-600">Memuat layanan...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header dengan badge */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-barber-gold/10 rounded-full mb-3 md:mb-4">
            <Scissors className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold" />
            <span className="text-xs md:text-sm font-medium text-barber-gold">Layanan Kami</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 px-4">
            Layanan di {currentBranch.shortName}
          </h2>
          <div className="w-16 h-1 bg-barber-gold mx-auto mt-3 rounded-full"></div>
          <p className="text-sm md:text-base text-gray-600 mt-4 md:mt-6 max-w-2xl mx-auto px-4">
            Kami menawarkan berbagai layanan perawatan untuk membuat Anda selalu tampil terbaik.
            {currentBranch.priceMultiplier !== 1.0 && (
              <span className="block text-xs md:text-sm text-barber-gold mt-2">
                *Harga untuk cabang {currentBranch.shortName} sudah termasuk biaya lokasi premium
              </span>
            )}
          </p>
        </div>
        
        {/* Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {displayServices.map((service, index) => (
            <div 
              key={service.id_layanan}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ServiceCard 
                title={service.nama_layanan}
                price={formatPrice(service.harga)}
                description={service.deskripsi || 'Nikmati layanan terbaik dari barber profesional kami.'}
                duration={`${service.durasi} menit`}
                image={getImageUrl(service.gambar)}
              />
            </div>
          ))}
        </div>
        
        {/* Tombol Lihat Semua */}
        <div className="text-center mt-8 md:mt-12">
          <Link to="/services">
            <Button className="bg-barber-brown hover:bg-barber-brown/90 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-xl group transition-all duration-300 hover:scale-105">
              Lihat Semua Layanan
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Informasi tambahan - Responsive dengan icon */}
        <div className="mt-10 md:mt-16 p-4 md:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Harga sudah termasuk PPN</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold" />
              <span className="text-gray-600">Garansi kepuasan 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;