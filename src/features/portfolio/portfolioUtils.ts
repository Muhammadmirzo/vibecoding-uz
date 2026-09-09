/**
 * Utility functions for portfolio image resolution.
 *
 * Strategy (tezlik bo'yicha tartiblangan):
 * 1. Agar imageUrl tashqi HTTP havola bo'lsa — to'g'ridan-to'g'ri ishlatiladi (eng tez).
 * 2. Agar imageUrl bo'sh yoki lokal /illustrations/ yo'l bo'lsa — placeholder ko'rsatiladi.
 * 3. Admin panelda "OG rasm olish" tugmasi orqali /api/og-image endpoint chaqiriladi
 *    va natija imageUrl ga saqlanadi (bir martalik, keyingi yuklashlar tezkor).
 */

/**
 * Fetches the og:image URL from a website via our server-side API.
 * This should be called ONCE when adding/editing a portfolio item in the admin panel,
 * NOT on every page load.
 */
export async function fetchOgImage(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl || websiteUrl === "https://") return null;

  try {
    const apiUrl = `/api/og-image?url=${encodeURIComponent(websiteUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data.ogImage || null;
  } catch {
    return null;
  }
}

/**
 * Resolves the display image URL for a portfolio item.
 *
 * Priority:
 * 1. If imageUrl is a valid external HTTP(S) URL → use as-is (fast, cached).
 * 2. If imageUrl is missing, empty, or a broken local path → return empty string
 *    (PortfolioCard will show the high-tech fallback mockup).
 */
export function resolvePortfolioImageUrl(item: {
  url: string;
  imageUrl?: string | null;
}): string {
  if (
    item.imageUrl &&
    item.imageUrl.trim() !== "" &&
    item.imageUrl.startsWith("http")
  ) {
    return item.imageUrl;
  }
  // Broken local path or empty — return empty, card will show fallback
  return "";
}

/**
 * Generates a simple gradient placeholder for portfolio items without images.
 * Returns an inline SVG data URI — zero network requests, instant render.
 */
export function generatePlaceholderSvg(title: string, domain: string): string {
  const firstLetter = (title || "V").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#16213e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="750" fill="url(#bg)"/>
    <circle cx="600" cy="300" r="80" fill="rgba(255,255,255,0.08)"/>
    <text x="600" y="325" text-anchor="middle" font-family="system-ui,sans-serif" font-size="64" font-weight="bold" fill="rgba(255,255,255,0.5)">${firstLetter}</text>
    <text x="600" y="440" text-anchor="middle" font-family="monospace" font-size="20" fill="rgba(255,255,255,0.3)">${domain || "vibecoding.uz"}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
