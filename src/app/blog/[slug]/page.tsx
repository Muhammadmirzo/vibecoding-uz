import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { extractTocFromMarkdown, STATIC_BLOG_POSTS } from "@/features/blog/blogData";
import { ArticleBreadcrumb, ArticleHeader } from "@/features/blog/ArticleHeader";
import { ArticleMain } from "@/features/blog/ArticleMain";
import { BlogSidebar } from "@/features/blog/BlogSidebar";
import { RelatedPosts } from "@/features/blog/RelatedPosts";
import { ShareProvider } from "@/features/blog/ShareActions";
import { ScrollProgress } from "@/features/motion/ui/ScrollProgress";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { articleJsonLd, routeMetadata, serializeJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return STATIC_BLOG_POSTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = STATIC_BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return { title: "Maqola topilmadi" };

  const canonical = `/blog/${post.slug}`;
  const metadata = routeMetadata({ title: post.title, description: post.excerpt, path: canonical });
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article", publishedTime: post.publishedAt, authors: [post.authorName], tags: post.tags, images: [{ url: post.coverUrl, alt: post.title }] } };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = STATIC_BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();

  const toc = extractTocFromMarkdown(post.contentMd);
  const relatedPosts = STATIC_BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 2);
  const jsonLd = articleJsonLd({ title: post.title, description: post.excerpt, image: post.coverUrl, publishedAt: post.publishedAt, author: post.authorName, path: `/blog/${post.slug}` });

  return (
    <ShareProvider>
    <div className="pt-28 pb-20 min-h-screen bg-bg text-ink">
      <ScrollProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        <ArticleBreadcrumb title={post.title} />
        <ArticleHeader post={post} />
        <div className="w-full h-64 md:h-[420px] rounded-2xl overflow-hidden border border-border-strong relative shadow-md">
          <Image src={post.coverUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" priority />
        </div>
        <div className="grid lg:grid-cols-12 gap-10 items-start pt-6">
          <ArticleMain post={post} />
          <BlogSidebar toc={toc} />
        </div>
        <RelatedPosts posts={relatedPosts} />
        <NextStepCTA />
      </div>
    </div>
    </ShareProvider>
  );
}
