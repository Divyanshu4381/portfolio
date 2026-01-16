import Link from "next/link"
import { cities } from "@/lib/cities"
import { Github, Linkedin, Twitter, Facebook, Instagram, Mail } from "lucide-react"

export const metadata = {
    title: "Explore Web Development Services | Divyanshu Kushwaha",
    description: "Browse all web development services, locations, and technologies offered by Divyanshu Kushwaha. A complete directory of resources.",
    openGraph: {
        title: "Explore Web Development Services | Divyanshu Kushwaha",
        description: "Browse all web development services, locations, and technologies offered by Divyanshu Kushwaha.",
        url: "https://divyanshubca.vercel.app/explore",
        siteName: "Divyanshu Kushwaha Portfolio",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Explore Web Development Services",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Explore Web Development Services | Divyanshu Kushwaha",
        description: "Browse all web development services, locations, and technologies offered by Divyanshu Kushwaha.",
        images: ["/og-image.png"],
    },
}

export default function ExplorePage() {
    const socialLinks = [
        { name: "GitHub", href: "https://github.com/Divyanshu4381", icon: Github },
        { name: "LinkedIn", href: "https://www.linkedin.com/in/divyanshukushwaha", icon: Linkedin },
        { name: "Twitter (X)", href: "https://x.com/Divyanshuk4381", icon: Twitter },
        { name: "Facebook", href: "https://www.facebook.com/divyanshu.kushwaha.3958", icon: Facebook },
        { name: "Instagram", href: "https://www.instagram.com/itzs_divyanshu/", icon: Instagram },
    ]

    const keywords = [
        "MERN Stack Developer", "Full Stack Developer", "React.js Expert", "Next.js Developer",
        "Node.js Backend Developer", "MongoDB Database Architect", "Freelance Web Developer",
        "Website Redesign Service", "E-commerce Development", "Custom ERP Solutions",
        "API Development", "Frontend Optimization", "SEO Friendly Websites"
    ]

    return (
        <div className="bg-black min-h-screen text-white p-8 md:p-16">
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Header */}
                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Explore Web Development Services
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        A comprehensive directory of my services, locations served, and professional profiles.
                        Designed to help you find exactly what you need.
                    </p>
                    <Link href="/" className="text-green-400 hover:underline">
                        ← Back to Home
                    </Link>
                </header>

                {/* Social Profiles (Verified) */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Connect (Verified Profiles)</h2>
                    <div className="flex flex-wrap gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="me noopener noreferrer"
                                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors border border-gray-800"
                            >
                                <social.icon className="w-5 h-5 text-green-500" />
                                <span>{social.name}</span>
                            </a>
                        ))}
                        <a href="mailto:divyanshu4381@gmail.com" rel="me" className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors border border-gray-800">
                            <Mail className="w-5 h-5 text-green-500" />
                            <span>Email Me</span>
                        </a>
                    </div>
                </section>

                {/* Service Locations (HTML Sitemap) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h2 className="text-2xl font-semibold">Service Locations</h2>
                        <span className="text-sm text-gray-500">{cities.length} Cities</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {cities.map((city) => (
                            <Link
                                key={city.name}
                                href={`/hire-web-developer-in-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-gray-400 hover:text-green-400 text-sm transition-colors"
                            >
                                Web Developer in {city.name}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Keywords & Technologies */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-gray-800 pb-2">Technologies & Expertise</h2>
                    <div className="flex flex-wrap gap-3">
                        {keywords.map((keyword) => (
                            <span key={keyword} className="bg-gray-900/50 text-gray-300 px-3 py-1 rounded-md text-sm border border-gray-800">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    )
}
