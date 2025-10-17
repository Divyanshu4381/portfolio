"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function InsightsSection() {
  const insights = [
    {
      date: "Apr 8, 2024",
      readTime: "5 min read",
      title: "Kickstart Growing a Career in Web Design",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      date: "May 15, 2024",
      readTime: "7 min read",
      title: "Create a Landing Page That Performs Great",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      date: "May 28, 2024",
      readTime: "4 min read",
      title: "How Can Designers Prepare for the Future?",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <section className="bg-gray-900 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Stay Inspired with Our{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Latest Insights
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Dive into our blog for the latest trends, tips, and insights in the world of design and AI. Whether you're a
            seasoned designer looking for inspiration, or a student eager, our articles provide valuable knowledge to
            fuel your creative journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {insights.map((insight, index) => (
            <article
              key={index}
              className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-colors duration-300 cursor-pointer scroll-animate"
            >
              <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/80 to-pink-400/80"></div>
                <Image
                  src={insight.image || "/placeholder.svg"}
                  alt={insight.title}
                  fill
                  className="object-cover mix-blend-overlay"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>{insight.date}</span>
                  <span>•</span>
                  <span>{insight.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">{insight.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center scroll-animate">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-semibold">
            Read More
          </Button>
        </div>
      </div>
    </section>
  )
}
