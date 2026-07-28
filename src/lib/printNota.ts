// src/lib/printNota.ts - TOMBOL DI BAWAH NOTA

export const printNota = () => {
  const printContent = document.getElementById('nota-pemesanan');
  if (!printContent) {
    alert('Data nota tidak ditemukan. Silakan coba lagi.');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=500,height=800,scrollbars=yes');
  
  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk mencetak nota.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Nota Pemesanan - Seniman Barbershop</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          #nota-pemesanan {
            max-width: 420px;
            width: 100%;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          .no-print {
            text-align: center;
            padding: 10px 0;
          }
          .no-print button {
            padding: 12px 30px;
            margin: 0 6px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-print {
            background: #C6A43F;
            color: #000;
          }
          .btn-print:hover {
            background: #b3932a;
            transform: scale(1.02);
          }
          .btn-close {
            background: #e0e0e0;
            color: #333;
          }
          .btn-close:hover {
            background: #ccc;
          }
          @media print {
            body { 
              background: #fff; 
              padding: 0;
            }
            #nota-pemesanan { 
              border: none; 
              box-shadow: none; 
              border-radius: 0;
              max-width: 100%;
              margin-bottom: 0;
            }
            .no-print { display: none; }
          }
          @media (max-width: 480px) {
            body { padding: 10px; }
            #nota-pemesanan { border-radius: 4px; }
            .no-print button { 
              padding: 10px 20px; 
              font-size: 13px; 
              width: 100%;
              margin: 4px 0;
            }
            .no-print { 
              display: flex; 
              flex-direction: column; 
              width: 100%;
              gap: 6px;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">🖨️ Cetak Nota</button>
          <button class="btn-close" onclick="window.close()">✕ Tutup</button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};