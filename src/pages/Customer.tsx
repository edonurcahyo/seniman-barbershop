// src/pages/Customer.tsx - FULL CODE RESPONSIVE MOBILE

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
import { Printer } from 'lucide-react'; 
import NotaPemesanan from '@/components/NotaPemesanan'; 
import { printNota } from '@/lib/printNota'; 
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
  Copy,
  Lock,
  ChevronRight,
  Clock as ClockIcon
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
  status: 'pending' | 'paid' | 'cancelled' | 'dikonfirmasi';
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
    alamat: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // ============ FUNGSI PAYMENT SETTINGS ============
  
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
      setPaymentSettings({
        bank_bca: '',
        bank_mandiri: '',
        bank_bni: '',
        bank_bri: '',
        qr_code: null
      });
    }
  };

  const getBankAccounts = () => {
    const banks = [
      { bank: 'BCA', accountNumber: paymentSettings.bank_bca, accountName: 'Seniman Barbershop' },
      { bank: 'Mandiri', accountNumber: paymentSettings.bank_mandiri, accountName: 'Seniman Barbershop' },
      { bank: 'BNI', accountNumber: paymentSettings.bank_bni, accountName: 'Seniman Barbershop' },
      { bank: 'BRI', accountNumber: paymentSettings.bank_bri, accountName: 'Seniman Barbershop' }
    ];
    return banks.filter(bank => bank.accountNumber && bank.accountNumber.trim() !== '');
  };

  const getQrImageUrl = (qrCode: string | null) => {
    if (!qrCode) return null;
    if (qrCode.startsWith('http')) return qrCode;
    return `http://127.0.0.1:8000/storage/${qrCode}`;
  };

  // ============ END PAYMENT SETTINGS ============

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (showPaymentDialog && selectedReservation?.cabang_id) {
      fetchPaymentSettings(selectedReservation.cabang_id.toString());
    }
  }, [showPaymentDialog, selectedReservation?.cabang_id]);

  const checkAuthAndLoadData = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('🔍 Auth check:', { 
      hasUser: !!userStr, 
      hasToken: !!token, 
      isLoggedIn 
    });
    
    if (!userStr || !token || !isLoggedIn) {
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
        alamat: user.alamat || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('⚠️ No user data found');
        return;
      }
      
      const user = JSON.parse(userStr);
      const pelangganId = user.id_pelanggan;
      
      console.log('🔍 Fetching reservations for pelanggan_id:', pelangganId);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('⚠️ No auth token found');
        toast({
          title: "Session Expired",
          description: "Silakan login kembali",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      const response = await axiosInstance.get('/reservasi/pelanggan', {
        params: { pelanggan_id: pelangganId }
      });
      
      console.log('✅ Response:', response.data);
      
      let reservationsData = [];
      if (response.data && response.data.data) {
        reservationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        reservationsData = response.data;
      }
      
      setReservations(reservationsData);
      console.log('📋 Reservations loaded:', reservationsData.length);
      
    } catch (error: any) {
      console.error('❌ Error fetching reservations:', error);
      
      if (error.response?.status === 401) {
        console.log('🔴 401 Unauthorized - Token expired');
        toast({
          title: "Session Expired",
          description: "Silakan login kembali",
          variant: "destructive",
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
      
      setReservations([]);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editForm.nama || !editForm.nama.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama tidak boleh kosong",
      });
      return;
    }

    if (!editForm.email || !editForm.email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email tidak boleh kosong",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Format email tidak valid",
      });
      return;
    }

    if (!editForm.no_hp || !editForm.no_hp.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nomor telepon tidak boleh kosong",
      });
      return;
    }

    const isPasswordFilled = editForm.current_password || editForm.new_password || editForm.new_password_confirmation;
    
    if (isPasswordFilled) {
      if (!editForm.current_password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password saat ini harus diisi untuk mengganti password",
        });
        return;
      }
      
      if (!editForm.new_password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password baru harus diisi",
        });
        return;
      }
      
      if (!editForm.new_password_confirmation) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Konfirmasi password baru harus diisi",
        });
        return;
      }
      
      if (editForm.new_password.length < 6) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password baru minimal 6 karakter",
        });
        return;
      }
      
      if (editForm.new_password !== editForm.new_password_confirmation) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password baru dan konfirmasi password tidak sama",
        });
        return;
      }
    }

    setSavingProfile(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Session expired, silakan login kembali",
        });
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      const pelangganId = user.id_pelanggan;

      const payload: any = {
        nama: editForm.nama.trim(),
        email: editForm.email.trim(),
        no_hp: editForm.no_hp.trim(),
        alamat: editForm.alamat || '',
      };

      if (editForm.new_password) {
        payload.current_password = editForm.current_password;
        payload.new_password = editForm.new_password;
        payload.new_password_confirmation = editForm.new_password_confirmation;
      }

      console.log('Sending update profile payload:', payload);

      const response = await axiosInstance.put(`/pelanggan/${pelangganId}`, payload);

      console.log('Update response:', response.data);

      if (response.data.success) {
        const updatedUser = {
          ...user,
          nama: editForm.nama.trim(),
          email: editForm.email.trim(),
          no_hp: editForm.no_hp.trim(),
          alamat: editForm.alamat || '',
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('customer_email', updatedUser.email);
        localStorage.setItem('customer_name', updatedUser.nama);
        
        setUserData(updatedUser);
        
        setEditForm({
          ...editForm,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });

        toast({
          title: "Berhasil!",
          description: "Profil Anda telah diperbarui.",
        });
        
        setShowEditProfileDialog(false);
      } else {
        throw new Error(response.data.message || 'Gagal memperbarui profil');
      }

    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Terjadi kesalahan saat memperbarui profil';
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      'Server error';
      } else if (error.request) {
        errorMessage = 'Tidak ada response dari server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan';
      }

      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: errorMessage,
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

  const handleConfirmPayment = async () => {
    if (!selectedReservation) return;

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

      if (paymentProof) {
        const formData = new FormData();
        formData.append('bukti_pembayaran', paymentProof);
        
        console.log('Uploading payment proof...');
        const uploadResponse = await axiosInstance.post('/reservasi/upload-bukti', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('Upload response:', uploadResponse.data);
        
        buktiUrl = uploadResponse.data.bukti_url || uploadResponse.data.data?.bukti_url;
        console.log('Bukti URL:', buktiUrl);
      }

      const payload: any = {};
      if (buktiUrl) {
        payload.bukti_pembayaran = buktiUrl;
      }

      console.log('Confirming payment with payload:', payload);
      const response = await axiosInstance.put(`/reservasi/${selectedReservation.id_reservasi}/konfirmasi-pembayaran`, payload);

      console.log('Confirm payment response:', response.data);

      setReservations(prev => prev.map(res => 
        res.id_reservasi === selectedReservation.id_reservasi 
          ? { 
              ...res, 
              status: 'pending',
              bukti_pembayaran: buktiUrl || res.bukti_pembayaran
            }
          : res
      ));

      toast({
        title: "Bukti Pembayaran Terkirim! 📤",
        description: "Bukti pembayaran Anda telah terkirim. Silakan tunggu konfirmasi dari admin.",
      });

      setShowPaymentDialog(false);
      setPaymentProof(null);
      setPaymentProofPreview(null);

    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Silakan login kembali",
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Gagal Mengirim Bukti",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelReservation = async (id_reservasi: number) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
      return;
    }

    try {
      const response = await axiosInstance.put(`/reservasi/${id_reservasi}/batal`);
      
      console.log('Cancel response:', response.data);
      
      if (response.data.success) {
        setReservations(prev => prev.map(res => 
          res.id_reservasi === id_reservasi 
            ? { ...res, status: 'cancelled' }
            : res
        ));
        
        toast({
          title: "Berhasil!",
          description: "Reservasi Anda telah dibatalkan.",
        });
        
        setShowDetailDialog(false);
      } else {
        throw new Error(response.data.message || 'Gagal membatalkan reservasi');
      }
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      
      let errorMessage = 'Terjadi kesalahan saat membatalkan reservasi';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error';
      } else if (error.request) {
        errorMessage = 'Tidak ada response dari server';
      }
      
      toast({
        variant: "destructive",
        title: "Gagal",
        description: errorMessage,
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
      case 'dikonfirmasi':
        return <Badge className="bg-green-500 text-white">Lunas ✓</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Menunggu Konfirmasi</Badge>;
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

  const handlePrintNota = () => {
    printNota();
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
      filtered = filtered.filter(res => res.status === 'paid' || res.status === 'cancelled' || res.status === 'dikonfirmasi');
    }
    
    return filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  };

  const customerStats = {
    upcomingReservations: reservations.filter(r => r.status === 'pending').length,
    completedReservations: reservations.filter(r => r.status === 'paid' || r.status === 'dikonfirmasi').length,
    totalSpent: reservations.filter(r => r.status === 'paid' || r.status === 'dikonfirmasi').reduce((sum, r) => sum + r.total_harga, 0),
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
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          {/* Header */}
          <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Barber Account</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Kelola reservasi dan lihat riwayat pemesanan Anda</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-600 hover:bg-red-50 w-full sm:w-auto text-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Profile Banner - Responsive */}
          <Card className="mb-4 md:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{userData?.nama || 'Customer'}</h2>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      <div className="flex items-center text-xs md:text-sm text-gray-600">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{userData?.email || '-'}</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm text-gray-600">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                        {userData?.no_hp || '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditProfileDialog(true)}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50 flex-1 sm:flex-none text-xs md:text-sm"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Edit Profil
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-none text-xs md:text-sm" 
                    onClick={() => navigate('/booking')}
                  >
                    <Scissors className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Reservasi Baru
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                <CardTitle className="text-xs md:text-sm font-medium">Reservasi Mendatang</CardTitle>
                <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </CardHeader>
              <CardContent className="p-0 pt-1">
                <div className="text-xl md:text-2xl font-bold">{customerStats.upcomingReservations}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Menunggu konfirmasi</p>
              </CardContent>
            </Card>
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                <CardTitle className="text-xs md:text-sm font-medium">Riwayat Reservasi</CardTitle>
                <History className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </CardHeader>
              <CardContent className="p-0 pt-1">
                <div className="text-xl md:text-2xl font-bold">{customerStats.completedReservations}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Reservasi selesai</p>
              </CardContent>
            </Card>
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                <CardTitle className="text-xs md:text-sm font-medium">Total Belanja</CardTitle>
                <Receipt className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </CardHeader>
              <CardContent className="p-0 pt-1">
                <div className="text-sm md:text-2xl font-bold truncate">{formatRupiah(customerStats.totalSpent)}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Sepanjang member</p>
              </CardContent>
            </Card>
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                <CardTitle className="text-xs md:text-sm font-medium">Layanan Favorit</CardTitle>
                <Star className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </CardHeader>
              <CardContent className="p-0 pt-1">
                <div className="text-sm md:text-xl font-bold text-amber-600 truncate">{customerStats.favoriteService}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Paling sering dipesan</p>
              </CardContent>
            </Card>
          </div>

          {/* Reservations Section */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg md:text-xl">Reservasi Saya</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Lihat semua reservasi yang sudah Anda pesan</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari reservasi..." 
                    className="pl-9 text-sm h-9 md:h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Tabs - Scrollable di mobile */}
                <TabsList className="flex w-full overflow-x-auto gap-1 bg-gray-100 p-1 rounded-lg md:grid md:grid-cols-3">
                  <TabsTrigger 
                    value="reservations" 
                    className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white"
                  >
                    Semua
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upcoming" 
                    className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white"
                  >
                    Menunggu
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white"
                  >
                    Riwayat
                  </TabsTrigger>
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
                    if (res.metode_pembayaran === 'cash') {
                      toast({
                        title: "Informasi",
                        description: "Pembayaran tunai dilakukan di tempat. Tunggu konfirmasi dari admin.",
                        variant: "default",
                      });
                      return;
                    }
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
      <Dialog open={showEditProfileDialog} onOpenChange={(open) => {
        if (!open) {
          setEditForm({
            ...editForm,
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
          });
        }
        setShowEditProfileDialog(open);
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profil</DialogTitle>
            <DialogDescription>
              Perbarui informasi profil Anda. Biarkan kosong jika tidak ingin mengubah password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-amber-50/30 rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-sm text-amber-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Data Diri
              </h4>
              
              <div className="space-y-4">
                {/* NAMA LENGKAP */}
                <div className="space-y-2">
                  <Label htmlFor="edit-nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-nama"
                    value={editForm.nama}
                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    disabled={savingProfile}
                  />
                </div>
                
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@example.com"
                    disabled={savingProfile}
                  />
                </div>
                
                {/* NOMOR TELEPON */}
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Nomor Telepon <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-phone"
                    value={editForm.no_hp}
                    onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                    placeholder="08123456789"
                    disabled={savingProfile}
                  />
                </div>
                
                {/* ALAMAT */}
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Alamat</Label>
                  <Input
                    id="edit-address"
                    value={editForm.alamat || ''}
                    onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                    placeholder="Jl. Contoh No. 123"
                    disabled={savingProfile}
                  />
                </div>
              </div>
            </div>
            <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Ganti Password
              </h4>
              
              <p className="text-xs text-gray-500 mb-4">
                Isi hanya jika ingin mengganti password. Semua field password harus diisi.
              </p>
              
              <div className="space-y-4">
                {/* PASSWORD SAAT INI */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Masukkan password saat ini"
                    value={editForm.current_password}
                    onChange={(e) => setEditForm({ ...editForm, current_password: e.target.value })}
                    disabled={savingProfile}
                  />
                </div>
                
                {/* PASSWORD BARU */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Masukkan password baru (min 6 karakter)"
                    value={editForm.new_password}
                    onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                    disabled={savingProfile}
                  />
                </div>
                
                {/* KONFIRMASI PASSWORD BARU */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                    value={editForm.new_password_confirmation}
                    onChange={(e) => setEditForm({ ...editForm, new_password_confirmation: e.target.value })}
                    disabled={savingProfile}
                  />
                </div>
                
                {/* INFORMASI TAMBAHAN */}
                <div className="p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 flex items-start gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      <strong>Tips:</strong> Password baru minimal 6 karakter. 
                      Password akan tetap sama jika tidak diisi.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
          </div>

          <DialogFooter className="flex gap-3 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditForm({
                  ...editForm,
                  current_password: '',
                  new_password: '',
                  new_password_confirmation: ''
                });
                setShowEditProfileDialog(false);
              }}
              disabled={savingProfile}
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
              <div className="hidden">
                <NotaPemesanan 
                  reservation={{
                    kode_reservasi: selectedReservation.kode_reservasi,
                    nama_layanan: selectedReservation.nama_layanan,
                    total_harga: selectedReservation.total_harga,
                    tanggal: selectedReservation.tanggal,
                    waktu: selectedReservation.waktu,
                    nama_cabang: selectedReservation.nama_cabang,
                    cabang_alamat: selectedReservation.cabang_alamat,
                    pelanggan_nama: selectedReservation.pelanggan_nama || userData?.nama,
                    durasi: selectedReservation.durasi,
                    metode_pembayaran: selectedReservation.metode_pembayaran,
                    status: selectedReservation.status
                  }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start p-3 md:p-4 bg-gray-50 rounded-lg gap-3">
                <div>
                  <p className="text-xs text-gray-600">Kode Reservasi</p>
                  <p className="font-mono font-bold text-sm md:text-base">{selectedReservation.kode_reservasi}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  {getStatusBadge(selectedReservation.status)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm md:text-base mb-3">Detail Layanan</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div><p className="text-xs text-gray-600">Layanan</p><p className="font-medium text-sm md:text-base">{selectedReservation.nama_layanan}</p></div>
                  <div><p className="text-xs text-gray-600">Durasi</p><p className="font-medium text-sm md:text-base">{selectedReservation.durasi}</p></div>
                  <div><p className="text-xs text-gray-600">Tanggal</p><p className="font-medium text-sm md:text-base">{formatDate(selectedReservation.tanggal)}</p></div>
                  <div><p className="text-xs text-gray-600">Waktu</p><p className="font-medium text-sm md:text-base">{selectedReservation.waktu}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-600">Cabang</p><p className="font-medium text-sm md:text-base">{selectedReservation.nama_cabang}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-600">Total</p><p className="font-bold text-amber-600 text-base md:text-lg">{formatRupiah(selectedReservation.total_harga)}</p></div>
                </div>
              </div>

              {selectedReservation.catatan && (
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-2">Catatan</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReservation.catatan}</p>
                </div>
              )}
              
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrintNota}
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  <Printer className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Cetak Nota
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDetailDialog(false)}>Tutup</Button>
                {selectedReservation.status === 'pending' && (
                  <>
                    {selectedReservation.metode_pembayaran === 'cash' ? (
                      <Button 
                        disabled
                        size="sm"
                        className="bg-gray-400 text-white cursor-not-allowed"
                      >
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Menunggu Konfirmasi
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => { 
                          setShowDetailDialog(false); 
                          setShowPaymentDialog(true); 
                        }} 
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Bayar Sekarang
                      </Button>
                    )}
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelReservation(selectedReservation.id_reservasi)}
                    >
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
                          ⚠️ Transfer sesuai dengan total: <strong>{formatRupiah(selectedReservation.total_harga)}</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Kode: <strong className="font-mono">{selectedReservation.kode_reservasi}</strong>
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
                          className="w-48 h-48 md:w-56 md:h-56 object-contain bg-white rounded-xl shadow-lg border-2 border-orange-200 p-4"
                        />
                      </div>
                      <p className="text-sm text-orange-600">Scan menggunakan e-wallet atau m-banking</p>
                      <div className="bg-yellow-50 p-2 rounded mt-2">
                        <p className="text-xs text-yellow-700">
                          💰 Nominal: <strong>{formatRupiah(selectedReservation.total_harga)}</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Kode: <strong className="font-mono">{selectedReservation.kode_reservasi}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR Code akan segera diupdate</p>
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
                  <p className="text-center text-green-700">Bayar tunai saat tiba di tempat</p>
                  <div className="mt-3 p-2 bg-white rounded text-center">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-xl font-bold text-green-600">{formatRupiah(selectedReservation.total_harga)}</p>
                  </div>
                  <p className="text-xs text-green-600 text-center mt-3">
                    📍 {selectedReservation.nama_cabang}
                  </p>
                </div>
              )}

              {/* Upload Bukti Pembayaran */}
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
                        <p className="text-sm text-gray-500">Klik untuk upload bukti</p>
                        <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
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
                Dengan mengkonfirmasi pembayaran, Anda menyetujui syarat dan ketentuan
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

// ============================================================
// RESERVATIONS TABLE - Responsive Mobile
// ============================================================

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
      <div className="text-center py-8 md:py-12">
        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Tidak ada reservasi</h3>
        <p className="text-sm text-gray-500">Belum ada reservasi yang ditemukan</p>
        <Button className="mt-4 bg-amber-600 text-sm" onClick={() => window.location.href = '/booking'}>
          Buat Reservasi Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 🔥 MOBILE VERSION - Card List */}
      <div className="block md:hidden space-y-3">
        {reservations.map((reservation) => (
          <Card key={reservation.id_reservasi} className="p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header: Kode & Status */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Kode Reservasi</p>
                  <p className="font-mono text-sm font-bold">{reservation.kode_reservasi}</p>
                </div>
                <div>{getStatusBadge(reservation.status)}</div>
              </div>
              
              {/* Info Layanan */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Layanan</p>
                  <p className="font-medium">{reservation.nama_layanan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>
                  <p className="font-medium">{formatDate(reservation.tanggal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Waktu</p>
                  <p className="font-medium">{reservation.waktu}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Metode</p>
                  <div className="flex items-center gap-1">
                    {getPaymentMethodIcon(reservation.metode_pembayaran)}
                    <span className="text-sm">{getPaymentMethodName(reservation.metode_pembayaran)}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-amber-600">{formatRupiah(reservation.total_harga)}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onViewDetails(reservation)}
                >
                  Detail
                </Button>
                {reservation.status === 'pending' && (
                  <Button 
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs"
                    onClick={() => onPayNow(reservation)}
                  >
                    Bayar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 🔥 DESKTOP VERSION - Table */}
      <div className="hidden md:block overflow-x-auto">
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
                      onClick={() => onViewDetails(reservation)}
                    >
                      Detail
                    </Button>
                    {reservation.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700"
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
    </div>
  );
};

export default Customer;