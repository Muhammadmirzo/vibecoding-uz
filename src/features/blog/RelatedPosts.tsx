import Image from "next/image";
import Link from "next/link";
import type { BlogPostItem } from "./types";

export function RelatedPosts({ posts }: { posts: BlogPostItem[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="pt-12 border-t border-border space-y-6">
      <h3 className="text-xl md:text-2xl font-bold text-ink">Mavzuga oid <span className="accent-serif">boshqa maqolalar</span></h3>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="bg-bg-sunken border border-border-strong rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start hover:border-accent hover:shadow-md transition-all group">
            <Image src={post.coverUrl} alt={post.title} width={288} height={112} sizes="(max-width: 767px) 100vw, 144px" className="h-28 w-full shrink-0 rounded-xl object-cover md:w-36" />
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
