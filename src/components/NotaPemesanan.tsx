// src/components/NotaPemesanan.tsx - FONT LEBIH BESAR

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
    catatan?: string;
  };
}

const NotaPemesanan: React.FC<NotaPemesananProps> = ({ reservation }) => {
  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${days[date.getDay()]}, ${date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  };

  const getStatus = (status: string, metode: string) => {
    if (status === 'paid' || status === 'dikonfirmasi') {
      return { text: 'LUNAS', icon: '✅' };
    } else if (status === 'pending') {
      if (metode === 'cash') {
        return { text: 'MENUNGGU KONFIRMASI', icon: '⏳' };
      }
      return { text: 'MENUNGGU VERIFIKASI', icon: '⏳' };
    } else if (status === 'cancelled' || status === 'dibatalkan') {
      return { text: 'DIBATALKAN', icon: '❌' };
    }
    return { text: status.toUpperCase(), icon: '📌' };
  };

  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'cash': return 'TUNAI';
      case 'transfer': return 'TRANSFER BANK';
      case 'qris': return 'QRIS';
      default: return method.toUpperCase();
    }
  };

  const statusInfo = getStatus(reservation.status, reservation.metode_pembayaran);

  return (
    <div id="nota-pemesanan" style={{ 
      fontFamily: 'Courier New, monospace', 
      fontSize: '14px',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#222222',
      lineHeight: '1.8'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '14px', marginBottom: '14px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#C6A43F' }}>SENIMAN BARBERSHOP</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{reservation.cabang_alamat}</div>
      </div>

      {/* TANGGAL */}
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
        {formatDate(reservation.tanggal)} {reservation.waktu}
      </div>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* SLIP PEMBAYARAN */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>SLIP PEMBAYARAN</div>
        <div style={{ fontSize: '12px', color: '#888' }}>Kode: {reservation.kode_reservasi}</div>
      </div>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* STATUS */}
      <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
        {statusInfo.icon} {statusInfo.text}
      </div>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* DETAIL - Menggunakan TABLE */}
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 0', color: '#666', width: '50%' }}>Nama Pelanggan</td>
            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{reservation.pelanggan_nama || '-'}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#666' }}>Layanan</td>
            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{reservation.nama_layanan}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#666' }}>Durasi</td>
            <td style={{ padding: '4px 0', textAlign: 'right' }}>{reservation.durasi}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#666' }}>Metode Bayar</td>
            <td style={{ padding: '4px 0', textAlign: 'right' }}>{getPaymentMethodText(reservation.metode_pembayaran)}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#666' }}>Cabang</td>
            <td style={{ padding: '4px 0', textAlign: 'right' }}>{reservation.nama_cabang}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* TOTAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        <span>TOTAL</span>
        <span style={{ color: '#C6A43F' }}>{formatRupiah(reservation.total_harga)}</span>
      </div>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* CATATAN */}
      {reservation.catatan && (
        <>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold' }}>Catatan:</div>
            <div>{reservation.catatan}</div>
          </div>
          <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>
        </>
      )}

      {/* INFO */}
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
        <div>⏰ Harap datang 15 menit sebelum jadwal</div>
        <div>📱 Tunjukkan nota ini saat datang</div>
      </div>

      <div style={{ borderTop: '1px dashed #ddd', marginBottom: '10px' }}></div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: '#555' }}>Terima kasih telah mempercayai</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#C6A43F' }}>Seniman Barbershop</div>
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '8px' }}>
          Dicetak: {new Date().toLocaleString('id-ID', { 
            day: 'numeric', 
            month: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

    </div>
  );
};

export default NotaPemesanan;