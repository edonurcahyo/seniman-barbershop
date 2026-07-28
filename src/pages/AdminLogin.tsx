import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Scissors, User } from 'lucide-react';

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form saat component mount
  useEffect(() => {
    setLoginEmail("");
    setLoginPassword("");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/admin/login", {
        email: loginEmail,
        password: loginPassword,
      });

      console.log('Login response:', res.data);

      if (res.data.success) {
        // 🔥 SIMPAN DATA SESUAI STRUKTUR RESPONSE DARI BACKEND
        // Menggunakan res.data.token dan res.data.admin (seperti kode lama)
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        localStorage.setItem("isAdminLoggedIn", "true");

        toast({
          title: "Login Berhasil",
          description: `Selamat datang kembali, ${res.data.admin.nama}!`,
        });

        // Redirect ke Dashboard Admin
        navigate("/admin");
      } else {
        throw new Error(res.data.message || 'Login gagal');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "Email atau password salah.";
      if (error.response) {
        console.error('Response data:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Tidak ada response dari server. Periksa koneksi Anda.";
      }
      
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 md:py-16 lg:py-20 flex items-center relative overflow-hidden">
        {/* Background Dekoratif */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-barber-gold/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-100/20 rounded-full filter blur-3xl"></div>
        </div>

        {/* Dekorasi Garis Tipis */}
        <div className="absolute top-10 left-0 w-20 h-0.5 bg-barber-gold/30 hidden md:block"></div>
        <div className="absolute bottom-10 right-0 w-20 h-0.5 bg-barber-gold/30 hidden md:block"></div>

        <div className="container mx-auto px-3 md:px-4 relative z-10">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-barber-gold/10 backdrop-blur-sm rounded-full border border-barber-gold/20 mb-4">
                {/* <Shield className="h-3.5 w-3.5 text-barber-gold" /> */}
                <span className="text-xs font-medium text-barber-gold tracking-wider">ADMIN PANEL</span>
              </div>
              {/* <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-14 h-14 bg-barber-brown rounded-full flex items-center justify-center shadow-lg shadow-barber-brown/20">
                  <User className="h-7 w-7 text-barber-gold" />
                </div>
              </div> */}
              <h1 className="text-2xl md:text-3xl font-bold text-barber-brown">
                Seniman <span className="text-barber-gold">Barbershop</span>
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Admin Dashboard Login
              </p>
            </div>

            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-amber-900/5">
              <CardHeader className="pb-2 md:pb-4 pt-6 md:pt-8 px-6 md:px-8">
                <CardTitle className="text-lg md:text-2xl font-bold text-center text-gray-800">
                  Admin Login
                </CardTitle>
                <p className="text-center text-xs md:text-sm text-gray-500 mt-1">
                  Masukkan kredensial admin Anda
                </p>
                {/* <div className="flex justify-center gap-1 mt-3">
                  <div className="w-8 h-1 bg-barber-gold rounded-full"></div>
                  <div className="w-8 h-1 bg-barber-gold/30 rounded-full"></div>
                  <div className="w-8 h-1 bg-barber-gold/10 rounded-full"></div>
                </div> */}
              </CardHeader>
              <CardContent className="px-4 md:px-8 pb-2">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4 md:gap-5">
                    <div className="grid gap-1.5 md:gap-2">
                      <Label htmlFor="email" className="text-sm md:text-base font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-barber-gold" />
                          Email Admin
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@seniman.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          autoComplete="off"
                          required
                          className="pl-4 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-1.5 md:gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm md:text-base font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-barber-gold" />
                            Password
                          </div>
                        </Label>
                        <Link to="/admin/forgot-password" className="text-xs md:text-sm text-barber-gold hover:underline font-medium transition-all">
                          Lupa Password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          className="pl-4 pr-12 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-barber-gold transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6 rounded-xl text-sm md:text-base transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-barber-gold/20 group"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          {/* <Shield className="h-4 w-4 mr-2" /> */}
                          Login sebagai Admin
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col pt-2 pb-6 md:pb-8 px-6 md:px-8">
                <div className="w-full border-t border-gray-200/50 my-3"></div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="h-3 w-3" />
                  <span>Akses Khusus Administrator</span>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  <Link to="/login" className="text-barber-gold hover:underline font-medium transition-all">
                    Kembali ke halaman login pelanggan
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default AdminLogin;