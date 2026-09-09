import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/og-image?url=https://edubaza.uz
 *
 * Fetches the og:image meta tag from the given URL.
 * Returns JSON: { ogImage: "https://..." } or { ogImage: null }
 * Cached for 7 days via Cache-Control headers.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "url parametri kiritilishi shart", ogImage: null },
      { status: 400 }
    );
  }

  try {
    const formattedUrl = targetUrl.startsWith("http")
      ? targetUrl
      : `https://${targetUrl}`;

    // Fetch only the HTML head (abort after 8KB to save bandwidth)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VibeCodingBot/1.0; +https://vibecoding.uz)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ ogImage: null }, { status: 200 });
    }

    // Read only first 16KB to find og:image quickly
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ ogImage: null }, { status: 200 });
    }

    let html = "";
    const decoder = new TextDecoder();
    const MAX_BYTES = 16384; // 16KB is enough for <head>
    let totalRead = 0;

    while (totalRead < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      totalRead += value.length;

      // Stop early if we've passed </head>
      if (html.includes("</head>")) break;
    }

    reader.cancel();

    // Extract og:image from HTML
    const ogImage = extractOgImage(html);

    // Resolve relative URLs
    let resolvedImage = ogImage;
    if (ogImage && !ogImage.startsWith("http")) {
      try {
        resolvedImage = new URL(ogImage, formattedUrl).href;
      } catch {
        resolvedImage = ogImage;
      }
    }

    const response = NextResponse.json(
      { ogImage: resolvedImage || null, sourceUrl: formattedUrl },
      { status: 200 }
    );

    // Cache for 7 days, stale-while-revalidate for 30 days
    response.headers.set(
      "Cache-Control",
      "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000"
    );

    return response;
  } catch (error) {
    console.error("[og-image] Fetch error:", error);
    return NextResponse.json({ ogImage: null }, { status: 200 });
  }
}

/**
 * Extract og:image content from HTML string.
 * Supports both property="og:image" and name="og:image" variants.
 */
function extractOgImage(html: string): string | null {
  // Try og:image first
  const ogPatterns = [
    /< *meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /< *meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    // twitter:image fallback
    /< *meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /< *meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of ogPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}
