
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, User } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold text-barber-brown">Barbershop</span>
            <span className="ml-1 text-2xl font-serif font-light text-barber-gold">Seniman</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-barber-gold transition-colors">Beranda</Link>
            <Link to="/services" className="font-medium hover:text-barber-gold transition-colors">Services</Link>
            <Link to="/barbers" className="font-medium hover:text-barber-gold transition-colors">Barbers</Link>
            <Link to="/gallery" className="font-medium hover:text-barber-gold transition-colors">Gallery</Link>
            <Link to="/contact" className="font-medium hover:text-barber-gold transition-colors">Contact</Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full bg-barber-cream hover:bg-barber-gold/20">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                    Book Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-barber-gold">Login</Button>
                </Link>
                <Link to="/booking">
                  <Button className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
              <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100">Beranda</Link>
              <Link to="/services" className="px-3 py-2 rounded-md hover:bg-gray-100">Services</Link>
              <Link to="/barbers" className="px-3 py-2 rounded-md hover:bg-gray-100">Barbers</Link>
              <Link to="/gallery" className="px-3 py-2 rounded-md hover:bg-gray-100">Gallery</Link>
              <Link to="/contact" className="px-3 py-2 rounded-md hover:bg-gray-100">Contact</Link>
              
              <div className="pt-2 border-t">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-3">
                    <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile saya
                    </Link>
                    <Link to="/booking">
                      <Button className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
                        Pesan Janji
                      </Button>
                    </Link>
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
