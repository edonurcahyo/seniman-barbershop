// src/pages/Admin.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Search, Filter, Upload, Image as ImageIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

  // Cek auth admin
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

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchReservations(),
        fetchCustomers(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard');
      if (response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axiosInstance.get('/admin/reservasi');
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

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    
    try {
      const payload: any = {};
      if (editForm.nama !== adminData?.nama) payload.nama = editForm.nama;
      if (editForm.email !== adminData?.email) payload.email = editForm.email;
      if (editForm.new_password) {
        payload.current_password = editForm.current_password;
        payload.new_password = editForm.new_password;
        payload.new_password_confirmation = editForm.new_password_confirmation;
      }
      
      if (Object.keys(payload).length === 0) {
        toast({ title: "Tidak ada perubahan" });
        setShowEditProfileDialog(false);
        return;
      }
      
      const response = await axiosInstance.put('/admin/profile', payload);
      
      if (response.data.success) {
        toast({ title: "Berhasil!", description: "Profil admin telah diperbarui" });
        setAdminData(response.data.admin);
        setShowEditProfileDialog(false);
        setEditForm({
          ...editForm,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan"
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

  const formatRupiah = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getImageUrl = (gambar: string | null) => {
    if (!gambar) return null;
    // Jika gambar sudah URL lengkap
    if (gambar.startsWith('http')) return gambar;
    // Jika gambar dari storage
    return `http://127.0.0.1:8000/storage/${gambar}`;
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.pelanggan_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.layanan_nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    return filtered;
  };

  // Revenue chart data
  const revenueData = [
    { month: 'Jan', revenue: 12500000 },
    { month: 'Feb', revenue: 14200000 },
    { month: 'Mar', revenue: 13800000 },
    { month: 'Apr', revenue: dashboardStats.monthlyRevenue || 15420000 },
    { month: 'Mei', revenue: 16200000 },
    { month: 'Jun', revenue: 17100000 },
  ];

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
          {/* Header dengan Logout */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, {adminData?.nama}</p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="appointments">Reservasi</TabsTrigger>
              <TabsTrigger value="services">Layanan</TabsTrigger>
              <TabsTrigger value="customers">Pelanggan</TabsTrigger>
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
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `Rp${value/1000000}jt`} />
                          <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Pendapatan" />
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

            {/* SERVICES TAB - DENGAN CRUD */}
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
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profil Admin</DialogTitle>
            <DialogDescription>Perbarui informasi akun administrator</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-nama">Nama</Label>
              <Input
                id="admin-nama"
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Ganti Password (Opsional)</h4>
              
              <div className="space-y-2 mb-3">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="********"
                  value={editForm.current_password}
                  onChange={(e) => setEditForm({ ...editForm, current_password: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 mb-3">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="********"
                  value={editForm.new_password}
                  onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  value={editForm.new_password_confirmation}
                  onChange={(e) => setEditForm({ ...editForm, new_password_confirmation: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
              <XCircleIcon className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleUpdateProfile} disabled={savingProfile} className="bg-amber-600 hover:bg-amber-700">
              <Save className="h-4 w-4 mr-2" />
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Form Dialog (Tambah/Edit Layanan) */}
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