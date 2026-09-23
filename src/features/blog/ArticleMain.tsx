import type { BlogPostItem } from "./types";
import { ArticleBody } from "./ArticleBody";
import { BottomShareAction } from "./ShareActions";

export function ArticleMain({ post }: { post: BlogPostItem }) {
  return (
    <main className="lg:col-span-8 bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-10 shadow-sm">
      <ArticleBody contentMd={post.contentMd} />
      <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-ink-subtle">Teglar:</span>
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs font-mono px-3 py-1 rounded-md bg-cream text-ink border border-border">#{tag}</span>
        ))}
      </div>
      <div className="mt-8 p-6 rounded-xl bg-cream border border-accent-line flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-ink">Maqola sizga foydali bo'ldimi?</div>
          <div className="text-xs text-ink-muted">Hamkasblaringiz va do'stlaringiz bilan ulashing.</div>
        </div>
        <div className="flex items-center gap-2"><BottomShareAction /></div>
      </div>
    </main>
  );
}
