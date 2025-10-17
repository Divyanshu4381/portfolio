import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
 title: {
  default: "Divyanshu Kushwaha - MERN Stack Developer from Kanpur | Allenhouse | Full Stack Engineer",
  template: "%s | Divyanshu Kushwaha - Allenhouse Developer"
},
description: "Divyanshu Kushwaha - MERN Stack Developer from Kanpur & Allenhouse Institute of Technology. Professional Full Stack Developer specializing in React.js, Node.js, MongoDB. Building scalable web applications, ERP systems for clients in Kanpur and worldwide.",
  keywords: [
    "Developer Divyanshu From Kanpur",
    "Coder Divyanshu From Kanpur",
    "Kanpur Number one Software Developer",
    "Kanpur No. 1 Software Developer",
    "Kanpur Number one Software Developer by Divyanshu Kushwaha",
    "Kanpur No. 1 Software Developer by Divyanshu Kushwaha",
    "Freelance Developer Divyanshu From Kanpur",
    "Freelance Developer Divyanshu From Kanpur India",
    "Freelance Developer Divyanshu From Kanpur India Uttar Pradesh",
    "Best Developer Divyanshu From Kanpur",
    "Best Web App Developer Divyanshu From Kanpur",
    "Best Website Developer Divyanshu From Kanpur",
    "Best Website Developer From Kanpur",
    "Divyanshu Kushwaha web Developer from allenhouse",
    "MERN Stack Developer",
    "Full Stack Developer",
    "React.js Developer",
    "Node.js Developer",
    "MongoDB Developer",
    "Express.js Developer",
    "Web Development",
    "JavaScript Developer",
    "Frontend Developer",
    "Backend Developer",
    "ERP Development",
    "React Native Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "Software Engineer",
    "Web Applications",
    "API Development",
    "Database Design",
    "Allenhouse Institute of Technology",
  "Allenhouse Kanpur",
  "Allenhouse student developer", 
  "Kanpur software engineer",
  "Kanpur web developer",
  "Allenhouse web developer",
  "Kanpur MERN stack developer",
  "Allenhouse MERN developer",
  "Divyanshu Kushwaha Allenhouse",
  "Software developer Kanpur UP",
  "Best developer in Kanpur",
  "Top web developer Kanpur",
  "Freelance developer Kanpur",
  "Hire developer Kanpur",
  "Website developer Kanpur",
  "Web development company Kanpur",
  "Kanpur IT services",
  "UP software developer"
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
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Divyanshu Kushwaha',
  url: 'https://divyanshubca.vercel.app/',
  image: '/aboutPhoto.jpg',
  sameAs: [
    'https://github.com/Divyanshu4381',
    'https://www.linkedin.com/in/divyanshukushwaha',
    'https://x.com/Divyanshuk4381',
    'https://www.instagram.com/itzs_divyanshu/',
    'https://www.facebook.com/divyanshu.kushwaha.3958'
  ],
  jobTitle: 'MERN Stack Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'Freelance',
  },
  knowsAbout: [
    'MERN Stack',
    'React.js',
    'Node.js',
    'MongoDB',
    'Express.js',
    'JavaScript',
    'TypeScript',
    'Next.js',
    'React Native',
    'Tailwind CSS',
    'RESTful APIs',
    'Database Design',
    'Web Development',
    'ERP Systems',
    'Full Stack Development',
     "Allenhouse Institute of Technology",
  "Allenhouse Kanpur",
  "Allenhouse student developer", 
  "Kanpur software engineer",
  "Kanpur web developer",
  "Allenhouse web developer",
  "Kanpur MERN stack developer",
  "Allenhouse MERN developer",
  "Divyanshu Kushwaha Allenhouse",
  "Software developer Kanpur UP",
  "Best developer in Kanpur",
  "Top web developer Kanpur",
  "Freelance developer Kanpur",
  "Hire developer Kanpur",
  "Website developer Kanpur",
  "Web development company Kanpur",
  "Kanpur IT services",
  "UP software developer"
  ],
description: "Divyanshu Kushwaha - MERN Stack Developer from Kanpur & Allenhouse Institute of Technology. Professional Full Stack Developer specializing in React.js, Node.js, MongoDB. Building scalable web applications, ERP systems for clients in Kanpur and worldwide.",}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
  {/* Preload critical resources */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

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
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      <body className="antialiased">
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