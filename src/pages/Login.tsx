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
import { 
  Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, 
  Sparkles, Shield, CheckCircle2 
} from 'lucide-react';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [namaLengkap, setNamaLengkap] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    resetAllForms();
    
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
    setLoginEmail("");
    setLoginPassword("");
    setNamaLengkap("");
    setRegEmail("");
    setPhone("");
    setRegPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const userData = res.data.user;
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("customer_email", userData.email);
      localStorage.setItem("customer_name", userData.nama);
      localStorage.setItem("customer_phone", userData.no_hp || phone);
      localStorage.setItem("isLoggedIn", "true");
      
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remembered_email", loginEmail);
        localStorage.setItem("remembered_password", loginPassword);
      } else {
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }
      
      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
      } else {
        const dummyToken = btoa(userData.email + ":" + Date.now());
        localStorage.setItem("auth_token", dummyToken);
      }
      
      if (!localStorage.getItem('selected_cabang')) {
        localStorage.setItem('selected_cabang', '1');
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${userData.nama}!`,
      });

      navigate("/");

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Gagal",
        description: error.response?.data?.message || "Email atau password salah.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    if (!namaLengkap.trim()) {
      toast({
        title: "Gagal",
        description: "Nama lengkap harus diisi.",
        variant: "destructive",
      });
      setRegisterLoading(false);
      return;
    }

    if (regPassword !== confirmPassword) {
      toast({
        title: "Gagal",
        description: "Password tidak sama.",
        variant: "destructive",
      });
      setRegisterLoading(false);
      return;
    }

    if (regPassword.length < 5) {
      toast({
        title: "Gagal",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      });
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        nama: namaLengkap,
        email: regEmail,
        password: regPassword,
        no_hp: phone,
      });

      console.log('Register response:', response.data);

      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda telah berhasil dibuat. Silakan login.",
      });

      setNamaLengkap("");
      setRegEmail("");
      setPhone("");
      setRegPassword("");
      setConfirmPassword("");
      
      setActiveTab("login");
      setLoginEmail(regEmail);

    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: "Registrasi Gagal",
        description: error.response?.data?.message || "Email sudah digunakan atau terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 md:py-16 lg:py-20 flex items-center relative overflow-hidden">
        {/* Background Dekoratif - Soft dan Elegan */}
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
            {/* Header - Elegan */}
            <div className="text-center mb-6 md:mb-8">
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-barber-gold/10 backdrop-blur-sm rounded-full border border-barber-gold/20 mb-4">
                <Scissors className="h-3.5 w-3.5 text-barber-gold" />
                <span className="text-xs font-medium text-barber-gold tracking-wider">SENIMAN BARBERSHOP</span>
              </div> */}
              <h1 className="text-3xl md:text-4xl font-bold text-barber-brown">
                Seniman <span className="text-barber-gold">Barbershop</span>
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-2">
                {activeTab === 'login' ? 'Masuk ke akun Anda' : 'Buat akun untuk mulai booking'}
              </p>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg text-sm md:text-base text-gray-600 data-[state=active]:bg-barber-gold data-[state=active]:text-black data-[state=active]:shadow-md transition-all"
                >
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-lg text-sm md:text-base text-gray-600 data-[state=active]:bg-barber-gold data-[state=active]:text-black data-[state=active]:shadow-md transition-all"
                >
                  <User className="h-3.5 w-3.5 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>
              
              {/* LOGIN TAB */}
              <TabsContent value="login" className="mt-4 md:mt-6">
                <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-amber-900/5">
                  <CardHeader className="pb-2 md:pb-4 pt-6 md:pt-8 px-6 md:px-8">
                    <CardTitle className="text-lg md:text-2xl font-bold text-center text-gray-800">
                      Selamat Datang Kembali
                    </CardTitle>
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-1">
                      Masukkan email dan password Anda
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
                              Email
                            </div>
                          </Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              placeholder="nama@gmail.com"
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
                            <Link to="/forgot-password" className="text-xs md:text-sm text-barber-gold hover:underline font-medium transition-all">
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
                        
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center space-x-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold cursor-pointer"
                            />
                            <span className="text-xs md:text-sm text-gray-500 cursor-pointer group-hover:text-barber-gold transition-colors">
                              Ingat Saya
                            </span>
                          </label>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Shield className="h-3 w-3" />
                            <span>Aman & Terpercaya</span>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={loginLoading}
                          className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6 rounded-xl text-sm md:text-base transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-barber-gold/20 group"
                        >
                          {loginLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Memproses...
                            </>
                          ) : (
                            <>
                              Login
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col pt-2 pb-6 md:pb-8 px-6 md:px-8">
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-2">
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-barber-gold hover:underline font-medium transition-all"
                      >
                        Daftar di sini
                      </button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* REGISTER TAB */}
              <TabsContent value="register" className="mt-4 md:mt-6">
                <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-amber-900/5">
                  <CardHeader className="pb-2 md:pb-4 pt-6 md:pt-8 px-6 md:px-8">
                    <CardTitle className="text-lg md:text-2xl font-bold text-center text-gray-800">
                      Buat Akun Baru
                    </CardTitle>
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-1">
                      Isi data diri Anda untuk mendaftar
                    </p>
                    {/* <div className="flex justify-center gap-1 mt-3">
                      <div className="w-8 h-1 bg-barber-gold rounded-full"></div>
                      <div className="w-8 h-1 bg-barber-gold/30 rounded-full"></div>
                      <div className="w-8 h-1 bg-barber-gold/10 rounded-full"></div>
                    </div> */}
                  </CardHeader>
                  <CardContent className="px-4 md:px-8 pb-2">
                    <form onSubmit={handleRegister}>
                      <div className="grid gap-3.5 md:gap-4">
                        <div className="grid gap-1.5 md:gap-2">
                          <Label htmlFor="namaLengkap" className="text-sm md:text-base font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-barber-gold" />
                              Nama Lengkap
                            </div>
                          </Label>
                          <Input
                            id="namaLengkap"
                            type="text"
                            placeholder="Masukkan nama lengkap Anda"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            autoComplete="off"
                            required
                            className="pl-4 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                          />
                        </div>
                        
                        <div className="grid gap-1.5 md:gap-2">
                          <Label htmlFor="regEmail" className="text-sm md:text-base font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-barber-gold" />
                              Email
                            </div>
                          </Label>
                          <Input
                            id="regEmail"
                            type="email"
                            placeholder="nama@gmail.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            autoComplete="off"
                            required
                            className="pl-4 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                          />
                        </div>
                        
                        <div className="grid gap-1.5 md:gap-2">
                          <Label htmlFor="phone" className="text-sm md:text-base font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-barber-gold" />
                              No HP
                            </div>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="08123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="off"
                            required
                            className="pl-4 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                          />
                        </div>
                        
                        <div className="grid gap-1.5 md:gap-2">
                          <Label htmlFor="regPassword" className="text-sm md:text-base font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-barber-gold" />
                              Password
                            </div>
                          </Label>
                          <div className="relative">
                            <Input
                              id="regPassword"
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              autoComplete="new-password"
                              required
                              className="pl-4 pr-12 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-barber-gold transition-colors"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Minimal 6 karakter</p>
                        </div>
                        
                        <div className="grid gap-1.5 md:gap-2">
                          <Label htmlFor="confirmPassword" className="text-sm md:text-base font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-barber-gold" />
                              Konfirmasi Password
                            </div>
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              required
                              className="pl-4 pr-12 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-gray-200 focus:border-barber-gold focus:ring-barber-gold/20 bg-white/80 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-barber-gold transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id="terms"
                            className="h-4 w-4 rounded border-gray-300 text-barber-gold focus:ring-barber-gold mt-0.5 cursor-pointer"
                            required
                          />
                          <Label htmlFor="terms" className="text-xs md:text-sm text-gray-500 cursor-pointer leading-relaxed">
                            Saya setuju dengan{" "}
                            <Link to="/terms" className="text-barber-gold hover:underline transition-all">
                              Syarat Layanan
                            </Link>{" "}
                            dan{" "}
                            <Link to="/privacy" className="text-barber-gold hover:underline transition-all">
                              Kebijakan Privasi
                            </Link>
                          </Label>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={registerLoading}
                          className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black font-semibold py-5 md:py-6 rounded-xl text-sm md:text-base transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-barber-gold/20 group"
                        >
                          {registerLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Memproses...
                            </>
                          ) : (
                            <>
                              {/* <Crown className="h-4 w-4 mr-2" /> */}
                              Daftar Sekarang
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col pt-2 pb-6 md:pb-8 px-6 md:px-8">
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-2">
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-barber-gold hover:underline font-medium transition-all"
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