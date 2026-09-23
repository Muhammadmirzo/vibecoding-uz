export type MarkdownBlock =
  | { type: "paragraph"; text: string; line: number }
  | { type: "heading"; level: 2 | 3; id: string; text: string; line: number }
  | { type: "list"; ordered: boolean; marker: string; text: string; line: number }
  | { type: "code"; language: string; text: string; line: number }
  | { type: "quote"; text: string; line: number };

export type MarkdownHeadingBlock = Extract<MarkdownBlock, { type: "heading" }>;

function heading(rawTitle: string): { id: string; text: string } {
  const idMatch = rawTitle.match(/\{#([^}]+)\}/);
  if (idMatch) {
    return {
      id: idMatch[1],
      text: rawTitle.replace(/\{#[^}]+\}/, "").trim(),
    };
  }
  return {
    id: rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-"),
    text: rawTitle,
  };
}

/** Parse the small Markdown subset used by public blog articles. */
export function parseMarkdown(md: string): MarkdownBlock[] {
  const lines = md.trim().split("\n");
  const blocks: MarkdownBlock[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = "";
  let codeStartLine = 0;

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace("```", "");
        codeBlockContent = [];
        codeStartLine = index;
      } else {
        inCodeBlock = false;
        blocks.push({
          type: "code",
          language: codeLanguage,
          text: codeBlockContent.join("\n"),
          line: codeStartLine,
        });
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      blocks.push({ type: "heading", level: 2, ...heading(h2Match[1]), line: index });
      return;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      blocks.push({ type: "heading", level: 3, ...heading(h3Match[1]), line: index });
      return;
    }

    if (line.trim().startsWith(">")) {
      blocks.push({
        type: "quote",
        text: line.replace(/^>\s*/, "").replace(/^"|"$/g, ""),
        line: index,
      });
      return;
    }

    const numMatch = line.match(/^([0-9]+)\.\s+(.+)$/);
    if (numMatch) {
      blocks.push({ type: "list", ordered: true, marker: numMatch[1], text: numMatch[2], line: index });
      return;
    }

    if (line.trim().startsWith("- ")) {
      blocks.push({ type: "list", ordered: false, marker: "", text: line.replace(/^-\s*/, ""), line: index });
      return;
    }

    if (line.trim().length > 0) {
      blocks.push({ type: "paragraph", text: line, line: index });
    }
  });

  return blocks;
}
