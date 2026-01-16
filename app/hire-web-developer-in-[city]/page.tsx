import type { Metadata } from 'next'
import dynamicImport from 'next/dynamic'
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import { cities } from '@/lib/cities'
import { notFound } from 'next/navigation'

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
    return cities.map((city) => ({
        city: city.name.toLowerCase().replace(/\s+/g, '-'),
    }))
}

type Props = {
    params: Promise<{ city: string }>
}

// 2. Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params
    const citySlug = resolvedParams.city
    const cityData = cities.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === citySlug)

    if (!cityData) {
        return {
            title: 'Web Developer in India | Divyanshu Kushwaha',
        }
    }

    const cityName = cityData.name

    return {
        title: `Hire Best Web Developer in ${cityName} | Divyanshu Kushwaha`,
        description: `Looking for a Web Developer in ${cityName}? I am Divyanshu Kushwaha, a Full Stack MERN Developer offering scalable web and app development services in ${cityName}, ${cityData.state}.`,
        keywords: [
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
    const cityData = cities.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === citySlug)

    if (!cityData) {
        notFound()
    }

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar />
            <HeroSection city={cityData.name} />
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
