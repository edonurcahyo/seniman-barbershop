// src/pages/Booking.tsx - VERSI DENGAN FIELD NAMA (SATU FIELD)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Wallet, Landmark, QrCode, ChevronRight, CheckCircle2, Upload, X, Clock, AlertCircle, MapPin, Store, Phone, Clock as ClockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
}

interface TimeSlotData {
  id_slot: number;
  jam_mulai: string;
  jam_selesai: string;
  status: 'tersedia' | 'dibooking';
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
  const [step, setStep] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [showPayLaterDialog, setShowPayLaterDialog] = useState(false);
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
  
  // 🔥 FORM DATA - SATU FIELD NAMA
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    phone: '',
    notes: ''
  });

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

  // 🔥 FUNGSI UNTUK LOAD DATA USER YANG LOGIN - SATU FIELD NAMA
  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    console.log('User data from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        setFormData({
          nama: user.nama || '',  // 🔥 Langsung ambil nama lengkap
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

  // Format price
  const formatRupiah = (price: number) => {
    return `Rp. ${price.toLocaleString('id-ID')}`;
  };

  // Get available time slots
  const getAvailableTimeSlots = () => {
    const slots = timeSlots.map(slot => ({
      time: slot.jam_mulai.substring(0, 5),
      slotId: slot.id_slot,
      isAvailable: slot.status === 'tersedia'
    }));
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Get QR image URL
  const getQrImageUrl = (qrCode: string | null) => {
    if (!qrCode) return null;
    if (qrCode.startsWith('http')) return qrCode;
    return `http://127.0.0.1:8000/storage/${qrCode}`;
  };

  const nextStep = () => {
    if (step === 1 && !selectedService) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih layanan untuk melanjutkan." });
      return;
    }

    if (step === 2 && (!date || !selectedTime)) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih tanggal dan waktu untuk melanjutkan." });
      return;
    }

    if (step === 3 && !selectedPayment) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih metode pembayaran untuk melanjutkan." });
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 🔥 Simpan reservasi ke database (Bayar Nanti) - FIELD NAMA
  const handleSaveReservation = async () => {
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
        nama: formData.nama,           // 🔥 Kirim nama lengkap
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

  // 🔥 Lanjut ke pembayaran (Bayar Sekarang) - FIELD NAMA
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  // 🔥 Handle Payment Confirm - FIELD NAMA
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
        nama: formData.nama,           // 🔥 Kirim nama lengkap
        email: formData.email,
        no_hp: formData.phone,
        status_pembayaran: 'paid',
        bukti_pembayaran: buktiUrl
      });

      setShowPaymentDialog(false);
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

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">Pesan Janji Temu Anda</h1>
          <p className="text-center text-gray-600 mb-12">Ikuti langkah-langkah di bawah ini untuk menjadwalkan kunjungan Anda</p>

          {/* Info Cabang Aktif */}
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-sm text-amber-700">
                📍 Booking untuk cabang: <span className="font-semibold">{currentBranch?.shortName || 'Rungkut'}</span>
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-center mb-10">
              <div className="relative flex items-center w-full max-w-3xl">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <React.Fragment key={stepNumber}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= stepNumber ? 'bg-barber-gold' : 'bg-gray-300'
                    } z-10`}>
                      <span className={`text-sm font-bold ${step >= stepNumber ? 'text-black' : 'text-white'}`}>{stepNumber}</span>
                    </div>
                    {stepNumber < 4 && (
                      <div className={`flex-1 h-1 ${step > stepNumber ? 'bg-barber-gold' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <Card className="w-full shadow-lg">
              <CardContent className="p-6">
                {step === 1 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Pilih Layanan</h2>
                    <RadioGroup value={selectedService || ""} onValueChange={setSelectedService} className="space-y-4">
                      {services.map((service) => (
                        <div key={service.id_layanan} className="flex">
                          <div className="flex items-center space-x-2 w-full hover:bg-gray-50 p-4 rounded-md cursor-pointer border-2 transition-all duration-200 hover:border-barber-gold/50">
                            <RadioGroupItem value={service.id_layanan.toString()} id={`service-${service.id_layanan}`} />
                            <Label htmlFor={`service-${service.id_layanan}`} className="flex flex-1 justify-between items-center cursor-pointer">
                              <div>
                                <div className="font-medium">{service.nama_layanan}</div>
                                <div className="text-sm text-muted-foreground">{service.durasi} menit</div>
                              </div>
                              <div className="font-medium text-barber-gold">{formatRupiah(service.harga)}</div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Pilih Tanggal & Waktu</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label className="block mb-2">Pilih Tanggal</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
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
                        <Label className="block mb-2">Pilih Waktu (10:00 - 22:00)</Label>
                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                          {availableTimeSlots.map((slot) => (
                            <Button 
                              key={slot.slotId}
                              type="button" 
                              variant={selectedTime === slot.time ? "default" : "outline"} 
                              onClick={() => handleTimeSelect(slot.time, slot.slotId, slot.isAvailable)} 
                              disabled={!slot.isAvailable}
                              className={cn(
                                "hover:bg-barber-gold/10 transition-all",
                                selectedTime === slot.time && "bg-barber-gold text-black hover:text-black",
                                !slot.isAvailable && "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                              )}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                        {timeSlots.length === 0 && date && (
                          <p className="text-sm text-gray-500 mt-2 text-center">Memuat slot waktu...</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Pilih Metode Pembayaran</h2>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedPayment === method.id 
                                ? 'border-barber-gold bg-barber-gold/5' 
                                : 'border-gray-200 hover:border-barber-gold/50'
                            }`}
                            onClick={() => setSelectedPayment(method.id)}
                          >
                            <div className="flex items-center space-x-4 w-full">
                              <div className={`p-3 rounded-full ${selectedPayment === method.id ? 'bg-barber-gold/20' : 'bg-gray-100'}`}>
                                <Icon className={`h-6 w-6 ${method.color}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{method.name}</h3>
                                <p className="text-sm text-gray-500">{method.description}</p>
                              </div>
                              {selectedPayment === method.id && (
                                <CheckCircle2 className="h-6 w-6 text-barber-gold" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Konfirmasi Data Anda</h2>
                    <div className="space-y-6">
                      {/* Ringkasan Pemesanan */}
                      <div className="bg-gradient-to-r from-barber-gold/10 to-transparent p-6 rounded-lg border-2 border-barber-gold/20">
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <ChevronRight className="h-5 w-5 mr-2 text-barber-gold" />
                          Ringkasan Pemesanan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-500">Layanan</p>
                            <p className="font-medium">{selectedServiceData?.nama_layanan}</p>
                            <p className="text-xs text-gray-400">{selectedServiceData?.durasi} menit</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-500">Harga Layanan</p>
                            <p className="font-medium text-barber-gold">{selectedServiceData && formatRupiah(selectedServiceData.harga)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                            <p className="font-medium">{date ? format(date, "d MMMM yyyy") : ''} - {selectedTime}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-500">Metode Pembayaran</p>
                            <div className="flex items-center space-x-2">
                              {getSelectedPaymentMethod() && (
                                <>
                                  {React.createElement(getSelectedPaymentMethod()?.icon || 'div', { 
                                    className: `h-4 w-4 ${getSelectedPaymentMethod()?.color}` 
                                  })}
                                  <p className="font-medium">{getSelectedPaymentMethod()?.name}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-barber-gold/30">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Pembayaran</span>
                            <span className="text-2xl font-bold text-barber-gold">
                              {selectedServiceData && formatRupiah(selectedServiceData.harga)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* INFORMASI CABANG YANG DIPILIH */}
                      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                        <h3 className="font-semibold text-lg mb-4 flex items-center text-blue-800">
                          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                          Lokasi Cabang
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{currentBranch?.name || 'Seniman Barbershop'}</p>
                              <p className="text-sm text-gray-600 mt-1">{currentBranch?.fullAddress || currentBranch?.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">{currentBranch?.phone}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Jam Operasional: {currentBranch?.operationalHours.monday_friday.open} - {currentBranch?.operationalHours.monday_friday.close}
                            </p>
                          </div>
                          {currentBranch?.features && currentBranch.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentBranch.features.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
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
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            📍 Buka di Google Maps
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* 🔥 FORM DATA DIRI - SATU FIELD NAMA */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center">
                          <ChevronRight className="h-5 w-5 mr-2 text-barber-gold" />
                          Data Diri
                        </h3>
                        
                        <div>
                          <Label htmlFor="nama">Nama Lengkap *</Label>
                          <Input 
                            id="nama" 
                            value={formData.nama}
                            onChange={handleInputChange}
                            required 
                            className="mt-1 bg-gray-50" 
                            readOnly={!!localStorage.getItem('user')}
                            placeholder="Masukkan nama lengkap Anda"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                            className="mt-1 bg-gray-50"
                            readOnly={!!localStorage.getItem('user')}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Nomor Telepon *</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            required 
                            className="mt-1 bg-gray-50"
                            readOnly={!!localStorage.getItem('user')}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Catatan Khusus (Opsional)</Label>
                          <Textarea 
                            id="notes" 
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Permintaan khusus atau informasi untuk barber Anda..." 
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="terms" 
                            className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold" 
                            required 
                          />
                          <Label htmlFor="terms" className="text-sm text-gray-500">
                            Saya setuju dengan kebijakan pembatalan. Saya memahami bahwa pembatalan harus dilakukan minimal 24 jam sebelumnya.
                          </Label>
                        </div>

                        <div className="flex gap-4 mt-6">
                          <Button 
                            onClick={handleProceedToPayment}
                            className="flex-1 bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-6"
                            disabled={loading}
                          >
                            {loading ? 'Memproses...' : 'Bayar Sekarang'}
                          </Button>
                          <Button 
                            onClick={handleSaveReservation}
                            variant="outline"
                            className="flex-1 border-barber-gold text-barber-gold hover:bg-barber-gold/10 font-semibold py-6"
                            disabled={loading}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {loading ? 'Memproses...' : 'Bayar Nanti'}
                          </Button>
                        </div>
                        
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-xs text-blue-700">
                            Pilih "Bayar Nanti" untuk menyimpan reservasi Anda. Pembayaran harus diselesaikan maksimal 24 jam sebelum jadwal appointment.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t">
                  {step > 1 && (
                    <Button onClick={prevStep} variant="outline" className="px-8">
                      Kembali
                    </Button>
                  )}
                  {step < 4 && (
                    <Button 
                      onClick={nextStep} 
                      className={`ml-auto bg-barber-brown hover:bg-barber-brown/90 px-8 ${
                        step === 1 ? 'ml-auto' : ''
                      }`}
                    >
                      Lanjut
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Pembayaran (Bayar Sekarang) */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription className="text-center">
              Silakan selesaikan pembayaran Anda untuk mengkonfirmasi pemesanan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Detail Pembayaran */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-medium">{selectedServiceData?.nama_layanan}</span>
              </div>
              <div className="flex justify-between">
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
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-barber-gold">{selectedServiceData && formatRupiah(selectedServiceData.harga)}</span>
              </div>
            </div>

            {/* Informasi Pembayaran berdasarkan metode */}
            {selectedPayment === 'transfer' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800 mb-3">Informasi Transfer Bank:</p>
                <div className="space-y-3">
                  {bankAccounts.length > 0 ? bankAccounts.map((bank, index) => (
                    <div key={index} className="bg-white p-3 rounded-md">
                      <p className="font-semibold text-blue-800">{bank.bank}</p>
                      <p className="text-sm text-gray-600">No. Rekening: <span className="font-mono font-bold">{bank.accountNumber}</span></p>
                      <p className="text-sm text-gray-600">a.n. {bank.accountName}</p>
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
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="font-medium text-orange-800 mb-2">Scan QRIS</p>
                <div className="flex justify-center mb-2">
                  {paymentSettings.qr_code ? (
                    <img 
                      src={getQrImageUrl(paymentSettings.qr_code)}
                      alt="QRIS Code"
                      className="w-56 h-56 object-contain bg-white rounded-xl shadow-lg border-2 border-orange-200 p-4"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-orange-200">
                      <QrCode className="h-40 w-40 text-orange-600" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-orange-600 mb-2">Scan menggunakan aplikasi e-wallet atau m-banking Anda</p>
                <p className="text-xs text-orange-500">Nominal: {selectedServiceData && formatRupiah(selectedServiceData.harga)}</p>
              </div>
            )}

            {selectedPayment === 'cash' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-center text-green-800">
                  Bayar tunai saat Anda tiba di tempat kami
                </p>
              </div>
            )}

            {/* Upload Bukti Pembayaran untuk non-tunai */}
            {(selectedPayment === 'transfer' || selectedPayment === 'qris') && (
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

            <Button 
              onClick={handlePaymentConfirm}
              className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </Button>

            <p className="text-xs text-center text-gray-400">
              Dengan mengkonfirmasi pembayaran, Anda menyetujui semua syarat dan ketentuan yang berlaku
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sukses Bayar Sekarang */}
      <Dialog open={paymentConfirmed} onOpenChange={setPaymentConfirmed}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Pembayaran Berhasil!</DialogTitle>
            <DialogDescription className="mb-6">
              Terima kasih telah memesan di Barber Shop kami. 
              {selectedPayment !== 'cash' && " Bukti pembayaran Anda akan kami verifikasi."}
              Kami akan mengirimkan konfirmasi ke email Anda.
            </DialogDescription>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-barber-gold hover:bg-barber-gold/90 text-black"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sukses Bayar Nanti */}
      <Dialog open={showPayLaterDialog} onOpenChange={setShowPayLaterDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Reservasi Disimpan!</DialogTitle>
            <DialogDescription className="mb-4">
              Data reservasi Anda telah berhasil disimpan.
            </DialogDescription>
            
            {savedReservation && (
              <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                <p className="text-sm font-semibold mb-2">Kode Reservasi:</p>
                <p className="text-lg font-bold text-barber-gold mb-3">{savedReservation.kode_reservasi || savedReservation.id_reservasi}</p>
                
                <p className="text-sm font-semibold mb-1">Detail Reservasi:</p>
                <div className="space-y-1 text-sm">
                  <p>📅 {date && formatDate(date)} - {selectedTime}</p>
                  <p>💇 {selectedServiceData?.nama_layanan}</p>
                  <p>💰 {selectedServiceData && formatRupiah(selectedServiceData.harga)}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowPayLaterDialog(false);
                  window.location.href = '/';
                }}
                className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black"
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