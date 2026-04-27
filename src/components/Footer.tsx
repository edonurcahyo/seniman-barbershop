import React from 'react';
import { Link } from 'react-router-dom';
import { useBranch } from '@/context/BranchContext';

const Footer = () => {
  const { currentBranch } = useBranch();

  // Format jam operasional untuk ditampilkan
  const operationalHoursList = [
    { days: 'Senin - Jumat', hours: `${currentBranch.operationalHours.monday_friday.open} - ${currentBranch.operationalHours.monday_friday.close}` },
    { days: 'Sabtu', hours: `${currentBranch.operationalHours.saturday.open} - ${currentBranch.operationalHours.saturday.close}` },
    { days: 'Minggu', hours: `${currentBranch.operationalHours.sunday.open} - ${currentBranch.operationalHours.sunday.close}` }
  ];

  return (
    <footer className="bg-barber-brown text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tentang */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-serif font-light text-barber-gold">Seniman</span>
              <span className="ml-1 text-2xl font-serif font-bold text-white">Barbershop</span>
            </Link>
            <p className="text-gray-300">
              Pengalaman grooming premium untuk pria modern. Barber berpengalaman, layanan berkualitas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-barber-gold transition-colors">
                {/* Ikon Facebook */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-barber-gold transition-colors">
                {/* Ikon Instagram */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h3 className="text-lg font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-300 hover:text-barber-gold transition-colors">Layanan Kami</Link></li>
              <li><Link to="/barbers" className="text-gray-300 hover:text-barber-gold transition-colors">Tim Barber</Link></li>
              <li><Link to="/booking" className="text-gray-300 hover:text-barber-gold transition-colors">Pesan Janji</Link></li>
              <li>
                <a 
                  href={currentBranch.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-barber-gold transition-colors"
                >
                  Lokasi Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Jam Operasional - DINAMIS per cabang */}
          <div>
            <h3 className="text-lg font-bold mb-4">Jam Operasional</h3>
            <ul className="space-y-2">
              {operationalHoursList.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-300">{item.days}</span>
                  <span className="text-barber-gold">{item.hours}</span>
                </li>
              ))}
              {/* Tampilkan catatan khusus jika ada (misal hari libur) */}
              {currentBranch.operationalHours.holiday && (
                <li className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Libur Nasional</span>
                  <span className="text-gray-400">{currentBranch.operationalHours.holiday.open} - {currentBranch.operationalHours.holiday.close}</span>
                </li>
              )}
            </ul>
            {/* Status Buka/Tutup sekarang */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-300">
                  {new Date().getDay() === 0 ? 'Minggu' : new Date().getDay() === 6 ? 'Sabtu' : 'Hari Kerja'} 
                  : {operationalHoursList.find((_, i) => 
                    i === (new Date().getDay() === 0 ? 2 : new Date().getDay() === 6 ? 1 : 0)
                  )?.hours || 'Buka'}
                </span>
              </div>
            </div>
          </div>

          {/* Kontak - DINAMIS per cabang */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3">
              {/* Alamat - Dinamis */}
              <li className="flex items-start text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-barber-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{currentBranch.fullAddress}</span>
              </li>
              
              {/* Telepon - Dinamis */}
              <li className="flex items-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${currentBranch.phone}`} className="hover:text-barber-gold transition-colors">
                  {currentBranch.phone}
                </a>
              </li>
              
              {/* Telepon Alternatif (jika ada) */}
              {currentBranch.alternativePhone && (
                <li className="flex items-center text-gray-300 pl-7">
                  <a href={`tel:${currentBranch.alternativePhone}`} className="text-sm hover:text-barber-gold transition-colors">
                    {currentBranch.alternativePhone}
                  </a>
                </li>
              )}
              
              {/* Email - Dinamis */}
              <li className="flex items-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${currentBranch.email}`} className="hover:text-barber-gold transition-colors">
                  {currentBranch.email}
                </a>
              </li>
            </ul>
            
            {/* Tombol Google Maps */}
            <div className="mt-4">
              <a 
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-barber-gold hover:text-barber-gold/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Hak Cipta dengan indikator cabang aktif */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Seniman Barbershop - {currentBranch.name}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Menampilkan informasi untuk cabang {currentBranch.shortName}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;