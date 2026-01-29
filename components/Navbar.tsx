"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("Home")
  const router = useRouter()
  const pathname = usePathname()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  })

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Education", href: "#edu" },
    { name: "Work", href: "#portfolio" },
    { name: "Experience", href: "#experience" },
    { name: "Certificates", href: "#certificates" },
    { name: "Blog", href: "/blog" },
  ]

  const handleNavClick = (href: string, name: string) => {
    setIsOpen(false)
    setActiveSection(name)

    if (href.startsWith("#")) {
      if (pathname === "/") {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        router.push(`/${href}`)
      }
    } else {
      router.push(href)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className={`navbar fixed top-3 sm:top-4 md:top-5 left-0 right-0 z-[100] transition-all duration-300 mx-3 sm:mx-6 md:mx-8 lg:mx-10 ${isScrolled
        ? "bg-black/90 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/20 rounded-2xl lg:rounded-full"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-5 md:px-6">
        <div className="flex items-center justify-center h-14 sm:h-16">

          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div key={item.name} className="relative">
                <motion.button
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05, ease: "easeOut" }}
                  className="nav-item relative text-gray-300 hover:text-white transition-colors duration-200 font-medium px-4 py-2 rounded-full text-base"
                  onClick={() => handleNavClick(item.href, item.name)}
                >
                  {item.name}
                  {item.name === activeSection && (
                    <motion.span
                      className="bg-green-500/20 absolute inset-0 -z-10 rounded-full border border-green-500/30"
                      layoutId="activeSection"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              </div>
            ))}

            <motion.div
              initial={{ scale: 0, rotate: 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
            >
              <Button
                className="cta-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-green-500/25 relative overflow-hidden group ml-4"
                onClick={() => scrollToSection("#contact")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Contact Us</span>
                </div>
              </Button>
            </motion.div>
          </div>

          <div className="lg:hidden flex items-center w-full justify-between">
            {/* Brand Name on Mobile (Optional but good for context) */}
            <span className="font-bold text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent opacity-90">
              Divyanshu
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-black/80 backdrop-blur-sm border-green-500/30 text-white hover:bg-green-500/10 px-4 py-2 h-10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="mr-2">Menu</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden"
            >
              <div className="py-4 bg-black/95 backdrop-blur-lg rounded-2xl mt-2 border border-green-500/20 max-h-[80vh] overflow-y-auto">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <button
                      className={`block w-full text-left px-4 py-3 transition-all duration-200 rounded-lg mx-2 text-base ${item.name === activeSection
                        ? "text-white bg-green-500/20 border border-green-500/30"
                        : "text-gray-300 hover:text-white hover:bg-green-500/10"
                        }`}
                      onClick={() => handleNavClick(item.href, item.name)}
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
                <div className="px-2 pt-2">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-green-500/25 text-base"
                    onClick={() => scrollToSection("#contact")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
    </motion.nav>
  )
}