import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';

const HeroSection = () => {
  const { currentBranch } = useBranch();

  // Optional: Background image berbeda per cabang
  const getHeroBackground = () => {
    if (currentBranch.id === '2') {
      // Background untuk cabang Taman Asri (premium)
      return 'bg-gradient-to-r from-black/70 to-black/50 bg-cover bg-center';
    }
    // Background default untuk Rungkut
    return 'bg-gradient-to-r from-black/60 to-black/40 bg-cover bg-center';
  };

  return (
    <section 
      className={`hero-section min-h-[80vh] flex items-center justify-center text-white relative ${getHeroBackground()}`}
      style={{
        backgroundImage: `url(${
          currentBranch.id === '2' 
            ? 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            : 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay untuk membuat teks lebih terbaca */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Title dinamis berdasarkan cabang */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {currentBranch.heroTitle}
        </h1>
        
        {/* Subtitle dinamis berdasarkan cabang */}
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-slide-up">
          {currentBranch.heroSubtitle}
        </p>
        
        {/* Informasi tambahan: lokasi dan jam buka (opsional) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 text-sm text-white/90">
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{currentBranch.address}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Buka: {currentBranch.operationalHours.monday_friday.open} - {currentBranch.operationalHours.monday_friday.close}
            </span>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/booking">
            <Button className="px-8 py-6 text-lg bg-barber-gold hover:bg-barber-gold/90 text-black transform transition-all duration-300 hover:scale-105">
              Pesan Sekarang
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10 transform transition-all duration-300 hover:scale-105">
              Lihat Layanan
            </Button>
          </Link>
        </div>
        
        {/* Badge untuk cabang premium (Taman Asri) */}
        {currentBranch.id === '2' && (
          <div className="mt-6 inline-block">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-semibold rounded-full">
              ⭐ Cabang Premium ⭐
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;