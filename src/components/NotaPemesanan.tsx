// src/components/NotaPemesanan.tsx

import React from 'react';

interface NotaPemesananProps {
  reservation: {
    kode_reservasi: string;
    nama_layanan: string;
    total_harga: number;
    tanggal: string;
    waktu: string;
    nama_cabang: string;
    cabang_alamat: string;
    pelanggan_nama?: string;
    durasi: string;
    metode_pembayaran: string;
    status: string;
  };
}

const NotaPemesanan: React.FC<NotaPemesananProps> = ({ reservation }) => {
  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusText = (status: string) => {
    if (status === 'paid' || status === 'dikonfirmasi') {
      return { text: '✓ LUNAS', color: 'text-green-700 bg-green-100' };
    } else if (status === 'pending') {
      return { text: '⏳ MENUNGGU PEMBAYARAN', color: 'text-yellow-700 bg-yellow-100' };
    } else if (status === 'cancelled' || status === 'dibatalkan') {
      return { text: '✗ DIBATALKAN', color: 'text-red-700 bg-red-100' };
    }
    return { text: status.toUpperCase(), color: 'text-gray-700 bg-gray-100' };
  };

  const statusInfo = getStatusText(reservation.status);

  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'cash': return 'Tunai';
      case 'transfer': return 'Transfer Bank';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  return (
    <div id="nota-pemesanan" className="bg-white p-6 max-w-sm mx-auto" style={{ fontFamily: 'Courier New, monospace' }}>
      {/* Kop Surat */}
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
        <h1 className="text-xl font-bold text-amber-600 tracking-wider">SENIMAN BARBERSHOP</h1>
        <p className="text-sm text-gray-600 font-semibold">{reservation.nama_cabang}</p>
        <p className="text-xs text-gray-500">{reservation.cabang_alamat}</p>
        <p className="text-xs text-gray-500">📞 (031) 1234-5678</p>
        <div className="mt-2">
          <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
            ✂️ BARBERSHOP
          </span>
        </div>
      </div>

      {/* Judul Nota */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">BUKTI PEMESANAN</h2>
        <p className="text-xs text-gray-500 mt-1">Reservasi #{reservation.kode_reservasi}</p>
      </div>

      {/* Garis Pemisah */}
      <div className="border-t border-dashed border-gray-300 mb-3"></div>

      {/* Detail Pemesanan */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tanggal</span>
          <span className="font-medium">{formatDate(reservation.tanggal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Waktu</span>
          <span className="font-medium">{reservation.waktu}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Layanan</span>
          <span className="font-medium">{reservation.nama_layanan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Durasi</span>
          <span className="font-medium">{reservation.durasi}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cabang</span>
          <span className="font-medium">{reservation.nama_cabang}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Metode Bayar</span>
          <span className="font-medium">{getPaymentMethodText(reservation.metode_pembayaran)}</span>
        </div>
        {reservation.pelanggan_nama && (
          <div className="flex justify-between">
            <span className="text-gray-600">Pelanggan</span>
            <span className="font-medium">{reservation.pelanggan_nama}</span>
          </div>
        )}
      </div>

      {/* Garis Pemisah */}
      <div className="border-t border-dashed border-gray-300 my-3"></div>

      {/* Total */}
      <div className="flex justify-between text-lg font-bold">
        <span className="text-gray-800">TOTAL</span>
        <span className="text-amber-600">{formatRupiah(reservation.total_harga)}</span>
      </div>

      {/* Status */}
      <div className="mt-3 text-center">
        <span className={`text-xs px-4 py-1.5 rounded-full font-bold ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Footer */}
      <div className="border-t border-dashed border-gray-300 mt-4 pt-4 text-center">
        <p className="text-xs font-medium text-gray-700">Terima kasih telah memesan di Seniman Barbershop</p>
        <p className="text-xs text-gray-500 mt-1">⏰ Harap datang 15 menit sebelum jadwal</p>
        <p className="text-xs text-gray-500">📱 Tunjukkan nota ini saat datang</p>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-[10px] text-gray-400">Dicetak pada: {new Date().toLocaleString('id-ID', { hour12: false })}</p>
        </div>
      </div>
    </div>
  );
};

export default NotaPemesanan;