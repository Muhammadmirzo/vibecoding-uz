"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Check,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  Copy,
  Send,
  ExternalLink,
} from "lucide-react";
import {
  STATIC_BLOG_POSTS,
  extractTocFromMarkdown,
  BlogPostItem,
  TocItem,
} from "@/features/blog/blogData";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const post = STATIC_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const toc = React.useMemo(() => extractTocFromMarkdown(post.contentMd), [post.contentMd]);
  const [copied, setCopied] = React.useState(false);
  const [activeTocId, setActiveTocId] = React.useState<string>(toc[0]?.id || "");
  const [shareUrl, setShareUrl] = React.useState<string>("");

  React.useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  // Intersection Observer to highlight active TOC section
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleCopyLink = () => {
    const urlToCopy = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (urlToCopy && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedPosts = STATIC_BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  // Render markdown content line by line cleanly
  const renderMarkdownContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = "";

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace("```", "");
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-xl overflow-hidden bg-[#1E1E1E] text-white p-4 font-mono text-xs border border-border-strong">
              {codeLanguage && (
                <div className="text-[11px] text-ink-subtle uppercase pb-2 mb-2 border-b border-white/10 font-bold">
                  {codeLanguage}
                </div>
              )}
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-gray-200">
                <code>{codeBlockContent.join("\n")}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Heading 2
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        let title = h2Match[1];
        let id = "";
        const idMatch = title.match(/\{#([^}]+)\}/);
        if (idMatch) {
          id = idMatch[1];
          title = title.replace(/\{#[^}]+\}/, "").trim();
        } else {
          id = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
        }

        elements.push(
          <h2
            key={`h2-${index}`}
            id={id}
            className="scroll-mt-24 text-2xl md:text-3xl font-extrabold text-ink mt-10 mb-4 tracking-tight"
          >
            {title}
          </h2>
        );
        return;
      }

      // Heading 3
      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        let title = h3Match[1];
        let id = "";
        const idMatch = title.match(/\{#([^}]+)\}/);
        if (idMatch) {
          id = idMatch[1];
          title = title.replace(/\{#[^}]+\}/, "").trim();
        } else {
          id = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
        }

        elements.push(
          <h3
            key={`h3-${index}`}
            id={id}
            className="scroll-mt-24 text-lg md:text-xl font-bold text-ink mt-6 mb-3"
          >
            {title}
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.trim().startsWith(">")) {
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-6 p-4 rounded-r-xl border-l-4 border-accent bg-accent-soft text-ink font-medium italic text-sm leading-relaxed"
          >
            {line.replace(/^>\s*/, "").replace(/^"|"$/g, "")}
          </blockquote>
        );
        return;
      }

      // Ordered list item
      const numMatch = line.match(/^([0-9]+)\.\s+(.+)$/);
      if (numMatch) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-3 my-2 text-sm text-ink-muted leading-relaxed">
            <span className="w-6 h-6 rounded-full bg-cream-deep text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <span>
              {numMatch[2].split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-ink font-bold">{part}</strong> : part
              )}
            </span>
          </div>
        );
        return;
      }

      // Unordered list item
      if (line.trim().startsWith("- ")) {
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2.5 my-2 text-sm text-ink-muted leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
            <span>
              {line.replace(/^-\s*/, "").split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-ink font-bold">{part}</strong> : part
              )}
            </span>
          </div>
        );
        return;
      }

      // Regular paragraph (if not empty)
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${index}`} className="my-4 text-sm md:text-base text-ink-muted leading-relaxed">
            {line.split("**").map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-ink font-bold">{part}</strong> : part
            )}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-ink-subtle">
          <Link href="/" className="hover:text-accent transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-accent transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-semibold truncate max-w-[240px] md:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Barcha maqolalarga qaytish
          </Link>
        </div>

        {/* Article Header Card */}
        <header className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-accent-soft text-accent border border-accent-line">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-ink-subtle">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedAt}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-ink-subtle">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{post.readTimeMin} daqiqa o'qish</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-ink-muted leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Block & Share Action */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <div className="text-sm font-bold text-ink">{post.authorName}</div>
                <div className="text-xs text-ink-muted">{post.authorRole}</div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="btn-secondary h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                title="Havolani nusxalash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Nusxalandi!" : "Havola"}</span>
              </button>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 text-telegram"
                title="Telegram'da ulashish"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </header>

        {/* Cover Banner */}
        <div className="w-full h-64 md:h-[420px] rounded-2xl overflow-hidden border border-border-strong relative shadow-md">
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Layout Grid: Content + Sidebar TOC */}
        <div className="grid lg:grid-cols-12 gap-10 items-start pt-6">
          
          {/* Main Article Body */}
          <main className="lg:col-span-8 bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-10 shadow-sm">
            <div className="article-body">
              {renderMarkdownContent(post.contentMd)}
            </div>

            {/* Article Tags */}
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-ink-subtle">Teglar:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1 rounded-md bg-cream text-ink border border-border"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Share Bottom Callout */}
            <div className="mt-8 p-6 rounded-xl bg-cream border border-accent-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-bold text-ink">Maqola sizga foydali bo'ldimi?</div>
                <div className="text-xs text-ink-muted">Hamkasblaringiz va do'stlaringiz bilan ulashing.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary h-9 px-4 rounded-md text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Nusxalandi!" : "Nusxalash"}</span>
                </button>
              </div>
            </div>
          </main>

          {/* Sticky Sidebar: TOC + Course Teaser */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Table of Contents (TOC) Widget */}
            <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-mono font-bold uppercase tracking-wider text-ink">
                <BookOpen className="w-4 h-4 text-accent" /> Mundarija (TOC)
              </div>

              <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {toc.map((item) => {
                  const isActive = activeTocId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs py-2 px-3 rounded-lg transition-all leading-snug ${
                        isActive
                          ? "bg-accent-soft text-accent font-bold border-l-2 border-accent"
                          : "text-ink-muted hover:text-ink hover:bg-cream"
                      } ${item.level === 3 ? "ml-3" : ""}`}
                    >
                      {item.title}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Course Promotion Card */}
            <div className="bg-cream-warm border-2 border-accent-line rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-accent uppercase">
                  8 Haftalik Mentorlik
                </div>
                <h4 className="text-lg font-bold text-ink leading-tight">
                  Vibe Coding Express
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  O'z g'oyangizdan ishlaydigan MVPgacha. Claude Code va Cursor bilan professional loyihalar qurishni o'rganing.
                </p>
              </div>

              <Link href="/kurs/vibe-coding-express" className="block">
                <button className="btn-primary h-11 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full">
                  <span>Kurs Dasturi bilan tanishish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

          </aside>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-12 border-t border-border space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-ink">
              Mavzuga oid <span className="accent-serif">boshqa maqolalar</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-cream-warm border border-border-strong rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start hover:border-accent-line hover:shadow-md transition-all group"
                >
                  <img
                    src={rel.coverUrl}
                    alt={rel.title}
                    className="w-full md:w-36 h-28 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold text-accent">
                      {rel.category}
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-ink-muted line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
