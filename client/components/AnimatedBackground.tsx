'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedBackground Component
 * 
 * Use this as an alternative to video background if you don't have a video file yet.
 * Features animated gradients and floating shapes for visual interest.
 * 
 * Usage: Replace the video section in landing-page.tsx with this component
 */

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(45deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
            'linear-gradient(90deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
            'linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
            'linear-gradient(180deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
            'linear-gradient(45deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Shapes */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(139, 92, 246, 0.1)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Particle Effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 rounded-full bg-orange-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Static Background Image (as ultimate fallback) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/Group.jpg')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
    </div>
  );
}

/**
 * HOW TO USE:
 * 
 * In your landing-page.tsx, replace the video section:
 * 
 * FROM:
 * ```tsx
 * <div className="absolute inset-0">
 *   <video autoPlay loop muted playsInline>
 *     <source src="/videos/india-culture.mp4" type="video/mp4" />
 *   </video>
 *   <div className="absolute inset-0 bg-gradient-to-b from-black/60..." />
 * </div>
 * ```
 * 
 * TO:
 * ```tsx
 * <AnimatedBackground />
 * ```
 */
