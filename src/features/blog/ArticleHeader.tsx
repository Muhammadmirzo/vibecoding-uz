import { ArrowLeft, Calendar, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPostItem } from "./types";
import { HeaderShareActions } from "./ShareActions";

export function ArticleBreadcrumb({ title }: { title: string }) {
  return (
    <>
      <nav className="flex items-center gap-2 text-xs font-mono text-ink-subtle">
        <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-accent transition-colors">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/blog" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-accent transition-colors">Blog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-semibold truncate max-w-[240px] md:max-w-md">{title}</span>
      </nav>
      <div>
        <Link href="/blog" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-mono font-semibold text-ink-muted hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Barcha maqolalarga qaytish
        </Link>
      </div>
    </>
  );
}

export function ArticleHeader({ post }: { post: BlogPostItem }) {
  return (
    <header className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-accent-soft text-accent border border-accent">{post.category}</span>
        <div className="flex items-center gap-1.5 text-xs font-mono text-ink-subtle"><Calendar className="w-3.5 h-3.5" /><span>{post.publishedAt}</span></div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-ink-subtle"><Clock className="w-3.5 h-3.5 text-accent" /><span>{post.readTimeMin} daqiqa o'qish</span></div>
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight">{post.title}</h1>
      <p className="text-base md:text-lg text-ink-muted leading-relaxed">{post.excerpt}</p>
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src={post.authorAvatar} alt={post.authorName} width={44} height={44} sizes="44px" className="h-11 w-11 rounded-full object-cover border-2 border-accent" />
          <div><div className="text-sm font-bold text-ink">{post.authorName}</div><div className="text-xs text-ink-muted">{post.authorRole}</div></div>
        </div>
        <HeaderShareActions title={post.title} />
      </div>
    </header>
  );
}
