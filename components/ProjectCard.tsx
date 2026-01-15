"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
    ExternalLink,
    Github,
    Users,
    Clock,
    Code,
    Smartphone,
    TrendingUp,
    Eye
} from "lucide-react"
import { Project, projectCategories } from "@/lib/projectsData"

interface ProjectCardProps {
    project: Project
    index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    const [showMore, setShowMore] = useState(false)

    const isLong = project.description.length > 120
    const shortDesc = isLong ? project.description.slice(0, 120) + '...' : project.description

    const handleLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    const handleSeeMoreClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(!showMore);
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

    return (
        <motion.div
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            custom={index}
            className="group relative flex flex-col rounded-xl sm:rounded-2xl border-2 border-green-500/20 bg-gray-900/50 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-green-500/40 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-green-500/20 h-full"
        >
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            {/* Project Image */}
            <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl flex-shrink-0">
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

                <p className="text-gray-300 mb-2 sm:mb-3 text-xs sm:text-sm leading-relaxed">
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
                <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-400 mt-auto">
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
                        {projectCategories.find(cat => cat.id === project.category)?.name.split(' ')[0] || project.category}
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
