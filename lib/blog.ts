import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
    slug: string;
    metadata: BlogPostMetadata;
    content: string;
}

export interface BlogPostMetadata {
    title: string;
    date: string;
    excerpt: string;
    image?: string;
    tags?: string[];
}

export function getAllPosts(): BlogPost[] {
    // Ensure directory exists to prevent crash on first run
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith(".mdx"))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            return {
                slug,
                metadata: data as BlogPostMetadata,
                content,
            };
        });

    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
        return (new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
    });
}

export function getPostBySlug(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
            slug,
            metadata: data as BlogPostMetadata,
            content,
        };
    } catch (error) {
        return null;
    }
}
