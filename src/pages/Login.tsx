import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 🔥 Register state - SATU FIELD NAMA (bukan nama_depan + nama_belakang)
  const [namaLengkap, setNamaLengkap] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset semua form saat component mount
  useEffect(() => {
    resetAllForms();
    
    // Cek apakah ada remember me data
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    const isRemembered = localStorage.getItem('remember_me') === 'true';
    
    if (isRemembered && savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
      if (savedPassword) {
        setLoginPassword(savedPassword);
      }
    }
  }, []);

  const resetAllForms = () => {
    // Reset login form
    setLoginEmail("");
    setLoginPassword("");
    
    // 🔥 Reset register form - SATU FIELD NAMA
    setNamaLengkap("");
    setRegEmail("");
    setPhone("");
    setRegPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email: loginEmail,
        password: loginPassword,
      });

      // Ambil data user dari response
      const userData = res.data.user;
      
      // Simpan data user ke localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("customer_email", userData.email);
      localStorage.setItem("customer_name", userData.nama);
      localStorage.setItem("customer_phone", userData.no_hp || phone);
      localStorage.setItem("isLoggedIn", "true");
      
      // Handle "Ingat Saya"
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remembered_email", loginEmail);
        localStorage.setItem("remembered_password", loginPassword);
      } else {
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }
      
      // Buat dan simpan token sederhana jika API tidak mengembalikan token
      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
      } else {
        const dummyToken = btoa(userData.email + ":" + Date.now());
        localStorage.setItem("auth_token", dummyToken);
      }
      
      // Simpan juga branch default (jika ada)
      if (!localStorage.getItem('selected_cabang')) {
        localStorage.setItem('selected_cabang', '1');
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${userData.nama}!`,
      });

      // Redirect ke Home
      navigate("/");

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Gagal",
        description: error.response?.data?.message || "Email atau password salah.",
        variant: "destructive",
      });
    }
  };

  // 🔥 Handle Register - SATU FIELD NAMA
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim()) {
      toast({
        title: "Gagal",
        description: "Nama lengkap harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (regPassword !== confirmPassword) {
      toast({
        title: "Gagal",
        description: "Password tidak sama.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        nama: namaLengkap,  // 🔥 Kirim nama lengkap (bukan nama_depan + nama_belakang)
        email: regEmail,
        password: regPassword,
        no_hp: phone,
      });

      console.log('Register response:', response.data);

      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda telah berhasil dibuat. Silakan login.",
      });

      // Reset form register
      setNamaLengkap("");
      setRegEmail("");
      setPhone("");
      setRegPassword("");
      setConfirmPassword("");
      
      // Pindah ke tab login
      setActiveTab("login");
      
      // Optional: Isi email di form login
      setLoginEmail(regEmail);

    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: "Registrasi Gagal",
        description: error.response?.data?.message || "Email sudah digunakan atau terjadi kesalahan.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Selamat Datang Kembali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@gmail.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/forgot-password" className="text-sm text-barber-gold hover:underline">
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
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-barber-gold transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 cursor-pointer">Ingat Saya</span>
                          </label>
                        </div>
                        <Button type="submit" className="w-full bg-barber-brown hover:bg-barber-brown/90">
                          Login
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col pt-0">
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-barber-gold hover:underline font-medium"
                      >
                        Daftar di sini
                      </button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Buat akun baru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister}>
                      <div className="grid gap-4">
                        {/* 🔥 SATU INPUT UNTUK NAMA LENGKAP (bukan 2 input) */}
                        <div className="grid gap-2">
                          <Label htmlFor="namaLengkap">Nama Lengkap</Label>
                          <Input
                            id="namaLengkap"
                            type="text"
                            placeholder="Masukkan nama lengkap Anda"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="regEmail">Email</Label>
                          <Input
                            id="regEmail"
                            type="email"
                            placeholder="nama@gmail.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="phone">No HP</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(+62) 123-4567-8901"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="regPassword">Password</Label>
                          <div className="relative">
                            <Input
                              id="regPassword"
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              autoComplete="new-password"
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-barber-gold transition-colors"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-barber-gold transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="terms"
                            className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold"
                            required
                          />
                          <Label htmlFor="terms" className="text-sm text-gray-500">
                            Saya setuju dengan{" "}
                            <Link to="/terms" className="text-barber-gold hover:underline">
                              Syarat Layanan
                            </Link>{" "}
                            dan{" "}
                            <Link to="/privacy" className="text-barber-gold hover:underline">
                              Kebijakan Privasi
                            </Link>
                          </Label>
                        </div>
                        
                        <Button type="submit" className="w-full bg-barber-brown hover:bg-barber-brown/90">
                          Register
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col pt-0">
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-barber-gold hover:underline font-medium"
                      >
                        Login di sini
                      </button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Login;