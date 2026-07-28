import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Wallet, Landmark, QrCode, ChevronRight, CheckCircle2, Upload, X, Clock, AlertCircle, MapPin, Store, Phone, Clock as ClockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Printer } from 'lucide-react';
import NotaPemesanan from '@/components/NotaPemesanan';
import { printNota } from '@/lib/printNota';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import axiosInstance from '@/lib/axios';
import { useBranch } from '@/context/BranchContext';

// Interface untuk data dari API
interface ServiceData {
  id_layanan: number;
  kode_layanan: string;
  nama_layanan: string;
  harga: number;
  durasi: number;
  deskripsi: string;
  status: string;
  gambar?: string | null;
}

interface TimeSlotData {
  id_slot: number;
  jam_mulai: string;
  jam_selesai: string;
  status: 'tersedia' | 'dibooking' | 'lewat';
}

interface ReservationData {
  id_reservasi: string;
  kode_reservasi: string;
  id_pelanggan: number;
  id_layanan: number;
  id_slot: number;
  tanggal: string;
  total_harga: number;
  metode_pembayaran: string;
  status_pembayaran: 'pending' | 'paid' | 'cancelled';
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

const Booking = () => {
  const { toast } = useToast();
  const { currentBranch } = useBranch();
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [showPayLaterDialog, setShowPayLaterDialog] = useState(false);
  const [showCashSuccessDialog, setShowCashSuccessDialog] = useState(false);
  const [savedReservation, setSavedReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data dari API
  const [services, setServices] = useState<ServiceData[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bank_bca: '',
    bank_mandiri: '',
    bank_bni: '',
    bank_bri: '',
    qr_code: null
  });
  
  // FORM DATA - SATU FIELD NAMA
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handlePrintNota = () => {
    printNota();
  };

  // Fetch payment settings dari API
  const fetchPaymentSettings = async () => {
    try {
      const response = await axiosInstance.get('/payment-settings/public', {
        params: { cabang_id: currentBranch?.id || '1' }
      });
      if (response.data && response.data.data) {
        setPaymentSettings({
          bank_bca: response.data.data.bank_bca || '',
          bank_mandiri: response.data.data.bank_mandiri || '',
          bank_bni: response.data.data.bank_bni || '',
          bank_bri: response.data.data.bank_bri || '',
          qr_code: response.data.data.qr_code || null
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  // Buat array bank accounts dari paymentSettings (hanya yang terisi)
  const bankAccounts = [
    { bank: 'BCA', accountNumber: paymentSettings.bank_bca, accountName: 'Seniman Barbershop' },
    { bank: 'Mandiri', accountNumber: paymentSettings.bank_mandiri, accountName: 'Seniman Barbershop' },
    { bank: 'BNI', accountNumber: paymentSettings.bank_bni, accountName: 'Seniman Barbershop' },
    { bank: 'BRI', accountNumber: paymentSettings.bank_bri, accountName: 'Seniman Barbershop' }
  ].filter(bank => bank.accountNumber);

  // FUNGSI UNTUK LOAD DATA USER YANG LOGIN - SATU FIELD NAMA
  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    console.log('User data from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        setFormData({
          nama: user.nama || '',
          email: user.email || '',
          phone: user.no_hp || user.phone || '',
          notes: ''
        });
        
        console.log('Form auto-filled with user data:', {
          nama: user.nama,
          email: user.email,
          phone: user.no_hp || user.phone
        });
        
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.log('No user data found in localStorage');
    }
  };

  // Load layanan dari API
  const loadServices = async () => {
    try {
      const response = await axiosInstance.get('/layanan');
      let servicesData = [];
      if (response.data && response.data.data) {
        servicesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      }
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data layanan",
      });
    }
  };

  // Load time slots ketika tanggal berubah
  const loadTimeSlots = async (tanggal: string) => {
    try {
      const response = await axiosInstance.get(`/slots/${tanggal}`);
      let slotsData = [];
      if (response.data && response.data.data) {
        slotsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        slotsData = response.data;
      }
      setTimeSlots(slotsData);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots([]);
    }
  };

  // useEffect untuk load data user, services, dan payment settings saat component mount
  useEffect(() => {
    loadUserData();
    loadServices();
    fetchPaymentSettings();
  }, []);

  // Re-fetch payment settings ketika cabang berubah
  useEffect(() => {
    if (currentBranch?.id) {
      fetchPaymentSettings();
    }
  }, [currentBranch?.id]);

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setSelectedTime(null);
    setSelectedSlotId(null);
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      loadTimeSlots(formattedDate);
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string, slotId: number, isAvailable: boolean) => {
    if (!isAvailable) {
      toast({
        variant: "destructive",
        title: "Tidak Tersedia",
        description: "Slot waktu ini sudah dibooking",
      });
      return;
    }
    setSelectedTime(time);
    setSelectedSlotId(slotId);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const getSelectedServiceData = () => {
    return services.find(s => s.id_layanan.toString() === selectedService);
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPayment);
  };

  // Get image URL layanan
  const getServiceImageUrl = (gambar: string | null | undefined) => {
    const defaultImage = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    if (!gambar) return defaultImage;
    if (gambar.startsWith('http')) return gambar;
    return `http://127.0.0.1:8000/storage/${gambar}`;
  };

