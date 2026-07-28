import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight, 
  Shield, 
  Calendar, 
  RefreshCw,
  Sparkles,
  Scissors
} from 'lucide-react';

const CTASection = () => {
  const { currentBranch } = useBranch();

  const getBookingLink = () => {
    return `/booking?branch=${currentBranch.id}&branchName=${encodeURIComponent(currentBranch.shortName)}`;
  };

  const getDayName = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };

  const getTodayHours = () => {
    const day = new Date().getDay();
    if (day === 0) {
      return `${currentBranch.operationalHours.sunday.open} - ${currentBranch.operationalHours.sunday.close}`;
    } else if (day === 6) {
      return `${currentBranch.operationalHours.saturday.open} - ${currentBranch.operationalHours.saturday.close}`;
    } else {
      return `${currentBranch.operationalHours.monday_friday.open} - ${currentBranch.operationalHours.monday_friday.close}`;
    }
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-barber-brown via-barber-brown/95 to-barber-brown/90 text-white relative overflow-hidden">
      {/* Background dekoratif */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-barber-gold rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-barber-gold rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-[500px] md:h-[500px] bg-amber-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 md:mb-6">
          <Scissors className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold" />
          <span className="text-xs md:text-sm font-medium text-barber-gold tracking-wider">
            {currentBranch.shortName}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 px-4 leading-tight">
          Siap untuk tampilan baru di Seniman Barbershop {currentBranch.shortName}?
        </h2>

        <p className="text-sm md:text-base lg:text-lg xl:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4 text-white/90">
          Bergabunglah dengan kami di {currentBranch.name} untuk pengalaman perawatan yang tak tertandingi.
          Tim ahli kami siap membantu Anda menemukan gaya yang sempurna.
        </p>

        {/* Informasi tambahan - Card style */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-white/10">
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-xs md:text-sm truncate max-w-[120px] sm:max-w-none">{currentBranch.address}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-white/10">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-xs md:text-sm whitespace-nowrap">
              {getDayName()}: {getTodayHours()}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-0">
          <Link to={getBookingLink()} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold rounded-xl shadow-lg shadow-barber-gold/30 hover:shadow-xl hover:shadow-barber-gold/40 transform transition-all duration-300 hover:scale-105 group">
              Pesan Sekarang
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a
            href={`tel:${currentBranch.phone}`}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg border-2 border-white/80 text-white rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
          >
            <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Hubungi {currentBranch.shortName}
          </a>
        </div>

        {/* Informasi garansi - Card style lebih menarik */}
        <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-[10px] md:text-xs text-white/80">Garansi 100%</span>
          </div>
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-[10px] md:text-xs text-white/80">Booking mudah</span>
          </div>
          {/* <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-[10px] md:text-xs text-white/80">Reschedule 2 jam</span>
          </div> */}
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-barber-gold flex-shrink-0" />
            <span className="text-[10px] md:text-xs text-white/80">Premium service</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;