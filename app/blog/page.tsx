import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";

export const metadata = {
    title: "Blog | Insights & Tutorials",
    description: "Read about my journey in web development, architecture, and design.",
};

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <div className="container py-24 mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Technical <span className="text-primary">Blog</span>
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                    Insights on System Design, Frontend Architecture, and Modern Web Stacks.
                </p>
            </div>

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <BlogCard key={post.slug} slug={post.slug} metadata={post.metadata} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No posts found. Check back later!</p>
                </div>
            )}
        </div>
    );
}
