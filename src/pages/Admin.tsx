// src/pages/Admin.tsx - FULL CODE LENGKAP

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '@/context/BranchContext';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/axios';
import { 
  Calendar, Users, Scissors, DollarSign, Plus, Edit, Trash2, 
  CreditCard, Wallet, Landmark, QrCode, TrendingUp, Clock, 
  CheckCircle2, XCircle, AlertCircle, FileText, FileSpreadsheet, 
  Download, Printer, LogOut, UserCircle, Save, XCircle as XCircleIcon,
  Search, Filter, Upload, Image as ImageIcon, Banknote, Upload as UploadIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface untuk data dari API
interface AdminData {
  id_admin: number;
  nama: string;
  email: string;
  created_at: string;
}

interface ReservationData {
  id_reservasi: number;
  kode_reservasi: string;
  pelanggan_id: number;
  pelanggan_nama: string;
  cabang_id: number;
  cabang_nama: string;
  layanan_id: number;
  layanan_nama: string;
  tanggal_reservasi: string;
  waktu: string;
  total_harga: number;
  status: string;
  metode_pembayaran: string;
  bukti_pembayaran?: string;
  created_at: string;
}

interface CustomerData {
  id_pelanggan: number;
  nama: string;
  email: string;
  no_hp: string;
  alamat: string;
  created_at: string;
}

interface ServiceData {
  id_layanan: number;
  kode_layanan: string;
  nama_layanan: string;
  harga: number;
  durasi: number;
  deskripsi: string;
  status: string;
  gambar: string | null;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState('pdf');
  const transactionsTableRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  
  // Data dari API
  const [dashboardStats, setDashboardStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0
  });
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // 🔥 FILTER PERIODE
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [filterYear, setFilterYear] = useState<string>(
    String(new Date().getFullYear())
  );
  
  // Edit Profile Dialog
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // CRUD Layanan states
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [serviceForm, setServiceForm] = useState({
    kode_layanan: '',
    nama_layanan: '',
    harga: '',
    durasi: '',
    deskripsi: '',
    status: 'aktif'
  });
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  // Payment Settings states
  const [paymentSettings, setPaymentSettings] = useState({
    bank_bca: '',
    bank_mandiri: '',
    bank_bni: '',
    bank_bri: '',
    qr_code: null as string | null
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [selectedCabangForPayment, setSelectedCabangForPayment] = useState('1');
  const [isQrChanged, setIsQrChanged] = useState(false);

  const resetQrState = () => {
  setQrFile(null);
  setQrPreview(null);
  setIsQrChanged(false);
  // Reset file input
  const fileInput = document.getElementById('qr-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

  // Revenue chart data
  const [revenueChartData, setRevenueChartData] = useState([
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'Mei', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ]);

  // ============ HELPER FUNCTIONS ============
  const getMonthName = (month: number): string => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || 'Januari';
  };

  const formatDateLocal = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ============ LIFE CYCLE ============
  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('admin_token');
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
      
      if (!token || !isLoggedIn) {
        navigate('/admin/login');
        return;
      }
      
      await fetchAdminProfile();
      await loadAllData();
    };
    
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentSettings();
    }
  }, [activeTab, selectedCabangForPayment]);

  useEffect(() => {
    if (currentBranch?.id && !loading) {
      fetchReservations();
      fetchDashboardStats();
      fetchMonthlyRevenue();
    }
  }, [currentBranch?.id]);

  // ============ FETCH FUNCTIONS ============
  const fetchAdminProfile = async () => {
    try {
      const response = await axiosInstance.get('/admin/profile');
      if (response.data) {
        setAdminData(response.data);
        setEditForm({
          nama: response.data.nama || '',
          email: response.data.email || '',
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      navigate('/admin/login');
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      console.log('Fetching payment settings for cabang:', selectedCabangForPayment);
      
      const response = await axiosInstance.get('/payment-settings', {
        params: { cabang_id: selectedCabangForPayment }
      });
      
      console.log('Payment settings response:', response.data);
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        setPaymentSettings({
          bank_bca: data.bank_bca || '',
          bank_mandiri: data.bank_mandiri || '',
          bank_bni: data.bank_bni || '',
          bank_bri: data.bank_bri || '',
          qr_code: data.qr_code || null
        });
        
        if (data.qr_code) {
          setQrPreview(null); 
        }
      
        resetQrState();
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const params: any = {};
      if (currentBranch?.id) {
        params.cabang_id = currentBranch.id;
      }
      
      const response = await axiosInstance.get('/admin/dashboard', { params });
      if (response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const params: any = {};
      if (currentBranch?.id) {
        params.cabang_id = currentBranch.id;
      }
      
      const response = await axiosInstance.get('/admin/reservasi', { params });
      if (response.data && response.data.data) {
        setReservations(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/admin/pelanggan');
      if (response.data && response.data.data) {
        setCustomers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get('/layanan');
      if (response.data && response.data.data) {
        setServices(response.data.data);
      } else if (Array.isArray(response.data)) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const params: any = {};
      if (currentBranch?.id) {
        params.cabang_id = currentBranch.id;
      }
      
      const response = await axiosInstance.get('/admin/revenue-monthly', { params });
      if (response.data && response.data.data) {
        setRevenueChartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchReservations(),
        fetchCustomers(),
        fetchServices(),
        fetchMonthlyRevenue()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ FILTER FUNCTIONS ============
  const getFilteredReservations = () => {
    let filtered = [...reservations];
    
    // 🔥 FILTER PERIODE
    if (filterPeriod === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(r => r.tanggal_reservasi === today);
    } 
    else if (filterPeriod === 'this_month') {
      const month = parseInt(filterMonth);
      const year = parseInt(filterYear);
      filtered = filtered.filter(r => {
        const date = new Date(r.tanggal_reservasi);
        return date.getMonth() === month - 1 && date.getFullYear() === year;
      });
    }
    else if (filterPeriod === 'custom') {
      if (dateRange.start && dateRange.end) {
        filtered = filtered.filter(r => {
          return r.tanggal_reservasi >= dateRange.start && r.tanggal_reservasi <= dateRange.end;
        });
      } else if (dateRange.start) {
        filtered = filtered.filter(r => r.tanggal_reservasi >= dateRange.start);
      } else if (dateRange.end) {
        filtered = filtered.filter(r => r.tanggal_reservasi <= dateRange.end);
      }
    }
    
    // 🔥 FILTER SEARCH
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.pelanggan_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.layanan_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kode_reservasi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 🔥 FILTER STATUS
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    return filtered;
  };

  // ============ CRUD FUNCTIONS ============
  const handleUpdateProfile = async () => {
    // 🔥 VALIDASI NAMA & EMAIL
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

    // 🔥 VALIDASI FORMAT EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Format email tidak valid",
      });
      return;
    }

    // 🔥 VALIDASI PASSWORD (jika ada yang diisi)
    if (editForm.new_password || editForm.new_password_confirmation || editForm.current_password) {
      // Jika salah satu field password diisi, semua harus diisi
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
      // 🔥 BUAT PAYLOAD
      const payload: any = {
        nama: editForm.nama.trim(),
        email: editForm.email.trim(),
      };

      // 🔥 Jika ada password baru, kirim juga
      if (editForm.new_password) {
        payload.current_password = editForm.current_password;
        payload.new_password = editForm.new_password;
        payload.new_password_confirmation = editForm.new_password_confirmation;
      }

      console.log('Sending payload:', payload);

      const response = await axiosInstance.put('/admin/profile', payload);

      console.log('Update response:', response.data);

      if (response.data.success) {
        toast({
          title: "Berhasil!",
          description: "Profil admin telah diperbarui",
        });

        // 🔥 Update data admin
        if (response.data.admin) {
          setAdminData(response.data.admin);
          
          // 🔥 Update editForm dengan data baru (reset password fields)
          setEditForm({
            nama: response.data.admin.nama || '',
            email: response.data.admin.email || '',
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
          });
        }

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
        title: "Gagal",
        description: errorMessage,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await axiosInstance.post('/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin');
      localStorage.removeItem('isAdminLoggedIn');
      navigate('/admin/login');
    }
  };

  const handleUpdateReservationStatus = async (id: number, status: string) => {
    try {
      await axiosInstance.put(`/admin/reservasi/${id}/status`, { status });
      toast({ title: "Berhasil", description: "Status reservasi diperbarui" });
      fetchReservations();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan" });
    }
  };

  // ============ CRUD LAYANAN ============
  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setServiceForm({
      ...serviceForm,
      [e.target.id]: e.target.value
    });
  };

  const handleServiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Error", description: "Harap upload file gambar" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Error", description: "Ukuran file maksimal 2MB" });
        return;
      }
      setServiceImage(file);
      setServiceImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceForm({
      kode_layanan: '',
      nama_layanan: '',
      harga: '',
      durasi: '',
      deskripsi: '',
      status: 'aktif'
    });
    setServiceImage(null);
    setServiceImagePreview(null);
    setShowServiceDialog(true);
  };

  const handleEditService = (service: ServiceData) => {
    setEditingService(service);
    setServiceForm({
      kode_layanan: service.kode_layanan,
      nama_layanan: service.nama_layanan,
      harga: service.harga.toString(),
      durasi: service.durasi.toString(),
      deskripsi: service.deskripsi || '',
      status: service.status
    });
    setServiceImage(null);
    setServiceImagePreview(null);
    setShowServiceDialog(true);
  };

  const handleSaveService = async () => {
    if (!serviceForm.kode_layanan || !serviceForm.nama_layanan || !serviceForm.harga || !serviceForm.durasi) {
      toast({ variant: "destructive", title: "Error", description: "Harap lengkapi semua field" });
      return;
    }

    setSavingService(true);

    try {
      const formData = new FormData();
      formData.append('kode_layanan', serviceForm.kode_layanan);
      formData.append('nama_layanan', serviceForm.nama_layanan);
      formData.append('harga', serviceForm.harga);
      formData.append('durasi', serviceForm.durasi);
      formData.append('deskripsi', serviceForm.deskripsi);
      formData.append('status', serviceForm.status);
      
      if (serviceImage) {
        formData.append('gambar', serviceImage);
      }

      let response;
      if (editingService) {
        formData.append('_method', 'PUT');
        response = await axiosInstance.post(`/layanan/${editingService.id_layanan}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axiosInstance.post('/layanan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast({ title: "Berhasil", description: editingService ? "Layanan berhasil diupdate" : "Layanan berhasil ditambahkan" });
        setShowServiceDialog(false);
        fetchServices();
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({ variant: "destructive", title: "Gagal", description: error.response?.data?.message || "Terjadi kesalahan" });
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: number, name: string) => {
    if (window.confirm(`Yakin ingin menghapus layanan "${name}"?`)) {
      setDeletingServiceId(id);
      try {
        const response = await axiosInstance.delete(`/layanan/${id}`);
        if (response.data.success) {
          toast({ title: "Berhasil", description: "Layanan berhasil dihapus" });
          fetchServices();
        }
      } catch (error: any) {
        console.error('Error deleting service:', error);
        toast({ variant: "destructive", title: "Gagal", description: error.response?.data?.message || "Terjadi kesalahan" });
      } finally {
        setDeletingServiceId(null);
      }
    }
  };

  // ============ PAYMENT SETTINGS ============
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('QR file selected:', file);
    
    if (!file) {
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Format file harus JPG, PNG, atau WEBP" 
      });
      e.target.value = '';
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Ukuran file maksimal 2MB" 
      });
      e.target.value = '';
      return;
    }
    
    // 🔥 Set file dan preview
    setQrFile(file);
    setIsQrChanged(true); // 🔥 Tandai bahwa QR berubah
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setQrPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    toast({ 
      title: "Berhasil", 
      description: `File "${file.name}" siap diupload (${(file.size / 1024).toFixed(1)} KB)` 
    });
  };

  const handleSavePaymentSettings = async () => {
    setSavingPayment(true);
    
    try {
      const formData = new FormData();
      formData.append('cabang_id', selectedCabangForPayment);
      
      // 🔥 Kirim data bank (termasuk yang kosong)
      formData.append('bank_bca', paymentSettings.bank_bca || '');
      formData.append('bank_mandiri', paymentSettings.bank_mandiri || '');
      formData.append('bank_bni', paymentSettings.bank_bni || '');
      formData.append('bank_bri', paymentSettings.bank_bri || '');
      
      // 🔥 Upload QR Code hanya jika ada file baru
      if (qrFile) {
        console.log('Uploading new QR Code:', qrFile.name, qrFile.size);
        formData.append('qr_code', qrFile);
      } else {
        console.log('No new QR file, keeping existing');
      }
      
      // 🔥 Debug log
      console.log('Saving payment settings:');
      console.log('- Cabang:', selectedCabangForPayment);
      console.log('- Bank BCA:', paymentSettings.bank_bca);
      console.log('- Bank Mandiri:', paymentSettings.bank_mandiri);
      console.log('- QR File:', qrFile ? qrFile.name : 'Tidak ada file baru');
      
      const response = await axiosInstance.post('/payment-settings', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      console.log('Save response:', response.data);
      
      if (response.data.success) {
        toast({ 
          title: "Berhasil", 
          description: "Pengaturan pembayaran berhasil disimpan" 
        });
        
        // 🔥 Refresh data
        await fetchPaymentSettings();
        
        // 🔥 Reset QR state setelah sukses
        resetQrState();
        
        // 🔥 Tampilkan QR code yang baru diupload
        if (response.data.data && response.data.data.qr_code) {
          setPaymentSettings(prev => ({
            ...prev,
            qr_code: response.data.data.qr_code
          }));
        }
      } else {
        throw new Error(response.data.message || 'Gagal menyimpan');
      }
      
    } catch (error: any) {
      console.error('Error saving payment settings:', error);
      
      let errorMessage = 'Terjadi kesalahan saat menyimpan pengaturan';
      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      'Server error';
      } else if (error.request) {
        errorMessage = 'Tidak ada response dari server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan';
      }
      
      toast({ 
        variant: "destructive", 
        title: "Gagal", 
        description: errorMessage
      });
    } finally {
      setSavingPayment(false);
    }
  };

  // ============ EXPORT FUNCTIONS ============
  const exportToPDF = () => {
    const filteredData = getFilteredReservations();
    
    if (filteredData.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada data reservasi untuk diexport",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF('landscape');
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text('Laporan Transaksi Reservasi', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Info filter
      let periodText = 'Semua Data';
      if (filterPeriod === 'today') periodText = 'Hari Ini';
      else if (filterPeriod === 'this_month') periodText = `Bulan ${getMonthName(parseInt(filterMonth))} ${filterYear}`;
      else if (filterPeriod === 'custom' && dateRange.start && dateRange.end) {
        periodText = `${formatDateLocal(dateRange.start)} - ${formatDateLocal(dateRange.end)}`;
      }
      
      doc.text(`Periode: ${periodText}`, 14, 35);
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);
      doc.text(`Total Transaksi: ${filteredData.length}`, 14, 49);
      
      const totalAmount = filteredData.reduce((sum, t) => {
        const harga = typeof t.total_harga === 'number' ? t.total_harga : parseFloat(t.total_harga) || 0;
        return sum + harga;
      }, 0);
      
      doc.text(`Total Pendapatan: Rp ${totalAmount.toLocaleString('id-ID')}`, 14, 56);
      
      // Table
      autoTable(doc, {
        startY: 65,
        head: [['Kode', 'Pelanggan', 'Layanan', 'Cabang', 'Tanggal', 'Waktu', 'Metode', 'Total', 'Status']],
        body: filteredData.map(r => {
          const harga = typeof r.total_harga === 'number' ? r.total_harga : parseFloat(r.total_harga) || 0;
          return [
            r.kode_reservasi || '-',
            r.pelanggan_nama || '-',
            r.layanan_nama || '-',
            r.cabang_nama || '-',
            formatDate(r.tanggal_reservasi),
            r.waktu || '-',
            r.metode_pembayaran || '-',
            `Rp ${harga.toLocaleString('id-ID')}`,
            r.status === 'pending' ? 'Menunggu' : 
            r.status === 'dikonfirmasi' ? 'Dikonfirmasi' : 
            r.status === 'selesai' ? 'Selesai' : 'Dibatalkan'
          ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 3 },
      });
      
      doc.save(`laporan_reservasi_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Berhasil!",
        description: `Laporan PDF berhasil diexport (${filteredData.length} data)`,
      });
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Gagal Export PDF",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat PDF",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const filteredData = getFilteredReservations();
    
    if (filteredData.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada data reservasi untuk diexport",
        variant: "destructive",
      });
      return;
    }

    try {
      const worksheetData = filteredData.map(r => {
        const harga = typeof r.total_harga === 'number' ? r.total_harga : parseFloat(r.total_harga) || 0;
        return {
          'Kode Reservasi': r.kode_reservasi || '-',
          'Pelanggan': r.pelanggan_nama || '-',
          'Layanan': r.layanan_nama || '-',
          'Cabang': r.cabang_nama || '-',
          'Tanggal': formatDate(r.tanggal_reservasi),
          'Waktu': r.waktu || '-',
          'Metode Pembayaran': r.metode_pembayaran || '-',
          'Total': harga,
          'Status': r.status === 'pending' ? 'Menunggu' : 
                   r.status === 'dikonfirmasi' ? 'Dikonfirmasi' : 
                   r.status === 'selesai' ? 'Selesai' : 'Dibatalkan'
        };
      });
      
      const totalAmount = worksheetData.reduce((sum, r) => sum + (r.Total || 0), 0);
      
      worksheetData.push({
        'Kode Reservasi': 'TOTAL',
        'Pelanggan': '',
        'Layanan': '',
        'Cabang': '',
        'Tanggal': '',
        'Waktu': '',
        'Metode Pembayaran': '',
        'Total': totalAmount,
        'Status': ''
      });
      
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Reservasi');
      
      ws['!cols'] = [
        { wch: 18 }, // Kode
        { wch: 20 }, // Pelanggan
        { wch: 20 }, // Layanan
        { wch: 28 }, // Cabang
        { wch: 15 }, // Tanggal
        { wch: 12 }, // Waktu
        { wch: 20 }, // Metode
        { wch: 18 }, // Total
        { wch: 18 }  // Status
      ];
      
      // Format currency di Excel
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 7 });
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '"Rp "#,##0.00';
        }
      }
      
      XLSX.writeFile(wb, `laporan_reservasi_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Berhasil!",
        description: `Laporan Excel berhasil diexport (${filteredData.length} data)`,
      });
      
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast({
        title: "Gagal Export Excel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat file Excel",
        variant: "destructive",
      });
    }
  };

  // ============ UI HELPERS ============
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      pending: { label: 'Menunggu', color: 'bg-yellow-500' },
      dikonfirmasi: { label: 'Dikonfirmasi', color: 'bg-blue-500' },
      selesai: { label: 'Selesai', color: 'bg-green-500' },
      dibatalkan: { label: 'Dibatalkan', color: 'bg-red-500' }
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-500' };
    return <Badge className={`${s.color} text-white`}>{s.label}</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method) {
      case 'cash': return <Wallet className="h-4 w-4 text-green-600" />;
      case 'transfer': return <Landmark className="h-4 w-4 text-blue-600" />;
      case 'qris': return <QrCode className="h-4 w-4 text-orange-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getBuktiUrl = (bukti: string | undefined) => {
    if (!bukti) return null;
    if (bukti.startsWith('http')) return bukti;
    return `http://127.0.0.1:8000/storage/${bukti}`;
  };

  const formatRupiah = (amount: number) => {
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getImageUrl = (gambar: string | null) => {
    if (!gambar) return null;
    if (gambar.startsWith('http')) return gambar;
    return `http://127.0.0.1:8000/storage/${gambar}`;
  };

  const getQrImageUrl = (qrCode: string | null) => {
    if (!qrCode) return null;
    if (qrCode.startsWith('http')) return qrCode;
    if (qrCode.startsWith('storage/')) {
      return `http://127.0.0.1:8000/${qrCode}`;
    }
    return `http://127.0.0.1:8000/storage/${qrCode}`;
  };

  const paymentMethodData = [
    { name: 'Tunai', value: reservations.filter(r => r.metode_pembayaran === 'cash').length, color: '#10b981' },
    { name: 'Transfer', value: reservations.filter(r => r.metode_pembayaran === 'transfer').length, color: '#3b82f6' },
    { name: 'QRIS', value: reservations.filter(r => r.metode_pembayaran === 'qris').length, color: '#f97316' },
  ];

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, {adminData?.nama}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Cabang:</span>
                <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {currentBranch?.name || 'Semua Cabang'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowEditProfileDialog(true)}
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAdminLogout}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="appointments">Reservasi</TabsTrigger>
              <TabsTrigger value="services">Layanan</TabsTrigger>
              <TabsTrigger value="customers">Pelanggan</TabsTrigger>
              <TabsTrigger value="reports">Laporan</TabsTrigger>
              <TabsTrigger value="payments">Pembayaran</TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reservasi</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalReservations}</div>
                    <p className="text-xs text-muted-foreground">Total semua reservasi</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reservasi Hari Ini</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.todayReservations}</div>
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
                    <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
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
                        <LineChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis 
                            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}K`}
                            width={70}
                            domain={[0, 'dataMax + dataMax * 0.1']}
                          />
                          <Tooltip 
                            formatter={(value) => formatRupiah(Number(value))}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#f59e0b" 
                            strokeWidth={2} 
                            name="Pendapatan" 
                          />
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
                            data={paymentMethodData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentMethodData.filter(d => d.value > 0).map((entry, index) => (
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

            {/* RESERVATIONS TAB */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Manajemen Reservasi</CardTitle>
                      <CardDescription>Lihat dan kelola semua reservasi</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Cari pelanggan/layanan..." 
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="dikonfirmasi">Dikonfirmasi</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                          <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Layanan</TableHead>
                          <TableHead>Cabang</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Metode</TableHead>
                          <TableHead>Bukti</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredReservations().map((reservation) => (
                          <TableRow key={reservation.id_reservasi}>
                            <TableCell className="font-mono text-sm">{reservation.kode_reservasi}</TableCell>
                            <TableCell>{reservation.pelanggan_nama || '-'}</TableCell>
                            <TableCell>{reservation.layanan_nama}</TableCell>
                            <TableCell>{reservation.cabang_nama || '-'}</TableCell>
                            <TableCell>{formatDate(reservation.tanggal_reservasi)}</TableCell>
                            <TableCell>{reservation.waktu}</TableCell>
                            <TableCell>{formatRupiah(reservation.total_harga)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(reservation.metode_pembayaran)}
                                <span className="capitalize text-sm">{reservation.metode_pembayaran}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {reservation.bukti_pembayaran ? (
                                <img 
                                  src={getBuktiUrl(reservation.bukti_pembayaran)} 
                                  alt="Bukti Pembayaran"
                                  className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    const url = getBuktiUrl(reservation.bukti_pembayaran);
                                    if (url) window.open(url, '_blank');
                                  }}
                                  title="Klik untuk melihat bukti pembayaran"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell>
                              <Select
                                value={reservation.status}
                                onValueChange={(value) => handleUpdateReservationStatus(reservation.id_reservasi, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Menunggu</SelectItem>
                                  <SelectItem value="dikonfirmasi">Dikonfirmasi</SelectItem>
                                  <SelectItem value="selesai">Selesai</SelectItem>
                                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {getFilteredReservations().length === 0 && (
                    <div className="text-center py-8 text-gray-500">Tidak ada data reservasi</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SERVICES TAB */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Layanan</CardTitle>
                      <CardDescription>Kelola layanan yang tersedia (Tambah, Edit, Hapus)</CardDescription>
                    </div>
                    <Button onClick={handleAddService} className="bg-amber-600 hover:bg-amber-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Layanan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gambar</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Nama Layanan</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Durasi</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id_layanan}>
                            <TableCell>
                              {service.gambar ? (
                                <img 
                                  src={getImageUrl(service.gambar)} 
                                  alt={service.nama_layanan}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{service.kode_layanan}</TableCell>
                            <TableCell className="font-medium">{service.nama_layanan}</TableCell>
                            <TableCell>{formatRupiah(service.harga)}</TableCell>
                            <TableCell>{service.durasi} menit</TableCell>
                            <TableCell className="max-w-xs truncate">{service.deskripsi || '-'}</TableCell>
                            <TableCell>
                              <Badge className={service.status === 'aktif' ? 'bg-green-500' : 'bg-red-500'}>
                                {service.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditService(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeleteService(service.id_layanan, service.nama_layanan)}
                                  disabled={deletingServiceId === service.id_layanan}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {services.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Tidak ada data layanan. Klik "Tambah Layanan" untuk menambahkan.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Laporan Reservasi</CardTitle>
                  <CardDescription>Export data reservasi dengan filter periode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    {/* Filter Periode */}
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="w-48">
                        <Label>Periode</Label>
                        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Periode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Data</SelectItem>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="this_month">Bulan Ini</SelectItem>
                            <SelectItem value="custom">Kustom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(filterPeriod === 'custom' || filterPeriod === 'this_month') && (
                        <>
                          <div className="w-40">
                            <Label>Bulan</Label>
                            <Select value={filterMonth} onValueChange={setFilterMonth}>
                              <SelectTrigger>
                                <SelectValue placeholder="Bulan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="01">Januari</SelectItem>
                                <SelectItem value="02">Februari</SelectItem>
                                <SelectItem value="03">Maret</SelectItem>
                                <SelectItem value="04">April</SelectItem>
                                <SelectItem value="05">Mei</SelectItem>
                                <SelectItem value="06">Juni</SelectItem>
                                <SelectItem value="07">Juli</SelectItem>
                                <SelectItem value="08">Agustus</SelectItem>
                                <SelectItem value="09">September</SelectItem>
                                <SelectItem value="10">Oktober</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">Desember</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-40">
                            <Label>Tahun</Label>
                            <Select value={filterYear} onValueChange={setFilterYear}>
                              <SelectTrigger>
                                <SelectValue placeholder="Tahun" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <SelectItem key={year} value={String(year)}>
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {filterPeriod === 'custom' && (
                        <>
                          <div className="flex-1">
                            <Label>Tanggal Mulai</Label>
                            <Input
                              type="date"
                              value={dateRange.start}
                              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Tanggal Akhir</Label>
                            <Input
                              type="date"
                              value={dateRange.end}
                              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      <div className="w-48">
                        <Label>Format Export</Label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={exportFormat === 'pdf' ? exportToPDF : exportToExcel} 
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Laporan
                      </Button>
                    </div>

                    {/* Info Filter Aktif */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-gray-600">Filter aktif:</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {filterPeriod === 'all' && 'Semua Data'}
                        {filterPeriod === 'today' && 'Hari Ini'}
                        {filterPeriod === 'this_month' && `Bulan ${getMonthName(parseInt(filterMonth))} ${filterYear}`}
                        {filterPeriod === 'custom' && dateRange.start && dateRange.end 
                          ? `${formatDateLocal(dateRange.start)} - ${formatDateLocal(dateRange.end)}`
                          : 'Kustom'}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        Total Data: {getFilteredReservations().length} transaksi
                      </Badge>
                    </div>
                    
                    {/* Preview Data */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Preview Data</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode</TableHead>
                              <TableHead>Pelanggan</TableHead>
                              <TableHead>Layanan</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Waktu</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredReservations().slice(0, 5).map((reservation) => (
                              <TableRow key={reservation.id_reservasi}>
                                <TableCell className="font-mono text-sm">{reservation.kode_reservasi}</TableCell>
                                <TableCell>{reservation.pelanggan_nama || '-'}</TableCell>
                                <TableCell>{reservation.layanan_nama}</TableCell>
                                <TableCell>{formatDate(reservation.tanggal_reservasi)}</TableCell>
                                <TableCell>{reservation.waktu || '-'}</TableCell> 
                                <TableCell>{formatRupiah(reservation.total_harga)}</TableCell>
                                <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {getFilteredReservations().length === 0 && (
                        <p className="text-center text-gray-500 py-4">Tidak ada data</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CUSTOMERS TAB */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Pelanggan</CardTitle>
                  <CardDescription>Lihat semua pelanggan terdaftar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>No HP</TableHead>
                          <TableHead>Alamat</TableHead>
                          <TableHead>Terdaftar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id_pelanggan}>
                            <TableCell>{customer.id_pelanggan}</TableCell>
                            <TableCell className="font-medium">{customer.nama}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.no_hp || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{customer.alamat || '-'}</TableCell>
                            <TableCell>{formatDate(customer.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {customers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Tidak ada data pelanggan</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENT SETTINGS TAB */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Pembayaran</CardTitle>
                  <CardDescription>Kelola rekening bank dan QR code untuk pembayaran</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Pilih Cabang</Label>
                    <Select value={selectedCabangForPayment} onValueChange={setSelectedCabangForPayment}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Pilih cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Seniman Barbershop Rungkut</SelectItem>
                        <SelectItem value="2">Seniman Barbershop Pondok Tjandra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Banknote className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Rekening Bank</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>BCA</Label>
                        <Input
                          placeholder="Nomor Rekening BCA"
                          value={paymentSettings.bank_bca}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bca: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Mandiri</Label>
                        <Input
                          placeholder="Nomor Rekening Mandiri"
                          value={paymentSettings.bank_mandiri}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_mandiri: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>BNI</Label>
                        <Input
                          placeholder="Nomor Rekening BNI"
                          value={paymentSettings.bank_bni}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bni: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>BRI</Label>
                        <Input
                          placeholder="Nomor Rekening BRI"
                          value={paymentSettings.bank_bri}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bri: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <QrCode className="h-5 w-5 text-orange-600" />
                        <h3 className="font-semibold">QRIS Code</h3>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {/* 🔥 Tampilkan preview (dari upload baru atau dari server) */}
                        {(qrPreview || getQrImageUrl(paymentSettings.qr_code)) ? (
                          <div className="space-y-3">
                            <img 
                              src={qrPreview || getQrImageUrl(paymentSettings.qr_code)} 
                              alt="QR Code"
                              className="w-48 h-48 object-contain mx-auto border rounded-lg bg-white p-2"
                            />
                            {qrPreview && (
                              <p className="text-xs text-green-600">
                                ✓ QR Code baru siap diupload
                              </p>
                            )}
                            <div className="flex justify-center gap-2 flex-wrap">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={resetQrState}
                              >
                                Hapus
                              </Button>
                              <label className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                  <span>Ganti QR Code</span>
                                </Button>
                                <input
                                  id="qr-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleQrUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center py-8">
                            <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Klik untuk upload QR Code</span>
                            <span className="text-xs text-gray-400">Format: JPG, PNG, WEBP (Max 2MB)</span>
                            <input
                              id="qr-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleQrUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        
                        {/* 🔥 Informasi file yang akan diupload */}
                        {qrFile && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-left">
                            <p className="text-xs text-blue-700">
                              <strong>File siap upload:</strong> {qrFile.name}
                            </p>
                            <p className="text-xs text-blue-600">
                              Ukuran: {(qrFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        )}
                        
                        {/* 🔥 Tampilkan QR Code lama jika ada */}
                        {paymentSettings.qr_code && !qrPreview && !qrFile && (
                          <p className="text-xs text-gray-500 mt-2">
                            QR Code saat ini (klik "Ganti QR Code" untuk mengubah)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSavePaymentSettings} 
                    disabled={savingPayment}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {savingPayment ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onOpenChange={(open) => {
        if (!open) {
          // 🔥 Reset form saat dialog ditutup tanpa menyimpan
          setEditForm({
            ...editForm,
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
          });
        }
        setShowEditProfileDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profil Admin</DialogTitle>
            <DialogDescription>
              Perbarui informasi akun administrator. Biarkan kosong jika tidak ingin mengubah password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 🔥 NAMA */}
            <div className="space-y-2">
              <Label htmlFor="admin-nama">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="admin-nama"
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                disabled={savingProfile}
              />
            </div>
            
            {/* 🔥 EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="admin-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="admin@example.com"
                disabled={savingProfile}
              />
            </div>
            
            {/* 🔥 PISAH DENGAN BORDER */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Ganti Password (Opsional)</h4>
              <p className="text-xs text-gray-500 mb-3">
                Isi hanya jika ingin mengganti password. Semua field password harus diisi.
              </p>
              
              {/* 🔥 PASSWORD SAAT INI */}
              <div className="space-y-2 mb-3">
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
              
              {/* 🔥 PASSWORD BARU */}
              <div className="space-y-2 mb-3">
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
              
              {/* 🔥 KONFIRMASI PASSWORD BARU */}
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
              
              {/* 🔥 INFORMASI TAMBAHAN */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tips:</strong> Password baru minimal 6 karakter. 
                  Password akan tetap sama jika tidak diisi.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                // 🔥 Reset form password
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
              <XCircleIcon className="h-4 w-4 mr-2" />
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

      {/* Service Form Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Perbarui informasi layanan' : 'Masukkan data layanan baru'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kode_layanan">Kode Layanan *</Label>
              <Input
                id="kode_layanan"
                value={serviceForm.kode_layanan}
                onChange={handleServiceInputChange}
                placeholder="Contoh: BC, HAW, KH"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nama_layanan">Nama Layanan *</Label>
              <Input
                id="nama_layanan"
                value={serviceForm.nama_layanan}
                onChange={handleServiceInputChange}
                placeholder="Contoh: Bald Cut"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="harga">Harga (Rp) *</Label>
                <Input
                  id="harga"
                  type="number"
                  value={serviceForm.harga}
                  onChange={handleServiceInputChange}
                  placeholder="45000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durasi">Durasi (menit) *</Label>
                <Input
                  id="durasi"
                  type="number"
                  value={serviceForm.durasi}
                  onChange={handleServiceInputChange}
                  placeholder="30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={serviceForm.deskripsi}
                onChange={handleServiceInputChange}
                placeholder="Deskripsi layanan..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={serviceForm.status} onValueChange={(value) => setServiceForm({ ...serviceForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gambar">Gambar Layanan</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="gambar"
                  type="file"
                  accept="image/*"
                  onChange={handleServiceImageUpload}
                  className="flex-1"
                />
              </div>
              {serviceImagePreview && (
                <div className="mt-2">
                  <img src={serviceImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                </div>
              )}
              {!serviceImagePreview && editingService?.gambar && (
                <div className="mt-2">
                  <img 
                    src={getImageUrl(editingService.gambar)} 
                    alt={editingService.nama_layanan}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gambar saat ini</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              <XCircleIcon className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSaveService} disabled={savingService} className="bg-amber-600 hover:bg-amber-700">
              <Save className="h-4 w-4 mr-2" />
              {savingService ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Admin;