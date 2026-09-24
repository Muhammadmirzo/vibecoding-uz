import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { BlogPostSummary } from "@/features/blog/blogData";

export const BlogCard = React.memo(function BlogCard({ post, priority = false }: { post: BlogPostSummary; priority?: boolean }) {
  return (
    <article className="group w6c-cover flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md" style={{ "--w6c-vt": `post-${post.id}` } as React.CSSProperties}>
      <div className="relative h-48 w-full overflow-hidden bg-bg-sunken">
        <Image src={post.coverUrl} alt="" fill priority={priority} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-3 py-1 font-mono text-[11px] font-bold text-accent backdrop-blur-md">{post.category}</span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-2.5 py-0.5 font-mono text-[11px] text-ink-muted backdrop-blur-md">
            <Clock className="h-3 w-3 text-accent" /> {post.readTimeMin} daqiqa
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-subtle">
            <Calendar className="h-3.5 w-3.5" /> <span>{post.publishedAt}</span>
          </div>
          <Link href={`/blog/${post.slug}`} prefetch={true} className="flex min-h-11 items-center transition-colors group-hover:text-accent">
            <h2 className="line-clamp-2 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand md:text-xl">{post.title}</h2>
          </Link>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2.5">
            <Image src={post.authorAvatar} alt="" width={28} height={28} sizes="28px" className="h-7 w-7 rounded-full border border-border object-cover" />
            <span className="text-xs font-semibold text-ink">{post.authorName}</span>
          </div>
          <Link href={`/blog/${post.slug}`} prefetch={true} className="flex min-h-11 min-w-11 items-center justify-center gap-1 px-1 text-xs font-bold text-accent transition-all hover:gap-1.5">
            <span>O&apos;qish</span> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});
