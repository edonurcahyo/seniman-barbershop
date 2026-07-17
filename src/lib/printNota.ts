// src/lib/printNota.ts

export const printNota = () => {
  const printContent = document.getElementById('nota-pemesanan');
  if (!printContent) {
    alert('Data nota tidak ditemukan. Silakan coba lagi.');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=500,height=600,scrollbars=yes');
  
  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk mencetak nota.');
    return;
  }
  
  // Ambil style dari halaman utama
  const styles = document.querySelector('style')?.innerHTML || '';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Nota Pemesanan - Seniman Barbershop</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            padding: 20px; 
            max-width: 400px; 
            margin: 0 auto; 
            background: #fff;
          }
          .no-print { 
            text-align: center; 
            margin-top: 20px; 
          }
          .no-print button {
            padding: 10px 20px;
            margin: 0 5px;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
            font-family: Arial, sans-serif;
          }
          .btn-print {
            background: #C6A43F;
            color: black;
          }
          .btn-print:hover {
            background: #b3932a;
          }
          .btn-close {
            background: #ccc;
            color: #333;
          }
          .btn-close:hover {
            background: #bbb;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; margin: 0; }
            #nota-pemesanan { 
              max-width: 100%; 
              padding: 15px;
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
          // Auto print setelah dimuat
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};