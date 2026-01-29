import Link from "next/link";
import { format } from "date-fns";
import { BlogPostMetadata } from "@/lib/blog"; // Adjust import path if needed

interface BlogCardProps {
    slug: string;
    metadata: BlogPostMetadata;
}

export default function BlogCard({ slug, metadata }: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`} className="group">
            <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
                {/* Basic color placeholder if no image, or optimize later with next/image */}
                <div className="aspect-video w-full bg-muted/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 group-hover:scale-105 transition-transform duration-500" />
                    {/* You would usually put <Image /> here */}
                </div>

                <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <time dateTime={metadata.date}>
                            {format(new Date(metadata.date), "MMMM d, yyyy")}
                        </time>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {metadata.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                        {metadata.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {metadata.tags?.map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