  // Format price
  const formatRupiah = (price: number) => {
    const num = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  // Helper function untuk parse time string
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Helper function untuk menghitung estimasi selesai
  const getEstimatedEndTime = (startTime: string, durationMinutes: number) => {
    const startDate = parseTime(startTime);
    const endDate = addMinutes(startDate, durationMinutes);
    return format(endDate, 'HH:mm');
  };

  // Get available time slots - TAMPILKAN SEMUA SLOT 15 MENIT
  const getAvailableTimeSlots = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = date && format(date, 'yyyy-MM-dd') === today;
    
    const slots = timeSlots.map(slot => {
      const [hours, minutes] = slot.jam_mulai.split(':').map(Number);
      const slotMinutes = hours * 60 + minutes;
      
      const isPassed = isToday && slotMinutes < currentMinutes;
      const isAvailable = slot.status === 'tersedia' && !isPassed;
      
      return {
        time: slot.jam_mulai.substring(0, 5),
        slotId: slot.id_slot,
        isAvailable: isAvailable,
        isPassed: isPassed,
        status: slot.status
      };
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Get QR image URL
  const getQrImageUrl = (qrCode: string | null) => {
    if (!qrCode) return null;
    if (qrCode.startsWith('http')) return qrCode;
    return `http://127.0.0.1:8000/storage/${qrCode}`;
  };

  // Cek apakah metode pembayaran adalah Tunai
  const isCashPayment = selectedPayment === 'cash';

  // Validasi lengkap sebelum submit
  const validateBookingData = () => {
    if (!selectedService) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih layanan terlebih dahulu." });
      return false;
    }
    if (!date || !selectedTime) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih tanggal dan waktu terlebih dahulu." });
      return false;
    }
    if (!selectedPayment) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih metode pembayaran terlebih dahulu." });
      return false;
    }
    return true;
  };

