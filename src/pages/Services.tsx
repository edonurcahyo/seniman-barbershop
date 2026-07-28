import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

const Services = () => {
  const { currentBranch, formatPrice } = useBranch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const servicesPerPage = 6;

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

  const formattedServices = services.map(service => ({
    id: service.id_layanan,
    title: service.nama_layanan,
    price: formatPrice(service.harga),
    description: service.deskripsi || '',
    duration: `${service.durasi} menit`,
    image: service.gambar ? `http://127.0.0.1:8000/storage/${service.gambar}` : null,
    category: getCategoryFromTitle(service.nama_layanan)
  }));

  function getCategoryFromTitle(title: string): string {
    const categoryMap: { [key: string]: string } = {
      'Bald Cut': 'Haircut',
      'Haircut and Wash': 'Haircut',
      'Kids Haircut': 'Haircut',
      'Shaving': 'Grooming',
      'Toning': 'Color',
      'Royal Shave': 'Premium',
      'Hair Tattoo': 'Premium',
      'Hair Spa': 'Spa'
    };
    return categoryMap[title] || 'Haircut';
  }

  const categories = ['all', ...new Set(formattedServices.map(s => s.category).filter(Boolean))];

  const filteredServices = formattedServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getImageUrl = (gambar: string | null) => {
    if (!gambar) return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    if (gambar.startsWith('http')) return gambar;
    return `http://127.0.0.1:8000/storage/${gambar}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">Memuat layanan...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Responsive */}
        <div className="bg-gradient-to-r from-barber-brown to-barber-brown/90 text-white py-10 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4">
              Layanan Kami
            </h1>
            <p className="text-sm md:text-base lg:text-lg max-w-2xl mx-auto opacity-90 px-4">
              Temukan berbagai layanan perawatan terbaik untuk Anda di {currentBranch.shortName}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-4 py-8 md:py-12">
          {/* Filter dan Search - Stack di mobile */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari layanan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 md:pl-10 h-9 md:h-10 text-sm md:text-base"
              />
            </div>

            {/* Category Filter - Scrollable di mobile */}
            <div className="flex w-full md:w-auto overflow-x-auto gap-1.5 md:gap-2 pb-2 md:pb-0 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-barber-gold text-black'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Semua' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Info cabang */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 mb-6 md:mb-8 text-center">
            <p className="text-xs md:text-sm text-amber-700">
              📍 Menampilkan layanan untuk cabang: <span className="font-semibold">{currentBranch.shortName}</span>
              {currentBranch.priceMultiplier !== 1.0 && (
                <span className="block text-[10px] md:text-xs mt-1">*Harga untuk cabang {currentBranch.shortName} sudah termasuk biaya lokasi premium</span>
              )}
            </p>
          </div>

          {/* Jumlah layanan ditemukan */}
          <div className="mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-barber-brown">{currentServices.length}</span> dari{' '}
              <span className="font-semibold">{filteredServices.length}</span> layanan
            </p>
          </div>

          {/* Grid Layanan - Responsive */}
          {currentServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {currentServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  price={service.price}
                  description={service.description}
                  duration={service.duration}
                  image={getImageUrl(service.image)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Tidak ada layanan ditemukan</h3>
              <p className="text-sm md:text-base text-gray-500">Coba cari dengan kata kunci yang berbeda</p>
            </div>
          )}

          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mt-8 md:mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:opacity-50 text-xs md:text-sm px-2 md:px-3"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`text-xs md:text-sm min-w-[32px] md:min-w-[40px] ${
                      currentPage === pageNumber ? 'bg-barber-brown hover:bg-barber-brown/90' : ''
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="flex items-center px-1 text-xs md:text-sm text-gray-400">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50 text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          )}

          {/* CTA Booking */}
          <div className="mt-12 md:mt-16 text-center">
            <Link to="/booking">
              <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto">
                Booking Sekarang
              </Button>
            </Link>
          </div>

          {/* Informasi tambahan - Responsive */}
          <div className="mt-8 md:mt-12 p-3 md:p-4 bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Harga sudah termasuk PPN</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Garansi kepuasan 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Barber profesional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Services;