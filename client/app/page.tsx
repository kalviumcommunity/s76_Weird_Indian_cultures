'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Slideshow from '@/components/Slideshow';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    router.push('/home');
  }, [router]);

  return (
    <>
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/Group.jpg')" }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        />

        <div className="relative">
          <h1 className="p-12 text-5xl font-bold text-orange-500">
            India&apos;s Culture
          </h1>

          <motion.img
            src="/images/737-Photoroom.png"
            alt="Spinning Chakra illustration"
            className="absolute ml-40 mt-32 h-[363px] w-[400px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <div className="absolute ml-[1170px] mt-[740px]">
            <Slideshow />
          </div>
        </div>

        <div className="relative mt-4">
          <div className="ml-[1170px] mt-24 h-[600px] w-[500px]">
            <h2 className="pt-10 text-4xl font-bold text-orange-400">
              Experience the Heart of India&apos;s Culture!
            </h2>
            <p className="mt-5 text-xl text-white">
              India is a land of diversity, where every region has its own language, cuisine, art,
              and customs. From the grandeur of ancient temples to the rhythm of folk dances,
              from the aroma of street food to the melodies of classical music-every element reflects
              a rich cultural tapestry. Step into a journey where history and modernity blend seamlessly,
              and immerse yourself in the vibrant tapestry of India&apos;s heritage.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="ml-[170px] h-[600px] w-[500px]">
            <h2 className="pt-2 text-4xl font-bold text-orange-400">Features</h2>
            <p className="mt-5 text-xl text-white">
              🌍 Explore India&apos;s Diversity – Discover traditions, festivals, and heritage of every state.
              🏞️ State-Wise Insights – Easily navigate and explore cultural aspects of each region.
              🎭 Traditional Arts & Festivals - Experience India&apos;s folk dances, music, and grand celebrations.
              🍛 Cuisine Showcase - Learn about iconic dishes and their cultural significance.
              🏰 Historical Marvels - Explore ancient temples, monuments, and architectural wonders.
              📜 Mythology & Folklore - Dive into legendary stories and traditional beliefs.
              📱 User-Friendly Interface - Smooth and interactive experience across all devices.
            </p>

            <button
              type="button"
              className="ml-[640px] mt-12 h-14 w-96 cursor-pointer rounded-2xl border-2 border-orange-500 bg-transparent text-xl font-bold text-white hover:bg-orange-500"
              onClick={handleGetStarted}
            >
              Get Started ➝
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
