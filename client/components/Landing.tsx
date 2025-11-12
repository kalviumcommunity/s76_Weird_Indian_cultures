'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Slideshow from '@/components/Slideshow';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const handleGetStarted = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    router.push('/home');
  }, [router]);

  const scrollToContent = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div ref={containerRef} className="bg-black">
        {/* Hero Section with Video */}
        <motion.section
          ref={heroRef}
          className="relative h-screen w-full overflow-hidden"
          style={{ opacity, scale }}
        >
          {/* Video Background */}
          <div className="absolute inset-0">
            {!videoUnavailable ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/images/Group.jpg"
                className="h-full w-full object-cover"
                aria-hidden
                onError={() => setVideoUnavailable(true)}
              >
                <source src="/images/India.mp4" type="video/mp4" />
              </video>
            ) : (
              <AnimatedBackground />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
          </div>

          {/* Ambient Glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-orange-500/25 blur-[160px] md:h-96 md:w-96" />
            <div className="absolute bottom-10 right-6 h-80 w-80 rounded-full bg-emerald-400/20 blur-[150px]" />
            <div className="absolute right-1/2 top-40 hidden h-64 w-64 rounded-full bg-teal-400/20 blur-[140px] md:block" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-32 pt-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mb-6 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-orange-100"
            >
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Cultural Atlas
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70"
            >
              {heroHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-1 backdrop-blur-sm"
                >
                  {highlight}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-8"
            >
              <motion.img
                src="/images/737-Photoroom.png"
                alt="Ashoka Chakra"
                className="mx-auto h-32 w-32 md:h-40 md:w-40"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mb-6 max-w-5xl text-4xl font-semibold text-white md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
                Incredible India
              </span>{' '}
              unfolds through immersive stories, rituals, and journeys.
            </motion.h1>

          

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-12 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:shadow-orange-500/50"
            >
              <span className="relative z-10">Begin Your Journey</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>
          </div>

      
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={scrollToContent}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center text-white/70"
            >
              <span className="mb-2 text-xs tracking-[0.5em]">Scroll</span>
              <ChevronDown className="h-10 w-10" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Cultural Highlights */}
        <section className="relative overflow-hidden bg-black py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-10 hidden w-px bg-gradient-to-b from-transparent via-orange-500/40 to-transparent md:block" />
            <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
          </div>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.5em] text-orange-300/80">
                Curated Immersion
              </p>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
                Culture meets{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  modern storytelling
                </span>
              </h2>
              <p className="mx-auto max-w-3xl text-base text-gray-300 md:text-lg">
                Every scroll unlocks living museums, ritual playbooks, and sensory experiences aimed at
                keeping India&apos;s plural voices alive online.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {culturalHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${highlight.gradient} opacity-70 blur-3xl`}
                  />
                  <div className="relative z-10">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-4xl">{highlight.icon}</span>
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                          Series 0{index + 1}
                        </p>
                        <h3 className="text-2xl font-semibold text-white">{highlight.title}</h3>
                      </div>
                    </div>
                    <p className="mb-6 text-gray-200">{highlight.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-white/80">
                      {highlight.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-4 text-xs uppercase tracking-[0.4em] text-white/50">
                    Immersive
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section with Parallax */}
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-orange-950/20 to-black py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Slideshow with Animation */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 opacity-20 blur-2xl" />
                  <Slideshow />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="mb-4 text-5xl font-bold text-white md:text-6xl">
                    Experience the{' '}
                    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                      Heart of India
                    </span>
                  </h2>
                  <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl leading-relaxed text-gray-300"
                >
                  India is a land of diversity, where every region has its own language, cuisine,
                  art, and customs. From the grandeur of ancient temples to the rhythm of folk
                  dances, from the aroma of street food to the melodies of classical music—every
                  element reflects a rich cultural tapestry.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-xl leading-relaxed text-gray-300"
                >
                  Step into a journey where history and modernity blend seamlessly, and immerse
                  yourself in the vibrant tapestry of India&apos;s heritage.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}

const heroHighlights = ['Festival Trackers', 'State Guides', 'Culinary Maps', 'Craft Circuits'];

const culturalHighlights = [
  {
    icon: '🛕',
    title: 'Living Heritage Trails',
    description:
      'Move through sacred rivers, ancient forts, and temple towns stitched together with augmented guides and archival trivia.',
    badges: ['Temple towns', 'UNESCO marvels', 'Wellness routes'],
    gradient: 'from-orange-500/40 via-orange-900/10 to-pink-500/30',
  },
  {
    icon: '🎨',
    title: 'Artisan Studio Drops',
    description:
      'Meet master craftspeople, stream live demos, and pin studios for your own culture-forward travel notebooks.',
    badges: ['Handlooms', 'Folk art', 'Residencies'],
    gradient: 'from-purple-500/40 via-indigo-900/10 to-rose-500/30',
  },
  {
    icon: '🥘',
    title: 'Flavour Expeditions',
    description:
      'Trace spice routes, ancestral recipes, and culinary labs that shape everyday India while unlocking cook-along playlists.',
    badges: ['Street food', 'Heritage cafes', 'Slow dining'],
    gradient: 'from-emerald-500/40 via-teal-900/10 to-cyan-500/30',
  },
];
