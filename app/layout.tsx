import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Divyanshu Kushwaha | Full Stack MERN Developer | Kanpur",
    template: "%s | Divyanshu Kushwaha - Allenhouse Developer"
  },
  description: "Divyanshu Kushwaha - MERN Stack Developer from Kanpur & Allenhouse Institute of Technology. Professional Full Stack Developer specializing in React.js, Node.js, MongoDB. Building scalable web applications, ERP systems for clients in Kanpur and worldwide.",
  "keywords": [
    "Divyanshu Kushwaha",
    "Divyanshu Kushwaha Portfolio",
    "Divyanshu Kushwaha Blog",
    "Divyanshu Kushwaha Web Developer in Kanpur",
    "Best Web Developer in Kanpur",
    "Top Software Developer in Kanpur",
    "Freelance Web Developer India",
    "MERN Stack Developer Kanpur",
    "Full Stack Developer India",
    "React.js Developer",
    "Next.js Developer",
    "Node.js Developer",
    "MongoDB Expert",
    "Hire Web Developer Kanpur",
    "Web Development Services",
    "Software Engineer Kanpur",
    "Freelance Web Developer",
    "Allenhouse Institute of Technology",
    "Frontend Developer",
    "PWA Developer",
    "Startup Website Developer",
    "Landing Page Creator", 
    "Corporate Website Design", 
    "UI/UX Design Services", 
    "Website Maker in Kanpur", 
    "Remote React Developer", 
    "Business Portfolio Designer", 
    "RESTful API Integration",
    "Affordable Web Design Kanpur",
    "Backend Developer",
    "JavaScript Expert",
    "TypeScript Developer",
    "Modern Web Applications",
    "Scalable Web Solutions",
    "ERP System Development",
    "API Development",
    "Custom Website Development",
    "E-commerce Website Developer",
    "Divyanshu Kushwaha Allenhouse",
    "Professional Coder Kanpur"
  ],
  authors: [
    {
      name: "Divyanshu Kushwaha",
      url: "https://github.com/Divyanshu4381",
    },
  ],
  creator: "Divyanshu Kushwaha",
  publisher: "Divyanshu Kushwaha",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://divyanshubca.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://divyanshubca.vercel.app",
    title: "Divyanshu Kushwaha - MERN Stack Developer & Full Stack Engineer",
    description: "Professional MERN Stack Developer specializing in React.js, Node.js, MongoDB, and Express.js. Building scalable web applications and innovative digital solutions.",
    siteName: "Divyanshu Kushwaha Portfolio",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Divyanshu Kushwaha - MERN Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divyanshu Kushwaha - MERN Stack Developer",
    description: "Professional MERN Stack Developer specializing in React.js, Node.js, MongoDB, and Express.js.",
    creator: "@Divyanshu4381",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google870b879f1f298f81", // Already verified via HTML file
  },
  category: "technology",
}

// Structured Data for better SEO
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://divyanshubca.vercel.app/#person",
  name: "Divyanshu Kushwaha",
  url: "https://divyanshubca.vercel.app/",
  image: "/aboutPhoto.jpg",
  sameAs: [
    "https://github.com/Divyanshu4381",
    "https://www.linkedin.com/in/divyanshukushwaha",
    "https://x.com/Divyanshuk4381",
    "https://www.instagram.com/itzs_divyanshu/",
    "https://www.facebook.com/divyanshu.kushwaha.3958"
  ],
  jobTitle: "MERN Stack Developer",
  worksFor: {
    "@type": "Organization",
    name: "Freelance"
  },
  knowsAbout: [
    "MERN Stack", "React.js", "Node.js", "MongoDB", "Express.js",
    "JavaScript", "TypeScript", "Next.js", "React Native",
    "Web Development", "ERP Systems", "Full Stack Development"
  ],
  description: "Divyanshu Kushwaha - MERN Stack Developer from Kanpur & Allenhouse Institute of Technology. Specializing in React.js, Node.js, and MongoDB."
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Divyanshu Kushwaha",
  alternateName: ["Divyanshu Kushwaha Portfolio", "Divyanshu Portfolio"],
  url: "https://divyanshubca.vercel.app/",
}

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://divyanshubca.vercel.app/#localbusiness",
  name: "Divyanshu Kushwaha - Remote Web Development Services",
  image: "/og-image.png",
  description: "Professional Remote MERN Stack Web Development Services for clients in India and United States. Specializing in React.js, Node.js, MongoDB, and custom web applications with seamless remote collaboration.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kanpur",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "26.4499",
    longitude: "80.3319"
  },
  url: "https://divyanshubca.vercel.app",
  email: "divyanshu4381@gmail.com",
  priceRange: "$$",
  serviceType: ["Remote Web Development", "Freelance MERN Stack Development", "Custom Web Applications"],
  areaServed: [
    {
      "@type": "Country",
      name: "India"
    },
    {
      "@type": "Country",
      name: "United States"
    },
    {
      "@type": "City",
      name: "Kanpur",
      addressCountry: "IN"
    },
    {
      "@type": "City",
      name: "Lucknow",
      addressCountry: "IN"
    },
    {
      "@type": "City",
      name: "Mumbai",
      addressCountry: "IN"
    },
    {
      "@type": "City",
      name: "Delhi",
      addressCountry: "IN"
    },
    {
      "@type": "City",
      name: "Bengaluru",
      addressCountry: "IN"
    },
    {
      "@type": "City",
      name: "San Francisco",
      addressCountry: "US"
    },
    {
      "@type": "City",
      name: "New York",
      addressCountry: "US"
    },
    {
      "@type": "City",
      name: "Austin",
      addressCountry: "US"
    }
  ],
  sameAs: [
    "https://github.com/Divyanshu4381",
    "https://www.linkedin.com/in/divyanshukushwaha",
    "https://x.com/Divyanshuk4381"
  ]
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you work with US clients remotely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, I provide remote MERN stack development services to clients in the United States. I work seamlessly across time zones, delivering high-quality web applications for businesses in San Francisco, New York, Austin, and other major US cities."
      }
    },
    {
      "@type": "Question",
      "name": "What technologies do you specialize in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "I specialize in the MERN stack: MongoDB, Express.js, React.js, and Node.js. I also work with Next.js, TypeScript, React Native, and modern web technologies to build scalable, performant applications."
      }
    },
    {
      "@type": "Question",
      "name": "What are your rates for freelance projects?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "My rates are competitive and vary based on project complexity and scope. I offer cost-effective solutions compared to local developers in the US, while maintaining high quality standards. Contact me for a detailed quote based on your specific requirements."
      }
    },
    {
      "@type": "Question",
      "name": "How do you handle communication across time zones?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "I maintain flexible working hours to overlap with US business hours when needed. I use modern collaboration tools like Slack, Zoom, and project management platforms to ensure smooth communication. My location in India also enables 24/7 development cycles for faster project delivery."
      }
    },
    {
      "@type": "Question",
      "name": "Can you help with both frontend and backend development?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, as a full-stack MERN developer, I handle both frontend (React.js, Next.js) and backend (Node.js, Express.js, MongoDB) development. I can build complete web applications from database design to user interface implementation."
      }
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon - Multiple formats for maximum compatibility */}
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* Performance optimizations */}
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Additional meta tags for better SEO */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Divyanshu Portfolio" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}

        {/* Performance monitoring script can be added here */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simple performance monitoring
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log('Page load time:', loadTime + 'ms');
                  }, 0);
                });
              }
            `,
          }}
        />
        <Analytics />

      </body>
    </html>
  )
}