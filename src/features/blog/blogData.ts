import { CORE_BLOG_POSTS } from "./postsCore";
import { MORE_BLOG_POSTS } from "./postsMore";
import { parseMarkdown, type MarkdownHeadingBlock } from "./markdown";
import type { BlogPostItem, BlogPostSummary, TocItem } from "./types";

export type { BlogPostItem, BlogPostSummary, TocItem } from "./types";

export const BLOG_CATEGORIES = [
  "Barchasi",
  "Vibe Coding",
  "AI Vositalar",
  "Keyslar",
  "Metodologiya",
  "Prompt Injiniring",
  "Karyera",
] as const;

export const STATIC_BLOG_POSTS: BlogPostItem[] = [
  ...CORE_BLOG_POSTS,
  ...MORE_BLOG_POSTS,
];

export const STATIC_BLOG_POST_SUMMARIES: BlogPostSummary[] = STATIC_BLOG_POSTS.map(
  ({ contentMd: _contentMd, ...summary }) => summary,
);

/** Extract the h2/h3 table of contents from Markdown content. */
export function extractTocFromMarkdown(contentMd: string): TocItem[] {
  return parseMarkdown(contentMd)
    .filter((block): block is MarkdownHeadingBlock =>
      block.type === "heading"
    )
    .map(({ id, text, level }) => ({ id, title: text, level }));
}
