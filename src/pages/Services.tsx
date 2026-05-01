// src/pages/Services.tsx
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

// Interface untuk data layanan dari API
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

  // Fetch services dari API
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

  // Konversi ke format ServiceCard
  const formattedServices = services.map(service => ({
    id: service.id_layanan,
    title: service.nama_layanan,
    price: formatPrice(service.harga),
    description: service.deskripsi || '',
    duration: `${service.durasi} menit`,
    image: service.gambar ? `http://127.0.0.1:8000/storage/${service.gambar}` : null,
    category: getCategoryFromTitle(service.nama_layanan)
  }));

  // Fungsi untuk menentukan kategori berdasarkan judul
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

  // Ambil daftar kategori unik
  const categories = ['all', ...new Set(formattedServices.map(s => s.category).filter(Boolean))];

  // Filter berdasarkan search dan kategori
  const filteredServices = formattedServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat layanan...</p>
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-barber-brown to-barber-brown/90 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Layanan Kami</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              Temukan berbagai layanan perawatan terbaik untuk Anda di {currentBranch.shortName}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filter dan Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari layanan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-amber-700">
              📍 Menampilkan layanan untuk cabang: <span className="font-semibold">{currentBranch.shortName}</span>
              {currentBranch.priceMultiplier !== 1.0 && (
                <span className="block text-xs mt-1">*Harga untuk cabang {currentBranch.shortName} sudah termasuk biaya lokasi premium</span>
              )}
            </p>
          </div>

          {/* Jumlah layanan ditemukan */}
          <div className="mb-6">
            <p className="text-gray-500">
              Menampilkan <span className="font-semibold text-barber-brown">{currentServices.length}</span> dari{' '}
              <span className="font-semibold">{filteredServices.length}</span> layanan
            </p>
          </div>

          {/* Grid Layanan */}
          {currentServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada layanan ditemukan</h3>
              <p className="text-gray-500">Coba cari dengan kata kunci yang berbeda</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? 'bg-barber-brown hover:bg-barber-brown/90' : ''}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* CTA Booking */}
          <div className="mt-16 text-center">
            <Link to="/booking">
              <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black px-8 py-6 text-lg">
                Booking Sekarang
              </Button>
            </Link>
          </div>

          {/* Informasi tambahan */}
          <div className="mt-12 p-4 bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
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
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Barber profesional & berpengalaman</span>
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