"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { BLOG_CATEGORIES, STATIC_BLOG_POSTS } from "@/features/blog/blogData";
import { BlogCard } from "./BlogCard";
import { BlogFilters } from "./BlogFilters";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Button } from "@/components/ui";

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Barchasi");

  const filteredPosts = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return STATIC_BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === "Barchasi" || post.category === selectedCategory;
      const matchesSearch = !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Barchasi");
  };

  return (
    <div className="min-h-screen bg-bg pb-20 pt-28 text-ink">
      <div className="mx-auto w-full max-w-[1360px] space-y-12 px-5 md:px-8 lg:px-10">
        <header className="mx-auto max-w-[760px] space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3.5 py-1.5 font-mono text-[12px] font-bold uppercase tracking-wider text-accent">
            <BookOpen className="h-4 w-4" /> Mirzo Academy Maqolalari
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
            AI va Vibe Coding bo&apos;yicha <span className="accent-serif">zamonaviy bilimlar</span>
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted md:text-base">
            Claude Code, Cursor IDE, prompt muhandisligi va dasturchilarsiz real startaplar qurish bo&apos;yicha amaliy qo&apos;llanmalar.
          </p>
        </header>

        <BlogFilters
          query={searchQuery}
          selectedCategory={selectedCategory}
          categories={BLOG_CATEGORIES}
          onQueryChange={setSearchQuery}
          onClearQuery={() => setSearchQuery("")}
          onCategorySelect={setSelectedCategory}
        />

        <div className="flex items-center justify-between border-b border-border pb-3 font-mono text-xs text-ink-muted">
          <span>Jami topildi: <strong className="text-accent">{filteredPosts.length} ta maqola</strong></span>
          {selectedCategory !== "Barchasi" && <span>Kategoriya: <span className="font-semibold text-ink">{selectedCategory}</span></span>}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border bg-bg-elevated px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"><Search className="h-6 w-6" /></div>
            <h2 className="text-lg font-bold text-ink">Maqola topilmadi</h2>
            <p className="text-xs text-ink-muted">
              {searchQuery ? `"${searchQuery}" so'rovi bo'yicha hech qanday maqola topilmadi.` : "Bu kategoriyada hozircha maqola yo'q."} Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring.
            </p>
            <Button type="button" onClick={resetFilters} variant="outline" size="sm">Filtrlarni tozalash</Button>
          </div>
        )}

        <section className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm md:flex-row md:p-12">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-accent"><Sparkles className="h-4 w-4" /> Vibe Coding Express</span>
            <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Nazariyani tugatib, <span className="accent-serif">amaliyotga o&apos;ting</span></h2>
            <p className="text-xs text-ink-muted md:text-sm">8 haftalik mentorlik kursida Claude Code va Cursor yordamida o&apos;z real loyihangizni quring.</p>
          </div>
          <Button href="/kurs/vibe-coding-express" size="lg" className="w-full md:w-auto">Kurs dasturini ko&apos;rish <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
        </section>
      </div>
      <NextStepCTA />
    </div>
  );
}
