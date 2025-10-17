"use client"
import React from "react"
import {
    FaReact,
    FaNodeJs,
    FaAndroid,
    FaHtml5,
    FaCss3,
    FaJava,
    FaPhp,
    FaPython,
    FaCuttlefish,
    FaDigitalOcean,
    FaGitAlt,
    FaGithub,
    FaWordpress,
    FaBootstrap,
    FaSass,
} from "react-icons/fa"

import {
    SiExpress,
    SiFirebase,
    SiMui,
    SiChakraui,
    SiTailwindcss,
    SiJavascript,
    SiKotlin,
    SiMongodb,
    SiMysql,
    SiPostgresql,
    SiAmazoncloudwatch,
    SiHeroku,
    SiNetlify,
    SiJquery,
} from "react-icons/si"

const skills = [
    { name: "ReactJS", icon: <FaReact className="text-sky-400" /> },
    { name: "ExpressJS", icon: <SiExpress className="text-gray-400" /> },
    { name: "NodeJS", icon: <FaNodeJs className="text-green-500" /> },
    { name: "Redux", icon: <FaReact className="text-purple-400" /> },
    { name: "Firebase", icon: <SiFirebase className="text-yellow-400" /> },
    { name: "Android", icon: <FaAndroid className="text-green-400" /> },

    { name: "MaterialUI", icon: <SiMui className="text-blue-500" /> },
    { name: "ChakraUI", icon: <SiChakraui className="text-teal-400" /> },
    { name: "TailwindCSS", icon: <SiTailwindcss className="text-cyan-400" /> },
    { name: "Bootstrap", icon: <FaBootstrap className="text-purple-500" /> },
    // { name: "Sass", icon: <FaSass className="text-pink-400" /> },
    { name: "HTML5", icon: <FaHtml5 className="text-orange-500" /> },

    { name: "CSS3", icon: <FaCss3 className="text-blue-400" /> },
    { name: "JavaScript", icon: <SiJavascript className="text-yellow-300" /> },
    { name: "Java", icon: <FaJava className="text-red-600" /> },
    { name: "Kotlin", icon: <SiKotlin className="text-purple-400" /> },
    { name: "PHP", icon: <FaPhp className="text-indigo-400" /> },
    { name: "Python", icon: <FaPython className="text-blue-400" /> },

    { name: "C++", icon: <FaCuttlefish className="text-blue-400" /> },
    { name: "MongoDB", icon: <SiMongodb className="text-green-500" /> },
    { name: "MySQL", icon: <SiMysql className="text-blue-500" /> },
    // { name: "PostgreSQL", icon: <SiPostgresql className="text-sky-600" /> },
    // { name: "AWS", icon: <SiAmazoncloudwatch className="text-orange-500" /> },
    // { name: "Heroku", icon: <SiHeroku className="text-purple-500" /> },

    { name: "Netlify", icon: <SiNetlify className="text-teal-400" /> },
    // { name: "DigitalOcean", icon: <FaDigitalOcean className="text-blue-400" /> },
    // { name: "JQuery", icon: <SiJquery className="text-cyan-400" /> },
    { name: "Git VCS", icon: <FaGitAlt className="text-orange-500" /> },
    { name: "GitHub", icon: <FaGithub className="text-white" /> },
    // { name: "WordPress", icon: <FaWordpress className="text-blue-500" /> },
]

export default function SkillsSection() {
    return (
        <section id='skills' className="bg-gradient-to-b from-[#120028] to-black py-16 md:py-24 px-20 text-white">
            <div className="container mx-auto px-46 md:px-12 lg:px-20">
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-12">
                    <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                        Skills & Abilities
                    </span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto">
                    {skills.map((skill, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
                        >
                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                {skill.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300 text-center">
                                {skill.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
