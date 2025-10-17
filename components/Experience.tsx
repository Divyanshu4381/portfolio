"use client";

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

interface ExperienceItem {
  company: string;
  position: string;
  period: string;
  Location: string;
}

const Experience = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, threshold: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Scroll-based animations
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const experiences: ExperienceItem[] = [
    {
      company: "Self Employed",
      position: "Full Stack Developer",
      period: "Oct 2024 - Present",
      Location: "Remote"
    },
    {
      company: "Riveyra Infotech",
      position: "Mern Stack Developer | Internship",
      period: "May 2025 - Aug 2025",
      Location: "Work From Office"
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 80,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  const dotVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "backOut"
      }
    }
  };

  return (
    <motion.section 
      id="experience" 
      ref={sectionRef}
      style={{
        y,
        opacity,
        scale
      }}
      className="py-12 md:py-20 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Experience
            </span>
          </motion.h2>
          <motion.div 
            className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: '5rem' } : { width: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </motion.div>

        {/* Experience Timeline */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {experiences.map((exp, index) => (
              <motion.div 
                key={index} 
                className="relative"
                variants={itemVariants}
              >
                {/* Timeline line - Hidden on mobile, visible on medium screens and up */}
                {index !== experiences.length - 1 && (
                  <motion.div 
                    className="absolute left-4 sm:left-6 top-14 sm:top-16 w-0.5 h-full bg-gradient-to-b from-green-500/50 to-emerald-500/50 origin-top hidden sm:block"
                    variants={lineVariants}
                  />
                )}
                
                {/* Timeline item */}
                <div className="relative flex items-start mb-8 sm:mb-12 group">
                  {/* Timeline dot */}
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25"
                    variants={dotVariants}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <motion.div 
                      className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    />
                  </motion.div>

                  {/* Content */}
                  <motion.div 
                    className="ml-4 sm:ml-6 md:ml-8 flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group-hover:shadow-lg sm:group-hover:shadow-xl group-hover:shadow-green-500/20"
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: index * 0.15,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -4,
                      scale: 1.01,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3">
                      <motion.h3 
                        className="text-lg sm:text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 break-words"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        {exp.company}
                      </motion.h3>
                      <motion.span 
                        className="text-emerald-400 font-medium text-xs sm:text-sm bg-emerald-400/10 px-2 sm:px-3 py-1 rounded-full border border-emerald-400/20 w-fit"
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        {exp.period}
                      </motion.span>
                    </div>
                    <motion.p 
                      className="text-gray-300 text-base sm:text-lg font-medium break-words"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {exp.position}
                    </motion.p>
                    
                    {/* Location */}
                    <motion.div 
                      className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2 text-gray-400 text-sm sm:text-base"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <span className="text-xs sm:text-sm">📍</span>
                      <span>{exp.Location}</span>
                    </motion.div>
                    
                    {/* Animated border effect */}
                    <motion.div 
                      className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.div>

                  {/* Floating elements - Reduced on mobile */}
                  <motion.div 
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-400/30 rounded-full blur-sm"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      delay: index * 0.3 
                    }}
                  />
                  <motion.div 
                    className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400/40 rounded-full blur-sm"
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.4, 0.9, 0.4]
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity,
                      delay: index * 0.5 
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background decorations with scroll effects - Adjusted for mobile */}
        <motion.div 
          className="absolute top-10 left-4 sm:top-20 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-green-500/10 rounded-full blur-2xl sm:blur-3xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, -50]),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.2, 0.1])
          }}
          animate={isInView ? { 
            scale: [1, 1.3, 1],
          } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-24 h-24 sm:w-40 sm:h-40 bg-emerald-500/10 rounded-full blur-2xl sm:blur-3xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, 50]),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.3, 0.1])
          }}
          animate={isInView ? { 
            scale: [1, 1.4, 1],
          } : {}}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Section transition border */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
        }}
      />
    </motion.section>
  );
};

export default Experience;