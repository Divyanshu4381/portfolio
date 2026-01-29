import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const post = getPostBySlug(params.slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.metadata.title,
        image: post.metadata.image,
        description: post.metadata.excerpt,
        openGraph: {
            title: post.metadata.title,
            description: post.metadata.excerpt,
            type: "article",
            publishedTime: post.metadata.date,
            tags: post.metadata.tags,
        }
    };
}

export default async function BlogPostPage(props: Props) {
    const params = await props.params;
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-black text-white py-24 px-4 md:px-6">
            <div className="container mx-auto max-w-4xl">
                <Link href="/blog" className="inline-flex items-center text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors">
                    ← Back to Blog
                </Link>

                <header className="mb-12 border-b border-gray-800 pb-8">
                    <div className="flex gap-2 mb-4">
                        {post.metadata.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium border border-green-500/20">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-6 leading-tight">
                        {post.metadata.title}
                    </h1>

                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <time dateTime={post.metadata.date}>
                            {format(new Date(post.metadata.date), "MMMM d, yyyy")}
                        </time>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                            <span>By Divyanshu</span>
                        </div>
                    </div>
                </header>

                <div className="prose prose-lg prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-white prose-code:text-green-300 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
                    <MDXRemote source={post.content} />
                </div>
            </div>
        </article>
    );
}
