"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { BLOG_CATEGORIES, STATIC_BLOG_POSTS, BlogPostItem } from "@/features/blog/blogData";

const BlogCardItem = React.memo(function BlogCardItem({ post }: { post: BlogPostItem }) {
  return (
    <article className="bg-cream-warm border border-border-strong rounded-2xl overflow-hidden hover:border-accent-line hover:shadow-lg transition-all duration-200 flex flex-col group">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-cream-deep">
        <img
          src={post.coverUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cream/90 backdrop-blur-md text-accent border border-border">
            {post.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-ink-muted bg-cream/90 backdrop-blur-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-accent" /> {post.readTimeMin} daqiqa
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink-subtle">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.publishedAt}</span>
          </div>

          <Link href={`/blog/${post.slug}`} prefetch={true} className="block group-hover:text-accent transition-colors">
            <h2 className="text-lg md:text-xl font-bold text-ink leading-snug line-clamp-2">
              {post.title}
            </h2>
          </Link>

          <p className="text-xs md:text-sm text-ink-muted leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        {/* Author & CTA Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-7 h-7 rounded-full object-cover border border-border"
            />
            <span className="text-xs font-semibold text-ink">
              {post.authorName}
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            prefetch={true}
            className="text-xs font-bold text-accent flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            <span>O'qish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Barchasi");

  const filteredPosts = React.useMemo(() => {
    return STATIC_BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "Barchasi" || post.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleCategorySelect = React.useCallback((cat: string) => {
    setSelectedCategory(cat);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("Barchasi");
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-[760px] mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold">
            <BookOpen className="w-4 h-4" /> Vibecoding.uz Maqolalari
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">
            AI va Vibe Coding bo'yicha{" "}
            <span className="accent-serif">zamonaviy bilimlar</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Claude Code, Cursor IDE, prompt muhandisligi va dasturchilarsiz real startaplar qurish bo'yicha amaliy qo'llanmalar.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="max-w-[900px] mx-auto space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-ink-subtle absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Maqolalarni qidirish (masalan: Claude Code, MVP, Prompt, Cursor)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-strong bg-cream-warm text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-3.5 text-xs text-ink-muted hover:text-accent font-mono"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BLOG_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-accent text-white shadow-sm"
                      : "bg-cream-warm text-ink-muted border border-border hover:text-ink hover:bg-cream-deep"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-border pb-3">
          <span>
            Jami topildi: <strong className="text-accent">{filteredPosts.length} ta maqola</strong>
          </span>
          {selectedCategory !== "Barchasi" && (
            <span>
              Kategoriya: <span className="text-ink font-semibold">{selectedCategory}</span>
            </span>
          )}
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCardItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-cream-warm border border-border rounded-2xl space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">Maqola topilmadi</h3>
            <p className="text-xs text-ink-muted">
              "{searchQuery}" so'rovi bo'yicha hech qanday maqola topilmadi. Qidiruv so'zini o'zgartirib ko'ring yoki barcha maqolalarni ko'ring.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-secondary h-10 px-5 rounded-lg text-xs font-semibold"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}

        {/* Newsletter / Course CTA Banner */}
        <div className="bg-cream-warm border border-accent-line rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent uppercase">
              <Sparkles className="w-4 h-4" /> Vibe Coding Express
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-ink">
              Nazariyani tugatib, <span className="accent-serif">amaliyotga o'ting</span>
            </h3>
            <p className="text-xs md:text-sm text-ink-muted">
              8 haftalik mentorlik kursida Claude Code va Cursor yordamida o'z real loyihangizni quring.
            </p>
          </div>

          <Link href="/kurs/vibe-coding-express" prefetch={true} className="shrink-0 w-full md:w-auto">
            <button className="btn-primary h-12 px-8 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 w-full">
              <span>Kurs Dasturini Ko'rish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
