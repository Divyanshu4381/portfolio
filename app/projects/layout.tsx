import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "My Projects | Divyanshu Kushwaha Portfolio",
    description: "Explore the complete portfolio of Divyanshu Kushwaha, featuring MERN stack applications, ERP systems, and web development projects.",
    openGraph: {
        title: "My Projects | Divyanshu Kushwaha Portfolio",
        description: "Explore the complete portfolio of Divyanshu Kushwaha, featuring MERN stack applications, ERP systems, and web development projects.",
        url: "https://divyanshubca.vercel.app/projects",
        siteName: "Divyanshu Kushwaha Portfolio",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Divyanshu Kushwaha Projects",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "My Projects | Divyanshu Kushwaha Portfolio",
        description: "Explore my web development projects and case studies.",
        images: ["/og-image.png"],
    },
}

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
