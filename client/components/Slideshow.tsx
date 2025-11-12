'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = {
  image: string;
  title: string;
  location: string;
  description: string;
  accent: string;
};

const slides: Slide[] = [
  {
    image: '/images/jallikattu.jpg',
    title: 'Jallikattu Spirit',
    location: 'Madurai · Tamil Nadu',
    description: 'Pongal mornings burst with drumbeats, bull valor, and turmeric skies in the southern heartland.',
    accent: 'from-orange-500/60 via-amber-400/30 to-rose-500/30',
  },
  {
    image: '/images/raimond-klavins-0xQ1H6xMak4-unsplash.jpg',
    title: 'Backwater Glow',
    location: 'Alleppey · Kerala',
    description: 'Emerald canals mirror coconut groves, boat songs, and Kathakali whispers at dusk.',
    accent: 'from-emerald-500/40 via-teal-400/30 to-cyan-400/30',
  },
  {
    image: '/images/debashis-rc-biswas-ZrejNf2Ex0M-unsplash.jpg',
    title: 'Sacred Ghats',
    location: 'Varanasi · Uttar Pradesh',
    description: 'Morning aartis, mantra-laced bells, and floating diyas keep the Ganga shimmering with stories.',
    accent: 'from-amber-400/40 via-orange-500/30 to-red-500/30',
  },
  {
    image: '/images/gettyimages-sb10069471a-001-612x612.jpg',
    title: 'Monsoon Revelry',
    location: 'Mumbai · Maharashtra',
    description: 'Rain glossed skylines sway with dhols, street food trails, and Ganesh visarjan tides.',
    accent: 'from-purple-500/30 via-indigo-500/30 to-blue-500/30',
  },
  {
    image: '/images/karoly-buzas-QS7e8OrubI0-unsplash.jpg',
    title: 'Desert Saffron',
    location: 'Jaisalmer · Rajasthan',
    description: 'Dunes echo with sarangi ballads, swirling ghagras, and camel pageantry under million-star nights.',
    accent: 'from-yellow-400/40 via-orange-500/30 to-rose-500/30',
  },
  {
    image: '/images/240_F_988992147_urXqMNdfqC07vwDqFxAC2v7UZ3FX5IPp.jpg',
    title: 'Temple Rhythms',
    location: 'Hampi · Karnataka',
    description: 'Granite corridors, veena strings, and incense-thick evenings celebrate Deccan heritage.',
    accent: 'from-red-500/30 via-purple-500/20 to-indigo-500/20',
  },
];

const SLIDE_DURATION = 7000;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98,
  }),
};

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSlide = slides[currentIndex];
  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(slides.length).padStart(2, '0');

  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const showNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const showPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    clearAutoplay();

    if (isPaused) {
      return;
    }

    autoplayRef.current = setTimeout(() => {
      showNext();
    }, SLIDE_DURATION);

    return () => {
      clearAutoplay();
    };
  }, [currentIndex, isPaused, showNext, clearAutoplay]);

  useEffect(() => clearAutoplay, [clearAutoplay]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <div
      className="relative mx-auto w-full max-w-5xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
      role="region"
      aria-roledescription="carousel"
      aria-label="Incredible India showcase"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute -inset-4 -z-10 rounded-[36px] bg-gradient-to-r from-orange-500/40 via-pink-500/30 to-purple-500/30 opacity-60 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 30 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.4 },
            }}
            className="relative"
            aria-live="polite"
          >
            <div className="relative h-[420px] w-full md:h-[520px] lg:h-[600px]">
              <Image
                src={activeSlide.image}
                alt={`${activeSlide.title} - ${activeSlide.location}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/80" />
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeSlide.accent} opacity-60 mix-blend-screen`}
              />
              <motion.div
                key={activeSlide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-x-0 bottom-0 space-y-3 px-6 pb-8 pt-12 text-left md:px-10"
              >
                <p className="text-xs uppercase tracking-[0.5em] text-white/70">{activeSlide.location}</p>
                <h3 className="text-3xl font-semibold md:text-4xl">{activeSlide.title}</h3>
                <p className="max-w-3xl text-sm text-white/80 md:text-base">{activeSlide.description}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={showPrevious}
          className="group absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white transition-all duration-300 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="View previous story"
        >
          <svg
            className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            strokeWidth="1.8"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={showNext}
          className="group absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white transition-all duration-300 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="View next story"
        >
          <svg
            className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            strokeWidth="1.8"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-orange-500 to-amber-300"
            />
          </div>
          <span className="text-sm font-semibold text-white/80">
            {formattedIndex} / {formattedTotal}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.title}
                onClick={() => handleDotClick(index)}
                className="group relative h-3 w-10 rounded-full bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeSlideIndicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                  />
                )}
                {!isActive && <span className="absolute inset-1 rounded-full bg-white/30 opacity-40" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        Slide {currentIndex + 1} of {slides.length}: {activeSlide.title} from {activeSlide.location}.
      </div>
    </div>
  );
}
