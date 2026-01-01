"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
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
    const loaderTimeout = setTimeout(() => setShowLoader(false), 1200)

    gsap.fromTo(".hero-title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.2 })
    gsap.fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.4 })
    gsap.fromTo(".hero-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.6 })

    gsap.to(".floating-element", {
      y: -20,
      rotation: 5,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    })

    gsap.utils.toArray(".parallax-element").forEach((element) => {
      gsap.to(element as HTMLElement, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: element as HTMLElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    gsap.utils.toArray(".scroll-animate").forEach((element, index) => {
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
    <>
      {/* 🔍 SEO + Meta Tags */}
      <Head>
        {/* Basic SEO */}
        <title>Divyanshu Kushwaha | Web Developer Portfolio</title>
        <meta
          name="description"
          content="Hi, I'm Divyanshu Kushwaha — a passionate web developer creating modern, fast, and visually stunning websites using React, Next.js, and Node.js."
        />
        <meta
          name="keywords"
          content="Divyanshu Kushwaha, Web Developer, Frontend Developer, Next.js, React.js, Node.js, Portfolio, Freelancer, Full Stack Developer"
        />
        <meta name="author" content="Divyanshu Kushwaha" />

        {/* Canonical */}
        <link rel="canonical" href="https://divyanshubca.vercel.app/" />

        {/* Open Graph (Facebook / LinkedIn / WhatsApp Preview) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://divyanshubca.vercel.app/" />
        <meta property="og:title" content="Divyanshu Kushwaha | Web Developer Portfolio" />
        <meta
          property="og:description"
          content="Explore the portfolio of Divyanshu Kushwaha — showcasing modern web development projects built with React and Next.js."
        />
        <meta property="og:image" content="https://divyanshubca.vercel.app/og-image.jpg" />

        {/* Twitter Card (Preview for Twitter / X) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Divyanshu Kushwaha | Web Developer Portfolio" />
        <meta
          name="twitter:description"
          content="Hi, I'm Divyanshu Kushwaha — crafting elegant, scalable, and modern web experiences."
        />
        <meta name="twitter:image" content="https://divyanshubca.vercel.app/og-image.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* JSON-LD Schema for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Divyanshu Kushwaha",
              url: "https://divyanshubca.vercel.app/",
              sameAs: [
                "https://github.com/Divyanshu4381",
                "https://linkedin.com/in/divyanshukushwaha",
                "mailto:divyanshu4381@gmail.com",
              ],
              jobTitle: "Full Stack Web Developer",
              worksFor: {
                "@type": "Organization",
                name: "Freelancer",
              },
              description:
                "Creative and detail-oriented web developer specializing in React, Next.js, and Node.js with a focus on performance and design.",
            }),
          }}
        />
      </Head>

      {/* 🌟 Main Page Content */}
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
                <div className="flex justify-center space-x-2">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay }}
                    />
                  ))}
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
            <EducationSection />
            <PortfolioSection />
            <Experience />
            <CertificatesPage />
            <ContactPage />
            <Footer />
          </>
        )}
      </div>
    </>
  )
}
