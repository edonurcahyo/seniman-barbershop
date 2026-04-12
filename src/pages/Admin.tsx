// Admin.tsx - dengan fitur export PDF dan Excel

import React, { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, Scissors, DollarSign, Plus, Edit, Trash2, CreditCard, Wallet, Landmark, QrCode, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle, FileText, FileSpreadsheet, Download, Printer } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Untuk TypeScript, tambahkan type declaration untuk jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState('pdf');
  const transactionsTableRef = useRef<HTMLDivElement>(null);

  // Enhanced mock data dengan informasi pembayaran
  const dashboardStats = {
    totalAppointments: 156,
    todayAppointments: 12,
    totalCustomers: 89,
    monthlyRevenue: 15420000,
    pendingPayments: 8,
    completedPayments: 148,
    revenueGrowth: 15.3
  };

  // Data untuk grafik pendapatan
  const revenueData = [
    { month: 'Jan', revenue: 12500000 },
    { month: 'Feb', revenue: 14200000 },
    { month: 'Mar', revenue: 13800000 },
    { month: 'Apr', revenue: 15420000 },
    { month: 'Mei', revenue: 16200000 },
    { month: 'Jun', revenue: 17100000 },
  ];

  // Data distribusi metode pembayaran
  const paymentMethodData = [
    { name: 'Tunai', value: 45, color: '#10b981' },
    { name: 'Transfer Bank', value: 30, color: '#3b82f6' },
    { name: 'Kartu', value: 15, color: '#8b5cf6' },
    { name: 'QRIS', value: 10, color: '#f97316' },
  ];

  // Enhanced appointments dengan informasi pembayaran
  const appointments = [
    { 
      id: 1, 
      customer: 'Hendrikus', 
      service: 'Potong Rambut Klasik', 
      time: '10:00', 
      date: '2024-01-15',
      status: 'dikonfirmasi',
      paymentMethod: 'transfer',
      paymentStatus: 'lunas',
      amount: 40000
    },
    { 
      id: 2, 
      customer: 'Windah Santoso', 
      service: 'Rapihkan Jenggot', 
      time: '11:30', 
      date: '2024-01-15',
      status: 'menunggu',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      amount: 20000
    },
    { 
      id: 3, 
      customer: 'Adel Wijaya', 
      service: 'Layanan Lengkap', 
      time: '14:00', 
      date: '2024-01-14',
      status: 'selesai',
      paymentMethod: 'qris',
      paymentStatus: 'lunas',
      amount: 50000
    },
    { 
      id: 4, 
      customer: 'Budi Santoso', 
      service: 'Warna Rambut', 
      time: '15:30', 
      date: '2024-01-15',
      status: 'dikonfirmasi',
      paymentMethod: 'card',
      paymentStatus: 'lunas',
      amount: 100000
    },
    { 
      id: 5, 
      customer: 'Ahmad Fauzi', 
      service: 'Potong & Jenggot', 
      time: '16:00', 
      date: '2024-01-16',
      status: 'menunggu',
      paymentMethod: 'transfer',
      paymentStatus: 'pending',
      amount: 50000
    },
  ];

  const services = [
    { id: 1, name: 'Potong Rambut Klasik', price: 40000, duration: '30 menit', description: 'Potong rambut tradisional dengan styling', totalBookings: 89, revenue: 3560000 },
    { id: 2, name: 'Rapihkan Jenggot', price: 20000, duration: '20 menit', description: 'Perawatan dan pembentukan jenggot profesional', totalBookings: 45, revenue: 900000 },
    { id: 3, name: 'Layanan Lengkap', price: 50000, duration: '60 menit', description: 'Potong rambut, rapihkan jenggot, dan perawatan handuk panas', totalBookings: 22, revenue: 1100000 },
    { id: 4, name: 'Warna Rambut', price: 100000, duration: '60 menit', description: 'Pewarnaan rambut dengan produk berkualitas', totalBookings: 15, revenue: 1500000 },
  ];

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '(555) 123-4567', lastVisit: '2024-01-15', totalVisits: 8, totalSpent: 420000, favoriteService: 'Potong Rambut Klasik' },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '(555) 987-6543', lastVisit: '2024-01-10', totalVisits: 3, totalSpent: 150000, favoriteService: 'Rapihkan Jenggot' },
    { id: 3, name: 'Bob Wilson', email: 'bob@email.com', phone: '(555) 456-7890', lastVisit: '2024-01-08', totalVisits: 15, totalSpent: 750000, favoriteService: 'Layanan Lengkap' },
  ];

  const recentTransactions = [
    { id: 1, customer: 'Hendrikus Olmedo', amount: 40000, method: 'transfer', status: 'sukses', time: '10:00' },
    { id: 2, customer: 'Adel Wijaya', amount: 50000, method: 'qris', status: 'sukses', time: '14:00' },
    { id: 3, customer: 'Budi Santoso', amount: 100000, method: 'card', status: 'sukses', time: '15:30' },
    { id: 4, customer: 'Windah Santoso', amount: 20000, method: 'cash', status: 'pending', time: '11:30' },
  ];

  // Data untuk laporan pembayaran yang lebih lengkap
  const paymentTransactions = appointments.map(apt => ({
    id: `TRX-${apt.id.toString().padStart(4, '0')}`,
    tanggal: apt.date,
    waktu: apt.time,
    pelanggan: apt.customer,
    layanan: apt.service,
    metode: apt.paymentMethod,
    jumlah: apt.amount,
    statusBayar: apt.paymentStatus,
    statusReservasi: apt.status
  }));

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      dikonfirmasi: 'default',
      menunggu: 'secondary',
      selesai: 'outline',
      dibatalkan: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'lunas':
        return <Badge className="bg-green-500 text-white">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'gagal':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method) {
      case 'cash':
        return <Wallet className="h-4 w-4 text-green-600" />;
      case 'transfer':
        return <Landmark className="h-4 w-4 text-blue-600" />;
      case 'card':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'qris':
        return <QrCode className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatRupiah = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  // Filter data berdasarkan tanggal
  const getFilteredTransactions = () => {
    if (!dateRange.start && !dateRange.end) return paymentTransactions;
    
    return paymentTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.tanggal);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;
      return true;
    });
  };

  // Export ke PDF
  const exportToPDF = () => {
    const filteredData = getFilteredTransactions();
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(245, 158, 11);
    doc.text('Laporan Transaksi Pembayaran', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Periode: ${dateRange.start || 'Awal'} - ${dateRange.end || 'Sekarang'}`, 14, 35);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);
    doc.text(`Total Transaksi: ${filteredData.length}`, 14, 49);
    
    const totalAmount = filteredData.reduce((sum, t) => sum + t.jumlah, 0);
    doc.text(`Total Pendapatan: ${formatRupiah(totalAmount)}`, 14, 56);
    
    // Tabel
    doc.autoTable({
      startY: 65,
      head: [['ID Transaksi', 'Tanggal', 'Waktu', 'Pelanggan', 'Layanan', 'Metode', 'Jumlah', 'Status']],
      body: filteredData.map(t => [
        t.id,
        t.tanggal,
        t.waktu,
        t.pelanggan,
        t.layanan,
        t.metode,
        formatRupiah(t.jumlah),
        t.statusBayar
      ]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 40 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
        7: { cellWidth: 25 }
      }
    });
    
    doc.save(`laporan_pembayaran_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export ke Excel
  const exportToExcel = () => {
    const filteredData = getFilteredTransactions();
    
    const worksheetData = filteredData.map(t => ({
      'ID Transaksi': t.id,
      'Tanggal': t.tanggal,
      'Waktu': t.waktu,
      'Pelanggan': t.pelanggan,
      'Layanan': t.layanan,
      'Metode Pembayaran': t.metode,
      'Jumlah': t.jumlah,
      'Status Pembayaran': t.statusBayar,
      'Status Reservasi': t.statusReservasi
    }));
    
    // Summary row
    const totalAmount = filteredData.reduce((sum, t) => sum + t.jumlah, 0);
    worksheetData.push({
      'ID Transaksi': 'TOTAL',
      'Tanggal': '',
      'Waktu': '',
      'Pelanggan': '',
      'Layanan': '',
      'Metode Pembayaran': '',
      'Jumlah': totalAmount,
      'Status Pembayaran': '',
      'Status Reservasi': ''
    });
    
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pembayaran');
    
    // Adjust column widths
    const colWidths = [
      { wch: 15 }, // ID Transaksi
      { wch: 12 }, // Tanggal
      { wch: 10 }, // Waktu
      { wch: 20 }, // Pelanggan
      { wch: 25 }, // Layanan
      { wch: 18 }, // Metode
      { wch: 15 }, // Jumlah
      { wch: 18 }, // Status
      { wch: 18 }  // Status Reservasi
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `laporan_pembayaran_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export ke CSV
  const exportToCSV = () => {
    const filteredData = getFilteredTransactions();
    
    const headers = ['ID Transaksi', 'Tanggal', 'Waktu', 'Pelanggan', 'Layanan', 'Metode Pembayaran', 'Jumlah', 'Status Pembayaran', 'Status Reservasi'];
    const csvRows = [headers];
    
    for (const transaction of filteredData) {
      csvRows.push([
        transaction.id,
        transaction.tanggal,
        transaction.waktu,
        transaction.pelanggan,
        transaction.layanan,
        transaction.metode,
        transaction.jumlah.toString(),
        transaction.statusBayar,
        transaction.statusReservasi
      ]);
    }
    
    // Add summary
    csvRows.push([]);
    csvRows.push(['TOTAL', '', '', '', '', '', filteredData.reduce((sum, t) => sum + t.jumlah, 0).toString(), '', '']);
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_pembayaran_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print laporan
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const filteredData = getFilteredTransactions();
    const totalAmount = filteredData.reduce((sum, t) => sum + t.jumlah, 0);
    
    printWindow?.document.write(`
      <html>
        <head>
          <title>Laporan Pembayaran</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #f59e0b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f59e0b; color: white; }
            .header { margin-bottom: 20px; }
            .summary { margin-top: 20px; padding: 10px; background-color: #f3f4f6; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Transaksi Pembayaran</h1>
            <p>Periode: ${dateRange.start || 'Awal'} - ${dateRange.end || 'Sekarang'}</p>
            <p>Tanggal Export: ${new Date().toLocaleDateString('id-ID')}</p>
            <p>Total Transaksi: ${filteredData.length}</p>
            <p>Total Pendapatan: ${formatRupiah(totalAmount)}</p>
          </div>
          
           <table>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th>Layanan</th>
                <th>Metode</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.tanggal}</td>
                  <td>${t.waktu}</td>
                  <td>${t.pelanggan}</td>
                  <td>${t.layanan}</td>
                  <td>${t.metode}</td>
                  <td>${formatRupiah(t.jumlah)}</td>
                  <td>${t.statusBayar}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <strong>Ringkasan:</strong><br>
            Total Transaksi: ${filteredData.length}<br>
            Total Pendapatan: ${formatRupiah(totalAmount)}<br>
            Rata-rata Transaksi: ${formatRupiah(totalAmount / (filteredData.length || 1))}
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #f59e0b; color: white; border: none; cursor: pointer;">Print</button>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  const handleExport = () => {
    switch(exportFormat) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'print':
        printReport();
        break;
      default:
        exportToPDF();
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola operasional dan pembayaran bisnis Anda</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="appointments">Reservasi</TabsTrigger>
              <TabsTrigger value="payments">Pembayaran</TabsTrigger>
              <TabsTrigger value="services">Layanan</TabsTrigger>
              <TabsTrigger value="customers">Pelanggan</TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB - Sama seperti sebelumnya */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* ... konten dashboard tetap sama ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reservasi</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalAppointments}</div>
                    <p className="text-xs text-muted-foreground">Bulan ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reservasi Hari Ini</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.todayAppointments}</div>
                    <p className="text-xs text-muted-foreground">Dijadwalkan hari ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">Pelanggan aktif</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendapatan Bulanan</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatRupiah(dashboardStats.monthlyRevenue)}</div>
                    <p className="text-xs text-green-600">↑ {dashboardStats.revenueGrowth}% dari bulan lalu</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tren Pendapatan</CardTitle>
                    <CardDescription>Pendapatan 6 bulan terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Metode Pembayaran</CardTitle>
                    <CardDescription>Berdasarkan total transaksi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* APPOINTMENTS TAB - Sama seperti sebelumnya */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Reservasi</CardTitle>
                      <CardDescription>Lihat dan kelola semua reservasi dengan status pembayaran</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Reservasi Baru</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Buat Reservasi Baru</DialogTitle>
                          <DialogDescription>Tambahkan reservasi baru ke jadwal</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">Pelanggan</Label>
                            <Input id="customer" className="col-span-3" placeholder="Nama pelanggan" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service" className="text-right">Layanan</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih layanan" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.name}>{service.name} - {formatRupiah(service.price)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Tanggal</Label>
                            <Input id="date" type="date" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Waktu</Label>
                            <Input id="time" type="time" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentMethod" className="text-right">Metode Bayar</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih metode pembayaran" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Tunai</SelectItem>
                                <SelectItem value="transfer">Transfer Bank</SelectItem>
                                <SelectItem value="card">Kartu Kredit/Debit</SelectItem>
                                <SelectItem value="qris">QRIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button className="w-full">Buat Reservasi</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Metode Bayar</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status Bayar</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.customer}</TableCell>
                          <TableCell>{appointment.service}</TableCell>
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(appointment.paymentMethod)}
                              <span className="capitalize">{appointment.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatRupiah(appointment.amount)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(appointment.paymentStatus)}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENTS TAB - DENGAN FITUR EXPORT */}
            <TabsContent value="payments" className="space-y-6">
              {/* Payment Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatRupiah(15420000)}</div>
                    <p className="text-xs text-muted-foreground">Bulan ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pembayaran Pending</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">8</div>
                    <p className="text-xs text-muted-foreground">Menunggu konfirmasi</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pembayaran Sukses</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">148</div>
                    <p className="text-xs text-muted-foreground">Total transaksi</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pembayaran Gagal</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <p className="text-xs text-muted-foreground">Perlu ditinjau</p>
                  </CardContent>
                </Card>
              </div>

              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Laporan</CardTitle>
                  <CardDescription>Export data transaksi ke berbagai format</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <Label>Periode Mulai</Label>
                      <Input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Periode Akhir</Label>
                      <Input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      />
                    </div>
                    <div className="w-48">
                      <Label>Format Export</Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="print">Print / Cetak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleExport} className="bg-amber-600 hover:bg-amber-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export Laporan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Metode Pembayaran Aktif</CardTitle>
                    <CardDescription>Kelola metode pembayaran yang tersedia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Wallet className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Tunai</p>
                            <p className="text-sm text-gray-500">Bayar langsung di tempat</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Landmark className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Transfer Bank</p>
                            <p className="text-sm text-gray-500">BCA, Mandiri, BNI, BRI</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Kartu Kredit/Debit</p>
                            <p className="text-sm text-gray-500">Visa, Mastercard, JCB</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <QrCode className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">QRIS</p>
                            <p className="text-sm text-gray-500">Scan dengan e-wallet</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pengaturan Pembayaran</CardTitle>
                    <CardDescription>Konfigurasi metode pembayaran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Rekening Bank (Transfer)</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input placeholder="Nama Bank" defaultValue="BCA" />
                          <Input placeholder="Nomor Rekening" defaultValue="1234567890" />
                        </div>
                        <Input className="mt-2" placeholder="Atas Nama" defaultValue="Barber Shop" />
                      </div>
                      <div>
                        <Label>QRIS</Label>
                        <div className="border-2 border-dashed p-4 text-center mt-1">
                          <Button variant="outline" size="sm">Upload QR Code</Button>
                        </div>
                      </div>
                      <Button className="w-full">Simpan Pengaturan</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Transactions Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Riwayat Transaksi Pembayaran</CardTitle>
                      <CardDescription>Daftar semua transaksi pembayaran</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportToPDF}>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportToExcel}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={printReport}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent ref={transactionsTableRef}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Transaksi</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Layanan</TableHead>
                          <TableHead>Metode</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredTransactions().map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                            <TableCell>{transaction.pelanggan}</TableCell>
                            <TableCell>{transaction.layanan}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getPaymentMethodIcon(transaction.metode)}
                                <span className="capitalize">{transaction.metode}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatRupiah(transaction.jumlah)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(transaction.statusBayar)}</TableCell>
                            <TableCell>{transaction.tanggal}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Detail</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {getFilteredTransactions().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Tidak ada data transaksi untuk periode yang dipilih</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SERVICES TAB - Sama seperti sebelumnya */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Layanan</CardTitle>
                      <CardDescription>Kelola layanan dan harga bisnis Anda</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Tambah Layanan</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Layanan Baru</DialogTitle>
                          <DialogDescription>Buat penawaran layanan baru</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serviceName" className="text-right">Nama</Label>
                            <Input id="serviceName" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Harga (Rp)</Label>
                            <Input id="price" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Deskripsi</Label>
                            <Textarea id="description" className="col-span-3" />
                          </div>
                        </div>
                        <Button>Tambah Layanan</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Layanan</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Total Booking</TableHead>
                        <TableHead>Pendapatan</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{formatRupiah(service.price)}</TableCell>
                          <TableCell>{service.duration}</TableCell>
                          <TableCell>{service.totalBookings}</TableCell>
                          <TableCell>{formatRupiah(service.revenue)}</TableCell>
                          <TableCell>{service.description}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CUSTOMERS TAB - Sama seperti sebelumnya */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Pelanggan</CardTitle>
                  <CardDescription>Lihat dan kelola informasi pelanggan dengan riwayat transaksi</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Total Kunjungan</TableHead>
                        <TableHead>Total Belanja</TableHead>
                        <TableHead>Layanan Favorit</TableHead>
                        <TableHead>Kunjungan Terakhir</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.totalVisits}</TableCell>
                          <TableCell>{formatRupiah(customer.totalSpent)}</TableCell>
                          <TableCell>{customer.favoriteService}</TableCell>
                          <TableCell>{customer.lastVisit}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;