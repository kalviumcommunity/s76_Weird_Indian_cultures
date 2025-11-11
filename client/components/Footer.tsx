'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const handleOpen = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <div className="relative flex h-[350px] w-full bg-white flex-col gap-8 px-20 py-10 md:flex-row">
      <div>
        <h2 className="text-2xl font-bold text-black">About us</h2>
        <motion.div
          className="h-1 w-24 bg-black"
          initial={{ width: 0 }}
          whileInView={{ width: 100 }}
          transition={{ duration: 1 }}
        />
        <p className="mt-6 max-w-2xl text-black">
          Welcome to India culture, a platform dedicated to celebrating India&apos;s rich cultural
          heritage! From vibrant festivals and traditional arts to diverse cuisines and historical
          wonders, we bring you an immersive experience of India&apos;s traditions. Our mission is
          to showcase the beauty and diversity of Indian culture in an engaging way, making it
          accessible to everyone. Whether you&apos;re a history buff, a traveler, or just curious,
          explore and celebrate India with us!
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-black">Contact</h2>
        <motion.div
          className="h-1 w-24 bg-black"
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          transition={{ duration: 1 }}
        />
        <div className="mt-6  flex gap-8">
          <FaGithub
            size={45} 
           
            className="cursor-pointer  transition-transform hover:scale-110"
            onClick={() => handleOpen('https://github.com/harishb2006')}
          />
          <FaLinkedin
            size={45}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() =>
              handleOpen('https://www.linkedin.com/in/harish-b-41450232a/')
            }
          />
        </div>
      </div>
    </div>
  );
}
