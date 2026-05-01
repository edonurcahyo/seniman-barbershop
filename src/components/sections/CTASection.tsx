import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/context/BranchContext';

const CTASection = () => {
  const { currentBranch } = useBranch();

  // Fungsi untuk membuat link booking dengan parameter cabang
  const getBookingLink = () => {
    return `/booking?branch=${currentBranch.id}&branchName=${encodeURIComponent(currentBranch.shortName)}`;
  };

  return (
    <section className="py-20 bg-barber-brown text-white relative overflow-hidden">
      {/* Background dekoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-barber-gold rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-barber-gold rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Siap untuk tampilan baru di {currentBranch.shortName}?
        </h2>
        
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Bergabunglah dengan kami di {currentBranch.name} untuk pengalaman perawatan yang tak tertandingi. 
          Tim ahli kami siap membantu Anda menemukan gaya yang sempurna.
        </p>

        {/* Informasi tambahan tentang cabang */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8 text-sm">
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{currentBranch.address}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Buka hari ini: {
              new Date().getDay() === 0 
                ? `${currentBranch.operationalHours.sunday.open} - ${currentBranch.operationalHours.sunday.close}`
                : new Date().getDay() === 6
                ? `${currentBranch.operationalHours.saturday.open} - ${currentBranch.operationalHours.saturday.close}`
                : `${currentBranch.operationalHours.monday_friday.open} - ${currentBranch.operationalHours.monday_friday.close}`
            }</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to={getBookingLink()}>
            <Button className="px-8 py-3 text-lg bg-barber-gold hover:bg-barber-gold/90 text-black transform transition-all duration-300 hover:scale-105">
              Pesan Sekarang di {currentBranch.shortName}
            </Button>
          </Link>
          <a 
            href={`tel:${currentBranch.phone}`}
            className="inline-flex items-center justify-center px-8 py-3 text-lg border-2 border-white text-white rounded-md hover:bg-white/10 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Hubungi {currentBranch.shortName}
          </a>
        </div>

        {/* Informasi garansi */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Garansi kepuasan 100%</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Booking online mudah & cepat</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 5h12M6 19h12M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
            <span>Bisa reschedule 2 jam sebelum</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;