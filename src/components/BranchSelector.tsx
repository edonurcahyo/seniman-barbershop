// components/BranchSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Clock, Phone, Star } from 'lucide-react';
import { useBranch } from '@/context/BranchContext';
import { branches } from '@/config/branches';

const BranchSelector = () => {
  const { currentBranch, setCurrentBranch } = useBranch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler untuk memilih cabang
  const handleBranchSelect = (branch: typeof branches[0]) => {
    setCurrentBranch(branch);
    setIsOpen(false);
    
    // Optional: Tampilkan notifikasi sukses
    console.log(`Cabang berubah ke: ${branch.name}`);
  };

  // Format jam operasional untuk ditampilkan di tooltip/dropdown
  const getTodayHours = (branch: typeof branches[0]) => {
    const today = new Date().getDay();
    // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    if (today === 0) {
      return `${branch.operationalHours.sunday.open} - ${branch.operationalHours.sunday.close}`;
    } else if (today === 6) {
      return `${branch.operationalHours.saturday.open} - ${branch.operationalHours.saturday.close}`;
    } else {
      return `${branch.operationalHours.monday_friday.open} - ${branch.operationalHours.monday_friday.close}`;
    }
  };

  // Cek apakah cabang buka sekarang
  const isBranchOpen = (branch: typeof branches[0]) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;
    
    const today = now.getDay();
    let openTime, closeTime;
    
    if (today === 0) {
      openTime = branch.operationalHours.sunday.open;
      closeTime = branch.operationalHours.sunday.close;
    } else if (today === 6) {
      openTime = branch.operationalHours.saturday.open;
      closeTime = branch.operationalHours.saturday.close;
    } else {
      openTime = branch.operationalHours.monday_friday.open;
      closeTime = branch.operationalHours.monday_friday.close;
    }
    
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openTimeValue = openHour + (openMinute || 0) / 60;
    const closeTimeValue = closeHour + (closeMinute || 0) / 60;
    
    return currentTime >= openTimeValue && currentTime < closeTimeValue;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Pemilih Cabang */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-barber-cream hover:bg-barber-gold/10 transition-all duration-200 border border-barber-gold/20"
        aria-label="Pilih cabang"
        aria-expanded={isOpen}
      >
        <MapPin className="w-4 h-4 text-barber-gold" />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {currentBranch.shortName}
        </span>
        <span className="text-sm font-medium text-gray-700 sm:hidden">
          Cabang
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-barber-brown to-barber-brown/90 px-4 py-3">
            <h3 className="text-white font-semibold text-sm">Pilih Cabang</h3>
            <p className="text-white/80 text-xs mt-1">Tersedia 2 cabang untuk Anda</p>
          </div>

          {/* Daftar Cabang */}
          <div className="max-h-96 overflow-y-auto">
            {branches.map((branch) => {
              const isActive = currentBranch.id === branch.id;
              const isOpenNow = isBranchOpen(branch);
              const todayHours = getTodayHours(branch);
              
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`w-full text-left px-4 py-3 transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    isActive ? 'bg-barber-gold/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon & Status */}
                    <div className="flex-shrink-0 mt-1">
                      {isActive ? (
                        <div className="w-5 h-5 rounded-full bg-barber-gold flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>

                    {/* Informasi Cabang */}
                    <div className="flex-1 min-w-0">
                      {/* Nama Cabang & Rating */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {branch.shortName}
                        </h4>
                        {branch.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {branch.rating} ({branch.totalReviews})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Alamat */}
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {branch.address}
                      </p>

                      {/* Jam Operasional & Status */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {todayHours}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            isOpenNow ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                          }`} />
                          <span className={`text-xs ${
                            isOpenNow ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isOpenNow ? 'Buka' : 'Tutup'}
                          </span>
                        </div>
                      </div>

                      {/* Fitur & Fasilitas (optional) */}
                      {branch.features && branch.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {branch.features.slice(0, 2).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {branch.features.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{branch.features.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Badge Premium (untuk cabang Taman Asri) */}
                      {branch.id === '2' && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-medium">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Telepon (quick action) */}
                    <div className="flex-shrink-0">
                      <a
                        href={`tel:${branch.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full hover:bg-barber-gold/10 transition-colors"
                        aria-label={`Telepon ${branch.shortName}`}
                      >
                        <Phone className="w-4 h-4 text-barber-gold" />
                      </a>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer dengan Link Maps */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <a
              href={currentBranch.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-barber-brown hover:text-barber-gold transition-colors w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin className="w-4 h-4" />
              <span>Lihat semua cabang di Google Maps</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;