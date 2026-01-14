"use client"

import dynamic from 'next/dynamic'
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"

// Dynamic imports for below-the-fold content
const AboutSection = dynamic(() => import('@/components/AboutSection'))
const SkillsSection = dynamic(() => import('@/components/Skills&Abilities'))
const EducationSection = dynamic(() => import('@/components/EducationSection'))
const PortfolioSection = dynamic(() => import('@/components/PortfolioSection'))
const Experience = dynamic(() => import('@/components/Experience'))
const CertificatesPage = dynamic(() => import('@/components/Certificates'))
const ContactPage = dynamic(() => import('@/components/ContactSection'))
const Footer = dynamic(() => import('@/components/Footer'))

export default function Home() {
  return (
    <>
      <div className="bg-black min-h-screen text-white">
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
      </div>
    </>
  )
}
