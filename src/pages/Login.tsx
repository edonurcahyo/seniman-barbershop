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

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [namaDepan, setNamaDepan] = useState("");
  const [namaBelakang, setNamaBelakang] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset semua form saat component mount
  useEffect(() => {
    resetAllForms();
  }, []);

  const resetAllForms = () => {
    // Reset login form
    setLoginEmail("");
    setLoginPassword("");
    
    // Reset register form
    setNamaDepan("");
    setNamaBelakang("");
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

      // Simpan data user
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("customer_email", res.data.user.email);
      localStorage.setItem("customer_name", res.data.user.nama || `${res.data.user.nama_depan} ${res.data.user.nama_belakang}`);
      localStorage.setItem("isLoggedIn", "true");  // ← Tambahkan ini
      
      // Simpan token jika ada
      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
      }

      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali.",
      });

      // Redirect ke Index/Home dulu
      navigate("/");

    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.response?.data?.message || "Email atau password salah.",
        variant: "destructive",
      });
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== confirmPassword) {
      toast({
        title: "Gagal",
        description: "Password tidak sama.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register", {
        nama: namaDepan + " " + namaBelakang,
        email: regEmail,
        password: regPassword,
        no_hp: phone,
      });

      toast({
        title: "Registrasi Berhasil",
        description: "Silakan login.",
      });

      setActiveTab("login");
      
      // Reset form register
      setNamaDepan("");
      setNamaBelakang("");
      setRegEmail("");
      setPhone("");
      setRegPassword("");
      setConfirmPassword("");

    } catch (error) {
      toast({
        title: "Registrasi Gagal",
        description: "Email sudah digunakan.",
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
                          <Input
                            id="password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-barber-brown hover:bg-barber-brown/90">
                          Login
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <div className="relative w-full my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Atau lanjutkan dengan</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button variant="outline" type="button" className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" fill="currentColor"/>
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" type="button" className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 12C20 7.581 16.419 4 12 4C7.58096 4 4 7.581 4 12C4 15.966 6.91655 19.256 10.75 19.9V14.25H8.5V12H10.75V10.357C10.75 8.354 11.9837 7.25 13.7417 7.25C14.5837 7.25 15.4378 7.4 15.4378 7.4V9.6H14.4344C13.4483 9.6 13.25 10.245 13.25 10.9103V12H15.3662L15.1207 14.25H13.25V19.9C17.0832 19.256 20 15.966 20 12Z" fill="currentColor"/>
                        </svg>
                        Facebook
                      </Button>
                    </div>
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">Nama depan</Label>
                            <Input
                              id="firstName"
                              placeholder="nama depan"
                              value={namaDepan}
                              onChange={(e) => setNamaDepan(e.target.value)}
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Nama belakang</Label>
                            <Input
                              id="lastName"
                              placeholder="nama belakang"
                              value={namaBelakang}
                              onChange={(e) => setNamaBelakang(e.target.value)}
                              autoComplete="off"
                              required
                            />
                          </div>
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
                          <Input
                            id="regPassword"
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
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