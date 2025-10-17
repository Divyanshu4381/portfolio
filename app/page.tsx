"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { AnimatePresence, motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import SkillsSection from "@/components/Skills&Abilities"
import FeaturesSection from "@/components/FeaturesSection"
import PortfolioSection from "@/components/PortfolioSection"
import Footer from "@/components/Footer"
import EducationSection from "@/components/EducationSection"
import ContactPage from "@/components/ContactSection"
import CertificatesPage from "@/components/Certificates"
import Experience from "@/components/Experience"

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    // Loader animation - reduced time from 2000ms to 1200ms
    const loaderTimeout = setTimeout(() => setShowLoader(false), 1200)

    // GSAP ScrollTrigger animations
    gsap.fromTo(".hero-title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.2 })
    gsap.fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.4 })
    gsap.fromTo(".hero-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.6 })

    // Floating animation for 3D elements
    gsap.to(".floating-element", {
      y: -20,
      rotation: 5,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    })

    // Parallax effects
    gsap.utils.toArray(".parallax-element").forEach((element: any) => {
      gsap.to(element, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    // Scroll-triggered animations
    gsap.utils.toArray(".scroll-animate").forEach((element: any, index) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 50, rotationX: 10 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => {
      clearTimeout(loaderTimeout)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="bg-black min-h-screen text-white">
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div className="w-40 h-28 bg-black rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl border border-green-500/20">
                <img src="/logo.png" alt="Logodiv" className="w-32 h-20 object-contain" />
              </div>

              {/* Animated Loading Dots */}
              <div className="flex justify-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.15,
                  }}
                />
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.3,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && (
        <>
          <Navbar />
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <EducationSection/>
          {/* <FeaturesSection /> */}
          <PortfolioSection />
          <Experience/>
          <CertificatesPage/>
          <ContactPage/>
          <Footer />
        </>
      )}
    </div>
  )
}
