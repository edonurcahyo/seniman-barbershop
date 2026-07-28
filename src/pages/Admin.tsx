// src/pages/Admin.tsx - FULL CODE RESPONSIVE MOBILE

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
  Search, Filter, Lock, Upload, Image as ImageIcon, Banknote, Upload as UploadIcon,
  ChevronRight, ChevronDown
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
  
  // FILTER PERIODE
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
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.pelanggan_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.layanan_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kode_reservasi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    return filtered;
  };

  // ============ CRUD FUNCTIONS ============
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

    if (editForm.new_password || editForm.new_password_confirmation || editForm.current_password) {
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
      const payload: any = {
        nama: editForm.nama.trim(),
        email: editForm.email.trim(),
      };

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

        if (response.data.admin) {
          setAdminData(response.data.admin);
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
    
    setQrFile(file);
    setIsQrChanged(true);
    
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
      
      formData.append('bank_bca', paymentSettings.bank_bca || '');
      formData.append('bank_mandiri', paymentSettings.bank_mandiri || '');
      formData.append('bank_bni', paymentSettings.bank_bni || '');
      formData.append('bank_bri', paymentSettings.bank_bri || '');
      
      if (qrFile) {
        console.log('Uploading new QR Code:', qrFile.name, qrFile.size);
        formData.append('qr_code', qrFile);
      } else {
        console.log('No new QR file, keeping existing');
      }
      
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
        
        await fetchPaymentSettings();
        resetQrState();
        
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

  const handleDeleteQr = async () => {
    if (!window.confirm('Yakin ingin menghapus QR Code? Ini akan menghapus QR Code dari database dan server.')) {
      return;
    }

    setSavingPayment(true);

    try {
      const response = await axiosInstance.delete('/payment-settings/qr', {
        params: { cabang_id: selectedCabangForPayment }
      });

      console.log('Delete QR response:', response.data);

      if (response.data.success) {
        toast({
          title: "Berhasil!",
          description: "QR Code berhasil dihapus",
        });

        setPaymentSettings(prev => ({ ...prev, qr_code: null }));
        setQrPreview(null);
        setQrFile(null);
        setIsQrChanged(false);
        
        const fileInput = document.getElementById('qr-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        await fetchPaymentSettings();
      }
    } catch (error: any) {
      console.error('Error deleting QR:', error);
      
      let errorMessage = 'Terjadi kesalahan saat menghapus QR Code';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error';
      }
      
      toast({
        variant: "destructive",
        title: "Gagal",
        description: errorMessage,
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
      
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text('Laporan Transaksi Reservasi', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
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
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          {/* Header - Responsive */}
          <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Dashboard Admin</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Selamat datang, {adminData?.nama}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs md:text-sm text-gray-500">Cabang:</span>
                <span className="text-xs md:text-sm font-semibold text-amber-600 bg-amber-50 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-amber-200">
                  {currentBranch?.name || 'Semua Cabang'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditProfileDialog(true)}
                className="border-amber-600 text-amber-600 hover:bg-amber-50 flex-1 sm:flex-none text-xs md:text-sm"
              >
                <UserCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Edit Profil</span>
                <span className="sm:hidden">Profil</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAdminLogout}
                className="text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Keluar</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
            {/* Tabs - Scrollable di mobile */}
            <TabsList className="flex w-full overflow-x-auto gap-1 bg-gray-100 p-1 rounded-lg md:grid md:grid-cols-6">
              <TabsTrigger value="dashboard" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">📊</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Reservasi</span>
                <span className="sm:hidden">📋</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Layanan</span>
                <span className="sm:hidden">✂️</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Pelanggan</span>
                <span className="sm:hidden">👤</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Laporan</span>
                <span className="sm:hidden">📄</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex-1 whitespace-nowrap text-xs md:text-sm py-1.5 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <span className="hidden sm:inline">Pembayaran</span>
                <span className="sm:hidden">💳</span>
              </TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                <Card className="p-3 md:p-6">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                    <CardTitle className="text-xs md:text-sm font-medium">Total Reservasi</CardTitle>
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <div className="text-xl md:text-2xl font-bold">{dashboardStats.totalReservations}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Total semua reservasi</p>
                  </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                    <CardTitle className="text-xs md:text-sm font-medium">Reservasi Hari Ini</CardTitle>
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <div className="text-xl md:text-2xl font-bold">{dashboardStats.todayReservations}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Dijadwalkan hari ini</p>
                  </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                    <CardTitle className="text-xs md:text-sm font-medium">Total Pelanggan</CardTitle>
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <div className="text-xl md:text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Pelanggan terdaftar</p>
                  </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0">
                    <CardTitle className="text-xs md:text-sm font-medium">Pendapatan Bulanan</CardTitle>
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <div className="text-base md:text-2xl font-bold">{formatRupiah(dashboardStats.monthlyRevenue)}</div>
                    <p className="text-[10px] md:text-xs text-green-600">↑ {dashboardStats.revenueGrowth}% dari bulan lalu</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">Tren Pendapatan</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Pendapatan 6 bulan terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis 
                            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}K`}
                            width={60}
                            domain={[0, 'dataMax + dataMax * 0.1']}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip 
                            formatter={(value) => formatRupiah(Number(value))}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
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
                    <CardTitle className="text-base md:text-lg">Distribusi Metode Pembayaran</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Berdasarkan total transaksi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentMethodData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* RESERVATIONS TAB - Responsive Mobile */}
            <TabsContent value="appointments" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <CardTitle className="text-base md:text-lg">Manajemen Reservasi</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Lihat dan kelola semua reservasi</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                        <Input 
                          placeholder="Cari..." 
                          className="pl-9 text-xs md:text-sm h-9 md:h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32 md:w-40 h-9 md:h-10 text-xs md:text-sm">
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
                <CardContent className="p-3 md:p-6 pt-0">
                  {/* 🔥 MOBILE VERSION - Card List */}
                  <div className="block md:hidden space-y-3">
                    {getFilteredReservations().map((reservation) => (
                      <Card key={reservation.id_reservasi} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-gray-500">Kode</p>
                              <p className="font-mono text-xs font-bold">{reservation.kode_reservasi}</p>
                            </div>
                            <div>{getStatusBadge(reservation.status)}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>
                              <p className="text-[10px] text-gray-500">Pelanggan</p>
                              <p className="font-medium">{reservation.pelanggan_nama || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Layanan</p>
                              <p className="font-medium">{reservation.layanan_nama}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Tanggal</p>
                              <p className="font-medium">{formatDate(reservation.tanggal_reservasi)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Total</p>
                              <p className="font-bold text-amber-600">{formatRupiah(reservation.total_harga)}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {reservation.bukti_pembayaran && (
                              <img 
                                src={getBuktiUrl(reservation.bukti_pembayaran)} 
                                alt="Bukti"
                                className="w-10 h-10 object-cover rounded border cursor-pointer"
                                onClick={() => {
                                  const url = getBuktiUrl(reservation.bukti_pembayaran);
                                  if (url) window.open(url, '_blank');
                                }}
                              />
                            )}
                            <Select
                              value={reservation.status}
                              onValueChange={(value) => handleUpdateReservationStatus(reservation.id_reservasi, value)}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="dikonfirmasi">Dikonfirmasi</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                              </SelectContent>
                            </Select>
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

            {/* SERVICES TAB - Responsive Mobile */}
            <TabsContent value="services" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-base md:text-lg">Manajemen Layanan</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Kelola layanan yang tersedia</CardDescription>
                    </div>
                    <Button onClick={handleAddService} className="bg-amber-600 hover:bg-amber-700 text-sm w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Layanan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  {/* 🔥 MOBILE VERSION - Card List */}
                  <div className="block md:hidden space-y-3">
                    {services.map((service) => (
                      <Card key={service.id_layanan} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {service.gambar ? (
                              <img 
                                src={getImageUrl(service.gambar)} 
                                alt={service.nama_layanan}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm truncate">{service.nama_layanan}</p>
                              <Badge className={service.status === 'aktif' ? 'bg-green-500' : 'bg-red-500'}>
                                {service.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{service.kode_layanan}</p>
                            <p className="text-xs font-bold text-amber-600">{formatRupiah(service.harga)}</p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEditService(service)}>
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs text-red-500" onClick={() => handleDeleteService(service.id_layanan, service.nama_layanan)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Hapus
                              </Button>
                            </div>
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
                                <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id_layanan, service.nama_layanan)}>
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
                    <div className="text-center py-8 text-gray-500">Tidak ada data layanan.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTS TAB - Responsive Mobile */}
            <TabsContent value="reports" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Export Laporan Reservasi</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Export data reservasi dengan filter periode</CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Filter - Stack di mobile */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-3">
                      <div className="w-full sm:w-48">
                        <Label className="text-xs md:text-sm">Periode</Label>
                        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                          <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
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
                          <div className="w-full sm:w-36">
                            <Label className="text-xs md:text-sm">Bulan</Label>
                            <Select value={filterMonth} onValueChange={setFilterMonth}>
                              <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
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

                          <div className="w-full sm:w-36">
                            <Label className="text-xs md:text-sm">Tahun</Label>
                            <Select value={filterYear} onValueChange={setFilterYear}>
                              <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
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
                          <div className="w-full sm:flex-1">
                            <Label className="text-xs md:text-sm">Tanggal Mulai</Label>
                            <Input
                              type="date"
                              value={dateRange.start}
                              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                              className="text-xs md:text-sm h-9 md:h-10"
                            />
                          </div>
                          <div className="w-full sm:flex-1">
                            <Label className="text-xs md:text-sm">Tanggal Akhir</Label>
                            <Input
                              type="date"
                              value={dateRange.end}
                              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                              className="text-xs md:text-sm h-9 md:h-10"
                            />
                          </div>
                        </>
                      )}

                      <div className="w-full sm:w-40">
                        <Label className="text-xs md:text-sm">Format Export</Label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={exportFormat === 'pdf' ? exportToPDF : exportToExcel} 
                        className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    {/* Info Filter Aktif */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-600">Filter aktif:</span>
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {filterPeriod === 'all' && 'Semua Data'}
                        {filterPeriod === 'today' && 'Hari Ini'}
                        {filterPeriod === 'this_month' && `Bulan ${getMonthName(parseInt(filterMonth))} ${filterYear}`}
                        {filterPeriod === 'custom' && dateRange.start && dateRange.end 
                          ? `${formatDateLocal(dateRange.start)} - ${formatDateLocal(dateRange.end)}`
                          : 'Kustom'}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-xs">
                        Total: {getFilteredReservations().length} transaksi
                      </Badge>
                    </div>
                    
                    {/* Preview Data - Responsive */}
                    <div className="mt-2">
                      <h3 className="font-semibold text-sm mb-2">Preview Data</h3>
                      <div className="hidden sm:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Kode</TableHead>
                              <TableHead className="text-xs">Pelanggan</TableHead>
                              <TableHead className="text-xs">Layanan</TableHead>
                              <TableHead className="text-xs">Tanggal</TableHead>
                              <TableHead className="text-xs">Waktu</TableHead>
                              <TableHead className="text-xs">Total</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredReservations().slice(0, 5).map((reservation) => (
                              <TableRow key={reservation.id_reservasi}>
                                <TableCell className="font-mono text-xs">{reservation.kode_reservasi}</TableCell>
                                <TableCell className="text-xs">{reservation.pelanggan_nama || '-'}</TableCell>
                                <TableCell className="text-xs">{reservation.layanan_nama}</TableCell>
                                <TableCell className="text-xs">{formatDate(reservation.tanggal_reservasi)}</TableCell>
                                <TableCell className="text-xs">{reservation.waktu || '-'}</TableCell>
                                <TableCell className="text-xs">{formatRupiah(reservation.total_harga)}</TableCell>
                                <TableCell className="text-xs">{getStatusBadge(reservation.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Mobile preview - Card */}
                      <div className="block sm:hidden space-y-2">
                        {getFilteredReservations().slice(0, 3).map((reservation) => (
                          <div key={reservation.id_reservasi} className="bg-gray-50 p-3 rounded-lg text-xs">
                            <div className="flex justify-between">
                              <span className="font-mono font-bold">{reservation.kode_reservasi}</span>
                              {getStatusBadge(reservation.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <span className="text-gray-500">{reservation.pelanggan_nama}</span>
                              <span className="text-right">{formatRupiah(reservation.total_harga)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {getFilteredReservations().length === 0 && (
                        <p className="text-center text-gray-500 py-4 text-sm">Tidak ada data</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CUSTOMERS TAB - Responsive Mobile */}
            <TabsContent value="customers" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Manajemen Pelanggan</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Lihat semua pelanggan terdaftar</CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  {/* 🔥 MOBILE VERSION - Card List */}
                  <div className="block md:hidden space-y-3">
                    {customers.map((customer) => (
                      <Card key={customer.id_pelanggan} className="p-4 shadow-sm">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{customer.nama}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-500">📱 {customer.no_hp || '-'}</p>
                          {customer.alamat && (
                            <p className="text-xs text-gray-400 truncate">{customer.alamat}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* 🔥 DESKTOP VERSION - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>No HP</TableHead>
                          <TableHead>Alamat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id_pelanggan}>
                            <TableCell className="font-medium">{customer.nama}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.no_hp || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{customer.alamat || '-'}</TableCell>
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

            {/* PAYMENT SETTINGS TAB - Responsive Mobile */}
            <TabsContent value="payments" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Pengaturan Pembayaran</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Kelola rekening bank dan QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6 pt-0">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Pilih Cabang</Label>
                    <Select value={selectedCabangForPayment} onValueChange={setSelectedCabangForPayment}>
                      <SelectTrigger className="w-full md:w-64 h-9 md:h-10 text-sm">
                        <SelectValue placeholder="Pilih cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Seniman Barbershop Rungkut</SelectItem>
                        <SelectItem value="2">Seniman Barbershop Pondok Tjandra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Banknote className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-sm md:text-base">Rekening Bank</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">BCA</Label>
                        <Input
                          placeholder="Nomor Rekening BCA"
                          value={paymentSettings.bank_bca}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bca: e.target.value })}
                          className="text-sm h-9 md:h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">Mandiri</Label>
                        <Input
                          placeholder="Nomor Rekening Mandiri"
                          value={paymentSettings.bank_mandiri}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_mandiri: e.target.value })}
                          className="text-sm h-9 md:h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">BNI</Label>
                        <Input
                          placeholder="Nomor Rekening BNI"
                          value={paymentSettings.bank_bni}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bni: e.target.value })}
                          className="text-sm h-9 md:h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">BRI</Label>
                        <Input
                          placeholder="Nomor Rekening BRI"
                          value={paymentSettings.bank_bri}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_bri: e.target.value })}
                          className="text-sm h-9 md:h-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <QrCode className="h-5 w-5 text-orange-600" />
                        <h3 className="font-semibold text-sm md:text-base">QRIS Code</h3>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-4 text-center">
                        {(qrPreview || getQrImageUrl(paymentSettings.qr_code)) ? (
                          <div className="space-y-3">
                            <img 
                              src={qrPreview || getQrImageUrl(paymentSettings.qr_code)} 
                              alt="QR Code"
                              className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto border rounded-lg bg-white p-2"
                            />
                            {qrPreview && (
                              <p className="text-xs text-green-600">✓ QR Code baru siap diupload</p>
                            )}
                            <div className="flex flex-wrap justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={handleDeleteQr} disabled={savingPayment}>
                                Hapus
                              </Button>
                              <label className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                  <span>Ganti QR</span>
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
                          <label className="cursor-pointer flex flex-col items-center justify-center py-6 md:py-8">
                            <UploadIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2" />
                            <span className="text-xs md:text-sm text-gray-500">Klik untuk upload QR Code</span>
                            <span className="text-[10px] md:text-xs text-gray-400">Format: JPG, PNG, WEBP (Max 2MB)</span>
                            <input
                              id="qr-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleQrUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        
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
                        
                        {paymentSettings.qr_code && !qrPreview && !qrFile && (
                          <p className="text-xs text-gray-500 mt-2">
                            QR Code saat ini (klik "Ganti QR" untuk mengubah)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSavePaymentSettings} 
                    disabled={savingPayment}
                    className="bg-amber-600 hover:bg-amber-700 w-full md:w-auto"
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
            <DialogTitle className="text-2xl font-bold">Edit Profil Admin</DialogTitle>
            <DialogDescription>
              Perbarui informasi akun administrator. Biarkan kosong jika tidak ingin mengubah password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-amber-50/30 rounded-lg p-4 border border-amber-100">
              <h4 className="font-semibold text-sm text-amber-700 mb-3 flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Data Diri
              </h4>
              
              <div className="space-y-4">
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