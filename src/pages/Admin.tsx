import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, Scissors, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - replace with actual API calls
  const dashboardStats = {
    totalAppointments: 156,
    todayAppointments: 12,
    totalCustomers: 89,
    monthlyRevenue: 15420
  };

  const appointments = [
    { id: 1, customer: 'Hendrikus Olmedo', service: 'Potong Rambut Klasik', barber: 'Ahmad Khalish', time: '10:00', status: 'dikonfirmasi' },
    { id: 2, customer: 'Windah Santoso', service: 'Rapihkan Jenggot', barber: 'Jason Susanto', time: '11:30', status: 'menunggu' },
    { id: 3, customer: 'Adel Wijaya', service: 'Layanan Lengkap', barber: 'Cahya Nugraha', time: '14:00', status: 'selesai' }
  ];

  const services = [
    { id: 1, name: 'Potong Rambut Klasik', price: 25, duration: '30 menit', description: 'Potong rambut tradisional dengan styling' },
    { id: 2, name: 'Rapihkan Jenggot', price: 15, duration: '20 menit', description: 'Perawatan dan pembentukan jenggot profesional' },
    { id: 3, name: 'Layanan Lengkap', price: 40, duration: '60 menit', description: 'Potong rambut, rapihkan jenggot, dan perawatan handuk panas' }
  ];

  const barbers = [
    { id: 1, name: 'Jason Susanto', specialties: ['Potongan Klasik', 'Styling Jenggot'], experience: '8 tahun', status: 'aktif' },
    { id: 2, name: 'Ahmad Khalish', specialties: ['Potongan Modern', 'Pewarnaan Rambut'], experience: '5 tahun', status: 'aktif' },
    { id: 3, name: 'Cahya Nugraha', specialties: ['Cukur Tradisional', 'Styling Kumis'], experience: '12 tahun', status: 'nonaktif' }
  ];

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '(555) 123-4567', lastVisit: '2024-01-15', totalVisits: 8 },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '(555) 987-6543', lastVisit: '2024-01-10', totalVisits: 3 },
    { id: 3, name: 'Bob Wilson', email: 'bob@email.com', phone: '(555) 456-7890', lastVisit: '2024-01-08', totalVisits: 15 }
  ];

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      dikonfirmasi: 'default',
      menunggu: 'secondary',
      selesai: 'outline',
      dibatalkan: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola operasi barbershop Anda</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="appointments">Reservasi</TabsTrigger>
              <TabsTrigger value="services">Layanan</TabsTrigger>
              <TabsTrigger value="barbers">Tukang Cukur</TabsTrigger>
              <TabsTrigger value="customers">Pelanggan</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reservasi</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalAppointments}</div>
                    <p className="text-xs text-muted-foreground">Bulan ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reservasi Hari Ini</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.todayAppointments}</div>
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
                    <p className="text-xs text-muted-foreground">Pelanggan aktif</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendapatan Bulanan</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp. {dashboardStats.monthlyRevenue}</div>
                    <p className="text-xs text-muted-foreground">Bulan ini</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reservasi Terbaru</CardTitle>
                  <CardDescription>Pemesanan reservasi terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Tukang Cukur</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.slice(0, 5).map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.customer}</TableCell>
                          <TableCell>{appointment.service}</TableCell>
                          <TableCell>{appointment.barber}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Reservasi</CardTitle>
                      <CardDescription>Lihat dan kelola semua Reservasi</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Reservasi Baru</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buat Reservasi Baru</DialogTitle>
                          <DialogDescription>Tambahkan Reservasi baru ke jadwal</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">Pelanggan</Label>
                            <Input id="customer" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service" className="text-right">Layanan</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih layanan" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="barber" className="text-right">Tukang Cukur</Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih tukang cukur" />
                              </SelectTrigger>
                              <SelectContent>
                                {barbers.filter(b => b.status === 'aktif').map((barber) => (
                                  <SelectItem key={barber.id} value={barber.name}>{barber.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button>Buat Reservasi</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Tukang Cukur</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.customer}</TableCell>
                          <TableCell>{appointment.service}</TableCell>
                          <TableCell>{appointment.barber}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Layanan</CardTitle>
                      <CardDescription>Kelola layanan barbershop Anda</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Tambah Layanan</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Layanan Baru</DialogTitle>
                          <DialogDescription>Buat penawaran layanan baru</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serviceName" className="text-right">Nama</Label>
                            <Input id="serviceName" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Harga</Label>
                            <Input id="price" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Durasi</Label>
                            <Input id="duration" className="col-span-3" placeholder="contoh: 30 menit" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Deskripsi</Label>
                            <Textarea id="description" className="col-span-3" />
                          </div>
                        </div>
                        <Button>Tambah Layanan</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Layanan</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>Rp{service.price}</TableCell>
                          <TableCell>{service.duration}</TableCell>
                          <TableCell>{service.description}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="barbers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Tukang Cukur</CardTitle>
                      <CardDescription>Kelola staf barbershop Anda</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Tambah Tukang Cukur</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Tukang Cukur Baru</DialogTitle>
                          <DialogDescription>Tambahkan tukang cukur baru ke tim Anda</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="barberName" className="text-right">Nama</Label>
                            <Input id="barberName" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="specialties" className="text-right">Spesialisasi</Label>
                            <Input id="specialties" className="col-span-3" placeholder="contoh: Potongan Klasik, Styling Jenggot" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="experience" className="text-right">Pengalaman</Label>
                            <Input id="experience" className="col-span-3" placeholder="contoh: 5 tahun" />
                          </div>
                        </div>
                        <Button>Tambah Tukang Cukur</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Spesialisasi</TableHead>
                        <TableHead>Pengalaman</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {barbers.map((barber) => (
                        <TableRow key={barber.id}>
                          <TableCell className="font-medium">{barber.name}</TableCell>
                          <TableCell>{barber.specialties.join(', ')}</TableCell>
                          <TableCell>{barber.experience}</TableCell>
                          <TableCell>
                            <Badge variant={barber.status === 'aktif' ? 'default' : 'secondary'}>
                              {barber.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Pelanggan</CardTitle>
                  <CardDescription>Lihat dan kelola informasi pelanggan</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Kunjungan Terakhir</TableHead>
                        <TableHead>Total Kunjungan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.lastVisit}</TableCell>
                          <TableCell>{customer.totalVisits}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;