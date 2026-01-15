"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp,
    Eye,
    Code,
    Smartphone,
    ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { projectsData, projectCategories } from "@/lib/projectsData"
import ProjectCard from "@/components/ProjectCard"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

export default function ProjectsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all")

    const filteredProjects = selectedCategory === "all"
        ? projectsData
        : projectsData.filter((project) => project.category === selectedCategory)

    const categories = [
        { id: "all", name: "All Projects", icon: Eye },
        { id: "web", name: "Web Development", icon: Code },
        { id: "app", name: "App Development", icon: Smartphone },
        { id: "erp", name: "Enterprise Solutions", icon: TrendingUp },
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-green-500/30">
            {/* Header/Nav Area */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Projects
                    </div>
                    <div className="w-[100px]"></div> {/* Spacer for alignment */}
                </div>
            </header>

            <div className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 md:px-8">
                <div className="container mx-auto max-w-7xl">

                    <div className="text-center mb-12 sm:mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                        >
                            All <span className="text-green-500">Works</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 max-w-2xl mx-auto text-lg"
                        >
                            Explore my complete portfolio of projects, ranging from web applications to enterprise solutions.
                        </motion.p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category.id
                                        ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                                    }`}
                            >
                                <category.icon className="w-4 h-4" />
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Projects Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-xl">No projects found in this category.</p>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </main>
    )
}
