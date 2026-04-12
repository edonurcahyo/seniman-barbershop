
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tentang Seniman Barbershop</h2>
            <p className="text-gray-600 mb-6">
              Di Barbershop Seniman, kami menggabungkan seni tradisional dengan teknik modern untuk memberikan pengalaman grooming yang tak tertandingi. 
              Dengan tim barber berpengalaman, kami berkomitmen untuk membantu Anda menemukan gaya yang sempurna, menciptakan penampilan yang tidak hanya menarik tetapi juga mencerminkan kepribadian Anda.
            </p>
            <p className="text-gray-600 mb-6">
              Kami percaya bahwa setiap potongan rambut adalah karya seni. Dari potongan klasik hingga gaya kontemporer, kami menggunakan teknik terbaik dan produk berkualitas tinggi untuk memastikan Anda mendapatkan hasil yang memuaskan. 
              Kunjungi kami dan rasakan perbedaan layanan yang dipersonalisasi dan perhatian terhadap detail yang kami tawarkan.
            </p>
            <Link to="/about">
              <Button variant="outline" className="border-barber-brown text-barber-brown hover:bg-barber-brown hover:text-white">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1587270613291-b5c7042fc104?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Barbershop interior" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg mt-8">
              <img 
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Barber tools" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img 
                src="https://plus.unsplash.com/premium_photo-1677444546739-21b8aad351d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Haircut in progress" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg mt-8">
              <img 
                src="https://media.istockphoto.com/id/1244833615/photo/barbershop-working-place-interior-3d-illustration.webp?a=1&b=1&s=612x612&w=0&k=20&c=-Mnbcti1uLomLNUNX97ZpOUh-ulAUneih1ii39O8_tU=" 
                alt="Barbershop detail" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
