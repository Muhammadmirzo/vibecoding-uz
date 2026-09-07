/**
 * Parses a YouTube URL and returns the embed URL string, or null if not YouTube.
 */
export function parseYouTubeUrl(url?: string): string | null {
  if (!url) return null;

  try {
    const trimmed = url.trim();
    // YouTube RegEx supporting watch, embed, shorts, youtu.be
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (err) {
    console.error("Error parsing YouTube URL:", err);
  }

  return null;
}

/**
 * Auto-detects if URL is YouTube or direct video stream (MP4/WebM).
 */
export function detectVideoType(url?: string): { type: "youtube" | "html5" | "empty"; embedUrl?: string } {
  if (!url || !url.trim()) {
    return { type: "empty" };
  }

  const ytEmbed = parseYouTubeUrl(url);
  if (ytEmbed) {
    return { type: "youtube", embedUrl: ytEmbed };
  }

  return { type: "html5" };
}
