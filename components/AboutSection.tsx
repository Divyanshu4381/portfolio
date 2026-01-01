"use client";

import { motion } from "framer-motion";
import { Code2, Laptop, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutSection() {
  const stats = [
    { icon: Code2, value: "10+", label: "Projects Completed" },
    { icon: Laptop, value: "2+", label: "Years of Coding Experience" },
    { icon: CheckCircle, value: "2+", label: "Hackathons Participated" },
    { icon: MapPin, value: "Kanpur", label: "Based In" },
  ];

  // Animation Variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-emerald-900/10"></div>

      {/* Background Effects - Responsive sizing */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-5 w-20 h-20 sm:top-20 sm:right-10 sm:w-40 sm:h-40 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-5 w-24 h-24 sm:bottom-20 sm:left-10 sm:w-60 sm:h-60 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-xl sm:blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-20">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            About{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Me
            </span>
          </motion.h2>
        </div>

        {/* Grid Layout - Stack on mobile, side-by-side on larger screens */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Section - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <motion.h3
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              I'm <span className="text-green-400">Divyanshu Kushwaha</span>
            </motion.h3>

            <motion.p
              className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed sm:leading-loose mb-4 sm:mb-6 break-words max-w-full"
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              I am a Full-Stack developer based in Kanpur, India. I am an
              Information Technology undergraduate from Allenhouse Business
              School. I am very passionate about improving my coding skills and
              developing applications and websites. I build WebApps and Websites
              using MERN Stack. Working for myself to improve my skills. Love to
              build Full-Stack clones.
            </motion.p>

            {/* Contact Info - Stack on mobile */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <motion.p
                className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed break-words"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <span className="text-blue-400 font-semibold">Email:</span>{" "}
                divyanshu4381@gmail.com
              </motion.p>

              <motion.p
                className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <span className="text-blue-400 font-semibold">Phone:</span> +91
                8957681217
              </motion.p>

              <motion.p
                className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed break-words"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <span className="text-blue-400 font-semibold">Place:</span> Kanpur,
                Uttar Pradesh - 208007
              </motion.p>
            </div>

            {/* Resume Button - Responsive sizing */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex justify-center lg:justify-start"
            >
              <a 
                href="/Divyanshu_FullStackDeveloper_Resume.pdf" 
                download
                className="w-full sm:w-auto"
              >
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-green-500/20">
                  Download Resume
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Section - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center relative z-20 order-1 lg:order-2 mb-8 lg:mb-0"
          >
            <div className="relative w-[280px] h-[320px] sm:w-[320px] sm:h-[380px] md:w-[350px] md:h-[420px] lg:w-[380px] lg:h-[440px] xl:w-[400px] xl:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden border border-green-500/20 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all duration-500">
              <Image
                src="/aboutPhoto.jpg"
                alt="Divyanshu Kushwaha - Full Stack Developer from Kanpur"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                priority
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 350px, 400px"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats Section - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-12 sm:mt-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:bg-gray-800/50 transition-all duration-500 group"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15 + 0.3,
                  ease: 'easeOut',
                }}
                viewport={{ once: true }}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </motion.div>

              <motion.div
                className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15 + 0.5,
                  type: 'spring',
                  stiffness: 200,
                  damping: 10,
                }}
                viewport={{ once: true }}
              >
                {stat.value}
              </motion.div>

              <motion.div
                className="text-gray-400 text-xs sm:text-sm leading-tight"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.7 }}
                viewport={{ once: true }}
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}