// Booking.tsx

import React, { useState } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Booking = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const barbers = [
    // { id: '1', name: 'Alex Rodriguez', image: 'https://images.unsplash.com/photo-1565022536102-f7645d84354a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80' },
    { id: '2', name: 'Jason Susanto', image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { id: '3', name: 'Ahmad Khalish', image: 'https://images.unsplash.com/photo-1596513058260-ac19435ec75a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  const services = [
    { id: '1', name: 'Potong Rambut', price: 'Rp. 40.000', duration: '30 menit' },
    { id: '2', name: 'Rapikan Jenggot', price: 'Rp. 20.000', duration: '20 menit' },
    { id: '4', name: 'Potong & Jenggot', price: 'Rp. 50.000', duration: '50 menit' },
    { id: '5', name: 'Warna Rambut', price: 'Rp. 100.000', duration: '60 menit' },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  const nextStep = () => {
    if (step === 1 && !selectedService) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih layanan untuk melanjutkan." });
      return;
    }

    if (step === 2 && !selectedBarber) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih barber untuk melanjutkan." });
      return;
    }

    if (step === 3 && (!date || !selectedTime)) {
      toast({ variant: "destructive", title: "Kesalahan", description: "Silakan pilih tanggal dan waktu untuk melanjutkan." });
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

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "Pemesanan Berhasil",
      description: "Janji temu Anda berhasil dipesan!",
    });
  };

  const getSelectedService = () => services.find(service => service.id === selectedService);
  const getSelectedBarber = () => barbers.find(barber => barber.id === selectedBarber);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">Pesan Janji Temu Anda</h1>
          <p className="text-center text-gray-600 mb-12">Ikuti langkah-langkah di bawah ini untuk menjadwalkan kunjungan Anda</p>

          <div className="max-w-4xl mx-auto">
            {/* Langkah Progress */}
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

            <Card className="w-full">
              <CardContent className="p-6">
                {step === 1 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Pilih Layanan</h2>
                    <RadioGroup value={selectedService || ""} onValueChange={setSelectedService} className="space-y-4">
                      {services.map((service) => (
                        <div key={service.id} className="flex">
                          <div className="flex items-center space-x-2 w-full hover:bg-gray-50 p-4 rounded-md cursor-pointer">
                            <RadioGroupItem value={service.id} id={`service-${service.id}`} />
                            <Label htmlFor={`service-${service.id}`} className="flex flex-1 justify-between items-center cursor-pointer">
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.duration}</div>
                              </div>
                              <div className="font-medium text-barber-gold">{service.price}</div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Pilih Barber</h2>
                    <RadioGroup value={selectedBarber || ""} onValueChange={setSelectedBarber} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {barbers.map((barber) => (
                        <div key={barber.id} className="relative">
                          <RadioGroupItem value={barber.id} id={`barber-${barber.id}`} className="peer sr-only" />
                          <Label htmlFor={`barber-${barber.id}`} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-barber-gold peer-data-[state=checked]:bg-barber-gold/10">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
                              <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="font-medium text-center">{barber.name}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </>
                )}

                {step === 3 && (
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
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today || date.getDay() === 0;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="block mb-2">Pilih Waktu</Label>
                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)} className={`hover:bg-barber-gold/10 ${selectedTime === time ? 'bg-barber-gold text-black hover:text-black' : ''}`}>
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Konfirmasi Data Anda</h2>
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-2">Ringkasan Pemesanan</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Layanan</p>
                            <p className="font-medium">{getSelectedService()?.name} - {getSelectedService()?.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Barber</p>
                            <p className="font-medium">{getSelectedBarber()?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tanggal</p>
                            <p className="font-medium">{date ? format(date, "d MMMM yyyy") : ''}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Waktu</p>
                            <p className="font-medium">{selectedTime}</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleBookAppointment}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">Nama Depan</Label>
                              <Input id="firstName" required />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Nama Belakang</Label>
                              <Input id="lastName" required />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required />
                          </div>
                          <div>
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input id="phone" type="tel" required />
                          </div>
                          <div>
                            <Label htmlFor="notes">Catatan Khusus (Opsional)</Label>
                            <Textarea id="notes" placeholder="Permintaan khusus atau informasi untuk barber Anda..." />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold" required />
                            <Label htmlFor="terms" className="text-sm text-gray-500">
                              Saya setuju dengan kebijakan pembatalan. Saya memahami bahwa pembatalan harus dilakukan minimal 24 jam sebelumnya.
                            </Label>
                          </div>
                          <Button type="submit" className="w-full mt-4 bg-barber-gold hover:bg-barber-gold/90 text-black">
                            Konfirmasi Pemesanan
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button onClick={prevStep} variant="outline">
                      Kembali
                    </Button>
                  )}
                  {step < 4 && (
                    <Button onClick={nextStep} className="ml-auto bg-barber-brown hover:bg-barber-brown/90">
                      Lanjut
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Booking;