  // Handle booking untuk metode Tunai
  const handleCashBooking = async () => {
    if (!validateBookingData()) return;

    if (!formData.nama || !formData.email || !formData.phone) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap lengkapi semua data diri terlebih dahulu" 
      });
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id_pelanggan) {
      toast({ 
        variant: "destructive", 
        title: "Login Diperlukan", 
        description: "Silakan login terlebih dahulu untuk melakukan booking" 
      });
      return;
    }

    const selectedServiceData = getSelectedServiceData();
    if (!selectedServiceData) return;

    const cabangId = currentBranch?.id ? parseInt(currentBranch.id) : 1;

    setLoading(true);

    try {
      const response = await axiosInstance.post('/reservasi', {
        pelanggan_id: user.id_pelanggan,
        cabang_id: cabangId,
        layanan_id: parseInt(selectedService),
        slot_id: selectedSlotId,
        tanggal_reservasi: format(date!, 'yyyy-MM-dd'),
        total_harga: selectedServiceData.harga,
        metode_pembayaran: 'cash',
        catatan: formData.notes,
        nama: formData.nama,
        email: formData.email,
        no_hp: formData.phone,
        status_pembayaran: 'pending'
      });

      if (response.data) {
        setSavedReservation({
          id_reservasi: response.data.id_reservasi || '',
          kode_reservasi: response.data.kode_reservasi || 'RES-001',
          id_pelanggan: user.id_pelanggan,
          id_layanan: parseInt(selectedService),
          id_slot: selectedSlotId || 0,
          tanggal: format(date!, 'yyyy-MM-dd'),
          total_harga: selectedServiceData.harga,
          metode_pembayaran: 'cash',
          status_pembayaran: 'pending',
          catatan: formData.notes,
          created_at: new Date().toISOString()
        });
      }

      setShowCashSuccessDialog(true);
      
      toast({
        title: "Booking Berhasil! 🎉",
        description: "Reservasi Anda berhasil dipesan. Silakan datang sesuai jadwal dan lakukan pembayaran tunai di tempat.",
      });
      
      if (date) {
        loadTimeSlots(format(date, 'yyyy-MM-dd'));
      }
    } catch (error: any) {
      console.error('Cash booking error:', error);
      toast({
        variant: "destructive",
        title: "Booking Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setLoading(false);
    }
  };

  // Simpan reservasi ke database (Bayar Nanti)
  const handleSaveReservation = async () => {
    if (!validateBookingData()) return;

    if (!formData.nama || !formData.email || !formData.phone) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap lengkapi semua data diri terlebih dahulu" 
      });
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id_pelanggan) {
      toast({ 
        variant: "destructive", 
        title: "Login Diperlukan", 
        description: "Silakan login terlebih dahulu untuk melakukan booking" 
      });
      return;
    }

    const selectedServiceData = getSelectedServiceData();
    if (!selectedServiceData) return;

    const cabangId = currentBranch?.id ? parseInt(currentBranch.id) : 1;

    setLoading(true);

    try {
      const response = await axiosInstance.post('/reservasi', {
        pelanggan_id: user.id_pelanggan,
        cabang_id: cabangId,
        layanan_id: parseInt(selectedService),
        slot_id: selectedSlotId,
        tanggal_reservasi: format(date!, 'yyyy-MM-dd'),
        total_harga: selectedServiceData.harga,
        metode_pembayaran: selectedPayment,
        catatan: formData.notes,
        nama: formData.nama,
        email: formData.email,
        no_hp: formData.phone,
        status_pembayaran: 'pending'
      });

      setSavedReservation(response.data);
      setShowPayLaterDialog(true);
      
      toast({
        title: "Reservasi Disimpan! 📝",
        description: "Data reservasi Anda telah kami simpan. Silakan selesaikan pembayaran sebelum batas waktu.",
      });
    } catch (error: any) {
      console.error('Save reservation error:', error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lanjut ke pembayaran (Bayar Sekarang)
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBookingData()) return;

    if (!formData.nama || !formData.email || !formData.phone) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap lengkapi semua data diri terlebih dahulu" 
      });
      return;
    }
    
    setShowPaymentDialog(true);
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

  // Handle Payment Confirm
  const handlePaymentConfirm = async () => {
    if (selectedPayment !== 'cash' && !paymentProof) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Harap upload bukti pembayaran terlebih dahulu" 
      });
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id_pelanggan) {
      toast({ 
        variant: "destructive", 
        title: "Login Diperlukan", 
        description: "Silakan login terlebih dahulu" 
      });
      return;
    }

    const selectedServiceData = getSelectedServiceData();
    if (!selectedServiceData) return;

    const cabangId = currentBranch?.id ? parseInt(currentBranch.id) : 1;

    setLoading(true);

    try {
      let buktiUrl = null;

      if (paymentProof) {
        const formDataUpload = new FormData();
        formDataUpload.append('bukti_pembayaran', paymentProof);
        
        const uploadResponse = await axiosInstance.post('/reservasi/upload-bukti', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        buktiUrl = uploadResponse.data.bukti_url;
      }

      const response = await axiosInstance.post('/reservasi', {
        pelanggan_id: user.id_pelanggan,
        cabang_id: cabangId,
        layanan_id: parseInt(selectedService),
        slot_id: selectedSlotId,
        tanggal_reservasi: format(date!, 'yyyy-MM-dd'),
        total_harga: selectedServiceData.harga,
        metode_pembayaran: selectedPayment,
        catatan: formData.notes,
        nama: formData.nama,
        email: formData.email,
        no_hp: formData.phone,
        status_pembayaran: 'paid',
        bukti_pembayaran: buktiUrl
      });

      setShowPaymentDialog(false);
      
      if (response.data) {
        setSavedReservation({
          id_reservasi: response.data.id_reservasi || '',
          kode_reservasi: response.data.kode_reservasi || 'RES-001',
          id_pelanggan: user.id_pelanggan,
          id_layanan: parseInt(selectedService),
          id_slot: selectedSlotId || 0,
          tanggal: format(date!, 'yyyy-MM-dd'),
          total_harga: selectedServiceData.harga,
          metode_pembayaran: selectedPayment || 'transfer',
          status_pembayaran: 'paid',
          catatan: formData.notes,
          created_at: new Date().toISOString()
        });
      }
      
      setPaymentConfirmed(true);
      
      toast({
        title: "Pembayaran Berhasil! 🎉",
        description: "Janji temu Anda berhasil dipesan. Silakan cek email untuk detail lebih lanjut.",
      });
      
      if (date) {
        loadTimeSlots(format(date, 'yyyy-MM-dd'));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Pembayaran Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'Tunai', 
      description: 'Bayar langsung di tempat', 
      icon: Wallet,
      color: 'text-green-600'
    },
    { 
      id: 'transfer', 
      name: 'Transfer Bank', 
      description: 'Transfer ke rekening bank', 
      icon: Landmark,
      color: 'text-blue-600'
    },
    { 
      id: 'qris', 
      name: 'QRIS', 
      description: 'Scan QR dengan e-wallet atau m-banking', 
      icon: QrCode,
      color: 'text-orange-600'
    },
  ];

  const formatDate = (date: Date) => {
    return format(date, "dd MMMM yyyy");
  };

  const formatDateTime = (date: Date) => {
    return format(date, "dd MMMM yyyy, HH:mm");
  };

  const selectedServiceData = getSelectedServiceData();
  const availableTimeSlots = getAvailableTimeSlots();

  // 🔥 CEK PROGRESS UNTUK STEP INDICATOR
  const isStepCompleted = (step: number) => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!(selectedService && date && selectedTime);
    if (step === 3) return !!(selectedService && date && selectedTime && selectedPayment);
    if (step === 4) return !!(selectedService && date && selectedTime && selectedPayment && formData.nama && formData.email && formData.phone);
    return false;
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-6 md:py-16">
        <div className="container mx-auto px-3 md:px-4">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">✂️ Pesan Janji Temu</h1>
            <p className="text-sm md:text-base text-gray-600">Lengkapi data di bawah ini untuk menjadwalkan kunjungan Anda</p>
          </div>

          {/* Info Cabang Aktif */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 md:p-3 text-center">
              <p className="text-xs md:text-sm text-amber-700">
                📍 Booking untuk cabang: <span className="font-semibold">{currentBranch?.shortName || 'Rungkut'}</span>
              </p>
            </div>
          </div>

          {/* 🔥 PROGRESS STEPS - INDICATOR */}
          <div className="max-w-4xl mx-auto mb-6 md:mb-10">
            <div className="flex justify-center">
              <div className="relative flex items-center w-full max-w-xs md:max-w-2xl">
                {[
                  { label: 'Layanan', step: 1 },
                  { label: 'Waktu', step: 2 },
                  { label: 'Pembayaran', step: 3 },
                  { label: 'Konfirmasi', step: 4 }
                ].map((item, index) => {
                  const isCompleted = isStepCompleted(item.step);
                  const isActive = 
                    (item.step === 1 && !selectedService) ||
                    (item.step === 2 && selectedService && !date) ||
                    (item.step === 3 && selectedService && date && !selectedPayment) ||
                    (item.step === 4 && selectedService && date && selectedPayment);
                  
                  return (
                    <React.Fragment key={index}>
                      <div className={`flex flex-col items-center ${index < 3 ? 'flex-1' : ''}`}>
                        <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-barber-gold border-barber-gold text-black' 
                            : isActive
                            ? 'border-barber-gold text-barber-gold bg-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                          ) : (
                            <span className="text-xs md:text-sm font-bold">{item.step}</span>
                          )}
                        </div>
                        <span className={`text-[10px] md:text-xs mt-1 whitespace-nowrap ${
                          isCompleted ? 'text-barber-gold font-medium' : 
                          isActive ? 'text-barber-gold' : 'text-gray-400'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-0.5 mx-1 md:mx-2 ${isCompleted ? 'bg-barber-gold' : 'bg-gray-300'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Single page - semua bagian ditampilkan sekaligus */}
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">

            {/* Bagian 1: Pilih Layanan */}
            <Card className={`w-full shadow-md border-2 transition-all duration-300 ${
              !selectedService ? 'border-barber-gold/50' : 'border-gray-200'
            }`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-barber-gold text-black text-xs md:text-sm font-bold">1</span>
                  <h2 className="text-lg md:text-2xl font-bold">Pilih Layanan</h2>
                  {selectedService && (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 ml-2" />
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-500 ml-8 md:ml-10 mb-4">Pilih salah satu layanan di bawah ini</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {services.map((service) => {
                    const isSelected = selectedService === service.id_layanan.toString();
                    return (
                      <button
                        type="button"
                        key={service.id_layanan}
                        onClick={() => setSelectedService(service.id_layanan.toString())}
                        className={`text-left rounded-lg border-2 overflow-hidden transition-all duration-200 bg-white flex flex-col h-full ${
                          isSelected ? 'border-barber-gold shadow-md' : 'border-gray-200 hover:border-barber-gold/50'
                        }`}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-gray-100 relative flex-shrink-0">
                          <img
                            src={getServiceImageUrl(service.gambar)}
                            alt={service.nama_layanan}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getServiceImageUrl(null);
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-barber-gold rounded-full p-1">
                              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-black" />
                            </div>
                          )}
                        </div>
                        <div className="p-3 md:p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold text-sm md:text-base line-clamp-1">{service.nama_layanan}</h3>
                            <span className="font-semibold text-barber-gold text-xs md:text-sm whitespace-nowrap">{formatRupiah(service.harga)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                            {service.deskripsi || 'Nikmati layanan terbaik dari barber profesional kami.'}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-auto">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.durasi} menit
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Bagian 2: Pilih Tanggal & Waktu */}
            <Card className={`w-full shadow-md border-2 transition-all duration-300 ${
              selectedService && !date ? 'border-barber-gold/50' : 
              selectedService && date && selectedTime ? 'border-green-200' : 'border-gray-200'
            }`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold ${
                    selectedService ? 'bg-barber-gold text-black' : 'bg-gray-300 text-white'
                  }`}>2</span>
                  <h2 className={`text-lg md:text-2xl font-bold ${!selectedService ? 'text-gray-400' : ''}`}>Pilih Tanggal & Waktu</h2>
                  {selectedService && date && selectedTime && (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 ml-2" />
                  )}
                </div>
                <p className={`text-xs md:text-sm text-gray-500 ml-8 md:ml-10 mb-4 ${!selectedService ? 'text-gray-300' : ''}`}>
                  {!selectedService ? 'Pilih layanan terlebih dahulu' : 'Tentukan jadwal kedatangan Anda'}
                </p>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ${!selectedService ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div>
                    <Label className="block mb-2 text-sm md:text-base">Pilih Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateChange}
                          initialFocus
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="block mb-2 text-sm md:text-base">Pilih Waktu (10:00 - 22:00)</Label>
                    
                    {date && new Date(date).toDateString() === new Date().toDateString() && (
                      <p className="text-xs text-gray-500 mb-2">
                        ⏰ Slot waktu yang sudah lewat tidak dapat dipilih
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2 max-h-56 md:max-h-64 overflow-y-auto">
                      {availableTimeSlots.map((slot) => (
                        <Button 
                          key={slot.slotId}
                          type="button" 
                          variant={selectedTime === slot.time ? "default" : "outline"} 
                          onClick={() => handleTimeSelect(slot.time, slot.slotId, slot.isAvailable)} 
                          disabled={!slot.isAvailable}
                          className={cn(
                            "hover:bg-barber-gold/10 transition-all text-xs md:text-sm px-1.5 md:px-3 py-1.5 md:py-2 h-auto",
                            selectedTime === slot.time && "bg-barber-gold text-black hover:text-black",
                            slot.isPassed && "bg-gray-300 text-gray-400 cursor-not-allowed hover:bg-gray-300 line-through",
                            !slot.isAvailable && !slot.isPassed && "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                          )}
                        >
                          {slot.time}
                          {slot.isPassed && " ⏰"}
                        </Button>
                      ))}
                    </div>
                    
                    {timeSlots.length === 0 && date && (
                      <p className="text-sm text-gray-500 mt-2 text-center">Memuat slot waktu...</p>
                    )}

                    {/* Informasi waktu yang dipilih dengan estimasi selesai */}
                    {selectedTime && selectedServiceData && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs md:text-sm text-amber-800">
                          <strong>Anda memilih:</strong> {selectedTime} 
                          <span className="mx-2">→</span> 
                          {getEstimatedEndTime(selectedTime, selectedServiceData.durasi)}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          💇 Layanan {selectedServiceData.nama_layanan} akan selesai dalam {selectedServiceData.durasi} menit
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bagian 3: Pilih Metode Pembayaran */}
            <Card className={`w-full shadow-md border-2 transition-all duration-300 ${
              selectedService && date && selectedTime && !selectedPayment ? 'border-barber-gold/50' : 
              selectedService && date && selectedTime && selectedPayment ? 'border-green-200' : 'border-gray-200'
            }`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold ${
                    selectedService && date && selectedTime ? 'bg-barber-gold text-black' : 'bg-gray-300 text-white'
                  }`}>3</span>
                  <h2 className={`text-lg md:text-2xl font-bold ${!(selectedService && date && selectedTime) ? 'text-gray-400' : ''}`}>Pilih Metode Pembayaran</h2>
                  {selectedService && date && selectedTime && selectedPayment && (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 ml-2" />
                  )}
                </div>
                <p className={`text-xs md:text-sm text-gray-500 ml-8 md:ml-10 mb-4 ${!(selectedService && date && selectedTime) ? 'text-gray-300' : ''}`}>
                  {!(selectedService && date && selectedTime) ? 'Pilih layanan, tanggal, dan waktu terlebih dahulu' : 'Pilih metode pembayaran yang Anda inginkan'}
                </p>
                <div className={`space-y-3 md:space-y-4 ${!(selectedService && date && selectedTime) ? 'opacity-50 pointer-events-none' : ''}`}>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`flex items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPayment === method.id 
                            ? 'border-barber-gold bg-barber-gold/5' 
                            : 'border-gray-200 hover:border-barber-gold/50'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="flex items-center space-x-3 md:space-x-4 w-full">
                          <div className={`p-2.5 md:p-3 rounded-full flex-shrink-0 ${selectedPayment === method.id ? 'bg-barber-gold/20' : 'bg-gray-100'}`}>
                            <Icon className={`h-5 w-5 md:h-6 md:w-6 ${method.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg">{method.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500">{method.description}</p>
                          </div>
                          {selectedPayment === method.id && (
                            <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-barber-gold flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Bagian 4: Konfirmasi Data & Booking */}
            <Card className={`w-full shadow-md border-2 transition-all duration-300 ${
              selectedService && date && selectedTime && selectedPayment ? 'border-green-200' : 'border-gray-200'
            }`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold ${
                    selectedService && date && selectedTime && selectedPayment ? 'bg-barber-gold text-black' : 'bg-gray-300 text-white'
                  }`}>4</span>
                  <h2 className={`text-lg md:text-2xl font-bold ${!(selectedService && date && selectedTime && selectedPayment) ? 'text-gray-400' : ''}`}>Konfirmasi Data & Booking</h2>
                  {selectedService && date && selectedTime && selectedPayment && formData.nama && formData.email && formData.phone && (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 ml-2" />
                  )}
                </div>
                <p className={`text-xs md:text-sm text-gray-500 ml-8 md:ml-10 mb-4 ${!(selectedService && date && selectedTime && selectedPayment) ? 'text-gray-300' : ''}`}>
                  {!(selectedService && date && selectedTime && selectedPayment) 
                    ? 'Lengkapi semua data sebelumnya' 
                    : 'Periksa kembali data Anda sebelum booking'}
                </p>
                
                <div className={`${!(selectedService && date && selectedTime && selectedPayment) ? 'opacity-50 pointer-events-none' : ''}`}>
                  {/* LAYOUT DUA KOLOM */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* KOLOM KIRI - Ringkasan Pemesanan & Lokasi */}
                    <div className="space-y-6">
                      {/* Ringkasan Pemesanan */}
                      <div className="bg-gradient-to-r from-barber-gold/10 to-transparent p-4 md:p-6 rounded-lg border-2 border-barber-gold/20">
                        <h3 className="font-semibold text-base md:text-lg mb-4 flex items-center">
                          <ChevronRight className="h-5 w-5 mr-2 text-barber-gold" />
                          Ringkasan Pemesanan
                        </h3>
                        <div className="space-y-2">
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs md:text-sm text-gray-500">Layanan</p>
                            <p className="font-medium text-sm md:text-base">{selectedServiceData?.nama_layanan || '-'}</p>
                            <p className="text-xs text-gray-400">{selectedServiceData?.durasi || 0} menit</p>
                            {selectedServiceData && selectedTime && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⏱️ Estimasi selesai: {getEstimatedEndTime(selectedTime, selectedServiceData.durasi)}
                              </p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs md:text-sm text-gray-500">Harga Layanan</p>
                            <p className="font-medium text-sm md:text-base text-barber-gold">{selectedServiceData ? formatRupiah(selectedServiceData.harga) : '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs md:text-sm text-gray-500">Tanggal & Waktu</p>
                            <p className="font-medium text-sm md:text-base">{date ? format(date, "d MMMM yyyy") : '-'} - {selectedTime || '-'}</p>
                            {selectedServiceData && selectedTime && (
                              <p className="text-xs text-gray-400 mt-1">
                                Selesai sekitar: {getEstimatedEndTime(selectedTime, selectedServiceData.durasi)}
                              </p>
                            )}
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs md:text-sm text-gray-500">Metode Pembayaran</p>
                            <div className="flex items-center space-x-2">
                              {getSelectedPaymentMethod() ? (
                                <>
                                  {React.createElement(getSelectedPaymentMethod()?.icon || 'div', { 
                                    className: `h-4 w-4 ${getSelectedPaymentMethod()?.color}` 
                                  })}
                                  <p className="font-medium text-sm md:text-base">{getSelectedPaymentMethod()?.name}</p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-400">Belum dipilih</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-barber-gold/30">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm md:text-base">Total Pembayaran</span>
                            <span className="text-xl md:text-2xl font-bold text-barber-gold">
                              {selectedServiceData ? formatRupiah(selectedServiceData.harga) : 'Rp 0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lokasi Cabang */}
                      <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                        <h3 className="font-semibold text-base md:text-lg mb-4 flex items-center text-blue-800">
                          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                          Lokasi Cabang
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                              <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm md:text-base">{currentBranch?.name || 'Seniman Barbershop'}</p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">{currentBranch?.fullAddress || currentBranch?.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs md:text-sm text-gray-600">{currentBranch?.phone}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs md:text-sm text-gray-600">
                              Jam Operasional: {currentBranch?.operationalHours.monday_friday.open} - {currentBranch?.operationalHours.monday_friday.close}
                            </p>
                          </div>
                          {currentBranch?.features && currentBranch.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentBranch.features.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="text-[10px] md:text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  ✓ {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <a 
                            href={currentBranch?.mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            📍 Buka di Google Maps
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* KOLOM KANAN - Form Data Diri */}
                    <div className="space-y-6">
                      <div className="bg-white p-4 md:p-6 rounded-lg border-2 border-gray-200">
                        <h3 className="font-semibold text-base md:text-lg mb-4 flex items-center">
                          <ChevronRight className="h-5 w-5 mr-2 text-barber-gold" />
                          Data Diri
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="nama" className="text-sm md:text-base">Nama Lengkap *</Label>
                            <Input 
                              id="nama" 
                              value={formData.nama}
                              onChange={handleInputChange}
                              required 
                              className="mt-1 bg-gray-50 text-sm md:text-base" 
                              readOnly={!!localStorage.getItem('user')}
                              placeholder="Masukkan nama lengkap Anda"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="text-sm md:text-base">Email *</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email}
                              onChange={handleInputChange}
                              required 
                              className="mt-1 bg-gray-50 text-sm md:text-base"
                              readOnly={!!localStorage.getItem('user')}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="phone" className="text-sm md:text-base">Nomor Telepon *</Label>
                            <Input 
                              id="phone" 
                              type="tel" 
                              value={formData.phone}
                              onChange={handleInputChange}
                              required 
                              className="mt-1 bg-gray-50 text-sm md:text-base"
                              readOnly={!!localStorage.getItem('user')}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes" className="text-sm md:text-base">Catatan Khusus (Opsional)</Label>
                            <Textarea 
                              id="notes" 
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Permintaan khusus atau informasi untuk barber Anda..." 
                              className="mt-1 text-sm md:text-base"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <input 
                              type="checkbox" 
                              id="terms" 
                              className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold mt-0.5" 
                              required 
                            />
                            <Label htmlFor="terms" className="text-xs md:text-sm text-gray-500 cursor-pointer">
                              Saya setuju dengan kebijakan pembatalan. Pembatalan minimal 24 jam sebelumnya.
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* TOMBOL AKSI */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          {selectedPayment === 'cash' ? (
                            <Button 
                              onClick={handleCashBooking}
                              className="w-full sm:flex-1 bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                  Memproses...
                                </>
                              ) : (
                                'Booking Sekarang'
                              )}
                            </Button>
                          ) : (
                            <>
                              <Button 
                                onClick={handleProceedToPayment}
                                className="w-full sm:flex-1 bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                    Memproses...
                                  </>
                                ) : (
                                  'Bayar Sekarang'
                                )}
                              </Button>
                              <Button 
                                onClick={handleSaveReservation}
                                variant="outline"
                                className="w-full sm:flex-1 border-barber-gold text-barber-gold hover:bg-barber-gold/10 font-semibold py-5 md:py-6"
                                disabled={loading}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {loading ? 'Memproses...' : 'Bayar Nanti'}
                              </Button>
                            </>
                          )}
                        </div>
                        
                        {selectedPayment !== 'cash' && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <AlertDescription className="text-xs text-blue-700">
                              <span className="hidden sm:inline">
                                Pilih "Bayar Nanti" untuk menyimpan reservasi. Pembayaran harus diselesaikan maksimal 24 jam sebelum jadwal appointment.
                              </span>
                              <span className="sm:hidden">
                                Bayar Nanti = simpan reservasi, bayar max 24 jam sebelum jadwal.
                              </span>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Pembayaran (Bayar Sekarang) */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center">Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription className="text-center text-sm md:text-base">
              Silakan selesaikan pembayaran Anda untuk mengkonfirmasi pemesanan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 md:space-y-6 py-4">
            {/* Detail Pembayaran */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-medium">{selectedServiceData?.nama_layanan}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Metode:</span>
                <span className="font-medium flex items-center">
                  {getSelectedPaymentMethod() && (
                    <>
                      {React.createElement(getSelectedPaymentMethod()?.icon || 'div', { 
                        className: `h-4 w-4 mr-1 ${getSelectedPaymentMethod()?.color}` 
                      })}
                      {getSelectedPaymentMethod()?.name}
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base md:text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-barber-gold">{selectedServiceData && formatRupiah(selectedServiceData.harga)}</span>
              </div>
            </div>

            {/* Informasi Pembayaran berdasarkan metode */}
            {selectedPayment === 'transfer' && (
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <p className="font-medium text-blue-800 text-sm md:text-base mb-3">Informasi Transfer Bank:</p>
                <div className="space-y-3">
                  {bankAccounts.length > 0 ? bankAccounts.map((bank, index) => (
                    <div key={index} className="bg-white p-3 rounded-md">
                      <p className="font-semibold text-blue-800 text-sm md:text-base">{bank.bank}</p>
                      <p className="text-xs md:text-sm text-gray-600">No. Rekening: <span className="font-mono font-bold">{bank.accountNumber}</span></p>
                      <p className="text-xs md:text-sm text-gray-600">a.n. {bank.accountName}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">Nomor rekening akan segera diupdate</p>
                  )}
                  <p className="text-xs text-blue-600 mt-2">
                    * Silakan transfer sesuai dengan total yang harus dibayar.
                  </p>
                </div>
              </div>
            )}

            {selectedPayment === 'qris' && (
              <div className="bg-orange-50 p-3 md:p-4 rounded-lg text-center">
                <p className="font-medium text-orange-800 text-sm md:text-base mb-2">Scan QRIS</p>
                <div className="flex justify-center mb-2">
                  {paymentSettings.qr_code ? (
                    <img 
                      src={getQrImageUrl(paymentSettings.qr_code)}
                      alt="QRIS Code"
                      className="w-40 h-40 md:w-56 md:h-56 object-contain bg-white rounded-xl shadow-lg border-2 border-orange-200 p-3 md:p-4"
                    />
                  ) : (
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-orange-200">
                      <QrCode className="h-24 w-24 md:h-40 md:w-40 text-orange-600" />
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-orange-600 mb-2">Scan menggunakan aplikasi e-wallet atau m-banking Anda</p>
                <p className="text-xs text-orange-500">Nominal: {selectedServiceData && formatRupiah(selectedServiceData.harga)}</p>
              </div>
            )}

            {selectedPayment === 'cash' && (
              <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                <p className="text-center text-green-800 text-sm md:text-base">
                  Bayar tunai saat Anda tiba di tempat kami
                </p>
              </div>
            )}

            {/* Upload Bukti Pembayaran untuk non-tunai */}
            {(selectedPayment === 'transfer' || selectedPayment === 'qris') && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-4">
                <Label className="block mb-2 font-medium text-sm md:text-base">Upload Bukti Pembayaran</Label>
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
                      className="flex flex-col items-center justify-center w-full h-24 md:h-32 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mb-2" />
                      <p className="text-xs md:text-sm text-gray-500">Klik untuk upload bukti transfer/QRIS</p>
                      <p className="text-[10px] md:text-xs text-gray-400">Format: JPG, PNG (Max 5MB)</p>
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
              onClick={handlePaymentConfirm}
              className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Memproses...
                </>
              ) : (
                'Konfirmasi Pembayaran'
              )}
            </Button>

            <p className="text-[10px] md:text-xs text-center text-gray-400">
              Dengan mengkonfirmasi pembayaran, Anda menyetujui semua syarat dan ketentuan yang berlaku
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sukses Bayar Sekarang (Non-Tunai) */}
      <Dialog open={paymentConfirmed} onOpenChange={setPaymentConfirmed}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <div className="text-center py-4 md:py-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold mb-2">Pembayaran Berhasil! 🎉</DialogTitle>
            <DialogDescription className="text-sm md:text-base mb-6">
              Terima kasih telah memesan di Barber Shop kami. 
              Bukti pembayaran Anda akan kami verifikasi.
              Kami akan mengirimkan konfirmasi ke email Anda.
            </DialogDescription>
            
            {/* KOMPONEN NOTA (HIDDEN) */}
            <div className="hidden">
              {selectedServiceData && date && (
                <NotaPemesanan 
                  reservation={{
                    kode_reservasi: savedReservation?.kode_reservasi || 'RES-001',
                    nama_layanan: selectedServiceData.nama_layanan,
                    total_harga: selectedServiceData.harga,
                    tanggal: date.toISOString(),
                    waktu: selectedTime || '10:00',
                    nama_cabang: currentBranch?.name || 'Seniman Barbershop',
                    cabang_alamat: currentBranch?.fullAddress || currentBranch?.address || '',
                    pelanggan_nama: formData.nama,
                    durasi: `${selectedServiceData.durasi} menit`,
                    metode_pembayaran: selectedPayment || 'transfer',
                    status: 'paid'
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handlePrintNota}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Nota
              </Button>
              <Button 
                onClick={() => {
                  setPaymentConfirmed(false);
                  window.location.href = '/customer';
                }}
                variant="outline"
              >
                Lihat Reservasi Saya
              </Button>
              <Button 
                onClick={() => {
                  setPaymentConfirmed(false);
                  window.location.href = '/';
                }}
                variant="outline"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sukses Booking Tunai */}
      <Dialog open={showCashSuccessDialog} onOpenChange={setShowCashSuccessDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <div className="text-center py-4 md:py-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 md:h-10 md:w-10 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold mb-2">Booking Berhasil! 📋</DialogTitle>
            <DialogDescription className="text-sm md:text-base mb-6">
              Reservasi Anda berhasil dibuat. Silakan datang ke cabang yang Anda pilih dan lakukan pembayaran tunai di tempat.
              <br /><br />
              <span className="text-yellow-600 font-semibold">⏳ Status: Menunggu Konfirmasi Admin</span>
            </DialogDescription>
            
            {/* KOMPONEN NOTA (HIDDEN) */}
            <div className="hidden">
              {selectedServiceData && date && (
                <NotaPemesanan 
                  reservation={{
                    kode_reservasi: savedReservation?.kode_reservasi || 'RES-001',
                    nama_layanan: selectedServiceData.nama_layanan,
                    total_harga: selectedServiceData.harga,
                    tanggal: date.toISOString(),
                    waktu: selectedTime || '10:00',
                    nama_cabang: currentBranch?.name || 'Seniman Barbershop',
                    cabang_alamat: currentBranch?.fullAddress || currentBranch?.address || '',
                    pelanggan_nama: formData.nama,
                    durasi: `${selectedServiceData.durasi} menit`,
                    metode_pembayaran: 'cash',
                    status: 'pending'
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handlePrintNota}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Nota
              </Button>
              <Button 
                onClick={() => {
                  setShowCashSuccessDialog(false);
                  window.location.href = '/customer';
                }}
                variant="outline"
              >
                Lihat Reservasi Saya
              </Button>
              <Button 
                onClick={() => {
                  setShowCashSuccessDialog(false);
                  window.location.href = '/';
                }}
                variant="outline"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Sukses Bayar Nanti */}
      <Dialog open={showPayLaterDialog} onOpenChange={setShowPayLaterDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <div className="text-center py-4 md:py-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold mb-2">Reservasi Disimpan!</DialogTitle>
            <DialogDescription className="text-sm md:text-base mb-4">
              Data reservasi Anda telah berhasil disimpan.
            </DialogDescription>
            
            {/* KOMPONEN NOTA (HIDDEN) */}
            <div className="hidden">
              {selectedServiceData && date && savedReservation && (
                <NotaPemesanan 
                  reservation={{
                    kode_reservasi: savedReservation.kode_reservasi || 'RES-001',
                    nama_layanan: selectedServiceData.nama_layanan,
                    total_harga: selectedServiceData.harga,
                    tanggal: date.toISOString(),
                    waktu: selectedTime || '10:00',
                    nama_cabang: currentBranch?.name || 'Seniman Barbershop',
                    cabang_alamat: currentBranch?.fullAddress || currentBranch?.address || '',
                    pelanggan_nama: formData.nama,
                    durasi: `${selectedServiceData.durasi} menit`,
                    metode_pembayaran: selectedPayment || 'cash',
                    status: 'pending'
                  }}
                />
              )}
            </div>
            
            {savedReservation && (
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-left mb-6">
                <p className="text-xs md:text-sm font-semibold mb-2">Kode Reservasi:</p>
                <p className="text-base md:text-lg font-bold text-barber-gold mb-3">{savedReservation.kode_reservasi || savedReservation.id_reservasi}</p>
                
                <p className="text-xs md:text-sm font-semibold mb-1">Detail Reservasi:</p>
                <div className="space-y-1 text-xs md:text-sm">
                  <p>📅 {date && formatDate(date)} - {selectedTime}</p>
                  <p>💇 {selectedServiceData?.nama_layanan}</p>
                  <p>💰 {selectedServiceData && formatRupiah(selectedServiceData.harga)}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handlePrintNota}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Nota
              </Button>
              <Button 
                onClick={() => {
                  setShowPayLaterDialog(false);
                  window.location.href = '/';
                }}
                variant="outline"
                className="w-full"
              >
                Kembali ke Beranda
              </Button>
              <Button 
                onClick={() => {
                  setShowPayLaterDialog(false);
                  setShowPaymentDialog(true);
                }}
                variant="outline"
                className="w-full"
              >
                Lanjutkan Pembayaran Sekarang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Booking;