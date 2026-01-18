import Link from "next/link"
import { getAllCities } from "@/app/seo/lib/cities"
import { CheckCircle, XCircle, BarChart, Smartphone, Globe, Shield } from "lucide-react"

export const metadata = {
    title: "Web Development & SEO Audit Strategy | Complete Guide 2026",
    description: "A comprehensive SEO and Web Development Audit Strategy report. detailed analysis of on-page optimization, technical SEO, and content strategy for modern web applications.",
    keywords: ["SEO Audit", "Web Development Checklist", "Technical SEO", "React Performance", "Next.js Optimization", "Core Web Vitals"],
    openGraph: {
        title: "Web Development & SEO Audit Strategy | Complete Guide 2026",
        description: "A comprehensive SEO and Web Development Audit Strategy report for modern web applications.",
        url: "https://divyanshubca.vercel.app/web-development-seo-audit",
        siteName: "Divyanshu Kushwaha Portfolio",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Web Development SEO Audit",
            },
        ],
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Web Development & SEO Audit Strategy",
        description: "A comprehensive SEO and Web Development Audit Strategy report.",
        images: ["/og-image.png"],
    },
}

export default function SEOAuditPage() {
    const cities = getAllCities()
    return (
        <div className="bg-white text-gray-900 font-sans leading-relaxed">
            {/* Navigation Bar Placeholder */}
            <nav className="bg-black text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl text-green-400">Divyanshu.Dev</Link>
                    <Link href="/explore" className="text-sm hover:underline">← Back to Explore</Link>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-12 max-w-4xl">

                {/* Header Section */}
                <header className="mb-12 border-b pb-8">
                    <span className="text-green-600 font-bold tracking-wider text-sm uppercase">SEO Report 2026</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 text-gray-900">
                        Complete Web Development & SEO Audit Strategy
                    </h1>
                    <p className="text-xl text-gray-600">
                        An in-depth analysis of what makes a website rank #1 on Google. This page serves as a live example of structured, high-quality technical content.
                    </p>
                </header>

                {/* Section 1: Site Overview */}
                <section className="mb-12">
                    <h2 className="flex items-center text-2xl font-bold mb-4 text-gray-800">
                        <Globe className="mr-2 text-blue-600" /> 1. Website Overview
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <p className="mb-4">
                            <strong>Target Audience:</strong> Recruiters, Clients, and Businesses looking for High-Performance Web Solutions.
                        </p>
                        <p>
                            <strong>Core Technology:</strong> Next.js 15, React 19, Tailwind CSS. This ensures lighning-fast load times and superior SEO capabilities compared to traditional CMS platforms.
                        </p>
                    </div>
                </section>

                {/* Section 2: On-Page SEO Checklist */}
                <section className="mb-12">
                    <h2 className="flex items-center text-2xl font-bold mb-6 text-gray-800">
                        <BarChart className="mr-2 text-green-600" /> 2. On-Page SEO Checklist
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">🔹 Title Tags & Meta Descriptions</h3>
                            <p className="text-gray-700 mb-2">
                                Every page must have a unique, keyword-rich title tag under 60 characters and a compelling meta description under 160 characters.
                            </p>
                            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 text-sm">
                                <strong>Recommendation:</strong> Use dynamic metadata generation for large sites. For example, our <Link href="/explore" className="text-blue-700 underline">Explore Page</Link> aggregates all resources.
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">🔹 Heading Structure (H1-H6)</h3>
                            <p className="text-gray-700 mb-2">
                                Search engines use headings to understand content hierarchy.
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                <li><strong>H1:</strong> Only one per page (Main Topic).</li>
                                <li><strong>H2:</strong> Major Sections (like this one).</li>
                                <li><strong>H3:</strong> Sub-sections (specific points).</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 3: Comparison Table */}
                <section className="mb-12">
                    <h2 className="flex items-center text-2xl font-bold mb-6 text-gray-800">
                        <Shield className="mr-2 text-purple-600" /> 3. Technical Improvements (Before vs. After)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 border-b text-left font-semibold">Metric / Item</th>
                                    <th className="py-3 px-4 border-b text-left font-semibold text-red-600">Before Optimization</th>
                                    <th className="py-3 px-4 border-b text-left font-semibold text-green-600">After Optimization</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">Page Load Speed</td>
                                    <td className="py-3 px-4 border-b">1.2s Artificial Delay</td>
                                    <td className="py-3 px-4 border-b font-semibold">Instant Load (&lt; 200ms)</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">Image Format</td>
                                    <td className="py-3 px-4 border-b">Standard PNG/JPG</td>
                                    <td className="py-3 px-4 border-b">Next.js Optimized (WebP/AVIF)</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">JavaScript Bundle</td>
                                    <td className="py-3 px-4 border-b">Heavy (GSAP Included)</td>
                                    <td className="py-3 px-4 border-b">Lightweight (Framer Motion)</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">Mobile Friendliness</td>
                                    <td className="py-3 px-4 border-b">Standard Responsive</td>
                                    <td className="py-3 px-4 border-b">Mobile-First Adaptive Design</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">Social Signals</td>
                                    <td className="py-3 px-4 border-b">Unverified Links</td>
                                    <td className="py-3 px-4 border-b">Verified (rel="me")</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 4: Target Locations */}
                <section className="mb-12">
                    <h2 className="flex items-center text-2xl font-bold mb-6 text-gray-800">
                        <Smartphone className="mr-2 text-orange-600" /> 4. Local SEO Strategy
                    </h2>
                    <p className="mb-4 text-gray-700">
                        To capture local search traffic, we have implemented <strong>Programmatic SEO</strong> strategies targeting major tech hubs across India. This ensures visibility for queries like "Web Developer in [City]".
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-3">Top Priority Locations:</h3>
                        <div className="flex flex-wrap gap-2">
                            {cities.slice(0, 10).map((city) => (
                                <Link
                                    key={city.name}
                                    href={`/hire-web-developer-in-${city.slug}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded text-sm"
                                >
                                    {city.name}
                                </Link>
                            ))}
                            <span className="text-gray-500 text-sm px-2 py-1">...and {cities.length - 10} more.</span>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="bg-gray-900 text-white p-8 rounded-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Need a High-Performance Website?</h2>
                    <p className="mb-6 opacity-90">
                        This audit report demonstrates the attention to detail we bring to every project.
                        From technical SEO to core web vitals, we ensure your digital presence is flawless.
                    </p>
                    <Link href="/" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105">
                        Contact Divyanshu Today
                    </Link>
                </section>

            </main>

            <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm border-t mt-12">
                <p>&copy; {new Date().getFullYear()} Divyanshu Kushwaha. All rights reserved.</p>
                <p className="mt-2">Generated for SEO Audit & Compliance.</p>
            </footer>
        </div>
    )
}
