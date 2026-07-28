import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  duration: string;
  image: string | null;
}

const ServiceCard = ({ title, price, description, duration, image }: ServiceCardProps) => {
  // Default image jika tidak ada gambar
  const defaultImage = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
  const imageUrl = image && image !== '' ? image : defaultImage;

  return (
    <Card className="service-card overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Jika gambar gagal load, gunakan default
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      <CardContent className="p-3 md:p-5 flex-1">
        {/* Judul & harga - wrap ke bawah kalau sempit di layar kecil */}
        <div className="flex flex-wrap justify-between items-start gap-x-2 gap-y-1 mb-2 md:mb-4">
          <h3 className="text-base md:text-xl font-bold line-clamp-1 flex-1 min-w-0">{title}</h3>
          <span className="text-barber-gold font-semibold text-sm md:text-base whitespace-nowrap">{price}</span>
        </div>
        <p className="text-muted-foreground text-xs md:text-sm mb-2 line-clamp-2">
          {description || 'Nikmati layanan terbaik dari barber profesional kami.'}
        </p>
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration}
        </div>
      </CardContent>
      <CardFooter className="p-3 md:p-5 pt-0">
        <Link to="/booking" className="w-full">
          <Button className="w-full bg-barber-brown hover:bg-barber-brown/90 text-sm md:text-base py-2 md:py-2.5">
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;