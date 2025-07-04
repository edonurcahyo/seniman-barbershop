import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Profil = () => {
  const { toast } = useToast();
  
  // Data pengguna contoh untuk demonstrasi
  const [user, setUser] = useState({
    namaDepan: 'Hendrikus',
    namaBelakang: 'Olmedo',
    email: 'hendrikus@gmail.com',
    telepon: '(123) 456-7890',
    poinLoyalitas: 240,
    hadiahSelanjutnya: 250,
  });
  
  // Data janji temu contoh
  const janjiTemu = [
    {
      id: 1,
      tanggal: '12 Mei 2025',
      waktu: '10:00',
      layanan: 'Potong Rambut',
      barber: 'Jason Susanto',
      status: 'akan_datang',
    },
    {
      id: 2,
      tanggal: '10 April 2025',
      waktu: '14:30',
      layanan: 'Rapihkan Jenggot',
      barber: 'Ahmad Khalish',
      status: 'selesai',
    },
    {
      id: 3,
      tanggal: '15 Maret 2025',
      waktu: '11:00',
      layanan: 'Potong Rambut & Jenggot',
      barber: 'Cahya Nugraha',
      status: 'selesai',
    },
  ];

  const handlePerbaruiProfil = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pembaruan Profil",
      description: "Profil Anda berhasil diperbarui.",
    });
  };

  const handleBatalkanJanjiTemu = (id: number) => {
    toast({
      title: "Janji Temu Dibatalkan",
      description: "Janji temu Anda telah dibatalkan. Anda akan menerima email konfirmasi segera.",
    });
  };

  const persentaseProgres = (user.poinLoyalitas / user.hadiahSelanjutnya) * 100;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Profil</h1>
          
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="janji_temu" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="janji_temu">Pesanan Saya</TabsTrigger>
                <TabsTrigger value="loyalitas">Program Loyalitas</TabsTrigger>
                <TabsTrigger value="pengaturan">Pengaturan Akun</TabsTrigger>
              </TabsList>
              
              <TabsContent value="janji_temu">
                <h2 className="text-2xl font-bold mb-6">Pesanan Saya</h2>
                
                {janjiTemu.length > 0 ? (
                  <div className="space-y-4">
                    {janjiTemu.filter(janji => janji.status === 'akan_datang').length > 0 && (
                      <>
                        <h3 className="text-lg font-medium">Janji Temu Mendatang</h3>
                        {janjiTemu
                          .filter(janji => janji.status === 'akan_datang')
                          .map((janji) => (
                            <Card key={janji.id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between">
                                  <div>
                                    <div className="flex items-center mb-2">
                                      <h3 className="text-lg font-bold">{janji.layanan}</h3>
                                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                        Akan Datang
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground mb-1">
                                      <span className="font-medium">Tanggal:</span> {janji.tanggal} pukul {janji.waktu}
                                    </p>
                                    <p className="text-muted-foreground">
                                      <span className="font-medium">Barber:</span> {janji.barber}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2 mt-4 md:mt-0">
                                    <Button variant="outline" className="border-barber-brown text-barber-brown hover:bg-barber-brown/10">
                                      Jadwal Ulang
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="border-red-500 text-red-500 hover:bg-red-50"
                                      onClick={() => handleBatalkanJanjiTemu(janji.id)}
                                    >
                                      Batalkan
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </>
                    )}
                    
                    {janjiTemu.filter(janji => janji.status === 'selesai').length > 0 && (
                      <>
                        <h3 className="text-lg font-medium mt-8">Janji Temu Sebelumnya</h3>
                        {janjiTemu
                          .filter(janji => janji.status === 'selesai')
                          .map((janji) => (
                            <Card key={janji.id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between">
                                  <div>
                                    <div className="flex items-center mb-2">
                                      <h3 className="text-lg font-bold">{janji.layanan}</h3>
                                      <Badge className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-100">
                                        Selesai
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground mb-1">
                                      <span className="font-medium">Tanggal:</span> {janji.tanggal} pukul {janji.waktu}
                                    </p>
                                    <p className="text-muted-foreground">
                                      <span className="font-medium">Barber:</span> {janji.barber}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2 mt-4 md:mt-0">
                                    <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                                      Pesan Lagi
                                    </Button>
                                    <Button variant="outline">
                                      Beri Ulasan
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500 mb-4">Anda belum memiliki janji temu.</p>
                    <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">Buat Janji Temu Pertama Anda</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="loyalitas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Program Loyalitas</h2>
                    
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium">Poin Saat Ini</h3>
                          <span className="text-3xl font-bold text-barber-gold">{user.poinLoyalitas}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Anda membutuhkan {user.hadiahSelanjutnya - user.poinLoyalitas} poin lagi untuk hadiah berikutnya
                        </p>
                        <Progress value={persentaseProgres} className="h-2" />
                      </CardContent>
                    </Card>
                    
                    <h3 className="text-lg font-bold mb-4">Cara Kerja</h3>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium">Dapatkan Poin</h4>
                        <p className="text-sm text-gray-600">Dapatkan 10 poin untuk setiap $1 yang dibelanjakan untuk layanan dan produk</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium">Dapatkan Hadiah</h4>
                        <p className="text-sm text-gray-600">Tukarkan poin Anda untuk diskon, layanan gratis, atau produk</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium">Keuntungan Khusus</h4>
                        <p className="text-sm text-gray-600">Dapatkan penawaran ulang tahun, akses awal ke promosi, dan acara eksklusif untuk anggota</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Hadiah Tersedia</h3>
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-br from-barber-brown to-barber-brown/80 text-white">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">Rapihkan Jenggot Gratis</h4>
                          <p className="text-sm mb-3">Dapatkan rapihkan jenggot gratis dengan layanan apa pun</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">250 poin</span>
                            <Button size="sm" className="bg-barber-gold hover:bg-barber-gold/90 text-black">Tukarkan</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">Diskon 25% Layanan Apa Pun</h4>
                          <p className="text-sm text-muted-foreground mb-3">Hemat untuk janji temu berikutnya</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">500 poin</span>
                            <Button size="sm" variant="outline" disabled>Tukarkan</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">Potong Rambut Premium Gratis</h4>
                          <p className="text-sm text-muted-foreground mb-3">Nikmati layanan potong rambut signature kami</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">750 poin</span>
                            <Button size="sm" variant="outline" disabled>Tukarkan</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pengaturan">
                <h2 className="text-2xl font-bold mb-6">Pengaturan Akun</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Informasi Pribadi</h3>
                    <Card>
                      <CardContent className="p-6">
                        <form onSubmit={handlePerbaruiProfil}>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="namaDepan">Nama Depan</Label>
                                <Input 
                                  id="namaDepan" 
                                  value={user.namaDepan} 
                                  onChange={(e) => setUser({...user, namaDepan: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="namaBelakang">Nama Belakang</Label>
                                <Input 
                                  id="namaBelakang" 
                                  value={user.namaBelakang}
                                  onChange={(e) => setUser({...user, namaBelakang: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                value={user.email}
                                onChange={(e) => setUser({...user, email: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="telepon">Nomor Telepon</Label>
                              <Input 
                                id="telepon" 
                                type="tel" 
                                value={user.telepon}
                                onChange={(e) => setUser({...user, telepon: e.target.value})}
                              />
                            </div>
                            <Button type="submit" className="bg-barber-brown hover:bg-barber-brown/90">
                              Simpan Perubahan
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Kata Sandi & Keamanan</h3>
                    <Card>
                      <CardContent className="p-6">
                        <form>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="kataSandiSekarang">Kata Sandi Sekarang</Label>
                              <Input id="kataSandiSekarang" type="password" />
                            </div>
                            <div>
                              <Label htmlFor="kataSandiBaru">Kata Sandi Baru</Label>
                              <Input id="kataSandiBaru" type="password" />
                            </div>
                            <div>
                              <Label htmlFor="konfirmasiKataSandi">Konfirmasi Kata Sandi Baru</Label>
                              <Input id="konfirmasiKataSandi" type="password" />
                            </div>
                            <Button type="submit" className="bg-barber-brown hover:bg-barber-brown/90">
                              Perbarui Kata Sandi
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                    
                    <h3 className="text-lg font-bold mt-8 mb-4">Preferensi</h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Notifikasi Email</h4>
                              <p className="text-sm text-muted-foreground">Terima email tentang janji temu</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="h-6 w-6 rounded border-gray-300 text-barber-gold focus:ring-barber-gold"
                              defaultChecked
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Pengingat SMS</h4>
                              <p className="text-sm text-muted-foreground">Dapatkan pesan teks sebelum janji temu</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="h-6 w-6 rounded border-gray-300 text-barber-gold focus:ring-barber-gold"
                              defaultChecked
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Komunikasi Pemasaran</h4>
                              <p className="text-sm text-muted-foreground">Terima penawaran dan promosi</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="h-6 w-6 rounded border-gray-300 text-barber-gold focus:ring-barber-gold"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Profil;