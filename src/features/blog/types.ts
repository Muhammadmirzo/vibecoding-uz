export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  coverUrl: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  readTimeMin: number;
  publishedAt: string;
  tags: string[];
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}
