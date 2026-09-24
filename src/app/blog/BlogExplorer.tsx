"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BLOG_CATEGORIES, type BlogPostSummary } from "@/features/blog/blogData";
import { Button } from "@/components/ui/Button";
import { BlogCard } from "./BlogCard";
import { BlogFilters } from "./BlogFilters";

export function BlogExplorer({ posts }: { posts: BlogPostSummary[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === "Barchasi" || post.category === selectedCategory;
      const matchesSearch = !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, selectedCategory]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Barchasi");
  };

  return (
    <>
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
          {filteredPosts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
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
    </>
  );
}
