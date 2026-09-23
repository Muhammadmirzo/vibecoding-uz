import Link from "next/link";
import type { BlogPostItem } from "./types";

export function RelatedPosts({ posts }: { posts: BlogPostItem[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="pt-12 border-t border-border space-y-6">
      <h3 className="text-xl md:text-2xl font-bold text-ink">Mavzuga oid <span className="accent-serif">boshqa maqolalar</span></h3>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="bg-cream-warm border border-border-strong rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start hover:border-accent-line hover:shadow-md transition-all group">
            <img src={post.coverUrl} alt={post.title} className="w-full md:w-36 h-28 rounded-xl object-cover shrink-0" />
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-accent">{post.category}</span>
              <h4 className="text-sm md:text-base font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">{post.title}</h4>
              <p className="text-xs text-ink-muted line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
