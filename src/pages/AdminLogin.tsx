// src/pages/AdminLogin.tsx
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

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (res.data.success) {
        // Simpan data admin ke localStorage
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        localStorage.setItem("isAdminLoggedIn", "true");

        toast({
          title: "Login Berhasil",
          description: `Selamat datang kembali, ${res.data.admin.nama}!`,
        });

        // Redirect ke Dashboard Admin
        navigate("/admin");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Gagal",
        description: error.response?.data?.message || "Email atau password salah.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Hanya tab login, tanpa register */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-barber-brown rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-barber-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Admin Panel</CardTitle>
                <p className="text-center text-gray-500 text-sm mt-2">Masuk ke dashboard administrator</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Admin</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@seniman.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/admin/forgot-password" className="text-sm text-barber-gold hover:underline">
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
                    <Button type="submit" className="w-full bg-barber-brown hover:bg-barber-brown/90" disabled={loading}>
                      {loading ? 'Memproses...' : 'Login sebagai Admin'}
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
                    <span className="px-2 bg-white text-gray-500">Akses Khusus Administrator</span>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  <p>Halaman ini hanya untuk admin barbershop</p>
                  <Link to="/login" className="text-barber-gold hover:underline mt-2 inline-block">
                    Kembali ke halaman login pelanggan
                  </Link>
                </div>
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