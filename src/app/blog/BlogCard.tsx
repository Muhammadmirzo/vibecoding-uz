import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { BlogPostItem } from "@/features/blog/blogData";

export const BlogCard = React.memo(function BlogCard({ post }: { post: BlogPostItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-cream-warm transition-all duration-200 hover:border-accent-line hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-cream-deep">
        <img src={post.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-border bg-cream/90 px-3 py-1 font-mono text-[11px] font-bold text-accent backdrop-blur-md">{post.category}</span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-0.5 font-mono text-[11px] text-ink-muted backdrop-blur-md">
            <Clock className="h-3 w-3 text-accent" /> {post.readTimeMin} daqiqa
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-subtle">
            <Calendar className="h-3.5 w-3.5" /> <span>{post.publishedAt}</span>
          </div>
          <Link href={`/blog/${post.slug}`} prefetch={true} className="block transition-colors group-hover:text-accent">
            <h2 className="line-clamp-2 text-lg font-bold leading-snug text-ink md:text-xl">{post.title}</h2>
          </Link>
          <p className="line-clamp-3 text-xs leading-relaxed text-ink-muted md:text-sm">{post.excerpt}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2.5">
            <img src={post.authorAvatar} alt="" className="h-7 w-7 rounded-full border border-border object-cover" />
            <span className="text-xs font-semibold text-ink">{post.authorName}</span>
          </div>
          <Link href={`/blog/${post.slug}`} prefetch={true} className="flex items-center gap-1 text-xs font-bold text-accent transition-all hover:gap-1.5">
            <span>O&apos;qish</span> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});
