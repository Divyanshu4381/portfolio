"use client"

import type React from "react"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useState, useRef } from "react"
import {
  TrendingUp,
  Eye,
  Code,
  Smartphone,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { projectsData } from "@/lib/projectsData"
import ProjectCard from "@/components/ProjectCard"

export default function PortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const categories = [
    { id: "all", name: "All Projects", icon: Eye },
    { id: "web", name: "Web Development", icon: Code },
    { id: "app", name: "App Development", icon: Smartphone },
    { id: "erp", name: "Enterprise Solutions", icon: TrendingUp },
  ]

  // Filter first, then slice to top 4 for the home page
  const filteredProjects = selectedCategory === "all"
    ? projectsData
    : projectsData.filter((project) => project.category === selectedCategory)

  const displayProjects = filteredProjects.slice(0, 4)

  return (
    <section id="portfolio" className="relative overflow-hidden bg-black py-12 sm:py-16 md:py-20 lg:py-24" ref={containerRef}>
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <div className="absolute left-5 top-10 sm:left-10 sm:top-20 h-20 w-20 sm:h-40 sm:w-40 animate-pulse rounded-full bg-gradient-to-r from-green-500/8 to-emerald-500/8 blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-20 right-10 sm:bottom-40 sm:right-20 h-24 w-24 sm:h-60 sm:w-60 animate-pulse rounded-full bg-gradient-to-r from-emerald-500/8 to-green-500/8 blur-2xl sm:blur-3xl" />
        <div className="absolute left-1/4 top-1/2 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-gradient-to-r from-green-400/5 to-emerald-400/5 blur-xl sm:blur-2xl" />
        <div className="absolute left-5 top-5 sm:left-10 sm:top-10 h-1 w-1 sm:h-2 sm:w-2 animate-bounce rounded-full bg-green-400/30" />
        <div className="absolute right-8 top-8 sm:right-32 sm:top-32 h-1.5 w-1.5 sm:h-3 sm:w-3 animate-ping rounded-full bg-emerald-400/40" />
        <div className="absolute bottom-20 left-1/3 h-1 w-1 sm:h-1.5 sm:w-1.5 animate-pulse rounded-full bg-green-500/50" />
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-12 sm:mb-16 text-center">
          <motion.h2
            className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            Featured{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Projects
            </span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-gray-300 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Showcasing my journey through innovative web solutions and cutting-edge technologies.
            <br className="hidden sm:block" />
            Here are a few of my recent works.
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div
          className="mb-8 sm:mb-10 md:mb-12 flex flex-wrap justify-center gap-2 sm:gap-3 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`group relative flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${selectedCategory === category.id
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/25"
                : "border border-green-500/20 bg-gray-800/50 text-gray-300 hover:border-green-400/40 hover:bg-gray-700/50 backdrop-blur-sm"
                }`}
            >
              <category.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{category.name}</span>
              <span className="xs:hidden">
                {category.id === 'all' ? 'All' :
                  category.id === 'web' ? 'Web' :
                    category.id === 'app' ? 'App' : 'ERP'}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {displayProjects.map((project, index) => (
            <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
          ))}
        </motion.div>

        {/* View All Projects Button */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/projects">
            <button
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg font-semibold text-black shadow-xl sm:shadow-2xl shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 rounded-lg cursor-pointer w-full sm:w-auto"
            >
              <span className="relative flex items-center justify-center sm:justify-start">
                View More Projects
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
