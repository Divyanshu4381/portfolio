import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
    title: "Blog | Insights & Tutorials",
    description: "Read about my journey in web development, architecture, and design.",
};

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <div className="min-h-screen bg-black text-white py-24 px-4 md:px-6">
            <div className="container mx-auto max-w-6xl">
                <div>
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Blog
                    </h1>
                    <p className="max-w-[700px] text-gray-400 md:text-xl">
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
                    <div className="text-center py-20 text-gray-500">
                        <p>No posts found. Check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
