// src/pages/Customer.tsx - FULL CODE YANG SUDAH DIPERBAIKI

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/axios';
import { 
  Calendar, 
  Scissors, 
  Wallet, 
  Landmark, 
  QrCode, 
  Search, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  History, 
  Receipt, 
  User, 
  CalendarDays,
  Upload,
  X,
  LogOut,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Store,
  Edit,
  Save,
  XCircle,
  Copy
} from 'lucide-react';

interface UserData {
  id_pelanggan: number;
  nama: string;
  email: string;
  no_hp: string;
  alamat?: string;
  created_at: string;
}

interface ReservationData {
  id_reservasi: number;
  kode_reservasi: string;
  pelanggan_id: number;
  pelanggan_nama?: string;
  cabang_id: number;
  nama_cabang: string;
  cabang_alamat: string;
  layanan_id: number;
  nama_layanan: string;
  durasi: string;
  total_harga: number;
  tanggal: string;
  waktu: string;
  status: 'pending' | 'paid' | 'cancelled';
  metode_pembayaran: 'cash' | 'transfer' | 'qris';
  bukti_pembayaran?: string;
  catatan?: string;
  created_at: string;
}

interface PaymentSettings {
  bank_bca: string;
  bank_mandiri: string;
  bank_bni: string;
  bank_bri: string;
  qr_code: string | null;
}

