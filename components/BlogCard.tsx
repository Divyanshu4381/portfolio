import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { BlogPostMetadata } from "@/lib/blog"; // Adjust import path if needed

interface BlogCardProps {
    slug: string;
    metadata: BlogPostMetadata;
}

export default function BlogCard({ slug, metadata }: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`} className="group h-full">
            <div className="flex flex-col h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-green-500/50 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-green-500/10">
                {/* Image Container */}
                <div className="aspect-video w-full bg-gray-900 overflow-hidden relative">
                    {metadata.image ? (
                        <Image
                            src={metadata.image}
                            alt={metadata.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-900/20 group-hover:scale-105 transition-transform duration-500" />
                    )}
                </div>

                <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <time dateTime={metadata.date}>
                            {format(new Date(metadata.date), "MMM d, yyyy")}
                        </time>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight mb-3 text-white group-hover:text-green-400 transition-colors line-clamp-2">
                        {metadata.title}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {metadata.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {metadata.tags?.map((tag) => (
                            <span key={tag} className="px-2.5 py-1 text-xs rounded-md bg-white/5 text-gray-300 border border-white/5 font-medium group-hover:border-green-500/30 group-hover:text-green-300 transition-colors">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
