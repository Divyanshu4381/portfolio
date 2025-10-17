"use client"
import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

const education = [
  {
    title: "Bachelor Of Computer Applications | BCA",
    college: "Allenhouse Business School | ABS",
    duration: "2025-2026 | Pursuing",
    statusColor: "text-green-400",
    image: "/images/allenhouse.png",
  },
  {
    title: "Intermediate",
    college: "B.L.M Inter College | UP Board",
    duration: "2022-2023 | Completed",
    statusColor: "text-green-400",
    image: "/images/blm.png",
  },
]

export default function EducationSection() {
  return (
    <section id='edu' className="bg-gradient-to-b from-[#120028] to-black py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 text-white">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 sm:mb-6"
        >
          <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            My Education
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-xs sm:text-sm md:text-base mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4"
        >
          Education Is Not The Learning Of Facts, But The Training Of The Mind To Think.
        </motion.p>

        {/* Education Cards */}
        <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 max-w-4xl lg:max-w-5xl mx-auto">
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 group"
            >
              {/* Image Section - Responsive sizing */}
              <div className="md:w-2/5 lg:w-1/3 w-full h-40 sm:h-48 md:h-56 lg:h-64 relative">
                <Image
                  src={edu.image}
                  alt={edu.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 33vw"
                />
                {/* Overlay for better text readability on image */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
              </div>

              {/* Content Section - Responsive padding and text */}
              <div className="md:w-3/5 lg:w-2/3 w-full p-4 sm:p-5 md:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 sm:mb-3 leading-tight">
                  {edu.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mb-2 sm:mb-3 leading-relaxed">
                  {edu.college}
                </p>
                <p className={`font-semibold text-sm sm:text-base ${edu.statusColor}`}>
                  {edu.duration}
                </p>
                
               
              </div>

            
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 md:mt-16 text-center"
        >
          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 max-w-2xl mx-auto">
            <h4 className="text-white text-lg sm:text-xl font-semibold mb-2">
              Continuous Learning
            </h4>
            <p className="text-gray-400 text-sm sm:text-base">
              Currently enhancing my skills through online courses and practical projects alongside formal education.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
