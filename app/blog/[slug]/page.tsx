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
        <article className="container py-24 mx-auto px-4 md:px-6 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                ← Back to Blog
            </Link>

            <header className="mb-12 border-b border-border pb-8">
                <div className="flex gap-2 mb-4">
                    {post.metadata.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                    {post.metadata.title}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground">
                    <time dateTime={post.metadata.date}>
                        {format(new Date(post.metadata.date), "MMMM d, yyyy")}
                    </time>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                        <span>By Divyanshu</span>
                    </div>
                </div>
            </header>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
                <MDXRemote source={post.content} />
            </div>
        </article>
    );
}
