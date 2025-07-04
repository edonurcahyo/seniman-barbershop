
import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface BarberCardProps {
  name: string;
  position: string;
  image: string;
  experience: string;
}

const BarberCard = ({ name, position, image, experience }: BarberCardProps) => {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-5 text-center">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-barber-gold font-medium">{position}</p>
        <p className="text-sm text-muted-foreground mt-2">{experience} pengalaman</p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Link to="/booking" className="w-full">
          <Button className="w-full bg-barber-brown hover:bg-barber-brown/90">
            Pesan dengan {name.split(' ')[0]}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BarberCard;
