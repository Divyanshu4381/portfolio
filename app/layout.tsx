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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
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