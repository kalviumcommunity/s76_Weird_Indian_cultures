'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const images = [
  '/images/jallikattu.jpg',
  '/images/240_F_988992147_urXqMNdfqC07vwDqFxAC2v7UZ3FX5IPp.jpg',
  '/images/debashis-rc-biswas-ZrejNf2Ex0M-unsplash.jpg',
  '/images/gettyimages-sb10069471a-001-612x612.jpg',
  '/images/karoly-buzas-QS7e8OrubI0-unsplash (1).jpg',
  '/images/raimond-klavins-0xQ1H6xMak4-unsplash.jpg',
  '/images/karoly-buzas-QS7e8OrubI0-unsplash.jpg',
];

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          width={600}
          height={363}
          className="h-[363px] w-[600px] cursor-pointer object-cover transition-opacity duration-500"
          priority
        />
      </div>
    </div>
  );
}
