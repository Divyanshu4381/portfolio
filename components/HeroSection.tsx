"use client"

import { Button } from "@/components/ui/button"
import { motion, easeInOut } from "framer-motion"
import { ArrowRight, Sparkles, Github, Linkedin, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeroSectionProps {
  city?: string;
}

export default function HeroSection({ city }: HeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  return (
    <section
      id="home"
      className="relative bg-black overflow-hidden min-h-screen flex items-center pt-16 pb-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 🎬 Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/videobg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* ✨ Light Effects - Responsive sizing */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-10 left-5 w-20 h-20 sm:top-20 sm:left-10 sm:w-32 sm:h-32 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 sm:bottom-40 sm:right-20 sm:w-48 sm:h-48 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      {/* 🌟 Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20 relative z-10">
        <div className="flex items-center justify-center text-center">
          <div className="max-w-4xl w-full">
            {/* Floating sparkles - Responsive positioning */}
            <motion.div
              className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10"
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: easeInOut }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-400/60" />
            </motion.div>

            {/* Avatar - Responsive sizing */}
            <motion.div
              className="mx-auto w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mb-6 sm:mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Avatar className="w-full h-full border-2 border-green-500/30">
                <AvatarImage
                  src="/MyImg.jpg"
                  alt="Divyanshu Kushwaha"
                  className="object-cover filter grayscale hover:grayscale-0 transition duration-300"
                />
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Name and Title - Responsive typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 px-2 sm:px-4"
            >
              <span className="block text-white text-lg sm:text-2xl md:text-3xl mb-2 font-medium">
                Hi, I am
              </span>
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent pb-1">
                Divyanshu Kushwaha
              </span>
            </motion.h1>

            {/* Description - Responsive text sizing and spacing */}
            <motion.p
              className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed sm:leading-loose px-2 sm:px-6 break-words"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Passionate about crafting scalable, secure, and intuitive web solutions {city ? `for businesses in ${city} ` : ""}using{" "}
              <span className="text-green-400 font-semibold">React</span>,{" "}
              <span className="text-green-400 font-semibold">Node.js</span>, and{" "}
              <span className="text-green-400 font-semibold">Next.js</span>. I love transforming ideas into smooth, high-performing digital experiences.
            </motion.p>

            {/* 📄 Resume Button - Responsive sizing */}
            <motion.div
              className="flex justify-center mb-8 sm:mb-10 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="https://drive.google.com/file/d/1M0PmBbeqkHkvF_VSw4NmNKFa2Ltnb2zz/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto max-w-xs mx-auto"
              >
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black px-6 py-6 sm:px-8 sm:py-6 rounded-xl font-semibold shadow-lg relative overflow-hidden group w-full text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    View Resume <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </Button>
              </a>
            </motion.div>

            {/* 🌐 Social Links - Responsive spacing and sizing */}
            <motion.div
              className="flex justify-center gap-6 sm:gap-8 mb-8 sm:mb-10 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <a
                href="https://github.com/Divyanshu4381"
                target="_blank"
                rel="me noopener noreferrer"
                className="p-3 bg-white/5 rounded-full hover:bg-green-500/20 transition-all duration-300 border border-white/10 hover:border-green-500/50"
              >
                <Github className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 hover:text-green-400 transition" />
              </a>
              <a
                href="https://linkedin.com/in/divyanshukushwaha"
                target="_blank"
                rel="me noopener noreferrer"
                className="p-3 bg-white/5 rounded-full hover:bg-green-500/20 transition-all duration-300 border border-white/10 hover:border-green-500/50"
              >
                <Linkedin className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 hover:text-green-400 transition" />
              </a>
              <a
                href="mailto:divyanshu4381@gmail.com"
                className="p-3 bg-white/5 rounded-full hover:bg-green-500/20 transition-all duration-300 border border-white/10 hover:border-green-500/50"
              >
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 hover:text-green-400 transition" />
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}