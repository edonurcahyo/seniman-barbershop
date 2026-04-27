// Customer.tsx - Updated with real data from localStorage

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
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
  Store,
  Upload,
  X
} from 'lucide-react';

// Interface untuk data reservasi
interface ReservationData {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: string;
  date: Date;
  time: string;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
  paymentDueDate?: Date;
  paymentProof?: string;
}

const Customer = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');

  // Data rekening bank
  const bankAccounts = [
    { bank: 'BCA', accountNumber: '1234567890', accountName: 'Barber Shop Official' },
    { bank: 'Mandiri', accountNumber: '9876543210', accountName: 'Barber Shop Official' },
    { bank: 'BNI', accountNumber: '5551234567', accountName: 'Barber Shop Official' },
    { bank: 'BRI', accountNumber: '7778889990', accountName: 'Barber Shop Official' }
  ];

  // Load customer data dari localStorage
  useEffect(() => {
    loadCustomerData();
    // Coba ambil email customer dari localStorage atau prompt
    const savedEmail = localStorage.getItem('customer_email');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
    } else {
      // Untuk demo, kita bisa menggunakan email dari reservasi terakhir
      const lastReservation = localStorage.getItem('last_reservation');
      if (lastReservation) {
        const reservation = JSON.parse(lastReservation);
        setCustomerEmail(reservation.email);
        localStorage.setItem('customer_email', reservation.email);
      }
    }
  }, []);

  const loadCustomerData = () => {
    const existingReservations = localStorage.getItem('barber_reservations');
    if (existingReservations) {
      const allReservations = JSON.parse(existingReservations);
      // Filter berdasarkan email customer yang login
      const savedEmail = localStorage.getItem('customer_email');
      if (savedEmail) {
        const customerReservations = allReservations.filter((res: ReservationData) => res.email === savedEmail);
        setReservations(customerReservations);
      } else {
        setReservations(allReservations);
      }
    }
  };

  // Customer profile dari data reservasi
  const getCustomerProfile = () => {
    if (reservations.length === 0) {
      return {
        name: 'Customer',
        email: customerEmail || 'customer@email.com',
        phone: '-',
        joinDate: new Date().toISOString(),
        totalVisits: 0,
        totalSpent: 0,
        favoriteService: '-'
      };
    }

    const firstReservation = reservations[0];
    const completedReservations = reservations.filter(r => r.status === 'paid');
    const totalSpent = completedReservations.reduce((sum, r) => {
      const price = parseInt(r.servicePrice.replace(/[^0-9]/g, ''));
      return sum + price;
    }, 0);

    // Hitung layanan favorit
    const serviceCount: { [key: string]: number } = {};
    reservations.forEach(r => {
      serviceCount[r.serviceName] = (serviceCount[r.serviceName] || 0) + 1;
    });
    let favoriteService = '-';
    let maxCount = 0;
    Object.entries(serviceCount).forEach(([service, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteService = service;
      }
    });

    return {
      name: `${firstReservation.firstName} ${firstReservation.lastName}`,
      email: firstReservation.email,
      phone: firstReservation.phone,
      joinDate: firstReservation.createdAt,
      totalVisits: completedReservations.length,
      totalSpent: totalSpent,
      favoriteService: favoriteService
    };
  };

  const customerProfile = getCustomerProfile();

  // Filter reservations based on search term and active tab
  const getFilteredReservations = () => {
    let filtered = reservations;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab status
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(res => res.status === 'pending');
    } else if (activeTab === 'history') {
      filtered = filtered.filter(res => res.status === 'paid' || res.status === 'cancelled');
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paid: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    };
    const labels: { [key: string]: string } = {
      paid: 'Lunas',
      pending: 'Menunggu Pembayaran',
      cancelled: 'Dibatalkan'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-500 text-white">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Menunggu Pembayaran</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Dibatalkan</Badge>;
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
      case 'qris':
        return <QrCode className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatRupiah = (priceString: string) => {
    const amount = parseInt(priceString.replace(/[^0-9]/g, ''));
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return formatDate(d) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetails = (reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
  };

  const handlePayNow = (reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setShowPaymentDialog(true);
  };

  const handleCancelReservation = (id: string) => {
    const updatedReservations = reservations.map(res => 
      res.id === id ? { ...res, status: 'cancelled' as const } : res
    );
    
    // Update localStorage
    const allReservations = localStorage.getItem('barber_reservations');
    if (allReservations) {
      const all = JSON.parse(allReservations);
      const updatedAll = all.map((res: ReservationData) => 
        res.id === id ? { ...res, status: 'cancelled' } : res
      );
      localStorage.setItem('barber_reservations', JSON.stringify(updatedAll));
    }
    
    setReservations(updatedReservations);
    setShowDetailDialog(false);
    
    toast({
      title: "Reservasi Dibatalkan",
      description: "Reservasi Anda telah dibatalkan.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Error", description: "Harap upload file gambar (JPG, PNG, dll)" });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Error", description: "Ukuran file maksimal 5MB" });
        return;
      }
      
      setPaymentProof(file);
      const previewUrl = URL.createObjectURL(file);
      setPaymentProofPreview(previewUrl);
    }
  };

  const removeFile = () => {
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    setPaymentProof(null);
    setPaymentProofPreview(null);
  };

  const handleConfirmPayment = () => {
    if (!paymentProof && selectedReservation?.paymentMethod !== 'cash') {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap upload bukti pembayaran terlebih dahulu" 
      });
      return;
    }

    // Update status reservasi menjadi paid
    const updatedReservations = reservations.map(res => 
      res.id === selectedReservation?.id ? { ...res, status: 'paid' as const } : res
    );
    
    // Update localStorage
    const allReservations = localStorage.getItem('barber_reservations');
    if (allReservations) {
      const all = JSON.parse(allReservations);
      const updatedAll = all.map((res: ReservationData) => 
        res.id === selectedReservation?.id ? { ...res, status: 'paid' } : res
      );
      localStorage.setItem('barber_reservations', JSON.stringify(updatedAll));
    }
    
    setReservations(updatedReservations);
    setShowPaymentDialog(false);
    setPaymentProof(null);
    setPaymentProofPreview(null);
    
    toast({
      title: "Pembayaran Berhasil! 🎉",
      description: "Pembayaran Anda telah dikonfirmasi. Reservasi Anda sekarang sudah lunas.",
    });
  };

  const customerStats = {
    upcomingReservations: reservations.filter(r => r.status === 'pending').length,
    completedReservations: reservations.filter(r => r.status === 'paid').length,
    totalSpent: customerProfile.totalSpent,
    favoriteService: customerProfile.favoriteService
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
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/booking'}>
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
                <p className="text-xs text-muted-foreground">Menunggu pembayaran</p>
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
                <div className="text-2xl font-bold">{formatRupiah(customerStats.totalSpent.toString())}</div>
                <p className="text-xs text-muted-foreground">Sepanjang menjadi member</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Layanan Favorit</CardTitle>
                <Star className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 truncate">{customerStats.favoriteService}</div>
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
                  <TabsTrigger value="upcoming">Menunggu Bayar</TabsTrigger>
                  <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>

                <TabsContent value="reservations" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onPayNow={handlePayNow}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onPayNow={handlePayNow}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <ReservationsTable 
                    reservations={getFilteredReservations()}
                    onViewDetails={handleViewDetails}
                    onPayNow={handlePayNow}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    getPaymentMethodIcon={getPaymentMethodIcon}
                    formatRupiah={formatRupiah}
                    formatDate={formatDate}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reservation Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <div className="mt-1">{getPaymentStatusBadge(selectedReservation.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Reservasi</p>
                  <p className="font-medium text-sm">{selectedReservation.id}</p>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold mb-3">Detail Layanan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Layanan</p>
                    <p className="font-medium">{selectedReservation.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durasi</p>
                    <p className="font-medium">{selectedReservation.serviceDuration}</p>
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
                    <p className="text-sm text-gray-600">Harga</p>
                    <p className="font-medium">{formatRupiah(selectedReservation.servicePrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dibuat pada</p>
                    <p className="font-medium text-sm">{formatDateTime(selectedReservation.createdAt)}</p>
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
                      <span className="capitalize font-medium">
                        {selectedReservation.paymentMethod === 'cash' ? 'Tunai' : 
                         selectedReservation.paymentMethod === 'transfer' ? 'Transfer Bank' : 'QRIS'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Dibayar</p>
                    <p className="font-medium">{formatRupiah(selectedReservation.servicePrice)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Informasi Customer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Lengkap</p>
                    <p className="font-medium">{selectedReservation.firstName} {selectedReservation.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedReservation.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nomor Telepon</p>
                    <p className="font-medium">{selectedReservation.phone}</p>
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

              {selectedReservation.paymentDueDate && selectedReservation.status === 'pending' && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Batas waktu pembayaran: {formatDateTime(selectedReservation.paymentDueDate)}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Tutup
                </Button>
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button onClick={() => {
                      setShowDetailDialog(false);
                      handlePayNow(selectedReservation);
                    }} className="bg-amber-600 hover:bg-amber-700">
                      Bayar Sekarang
                    </Button>
                    <Button variant="destructive" onClick={() => handleCancelReservation(selectedReservation.id)}>
                      Batalkan Reservasi
                    </Button>
                  </>
                )}
                {selectedReservation.status === 'paid' && (
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/booking'}>
                    Reservasi Lagi
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription className="text-center">
              Silakan selesaikan pembayaran untuk reservasi Anda
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-6 py-4">
              {/* Detail Pembayaran */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Layanan:</span>
                  <span className="font-medium">{selectedReservation.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal & Waktu:</span>
                  <span className="font-medium">{formatDate(selectedReservation.date)} - {selectedReservation.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode:</span>
                  <span className="font-medium flex items-center">
                    {getPaymentMethodIcon(selectedReservation.paymentMethod)}
                    <span className="ml-1 capitalize">
                      {selectedReservation.paymentMethod === 'cash' ? 'Tunai' : 
                       selectedReservation.paymentMethod === 'transfer' ? 'Transfer Bank' : 'QRIS'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-barber-gold">{formatRupiah(selectedReservation.servicePrice)}</span>
                </div>
              </div>

              {/* Informasi Pembayaran berdasarkan metode */}
              {selectedReservation.paymentMethod === 'transfer' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800 mb-3">Informasi Transfer Bank:</p>
                  <div className="space-y-3">
                    {bankAccounts.map((bank, index) => (
                      <div key={index} className="bg-white p-3 rounded-md">
                        <p className="font-semibold text-blue-800">{bank.bank}</p>
                        <p className="text-sm text-gray-600">No. Rekening: <span className="font-mono font-bold">{bank.accountNumber}</span></p>
                        <p className="text-sm text-gray-600">a.n. {bank.accountName}</p>
                      </div>
                    ))}
                    <p className="text-xs text-blue-600 mt-2">
                      * Silakan transfer sesuai dengan total yang harus dibayar. Sertakan kode reservasi: {selectedReservation.id}
                    </p>
                  </div>
                </div>
              )}

              {selectedReservation.paymentMethod === 'qris' && (
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="font-medium text-orange-800 mb-2">Scan QRIS</p>
                  <div className="flex justify-center mb-2">
                    <div className="w-56 h-56 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-orange-200">
                      <div className="text-center">
                        <QrCode className="h-40 w-40 text-orange-600 mx-auto" />
                        <p className="text-xs text-gray-500 mt-2">QRIS Code</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600 mb-2">Scan menggunakan aplikasi e-wallet atau m-banking Anda</p>
                  <p className="text-xs text-orange-500">Nominal: {formatRupiah(selectedReservation.servicePrice)}</p>
                </div>
              )}

              {selectedReservation.paymentMethod === 'cash' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-center text-green-800">
                    Bayar tunai saat Anda tiba di tempat kami
                  </p>
                </div>
              )}

              {/* Upload Bukti Pembayaran untuk non-tunai */}
              {(selectedReservation.paymentMethod === 'transfer' || selectedReservation.paymentMethod === 'qris') && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Label className="block mb-2 font-medium">Upload Bukti Pembayaran</Label>
                  {!paymentProofPreview ? (
                    <div className="flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="payment-proof"
                        className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk upload bukti transfer/QRIS</p>
                        <p className="text-xs text-gray-400">Format: JPG, PNG (Max 5MB)</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={paymentProofPreview} 
                        alt="Bukti Pembayaran" 
                        className="w-full h-auto rounded-lg border"
                      />
                      <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Konfirmasi */}
              <Button 
                onClick={handleConfirmPayment}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Konfirmasi Pembayaran
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

// Reservations Table Component
const ReservationsTable = ({ 
  reservations, 
  onViewDetails, 
  onPayNow,
  getStatusBadge, 
  getPaymentStatusBadge, 
  getPaymentMethodIcon, 
  formatRupiah,
  formatDate
}: { 
  reservations: ReservationData[], 
  onViewDetails: (reservation: ReservationData) => void, 
  onPayNow: (reservation: ReservationData) => void,
  getStatusBadge: (status: string) => React.ReactNode,
  getPaymentStatusBadge: (status: string) => React.ReactNode,
  getPaymentMethodIcon: (method: string) => React.ReactNode,
  formatRupiah: (price: string) => string,
  formatDate: (date: Date | string) => string
}) => {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada reservasi</h3>
        <p className="text-gray-500">Belum ada reservasi yang ditemukan</p>
        <Button className="mt-4 bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/booking'}>
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
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{formatDate(reservation.date)}</TableCell>
              <TableCell>{reservation.time}</TableCell>
              <TableCell className="font-medium">{reservation.serviceName}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(reservation.paymentMethod)}
                  <span className="capitalize text-sm">
                    {reservation.paymentMethod === 'cash' ? 'Tunai' : 
                     reservation.paymentMethod === 'transfer' ? 'Transfer' : 'QRIS'}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatRupiah(reservation.servicePrice)}</TableCell>
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
                  {reservation.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => onPayNow(reservation)}
                    >
                      Bayar
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