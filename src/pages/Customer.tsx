// Customer.tsx - Fixed imports

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Landmark, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  History, 
  Receipt, 
  User, 
  ChevronRight,
  Home,
  Scissors as ScissorsIcon,
  CalendarDays,
  Store
} from 'lucide-react';

const Customer = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Mock data for current customer
  const customerProfile = {
    id: 1,
    name: 'Hendrikus Olmedo',
    email: 'hendrikus@email.com',
    phone: '(555) 123-4567',
    address: 'Jl. Contoh No. 123, Jakarta Selatan',
    joinDate: '2023-06-15',
    totalVisits: 8,
    totalSpent: 420000,
    favoriteService: 'Potong Rambut Klasik'
  };

  // Enhanced reservation data for customer
  const customerReservations = [
    { 
      id: 1, 
      customer: 'Hendrikus Olmedo', 
      service: 'Potong Rambut Klasik', 
      time: '10:00', 
      date: '2024-01-15',
      status: 'selesai',
      paymentMethod: 'transfer',
      paymentStatus: 'lunas',
      amount: 40000,
      barber: 'John Barber',
      duration: '30 menit',
      notes: 'Potong agak pendek',
      cancellationReason: null,
      createdAt: '2024-01-10 08:30:00'
    },
    { 
      id: 2, 
      customer: 'Hendrikus Olmedo', 
      service: 'Rapihkan Jenggot', 
      time: '11:30', 
      date: '2024-01-20',
      status: 'dikonfirmasi',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      amount: 20000,
      barber: 'Mike Barber',
      duration: '20 menit',
      notes: 'Rapihkan bagian samping',
      cancellationReason: null,
      createdAt: '2024-01-18 14:15:00'
    },
    { 
      id: 3, 
      customer: 'Hendrikus Olmedo', 
      service: 'Layanan Lengkap', 
      time: '14:00', 
      date: '2024-02-01',
      status: 'menunggu',
      paymentMethod: 'qris',
      paymentStatus: 'lunas',
      amount: 50000,
      barber: 'John Barber',
      duration: '60 menit',
      notes: 'Mau model rambut undercut',
      cancellationReason: null,
      createdAt: '2024-01-25 09:45:00'
    },
    { 
      id: 4, 
      customer: 'Hendrikus Olmedo', 
      service: 'Potong & Jenggot', 
      time: '16:00', 
      date: '2024-01-10',
      status: 'selesai',
      paymentMethod: 'transfer',
      paymentStatus: 'lunas',
      amount: 50000,
      barber: 'Sarah Barber',
      duration: '45 menit',
      notes: 'Potong seperti biasa',
      cancellationReason: null,
      createdAt: '2024-01-05 11:20:00'
    },
    { 
      id: 5, 
      customer: 'Hendrikus Olmedo', 
      service: 'Warna Rambut', 
      time: '13:00', 
      date: '2024-01-25',
      status: 'dibatalkan',
      paymentMethod: 'card',
      paymentStatus: 'refund',
      amount: 100000,
      barber: 'Mike Barber',
      duration: '60 menit',
      notes: 'Warna coklat tua',
      cancellationReason: 'Pelanggan membatalkan karena sakit',
      createdAt: '2024-01-20 16:30:00'
    },
  ];

  // Filter reservations based on search term and active tab
  const getFilteredReservations = () => {
    let filtered = customerReservations;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab status
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(res => res.status === 'dikonfirmasi' || res.status === 'menunggu');
    } else if (activeTab === 'history') {
      filtered = filtered.filter(res => res.status === 'selesai' || res.status === 'dibatalkan');
    }
    
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      dikonfirmasi: 'default',
      menunggu: 'secondary',
      selesai: 'outline',
      dibatalkan: 'destructive'
    };
    const labels: { [key: string]: string } = {
      dikonfirmasi: 'Dikonfirmasi',
      menunggu: 'Menunggu',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'lunas':
        return <Badge className="bg-green-500 text-white">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'refund':
        return <Badge className="bg-red-500 text-white">Refund</Badge>;
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
  };

  const handleCancelReservation = (id: number) => {
    // Handle cancellation logic here
    console.log('Cancel reservation:', id);
  };

  // Stats for customer dashboard
  const customerStats = {
    upcomingReservations: customerReservations.filter(r => r.status === 'dikonfirmasi' || r.status === 'menunggu').length,
    completedReservations: customerReservations.filter(r => r.status === 'selesai').length,
    totalSpent: customerReservations.reduce((sum, r) => r.paymentStatus === 'lunas' ? sum + r.amount : sum, 0),
    favoriteService: 'Potong Rambut Klasik'
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Barber Account</h1>
            <p className="text-gray-600">Kelola reservasi dan lihat riwayat pemesanan Anda</p>
          </div>

          {/* Customer Profile Banner */}
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{customerProfile.name}</h2>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-1" />
                        {customerProfile.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {customerProfile.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Member sejak {formatDate(customerProfile.joinDate)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Hubungi Kami
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <ScissorsIcon className="h-4 w-4 mr-2" />
                    Reservasi Baru
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservasi Mendatang</CardTitle>
                <CalendarDays className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.upcomingReservations}</div>
                <p className="text-xs text-muted-foreground">Reservasi yang sudah dijadwalkan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riwayat Reservasi</CardTitle>
                <History className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.completedReservations}</div>
                <p className="text-xs text-muted-foreground">Reservasi yang sudah selesai</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Belanja</CardTitle>
                <Receipt className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(customerStats.totalSpent)}</div>
                <p className="text-xs text-muted-foreground">Sepanjang menjadi member</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Layanan Favorit</CardTitle>
                <Star className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{customerStats.favoriteService}</div>
                <p className="text-xs text-muted-foreground">Paling sering dipesan</p>
              </CardContent>
            </Card>
          </div>

          {/* Reservations Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Reservasi Saya</CardTitle>
                  <CardDescription>Lihat semua reservasi yang sudah Anda pesan</CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Cari reservasi..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="reservations">Semua Reservasi</TabsTrigger>
                  <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
                  <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>

                <TabsContent value="reservations" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelReservation}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                  />
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelReservation}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelReservation}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reservation Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang reservasi Anda
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Status Reservasi</p>
                  <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status Pembayaran</p>
                  <div className="mt-1">{getPaymentStatusBadge(selectedReservation.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Reservasi</p>
                  <p className="font-medium">#RES-{selectedReservation.id.toString().padStart(4, '0')}</p>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold mb-3">Detail Layanan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Layanan</p>
                    <p className="font-medium">{selectedReservation.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Barber</p>
                    <p className="font-medium">{selectedReservation.barber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium">{formatDate(selectedReservation.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu</p>
                    <p className="font-medium">{selectedReservation.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durasi</p>
                    <p className="font-medium">{selectedReservation.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Harga</p>
                    <p className="font-medium">{formatRupiah(selectedReservation.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-3">Detail Pembayaran</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Metode Pembayaran</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPaymentMethodIcon(selectedReservation.paymentMethod)}
                      <span className="capitalize font-medium">{selectedReservation.paymentMethod}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Dibayar</p>
                    <p className="font-medium">{formatRupiah(selectedReservation.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedReservation.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Catatan</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReservation.notes}</p>
                </div>
              )}

              {selectedReservation.cancellationReason && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Alasan Pembatalan</h3>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selectedReservation.cancellationReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedReservation.status !== 'selesai' && selectedReservation.status !== 'dibatalkan' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Tutup
                  </Button>
                  <Button variant="destructive" onClick={() => handleCancelReservation(selectedReservation.id)}>
                    Batalkan Reservasi
                  </Button>
                </div>
              )}

              {selectedReservation.status === 'selesai' && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Tutup
                  </Button>
                  <Button className="ml-3 bg-amber-600 hover:bg-amber-700">
                    Reservasi Lagi
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

// Separate component for reservations table to keep code organized
const ReservationsTable = ({ 
  reservations, 
  onViewDetails, 
  onCancel, 
  getStatusBadge, 
  getPaymentStatusBadge, 
  getPaymentMethodIcon, 
  formatRupiah 
}: { 
  reservations: any[], 
  onViewDetails: (reservation: any) => void, 
  onCancel: (id: number) => void,
  getStatusBadge: (status: string) => React.ReactNode,
  getPaymentStatusBadge: (status: string) => React.ReactNode,
  getPaymentMethodIcon: (method: string) => React.ReactNode,
  formatRupiah: (amount: number) => string
}) => {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada reservasi</h3>
        <p className="text-gray-500">Belum ada reservasi yang ditemukan</p>
        <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
          Buat Reservasi Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Metode Bayar</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status Bayar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.date}</TableCell>
              <TableCell>{reservation.time}</TableCell>
              <TableCell className="font-medium">{reservation.service}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(reservation.paymentMethod)}
                  <span className="capitalize">{reservation.paymentMethod}</span>
                </div>
              </TableCell>
              <TableCell>{formatRupiah(reservation.amount)}</TableCell>
              <TableCell>{getPaymentStatusBadge(reservation.paymentStatus)}</TableCell>
              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(reservation)}
                  >
                    Detail
                  </Button>
                  {(reservation.status === 'menunggu' || reservation.status === 'dikonfirmasi') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onCancel(reservation.id)}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Customer;