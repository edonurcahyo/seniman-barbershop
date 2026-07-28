import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';
import { MapPin, Clock,Scissors, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const { currentBranch } = useBranch();

  return (
    <section
      className="hero-section min-h-[60vh] md:min-h-[80vh] flex items-center justify-center text-white relative"
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
      {/* Overlay dengan gradasi lebih halus */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge kecil di atas */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-barber-gold/20 backdrop-blur-sm rounded-full border border-barber-gold/30">
          <Scissors className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold" />
          <span className="text-xs md:text-sm font-medium text-barber-gold tracking-wider">
            {currentBranch.shortName}
          </span>
        </div> */}

        {/* Title - Responsive font size */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 animate-fade-in leading-tight">
          {currentBranch.heroTitle}
        </h1>

        {/* Subtitle - Responsive font size */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto animate-slide-up px-4 text-white/90">
          {currentBranch.heroSubtitle}
        </p>

        {/* Informasi tambahan - Stack di mobile, lebih rapi */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8 text-xs sm:text-sm text-white/80">
          <div className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full sm:bg-transparent sm:px-0">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-barber-gold" />
            <span className="truncate max-w-[180px] sm:max-w-none">{currentBranch.address}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full sm:bg-transparent sm:px-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-barber-gold" />
            <span>
              {currentBranch.operationalHours.monday_friday.open} - {currentBranch.operationalHours.monday_friday.close}
            </span>
          </div>
        </div>

        {/* CTA Buttons - Full width di mobile dengan efek */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-0">
          <Link to="/booking" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold rounded-xl shadow-lg shadow-barber-gold/30 hover:shadow-xl hover:shadow-barber-gold/40 transform transition-all duration-300 hover:scale-105 group">
              Pesan Sekarang
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/services" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg border-2 border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black rounded-xl transform transition-all duration-300 hover:scale-105">
              Lihat Layanan
            </Button>
          </Link>
        </div>

        {/* Indikator scroll - hanya di desktop */}
        {/* <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;