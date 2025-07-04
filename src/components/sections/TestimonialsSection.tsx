
import React from 'react';
import TestimonialCard from '@/components/TestimonialCard';

const TestimonialsSection = () => {
  // Sample data - in a real app this would come from an API
  const testimonials = [
    {
      id: 1,
      name: 'Budi Santoso',
      date: 'April 15, 2025',
      rating: 5,
      review: "Pengalaman luar biasa di Barbershop Seniman! Suasana sangat nyaman dan stafnya sangat profesional. Alex memberikan potongan rambut terbaik yang pernah saya dapatkan.",
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Brando Pratama',
      date: 'March 28, 2025',
      rating: 5,
      review: "Saya sangat puas dengan layanan di sini. Jason sangat teliti dan memperhatikan detail. Saya akan kembali lagi untuk potongan rambut berikutnya!",
      image: 'https://randomuser.me/api/portraits/men/44.jpg'
    },
    {
      id: 3,
      name: 'Adel Wijaya',
      date: 'February 10, 2025',
      rating: 4,
      review: "Layanan yang sangat baik! Michael sangat ramah dan membuat saya merasa nyaman. Hasil potongan rambutnya juga sangat bagus, hanya sedikit lebih lama dari yang saya harapkan.",
      image: 'https://randomuser.me/api/portraits/men/51.jpg'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 section-title inline-block">Review Pelanggam</h2>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Dengarkan apa yang dikatakan klien kami tentang pengalaman mereka di Barbershop Seniman.
            Kami bangga memberikan layanan terbaik dan menciptakan suasana yang ramah untuk semua.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard 
              key={testimonial.id}
              name={testimonial.name}
              date={testimonial.date}
              rating={testimonial.rating}
              review={testimonial.review}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
