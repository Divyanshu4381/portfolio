import ProjectsClient from "./ProjectsClient"

export const metadata = {
    title: "Projects | Divyanshu Kushwaha Portfolio",
    description: "Explore my complete portfolio of projects, ranging from web applications, mobile apps to enterprise solutions.",
    openGraph: {
        title: "Projects | Divyanshu Kushwaha Portfolio",
        description: "Explore my complete portfolio of projects, ranging from web applications, mobile apps to enterprise solutions.",
        url: "https://divyanshubca.vercel.app/projects",
        siteName: "Divyanshu Kushwaha Portfolio",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Projects",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Projects | Divyanshu Kushwaha Portfolio",
        description: "Explore my complete portfolio of projects, ranging from web applications, mobile apps to enterprise solutions.",
        images: ["/og-image.png"],
    },
}

export default function ProjectsPage() {
    return <ProjectsClient />
}

