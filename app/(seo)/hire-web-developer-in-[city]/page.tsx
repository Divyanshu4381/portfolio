import type { Metadata } from 'next'
import dynamicImport from 'next/dynamic'
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import CityIntroSection from "@/components/CityIntroSection"
import { getAllCities } from '@/app/seo/lib/cities'
import { notFound } from 'next/navigation'
import cityContentData from '@/app/seo/data/city_content.json'

// Dynamic imports for below-the-fold content
const AboutSection = dynamicImport(() => import('@/components/AboutSection'))
const SkillsSection = dynamicImport(() => import('@/components/Skills&Abilities'))
const EducationSection = dynamicImport(() => import('@/components/EducationSection'))
const PortfolioSection = dynamicImport(() => import('@/components/PortfolioSection'))
const Experience = dynamicImport(() => import('@/components/Experience'))
const CertificatesPage = dynamicImport(() => import('@/components/Certificates'))
const ContactPage = dynamicImport(() => import('@/components/ContactSection'))
const Footer = dynamicImport(() => import('@/components/Footer'))

// 1. Generate Static Params for all cities
export async function generateStaticParams() {
    const cities = getAllCities()
    return cities.map((city) => ({
        city: city.slug,
    }))
}

type Props = {
    params: Promise<{ city: string }>
}

// 2. Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params
    const citySlug = resolvedParams.city
    const cities = getAllCities()
    const cityData = cities.find(c => c.slug === citySlug)

    if (!cityData) {
        return {
            title: 'Web Developer in India | Divyanshu Kushwaha',
        }
    }

    const { name: cityName, state: cityState, seoKeyword } = cityData
    const locationString = cityState ? `${cityName}, ${cityState}` : cityName

    return {
        title: `Hire Best Web Developer in ${cityName} | Divyanshu Kushwaha`,
        description: `Looking for a Web Developer in ${cityName}? I am Divyanshu Kushwaha, a Full Stack MERN Developer offering scalable web and app development services in ${locationString}.`,
        keywords: [
            seoKeyword,
            `Web Developer in ${cityName}`,
            `App Developer in ${cityName}`,
            `Freelance Web Developer ${cityName}`,
            `Website Design Company in ${cityName}`,
            `MERN Stack Developer ${cityName}`,
            `Full Stack Developer ${cityName}`,
            "Divyanshu Kushwaha"
        ],
        openGraph: {
            title: `Top Web Developer in ${cityName} - Divyanshu Kushwaha`,
            description: `Professional Web Development Services in ${cityName}. React, Node.js, and Custom Software Solutions.`,
            url: `https://divyanshubca.vercel.app/hire-web-developer-in-${citySlug}`,
            siteName: "Divyanshu Kushwaha Portfolio",
            images: [
                {
                    url: "/og-image.png",
                    width: 1200,
                    height: 630,
                    alt: `Web Developer in ${cityName}`,
                },
            ],
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: `Top Web Developer in ${cityName} - Divyanshu Kushwaha`,
            description: `Professional Web Development Services in ${cityName}. React, Node.js, and Custom Software Solutions.`,
            images: ["/og-image.png"],
        },
        alternates: {
            canonical: `/hire-web-developer-in-${citySlug}`,
        }
    }
}

// 3. Page Component
export default async function CityPage({ params }: Props) {
    const resolvedParams = await params
    const citySlug = resolvedParams.city
    const cities = getAllCities()
    const cityData = cities.find(c => c.slug === citySlug)

    if (!cityData) {
        notFound()
    }

    // Get unique content for this city
    const cityContent = (cityContentData as Record<string, any>)[citySlug] || {
        intro: `Looking for professional web development services in ${cityData.name}? I specialize in building scalable, modern web applications using the MERN stack.`,
        stats: `Growing demand for web developers in ${cityData.name}`,
        localInsight: `${cityData.name} is experiencing digital transformation across industries.`,
        cta: `Let's build something amazing together in ${cityData.name}`
    }

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar />
            <HeroSection city={cityData.name} />

            {/* Unique City-Specific Content */}
            <CityIntroSection
                cityName={cityData.name}
                intro={cityContent.intro}
                stats={cityContent.stats}
                localInsight={cityContent.localInsight}
                cta={cityContent.cta}
            />

            <AboutSection />
            <SkillsSection />
            <EducationSection />
            <PortfolioSection />
            <Experience />
            <CertificatesPage />
            <ContactPage />
            <Footer />
        </div>
    )
}
