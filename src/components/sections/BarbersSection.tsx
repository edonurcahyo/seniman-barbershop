
import React from 'react';
import BarberCard from '@/components/BarberCard';

const BarbersSection = () => {
  // Sample data - in a real app this would come from an API
  const barbers = [
    // {
    //   id: 1,
    //   name: 'Cahya Nugraha',
    //   position: 'Junior Barber',
    //   experience: '2 Tahun',
    //   image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    // },
    {
      id: 2,
      name: 'Jason Susanto',
      position: 'Senior Barber',
      experience: '5 Tahun',
      image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Ahmad Khalish',
      position: 'Style Specialist',
      experience: '3 Tahun',
      image: 'https://images.unsplash.com/photo-1596513058260-ac19435ec75a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];  

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 section-title inline-block">Lihat Barber Kami</h2>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Tim kami terdiri dari barber berpengalaman yang siap membantu Anda menemukan gaya yang sempurna. 
            Setiap barber memiliki keahlian unik dan dedikasi untuk memberikan layanan terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {barbers.slice(0, 2).map((barber) => (
            <BarberCard 
              key={barber.id}
              name={barber.name}
              position={barber.position}
              experience={barber.experience}
              image={barber.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BarbersSection;
