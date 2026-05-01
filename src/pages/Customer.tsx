// src/pages/Customer.tsx
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
  XCircle
} from 'lucide-react';

// Interface untuk data dari API
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
  
  // Form edit profile
  const [editForm, setEditForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    alamat: ''
  });

  // Data rekening bank
  const bankAccounts = [
    { bank: 'BCA', accountNumber: '1234567890', accountName: 'Seniman Barbershop' },
    { bank: 'Mandiri', accountNumber: '9876543210', accountName: 'Seniman Barbershop' },
    { bank: 'BNI', accountNumber: '5551234567', accountName: 'Seniman Barbershop' },
    { bank: 'BRI', accountNumber: '7778889990', accountName: 'Seniman Barbershop' }
  ];

  // Cek autentikasi dan load data
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

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
  
  // Ambil data user profile
  const fetchUserProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const pelangganId = user.id_pelanggan;
      
      const response = await axiosInstance.get('/pelanggan/profile', {
        params: { pelanggan_id: pelangganId }
      });
      
      if (response.data && response.data.id_pelanggan) {
        setUserData(response.data);
        // Update edit form
        setEditForm({
          nama: response.data.nama || '',
          email: response.data.email || '',
          no_hp: response.data.no_hp || '',
          alamat: response.data.alamat || ''
        });
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('customer_email', response.data.email);
        localStorage.setItem('customer_name', response.data.nama);
      } else {
        setUserData(user);
        setEditForm({
          nama: user.nama || '',
          email: user.email || '',
          no_hp: user.no_hp || '',
          alamat: user.alamat || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        setEditForm({
          nama: user.nama || '',
          email: user.email || '',
          no_hp: user.no_hp || '',
          alamat: user.alamat || ''
        });
      }
    }
  };

  // Ambil data reservasi
  const fetchReservations = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const pelangganId = user.id_pelanggan;
      
      const response = await axiosInstance.get('/reservasi/pelanggan', {
        params: { pelanggan_id: pelangganId }
      });
      
      if (response.data && response.data.data) {
        setReservations(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReservations(response.data);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    }
  };

  // Update profile
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
      const pelangganId = user.id_pelanggan;

      const response = await axiosInstance.put(`/pelanggan/${pelangganId}`, {
        nama: editForm.nama,
        email: editForm.email,
        no_hp: editForm.no_hp,
        alamat: editForm.alamat
      });

      if (response.data && response.data.success) {
        // Update userData state
        const updatedUser = {
          ...userData,
          nama: editForm.nama,
          email: editForm.email,
          no_hp: editForm.no_hp,
          alamat: editForm.alamat
        };
        setUserData(updatedUser as UserData);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('customer_email', editForm.email);
        localStorage.setItem('customer_name', editForm.nama);
        
        toast({
          title: "Berhasil!",
          description: "Profil Anda telah diperbarui.",
        });
        
        setShowEditProfileDialog(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('selected_cabang');
    localStorage.removeItem('selectedBranch');
    navigate('/login');
  };

  // Handle confirm payment
  const handleConfirmPayment = async () => {
    if (!selectedReservation) return;

    if (!paymentProof && selectedReservation.metode_pembayaran !== 'cash') {
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

      if (paymentProof) {
        const formData = new FormData();
        formData.append('bukti_pembayaran', paymentProof);

        const uploadResponse = await axiosInstance.post('/reservasi/upload-bukti', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        buktiUrl = uploadResponse.data.bukti_url;
      }

      await axiosInstance.put(`/reservasi/${selectedReservation.id_reservasi}/konfirmasi-pembayaran`, {
        bukti_pembayaran: buktiUrl
      });

      toast({
        title: "Pembayaran Berhasil! 🎉",
        description: "Pembayaran Anda telah dikonfirmasi.",
      });

      await fetchReservations();
      
      setShowPaymentDialog(false);
      setPaymentProof(null);
      setPaymentProofPreview(null);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Pembayaran Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel reservation
  const handleCancelReservation = async (id_reservasi: number) => {
    try {
      await axiosInstance.put(`/reservasi/${id_reservasi}/batal`);
      
      toast({
        title: "Reservasi Dibatalkan",
        description: "Reservasi Anda telah dibatalkan.",
      });
      
      await fetchReservations();
      setShowDetailDialog(false);
      
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast({
        variant: "destructive",
        title: "Gagal Membatalkan",
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    }
  };

  // Handle file upload
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

  // Format currency
  const formatRupiah = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format datetime
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

  // Get status badge
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

  // Get payment method icon
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

  // Get payment method name
  const getPaymentMethodName = (method: string) => {
    switch(method) {
      case 'cash': return 'Tunai';
      case 'transfer': return 'Transfer Bank';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  // Filter reservations
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

  // Customer stats
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
          {/* Header with Logout Button */}
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

          {/* Customer Profile Banner with Edit Button */}
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
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Member sejak {userData?.created_at ? formatDate(userData.created_at) : '-'}
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
                    setSelectedReservation(res);
                    setShowDetailDialog(true);
                  }}
                  onPayNow={(res) => {
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
            <DialogDescription>
              Perbarui informasi profil Anda di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Lengkap</Label>
              <Input
                id="edit-nama"
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Nomor Telepon</Label>
              <Input
                id="edit-phone"
                value={editForm.no_hp}
                onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                placeholder="08123456789"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Alamat (Opsional)</Label>
              <Input
                id="edit-address"
                value={editForm.alamat}
                onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                placeholder="Jl. Contoh No. 123"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditProfileDialog(false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={savingProfile}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reservation Detail Dialog - existing code */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        {/* ... same as before ... */}
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* ... konten sama seperti sebelumnya ... */}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog - existing code */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        {/* ... same as before ... */}
      </Dialog>

      <Footer />
    </>
  );
};

// Reservations Table Component (sama seperti sebelumnya)
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
            <TableHead>Kode</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Cabang</TableHead>
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
                <div className="flex items-center gap-1">
                  <Store className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{reservation.nama_cabang}</span>
                </div>
              </TableCell>
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
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(reservation)}>
                    Detail
                  </Button>
                  {reservation.status === 'pending' && (
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => onPayNow(reservation)}>
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