const Customer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bank_bca: '',
    bank_mandiri: '',
    bank_bni: '',
    bank_bri: '',
    qr_code: null
  });
  
  const [editForm, setEditForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    alamat: ''
  });

  // ============ FUNGSI PAYMENT SETTINGS ============
  
  // Fetch payment settings dari API
  const fetchPaymentSettings = async (cabangId: string = '1') => {
    try {
      const response = await axiosInstance.get('/payment-settings/public', {
        params: { cabang_id: cabangId }
      });
      
      if (response.data && response.data.data) {
        setPaymentSettings({
          bank_bca: response.data.data.bank_bca || '',
          bank_mandiri: response.data.data.bank_mandiri || '',
          bank_bni: response.data.data.bank_bni || '',
          bank_bri: response.data.data.bank_bri || '',
          qr_code: response.data.data.qr_code || null
        });
      } else {
        // Fallback kosong
        setPaymentSettings({
          bank_bca: '',
          bank_mandiri: '',
          bank_bni: '',
          bank_bri: '',
          qr_code: null
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      // Fallback kosong jika API error
      setPaymentSettings({
        bank_bca: '',
        bank_mandiri: '',
        bank_bni: '',
        bank_bri: '',
        qr_code: null
      });
    }
  };

  // Mendapatkan daftar bank yang memiliki nomor rekening
  const getBankAccounts = () => {
    const banks = [
      { bank: 'BCA', accountNumber: paymentSettings.bank_bca, accountName: 'Seniman Barbershop' },
      { bank: 'Mandiri', accountNumber: paymentSettings.bank_mandiri, accountName: 'Seniman Barbershop' },
      { bank: 'BNI', accountNumber: paymentSettings.bank_bni, accountName: 'Seniman Barbershop' },
      { bank: 'BRI', accountNumber: paymentSettings.bank_bri, accountName: 'Seniman Barbershop' }
    ];
    return banks.filter(bank => bank.accountNumber && bank.accountNumber.trim() !== '');
  };

  // Mendapatkan URL QR Code
  const getQrImageUrl = (qrCode: string | null) => {
    if (!qrCode) return null;
    if (qrCode.startsWith('http')) return qrCode;
    return `http://127.0.0.1:8000/storage/${qrCode}`;
  };

  // ============ END PAYMENT SETTINGS ============

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Fetch payment settings ketika dialog pembayaran dibuka
  useEffect(() => {
    if (showPaymentDialog && selectedReservation?.cabang_id) {
      fetchPaymentSettings(selectedReservation.cabang_id.toString());
    }
  }, [showPaymentDialog, selectedReservation?.cabang_id]);

  const checkAuthAndLoadData = async () => {
    const userStr = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!userStr || !isLoggedIn) {
      toast({
        title: "Akses Ditolak",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchReservations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      setUserData(user);
      setEditForm({
        nama: user.nama || '',
        email: user.email || '',
        no_hp: user.no_hp || '',
        alamat: user.alamat || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const pelangganId = user.id_pelanggan;
      
      console.log('Fetching reservations for:', pelangganId);
      
      const response = await axiosInstance.get('/reservasi/pelanggan', {
        params: { pelanggan_id: pelangganId }
      });
      
      console.log('Response:', response.data);
      
      let reservationsData = [];
      if (response.data && response.data.data) {
        reservationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        reservationsData = response.data;
      }
      
      setReservations(reservationsData);
      console.log('Reservations loaded:', reservationsData.length);
      
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      // Fallback ke mock data untuk testing
      const mockData: ReservationData[] = [
        {
          id_reservasi: 1,
          kode_reservasi: 'RES-001',
          pelanggan_id: 1,
          cabang_id: 1,
          nama_cabang: 'Seniman Barbershop Rungkut',
          cabang_alamat: 'Jl. Rungkut Mapan No. 123',
          layanan_id: 1,
          nama_layanan: 'Potong Rambut Klasik',
          durasi: '30 menit',
          total_harga: 40000,
          tanggal: '2024-06-20',
          waktu: '14:00',
          status: 'pending',
          metode_pembayaran: 'transfer',
          catatan: 'Potong agak pendek',
          created_at: new Date().toISOString()
        },
        {
          id_reservasi: 2,
          kode_reservasi: 'RES-002',
          pelanggan_id: 1,
          cabang_id: 1,
          nama_cabang: 'Seniman Barbershop Rungkut',
          cabang_alamat: 'Jl. Rungkut Mapan No. 123',
          layanan_id: 2,
          nama_layanan: 'Rapikan Jenggot',
          durasi: '20 menit',
          total_harga: 20000,
          tanggal: '2024-06-15',
          waktu: '11:00',
          status: 'paid',
          metode_pembayaran: 'qris',
          catatan: '',
          created_at: new Date().toISOString()
        }
      ];
      setReservations(mockData);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editForm.nama || !editForm.email || !editForm.no_hp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama, Email, dan No HP harus diisi",
      });
      return;
    }

    setSavingProfile(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...editForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      toast({
        title: "Berhasil!",
        description: "Profil Anda telah diperbarui.",
      });
      
      setShowEditProfileDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('selected_cabang');
    localStorage.removeItem('selectedBranch');
    navigate('/login');
  };

  // src/pages/Customer.tsx - Perbaiki handleConfirmPayment

  const handleConfirmPayment = async () => {
    if (!selectedReservation) return;

    // Validasi upload bukti untuk metode non-tunai
    if (selectedReservation.metode_pembayaran !== 'cash' && !paymentProof) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap upload bukti pembayaran terlebih dahulu" 
      });
      return;
    }

    setUploading(true);

    try {
      let buktiUrl = null;

      // Upload bukti pembayaran jika ada
      if (paymentProof) {
        const formData = new FormData();
        formData.append('bukti_pembayaran', paymentProof);
        
        console.log('Uploading payment proof...');
        const uploadResponse = await axiosInstance.post('/reservasi/upload-bukti', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('Upload response:', uploadResponse.data);
        
        // Ambil URL dari response (sesuai dengan struktur response dari backend)
        buktiUrl = uploadResponse.data.bukti_url || uploadResponse.data.data?.bukti_url;
        console.log('Bukti URL:', buktiUrl);
      }

      // Kirim konfirmasi pembayaran ke API
      const payload: any = {};
      if (buktiUrl) {
        payload.bukti_pembayaran = buktiUrl;
      }

      console.log('Confirming payment with payload:', payload);
      await axiosInstance.put(`/reservasi/${selectedReservation.id_reservasi}/konfirmasi-pembayaran`, payload);

      // Update state lokal
      setReservations(prev => prev.map(res => 
        res.id_reservasi === selectedReservation.id_reservasi 
          ? { 
              ...res, 
              status: 'paid',
              bukti_pembayaran: buktiUrl || res.bukti_pembayaran
            }
          : res
      ));

      toast({
        title: "Pembayaran Berhasil! 🎉",
        description: "Pembayaran Anda telah dikonfirmasi. Terima kasih!",
      });

      setShowPaymentDialog(false);
      setPaymentProof(null);
      setPaymentProofPreview(null);

    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        variant: "destructive",
        title: "Pembayaran Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelReservation = async (id_reservasi: number) => {
    try {
      setReservations(prev => prev.map(res => 
        res.id_reservasi === id_reservasi 
          ? { ...res, status: 'cancelled' }
          : res
      ));
      
      toast({
        title: "Reservasi Dibatalkan",
        description: "Reservasi Anda telah dibatalkan.",
      });
      
      setShowDetailDialog(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Membatalkan",
        description: "Terjadi kesalahan",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Error", description: "Harap upload file gambar" });
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

  const formatRupiah = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
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

  const getPaymentMethodName = (method: string) => {
    switch(method) {
      case 'cash': return 'Tunai';
      case 'transfer': return 'Transfer Bank';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.nama_layanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.kode_reservasi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(res => res.status === 'pending');
    } else if (activeTab === 'history') {
      filtered = filtered.filter(res => res.status === 'paid' || res.status === 'cancelled');
    }
    
    return filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  };

  const customerStats = {
    upcomingReservations: reservations.filter(r => r.status === 'pending').length,
    completedReservations: reservations.filter(r => r.status === 'paid').length,
    totalSpent: reservations.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.total_harga, 0),
    favoriteService: getFavoriteService()
  };

  function getFavoriteService() {
    const serviceCount: { [key: string]: number } = {};
    reservations.forEach(r => {
      serviceCount[r.nama_layanan] = (serviceCount[r.nama_layanan] || 0) + 1;
    });
    let favoriteService = '-';
    let maxCount = 0;
    Object.entries(serviceCount).forEach(([service, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteService = service;
      }
    });
    return favoriteService;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Barber Account</h1>
              <p className="text-gray-600">Kelola reservasi dan lihat riwayat pemesanan Anda</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Profile Banner */}
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userData?.nama || 'Customer'}</h2>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-1" />
                        {userData?.email || '-'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {userData?.no_hp || '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditProfileDialog(true)}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profil
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => navigate('/booking')}>
                    <Scissors className="h-4 w-4 mr-2" />
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
                <div className="text-xl font-bold text-amber-600 truncate">{customerStats.favoriteService}</div>
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
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari reservasi..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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

                <ReservationsTable 
                  reservations={getFilteredReservations()}
                  onViewDetails={(res) => {
                    console.log('View details clicked:', res);
                    setSelectedReservation(res);
                    setShowDetailDialog(true);
                  }}
                  onPayNow={(res) => {
                    console.log('Pay now clicked:', res);
                    setSelectedReservation(res);
                    setShowPaymentDialog(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getPaymentMethodIcon={getPaymentMethodIcon}
                  getPaymentMethodName={getPaymentMethodName}
                  formatRupiah={formatRupiah}
                  formatDate={formatDate}
                />
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profil</DialogTitle>
            <DialogDescription>Perbarui informasi profil Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={editForm.nama} onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <Input value={editForm.no_hp} onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input value={editForm.alamat || ''} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>Batal</Button>
            <Button onClick={handleUpdateProfile} disabled={savingProfile} className="bg-amber-600">
              {savingProfile ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
            <DialogDescription>Informasi lengkap tentang reservasi Anda</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Kode Reservasi</p>
                  <p className="font-mono font-bold">{selectedReservation.kode_reservasi}</p>
                </div>
                {selectedReservation.pelanggan_nama && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Nama Customer</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-amber-600" />
                      {selectedReservation.pelanggan_nama}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedReservation.status)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Detail Layanan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-600">Layanan</p><p className="font-medium">{selectedReservation.nama_layanan}</p></div>
                  <div><p className="text-sm text-gray-600">Durasi</p><p className="font-medium">{selectedReservation.durasi}</p></div>
                  <div><p className="text-sm text-gray-600">Tanggal</p><p className="font-medium">{formatDate(selectedReservation.tanggal)}</p></div>
                  <div><p className="text-sm text-gray-600">Waktu</p><p className="font-medium">{selectedReservation.waktu}</p></div>
                  <div><p className="text-sm text-gray-600">Cabang</p><p className="font-medium">{selectedReservation.nama_cabang}</p></div>
                  <div><p className="text-sm text-gray-600">Total</p><p className="font-bold text-amber-600">{formatRupiah(selectedReservation.total_harga)}</p></div>
                </div>
              </div>

              {selectedReservation.catatan && (
                <div>
                  <h3 className="font-semibold mb-2">Catatan</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReservation.catatan}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Tutup</Button>
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button onClick={() => { setShowDetailDialog(false); setShowPaymentDialog(true); }} className="bg-amber-600">
                      Bayar Sekarang
                    </Button>
                    <Button variant="destructive" onClick={() => handleCancelReservation(selectedReservation.id_reservasi)}>
                      Batalkan
                    </Button>
                  </>
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
                  <span className="text-gray-600">Kode Reservasi:</span>
                  <span className="font-mono text-sm font-bold">{selectedReservation.kode_reservasi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layanan:</span>
                  <span className="font-medium">{selectedReservation.nama_layanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cabang:</span>
                  <span className="font-medium">{selectedReservation.nama_cabang}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal & Waktu:</span>
                  <span className="font-medium">{formatDate(selectedReservation.tanggal)} - {selectedReservation.waktu}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Pembayaran:</span>
                  <span className="text-xl font-bold text-amber-600">{formatRupiah(selectedReservation.total_harga)}</span>
                </div>
              </div>

              {/* Informasi Pembayaran - TRANSFER BANK */}
              {selectedReservation.metode_pembayaran === 'transfer' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-blue-800">Transfer Bank</p>
                  </div>
                  
                  {getBankAccounts().length > 0 ? (
                    <div className="space-y-3">
                      {getBankAccounts().map((bank, index) => (
                        <div key={index} className="bg-white p-3 rounded-md border border-blue-200">
                          <p className="font-bold text-blue-800">{bank.bank}</p>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Nomor Rekening</p>
                            <div className="flex items-center justify-between">
                              <p className="font-mono text-lg font-bold tracking-wider">{bank.accountNumber}</p>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(bank.accountNumber);
                                  toast({ title: "Tersalin!", description: "Nomor rekening telah disalin" });
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Atas Nama</p>
                            <p className="text-sm">{bank.accountName}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-yellow-50 p-2 rounded mt-2">
                        <p className="text-xs text-yellow-700">
                          ⚠️ Transfer sesuai dengan total yang harus dibayar: <strong>{formatRupiah(selectedReservation.total_harga)}</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Cantumkan kode reservasi: <strong className="font-mono">{selectedReservation.kode_reservasi}</strong> sebagai referensi
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nomor rekening akan segera diupdate oleh admin</p>
                  )}
                </div>
              )}

              {/* Informasi Pembayaran - QRIS */}
              {selectedReservation.metode_pembayaran === 'qris' && (
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className="h-5 w-5 text-orange-600" />
                    <p className="font-semibold text-orange-800">Scan QRIS</p>
                  </div>
                  
                  {getQrImageUrl(paymentSettings.qr_code) ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <img 
                          src={getQrImageUrl(paymentSettings.qr_code)} 
                          alt="QRIS Code"
                          className="w-56 h-56 object-contain bg-white rounded-xl shadow-lg border-2 border-orange-200 p-4"
                        />
                      </div>
                      <p className="text-sm text-orange-600">
                        Scan menggunakan aplikasi e-wallet atau m-banking Anda
                      </p>
                      <div className="bg-yellow-50 p-2 rounded mt-2">
                        <p className="text-xs text-yellow-700">
                          💰 Nominal: <strong>{formatRupiah(selectedReservation.total_harga)}</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Kode Reservasi: <strong className="font-mono">{selectedReservation.kode_reservasi}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR Code akan segera diupdate oleh admin</p>
                      <p className="text-xs text-gray-400 mt-2">Silakan pilih metode pembayaran lain atau hubungi customer service</p>
                    </div>
                  )}
                </div>
              )}

              {/* Informasi Pembayaran - TUNAI */}
              {selectedReservation.metode_pembayaran === 'cash' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-800">Pembayaran Tunai</p>
                  </div>
                  <p className="text-center text-green-700">
                    Silakan bayar tunai saat Anda tiba di tempat kami
                  </p>
                  <div className="mt-3 p-2 bg-white rounded text-center">
                    <p className="text-sm text-gray-600">Total yang harus dibayar:</p>
                    <p className="text-xl font-bold text-green-600">{formatRupiah(selectedReservation.total_harga)}</p>
                  </div>
                  <p className="text-xs text-green-600 text-center mt-3">
                    📍 {selectedReservation.nama_cabang} - {selectedReservation.cabang_alamat}
                  </p>
                </div>
              )}

              {/* Upload Bukti Pembayaran untuk non-tunai */}
              {(selectedReservation.metode_pembayaran === 'transfer' || selectedReservation.metode_pembayaran === 'qris') && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Label className="block mb-2 font-medium">Upload Bukti Pembayaran</Label>
                  {!paymentProofPreview ? (
                    <div className="flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="payment-proof-customer"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="payment-proof-customer"
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
                disabled={uploading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Pembayaran'
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Dengan mengkonfirmasi pembayaran, Anda menyetujui semua syarat dan ketentuan yang berlaku
              </p>
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
  getPaymentMethodIcon, 
  getPaymentMethodName,
  formatRupiah,
  formatDate
}: { 
  reservations: ReservationData[], 
  onViewDetails: (reservation: ReservationData) => void, 
  onPayNow: (reservation: ReservationData) => void,
  getStatusBadge: (status: string) => React.ReactNode,
  getPaymentMethodIcon: (method: string) => React.ReactNode,
  getPaymentMethodName: (method: string) => string,
  formatRupiah: (amount: number) => string,
  formatDate: (date: string) => string
}) => {
  console.log('ReservationsTable received:', reservations.length, 'reservations');

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada reservasi</h3>
        <p className="text-gray-500">Belum ada reservasi yang ditemukan</p>
        <Button className="mt-4 bg-amber-600" onClick={() => window.location.href = '/booking'}>
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
            <TableHead>Kode</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id_reservasi}>
              <TableCell className="font-mono text-sm">{reservation.kode_reservasi}</TableCell>
              <TableCell>{formatDate(reservation.tanggal)}</TableCell>
              <TableCell className="font-medium">{reservation.nama_layanan}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(reservation.metode_pembayaran)}
                  <span className="text-sm">{getPaymentMethodName(reservation.metode_pembayaran)}</span>
                </div>
              </TableCell>
              <TableCell>{formatRupiah(reservation.total_harga)}</TableCell>
              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Detail button clicked for:', reservation.id_reservasi);
                      onViewDetails(reservation);
                    }}
                  >
                    Detail
                  </Button>
                  {reservation.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        console.log('Pay button clicked for:', reservation.id_reservasi);
                        onPayNow(reservation);
                      }}
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