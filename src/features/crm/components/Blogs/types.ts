export type BlogStatus = "draft" | "published" | "scheduled" | "archived";
export type BlogStatusFilter = BlogStatus | "all";
export type EditorTab = "edit" | "preview" | "split";
export interface BlogPost { id: string; slug: string; title: string; excerpt: string | null; contentMd: string; coverUrl: string | null; authorName: string; category: string; seoTitle: string | null; seoDescription: string | null; status: BlogStatus; publishedAt: string; createdAt: string; updatedAt: string; }
export interface BlogForm { title: string; slug: string; category: string; authorName: string; coverUrl: string; excerpt: string; contentMd: string; seoTitle: string; seoDescription: string; status: BlogStatus; publishedAt: string; }
