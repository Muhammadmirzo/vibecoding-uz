/**
 * Utility functions for portfolio URL & image screenshot processing.
 */

/**
 * Generates an automatic website screenshot preview URL using WordPress mshots API.
 * WordPress mshots is public, reliable, and generates high-res live screenshots of public websites.
 */
export function getWebsiteScreenshotUrl(websiteUrl: string): string {
  if (!websiteUrl) return "";
  try {
    const formattedUrl = websiteUrl.startsWith("http")
      ? websiteUrl
      : `https://${websiteUrl}`;
    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(formattedUrl)}?w=1200&h=750`;
  } catch {
    return "";
  }
}

/**
 * Resolves the primary image URL for a portfolio item.
 * If imageUrl is missing, empty, or points to missing local illustrations,
 * it automatically falls back to generating a live website screenshot URL.
 */
export function resolvePortfolioImageUrl(item: {
  url: string;
  imageUrl?: string | null;
}): string {
  if (
    item.imageUrl &&
    item.imageUrl.trim() !== "" &&
    !item.imageUrl.startsWith("/illustrations/")
  ) {
    return item.imageUrl;
  }
  return getWebsiteScreenshotUrl(item.url);
}
