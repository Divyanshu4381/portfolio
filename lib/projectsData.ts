export interface Project {
    image: string;
    title: string;
    description: string;
    technologies: readonly string[];
    links: {
        preview: string;
        github: string;
    };
    category: string;
    duration: string;
    team: string;
}

export const projectsData: Project[] = [
    {
        image: '/images/naturescure_01.png',
        title: `Nature's Cure - A Virtual Herbal Garden`,
        description: `Nature's Cure is responsive show casing 25+ medicinal plants across six AYUSH systems, with dynamic search, category filtering and intuitive navigation. Integrated 3D plant models using google-model-viewer, allowing 100% interactive viewing with rotation, zoom and info overlays. Integrated AI assistant 'Herba' with Gemini API for natural language plant query handling.`,
        technologies: [
            'AI Chatbot',
            'Shadcn UI',
            'React.js',
            'Tailwind CSS',
            'OpenRouter API',
            'nodemailer',
            'Google Model Viewer',
            'Git LFS',
            'MongoDB',
            'Express.js',
            'Node.js',
            'MERN Stack',
        ],
        links: {
            preview: 'http://www.naturescure.page.gd/',
            github: 'https://github.com/Saral224x2/naturescure',
        },
        category: "web",
        duration: "3 Months",
        team: "4 Members"
    },
    {
        image: '/images/findure.png',
        title: 'Business Directory App',
        description: 'Designed and developed the complete backend architecture for a local base service discovery app called Findure using MERN and react native for fully responsive with UI with seamless API integration, and a 40% increase in overall app performance.',
        technologies: [
            'React Native',
            'Tailwind CSS',
            'Node.js',
            'MongoDB',
            'Node Mailer',
            'Express.js',
        ],
        links: {
            preview: 'https://github.com/Divyanshu4381/findure',
            github: 'https://github.com/Divyanshu4381/findure',
        },
        category: "app",
        duration: "4 Months",
        team: "Solo Project"
    },
    {
        image: '/images/erp.png',
        title: 'Enterprise Resource Planning System',
        description: 'Engineered a full-scale ERP Management System with 4 user roles (Admin, Students, Teachers, Counselors), enabling role-based access, secure login (JWT), and dynamic dashboards using react And tailwind; deployed with 99.9% uptime and scalable backend on Render.',
        technologies: [
            'JavaScript',
            'React.js',
            'node.js',
            'Tailwind CSS',
            'gsap',
            'framer-motion',
            'JWT',
            'RESTful API',
            'Git',
            'GitHub',
            'Node.js',
            'Express',
            'MongoDB',
        ],
        links: {
            preview: 'https://erp-frontend-eight-flax.vercel.app/',
            github: 'https://github.com/developer-umar?tab=repositories',
        },
        category: "erp",
        duration: "5 Months",
        team: "3 Members"
    },
    {
        image: '/images/jobPortal.png',
        title: 'Job and Internship Portal',
        description: 'Developed a comprehensive Job and Internship Portal with multi-role access (Admin, Recruiter, Candidate), featuring secure authentication (JWT), dynamic job listings, and application tracking using React and Tailwind; ensured robust backend functionality with Node.js and MongoDB, achieving seamless user experience and efficient data management.',
        technologies: [
            'JavaScript',
            'React.js',
            'node.js',
            'Tailwind CSS',
            'JWT',
            'RESTful API',
            'Git',
            'GitHub',
            'Node.js',
            'Express',
            'MongoDB',
        ],
        links: {
            preview: 'https://jobportal-fghp.onrender.com/',
            github: 'https://github.com/Divyanshu4381/jobportal',
        },
        category: "web",
        duration: "5 Months",
        team: "3 Members"
    },
    {
        image: '/images/sarkarisuvidha.png',
        title: `SARKARI SUVIDHA`,
        description: `Sarkari Suvidha is the protal to helps to people to find government job openings.`,
        technologies: [
            'Next.js',
            'Shadcn UI',
            'Tailwind CSS',
            'nodemailer',
            'MongoDB',
            'TypeScript',
        ],
        links: {
            preview: 'https://sarkarisuvidha.vercel.app/',
            github: 'https://github.com/Divyanshu4381',
        },
        category: "web",
        duration: "1 Months",
        team: "Self"
    },
];

export const projectCategories = [
    { id: "all", name: "All Projects" },
    { id: "web", name: "Web Development" },
    { id: "app", name: "App Development" },
    { id: "erp", name: "Enterprise Solutions" },
];
