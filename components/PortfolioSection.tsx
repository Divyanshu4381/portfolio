"use client"

import type React from "react"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useState, useRef } from "react"
import {
  ExternalLink,
  TrendingUp,
  Eye,
  Code,
  Smartphone,
  Users,
  Clock,
  Github,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const projectsData = [
  {
    image: '/images/naturescure_01.png',
    title: `Nature's Cure - A Virtual Herbal Garden`,
    description: `Nature's Cure is responsive show casing 25+ medicinal plants across six AYUSH systems, with dynamic search, category filtering and intuitive navigation. Integrated 3D plant models using google-model-viewer, allowing 100% interactive viewing with rotation, zoom and info overlays. Integrated AI assistant 'Herba' with Gemini API for natural language plant query handling.`,
    technologies: [
      'AI Chatbot',
      'Shadcn UI',
      'React.js',
      'Tailwind CSS',
      'OpenRouter API',
      'nodemailer',
      'Google Model Viewer',
      'Git LFS',
      'MongoDB',
      'Express.js',
      'Node.js',
      'MERN Stack',
    ],
    links: {
      preview: 'http://www.naturescure.page.gd/',
      github: 'https://github.com/Saral224x2/naturescure',
    },
    category: "web",
    duration: "3 Months",
    team: "4 Members"
  },
  {
    image: '/images/findure.png',
    title: 'Business Directory App',
    description: 'Designed and developed the complete backend architecture for a local base service discovery app called Findure using MERN and react native for fully responsive with UI with seamless API integration, and a 40% increase in overall app performance.',
    technologies: [
      'React Native',
      'Tailwind CSS',
      'Node.js',
      'MongoDB',
      'Node Mailer',
      'Express.js',
    ],
    links: {
      preview: 'https://github.com/Divyanshu4381/findure',
      github: 'https://github.com/Divyanshu4381/findure',
    },
    category: "app",
    duration: "4 Months",
    team: "Solo Project"
  },
  {
    image: '/images/erp.png',
    title: 'Enterprise Resource Planning System',
    description: 'Engineered a full-scale ERP Management System with 4 user roles (Admin, Students, Teachers, Counselors), enabling role-based access, secure login (JWT), and dynamic dashboards using react And tailwind; deployed with 99.9% uptime and scalable backend on Render.',
    technologies: [
      'JavaScript',
      'React.js',
      'node.js',
      'Tailwind CSS',
      'gsap',
      'framer-motion',
      'JWT',
      'RESTful API',
      'Git',
      'GitHub',
      'Node.js',
      'Express',
      'MongoDB',
    ],
    links: {
      preview: 'https://erp-frontend-eight-flax.vercel.app/',
      github: 'https://github.com/developer-umar?tab=repositories',
    },
    category: "erp",
    duration: "5 Months",
    team: "3 Members"
  },
  {
    image: '/images/jobPortal.png',
    title: 'Job and Internship Portal',
    description: 'Developed a comprehensive Job and Internship Portal with multi-role access (Admin, Recruiter, Candidate), featuring secure authentication (JWT), dynamic job listings, and application tracking using React and Tailwind; ensured robust backend functionality with Node.js and MongoDB, achieving seamless user experience and efficient data management.',
    technologies: [
      'JavaScript',
      'React.js',
      'node.js',
      'Tailwind CSS',
      'JWT',
      'RESTful API',
      'Git',
      'GitHub',
      'Node.js',
      'Express',
      'MongoDB',
    ],
    links: {
      preview: 'https://jobportal-fghp.onrender.com/',
      github: 'https://github.com/Divyanshu4381/jobportal',
    },
    category: "web",
    duration: "5 Months",
    team: "3 Members"
  },
  {
    image: '/images/sarkarisuvidha.png',
    title: `SARKARI SUVIDHA`,
    description: `Sarkari Suvidha is the protal to helps to people to find government job openings.`,
    technologies: [
      'Next.js',
      'Shadcn UI',
      'Tailwind CSS',
      'nodemailer',
      'MongoDB',
      'TypeScript',
    ],
    links: {
      preview: 'https://sarkarisuvidha.vercel.app/',
      github: 'https://github.com/Divyanshu4381',
    },
    category: "web",
    duration: "1 Months",
    team: "Self"
  },
] as const;

interface Project {
  image: string;
  title: string;
  description: string;
  technologies: readonly string[];
  links: {
    preview: string;
    github: string;
  };
  category: string;
  duration: string;
  team: string;
}

export default function PortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showMoreStates, setShowMoreStates] = useState<Record<number, boolean>>({})
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

  const filteredProjects = selectedCategory === "all" 
    ? projectsData 
    : projectsData.filter((project) => project.category === selectedCategory)

  const toggleShowMore = (projectIndex: number) => {
    setShowMoreStates(prev => ({
      ...prev,
      [projectIndex]: !prev[projectIndex]
    }))
  }

  const fadeInAnimationVariants = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * index,
        duration: 0.6,
      },
    }),
  }

  const ProjectCard = ({ project, index }: { project: Project, index: number }) => {
    const isLong = project.description.length > 120
    const shortDesc = isLong ? project.description.slice(0, 120) + '...' : project.description
    const showMore = showMoreStates[index] || false

    const handleLinkClick = (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    const handleSeeMoreClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleShowMore(index);
    }

    const handleLiveDemoClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleLinkClick(project.links.preview);
    }

    const handleCodeClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleLinkClick(project.links.github);
    }

    return (
      <motion.div
        variants={fadeInAnimationVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        custom={index}
        className="group relative flex flex-col rounded-xl sm:rounded-2xl border-2 border-green-500/20 bg-gray-900/50 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-green-500/40 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-green-500/20"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
        
        {/* Project Image */}
        <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl">
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=300&width=500"
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          
          {/* Live Demo Badge */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <div className="rounded-full bg-green-500/90 px-2 py-1 text-xs font-semibold text-black backdrop-blur-sm">
              Live
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex flex-1 flex-col">
          <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-bold text-white group-hover:text-green-400 transition-colors duration-300 line-clamp-2">
            {project.title}
          </h3>

          <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
            {showMore ? project.description : shortDesc}
          </p>

          {isLong && (
            <button
              onClick={handleSeeMoreClick}
              className="mb-3 sm:mb-4 self-start text-xs sm:text-sm font-medium text-green-400 hover:text-green-300 transition-colors duration-300 hover:underline cursor-pointer"
            >
              {showMore ? 'See Less' : 'See More'}
            </button>
          )}

          {/* Project Meta Info */}
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{project.team}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{project.duration}</span>
              </div>
            </div>
            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 sm:self-start">
              {categories.find(cat => cat.id === project.category)?.name}
            </span>
          </div>

          {/* Technologies */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-1 sm:gap-2">
            {project.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="rounded-full border border-green-500/30 bg-gray-800/50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-green-400/50 hover:bg-gray-700/50"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="rounded-full border border-green-500/30 bg-gray-800/50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-gray-300 backdrop-blur-sm">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex gap-2 sm:gap-3">
            <button 
              onClick={handleLiveDemoClick}
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-md border border-green-500/30 bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-400 transition-all duration-300 hover:bg-green-500/10 hover:text-green-300 cursor-pointer"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Live Demo</span>
              <span className="xs:hidden">Demo</span>
            </button>
            <button 
              onClick={handleCodeClick}
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-md border border-blue-500/30 bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-400 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-300 cursor-pointer"
            >
              <Github className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Code</span>
            </button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10 pointer-events-none" />
      </motion.div>
    )
  }

  const handleGitHubClick = () => {
    window.open('https://github.com/Divyanshu4381', '_blank', 'noopener,noreferrer');
  }

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
            Showcasing my journey through innovative web solutions and cutting-edge technologies
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
              className={`group relative flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === category.id
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </motion.div>

        {/* GitHub Button */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button 
            onClick={handleGitHubClick}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg font-semibold text-black shadow-xl sm:shadow-2xl shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 rounded-lg cursor-pointer w-full sm:w-auto"
          >
            <span className="relative flex items-center justify-center sm:justify-start">
              View More on GitHub
              <Github className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
