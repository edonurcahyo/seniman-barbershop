
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-barber-brown text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap untuk tampilan baru?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Bergabunglah dengan kami di Barbershop Seniman untuk pengalaman perawatan yang tak tertandingi. 
          Tim ahli kami siap membantu Anda menemukan gaya yang sempurna.
        </p>
        <Link to="/booking">
          <Button className="px-8 py-3 text-lg bg-barber-gold hover:bg-barber-gold/90 text-black">
            Pesan Sekarang
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
