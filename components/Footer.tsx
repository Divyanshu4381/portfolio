"use client"

import { useState, useEffect } from "react"
import { motion, backOut } from "framer-motion"
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ArrowUp,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/divyanshu.kushwaha.3958", color: "hover:text-blue-500" },
    { icon: Twitter, href: "https://x.com/Divyanshuk4381", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "https://www.facebook.com/divyanshu.kushwaha.3958", color: "hover:text-blue-600" },
    { icon: Instagram, href: "https://www.instagram.com/itzs_divyanshu/", color: "hover:text-pink-500" },
  ]

  const usefulLinks = [
    { name: "Home", href: "/" },
    { name: "About us", href: "#about" },
    { name: "Projects", href: "#portfolio" },
    { name: "Explore Services", href: "/explore" },
    { name: "Skills & Abilites", href: "#skills" },
    // { name: "Career", href: "/career" },
    { name: "Education", href: "#edu" },
    { name: "Contact us", href: "#contact" },
  ]

  const [showGoToTop, setShowGoToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openWhatsApp = () => {
    window.open("https://wa.me/+918957681217", "_blank")
  }

  return (
    <footer className="bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-20 w-24 h-24 sm:w-40 sm:h-40 md:w-60 md:h-60 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center">
          {/* Company Info */}
          <motion.div
            className="space-y-4 max-w-xs sm:max-w-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.img
              src="/logo.png"
              alt="Divyanshu Logo"
              className="w-32 sm:w-40 md:w-52 mx-auto md:mx-0"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: backOut }}
            />
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Thank you for visiting my portfolio website. Connect with me over socials.
            </p>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Keep Rising 🚀. Connect with me over live chat!
            </p>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Follow us</h4>
              <div className="flex justify-center md:justify-start space-x-2 sm:space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-green-500/20`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-4 sm:space-y-5 max-w-xs sm:max-w-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3">Contact Info</h4>
            <div className="flex justify-center md:justify-start items-start space-x-2 sm:space-x-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 sm:mt-1 flex-shrink-0" />
              <p className="text-gray-300 text-xs sm:text-sm text-left">
                188, Ahirwan, Harjinder Nagar,<br />Kanpur, Uttar Pradesh 208007.
              </p>
            </div>
            <div className="flex justify-center md:justify-start items-center space-x-2 sm:space-x-3">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <p className="text-gray-300 text-xs sm:text-sm">+91 8957681217</p>
            </div>
            <div className="flex justify-center md:justify-start items-center space-x-2 sm:space-x-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <p className="text-gray-300 text-xs sm:text-sm break-all">divyanshu4381@gmail.com</p>
            </div>
          </motion.div>

          {/* Useful Links */}
          <motion.div
            className="space-y-4 max-w-xs sm:max-w-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3">Useful Links</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 justify-items-center md:justify-items-start">
              {usefulLinks.map((link, index) => (
                <motion.div key={index} whileHover={{ x: 3 }}>
                  <Link
                    href={link.href}
                    className="text-gray-300 text-xs sm:text-sm hover:text-green-400 transition-colors duration-300 text-center md:text-left w-full"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="border-t border-gray-800 mt-8 sm:mt-10 pt-4 sm:pt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-400 text-xs sm:text-sm">
            2025–26, Made With <span className="text-red-500">❤️</span> in INDIA
          </p>
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* WhatsApp Button */}
        <motion.button
          onClick={openWhatsApp}
          className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto group"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </motion.button>

        {/* Scroll to Top */}
        {showGoToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto group"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
        )}
      </div>
    </footer>
  )
}