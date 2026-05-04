import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, User, LogOut, Shield } from 'lucide-react';
import BranchSelector from './BranchSelector';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const checkLoginStatus = () => {
    // Cek admin login
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminStr = localStorage.getItem('admin');
    
    // Cek customer login
    const isCustomerLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    
    if (isAdminLoggedIn && adminStr) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      try {
        const admin = JSON.parse(adminStr);
        setUserName(admin.nama || 'Admin');
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    } else if (isCustomerLoggedIn && userStr) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      try {
        const user = JSON.parse(userStr);
        const name = user.nama || user.name || 'User';
        setUserName(name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserName('');
    }
  };

  const handleLogout = () => {
    // Hapus data customer
    localStorage.removeItem('user');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_phone');
    
    // Hapus data admin
    localStorage.removeItem('admin');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('isAdminLoggedIn');
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
    
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-serif font-light text-barber-gold">Seniman</span>
            <span className="ml-1 text-2xl font-serif font-bold text-barber-brown">Barbershop</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <BranchSelector />
            
            <Link to="/" className="font-medium hover:text-barber-gold transition-colors">Beranda</Link>
            <Link to="/services" className="font-medium hover:text-barber-gold transition-colors">Layanan</Link>
            <Link to="/contact" className="font-medium hover:text-barber-gold transition-colors">Kontak</Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Profile Button */}
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-barber-cream transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-600' : 'bg-barber-gold'}`}>
                    {isAdmin ? <Shield className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                    {isAdmin ? `Admin: ${userName.split(' ')[0]}` : userName.split(' ')[0]}
                  </span>
                </button>
                
                {/* 🔥 Tombol "Pesan Sekarang" hanya untuk customer (bukan admin) */}
                {!isAdmin && (
                  <Link to="/booking">
                    <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                      Pesan Sekarang
                    </Button>
                  </Link>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-barber-gold">Login</Button>
                </Link>
                <Link to="/booking">
                  <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                    Pesan Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <div className="mr-1">
              <BranchSelector />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-2 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Cabang aktif:</p>
                <BranchSelector />
              </div>
              
              <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100">Beranda</Link>
              <Link to="/services" className="px-3 py-2 rounded-md hover:bg-gray-100">Layanan</Link>
              <Link to="/contact" className="px-3 py-2 rounded-md hover:bg-gray-100">Kontak</Link>
              
              <div className="pt-2 border-t">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleProfileClick();
                      }}
                      className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center w-full text-left"
                    >
                      {isAdmin ? <Shield className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                      {isAdmin ? `Admin: ${userName}` : `Profile: ${userName}`}
                    </button>
                    
                    {/* 🔥 Tombol "Pesan Janji" hanya untuk customer (bukan admin) */}
                    {!isAdmin && (
                      <Link to="/booking" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
                          Pesan Janji
                        </Button>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="px-3 py-2 rounded-md hover:bg-red-50 flex items-center w-full text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/booking">
                      <Button className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
                        Pesan Janji
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;