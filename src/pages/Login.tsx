
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login Berhasil",
      description: "Anda telah berhasil masuk ke akun Anda.",
    });
    // In a real app, you would handle authentication here
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registrasi Berhasil",
      description: "Akun Anda telah berhasil dibuat. Silakan masuk.",
    });
    // In a real app, you would handle registration here
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setActiveTab(value as "login" | "register")}>
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
                            placeholder="nama@example.com"
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
                              placeholder="Hendrikus"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Nama belakang</Label>
                            <Input
                              id="lastName"
                              placeholder="Olmedo"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="regEmail"
                            type="email"
                            placeholder="nama@example.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">No HP</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(123) 456-7890"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="regPassword"
                            type="password"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
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
