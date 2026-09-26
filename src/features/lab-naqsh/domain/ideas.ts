/**
 * Pure domain for the hero live demo (AWWWARDS slice 2): the 3 idea chips,
 * the keyword map that resolves free-typed text to the closest chip (or the
 * generic fallback), and the scripted "namuna" site-mock content per idea.
 * No DOM, no GSAP here — see ui/HeroDemo.tsx and ui/useHeroDemoMotion.ts.
 */

export const IDEA_IDS = ["onlayn-dokon", "kurs-sayti", "telegram-bot", "sayt"] as const;
export type IdeaId = (typeof IDEA_IDS)[number];

export interface IdeaChip {
  id: Exclude<IdeaId, "sayt">;
  label: string;
}

/** The 3 chips shown in the terminal; "sayt" is the generic fallback, not a chip. */
export const IDEA_CHIPS: readonly IdeaChip[] = [
  { id: "onlayn-dokon", label: "Onlayn do'kon" },
  { id: "kurs-sayti", label: "Kurs sayti" },
  { id: "telegram-bot", label: "Telegram bot" },
] as const;

export interface MockBlock {
  kind: "header" | "hero" | "content" | "cta";
  shape: "square" | "diamond";
  text: string;
}

export type MockLayout = "grid" | "stack" | "chat";

export interface IdeaTemplate {
  id: IdeaId;
  /** Short Uzbek line the terminal types after a chip/idea is chosen. */
  promptLine: string;
  siteName: string;
  /** How the 2 content blocks arrange — different per idea, not just different text. */
  layout: MockLayout;
  blocks: readonly MockBlock[];
}

export const IDEA_TEMPLATES: Record<IdeaId, IdeaTemplate> = {
  "onlayn-dokon": {
    id: "onlayn-dokon",
    promptLine: "Onlayn do'kon quramiz...",
    siteName: "Do'kon",
    layout: "grid",
    blocks: [
      { kind: "header", shape: "square", text: "Do'kon" },
      { kind: "hero", shape: "diamond", text: "Yangi kolleksiya" },
      { kind: "content", shape: "square", text: "Mahsulot 1" },
      { kind: "content", shape: "square", text: "Mahsulot 2" },
      { kind: "cta", shape: "diamond", text: "Xarid qilish" },
    ],
  },
  "kurs-sayti": {
    id: "kurs-sayti",
    promptLine: "Kurs saytini yig'amiz...",
    siteName: "Kurs",
    layout: "stack",
    blocks: [
      { kind: "header", shape: "square", text: "Kurs" },
      { kind: "hero", shape: "diamond", text: "Video darslar" },
      { kind: "content", shape: "square", text: "Dastur" },
      { kind: "content", shape: "square", text: "Sharhlar" },
      { kind: "cta", shape: "diamond", text: "Ro'yhatdan o'tish" },
    ],
  },
  "telegram-bot": {
    id: "telegram-bot",
    promptLine: "Telegram bot yozamiz...",
    siteName: "Bot",
    layout: "chat",
    blocks: [
      { kind: "header", shape: "square", text: "Bot" },
      { kind: "hero", shape: "diamond", text: "Darrov javob beradi" },
      { kind: "content", shape: "square", text: "Buyurtmalar" },
      { kind: "content", shape: "square", text: "Yordam" },
      { kind: "cta", shape: "diamond", text: "Botni ishga tushirish" },
    ],
  },
  sayt: {
    id: "sayt",
    promptLine: "Sayt tayyorlaymiz...",
    siteName: "Sayt",
    layout: "grid",
    blocks: [
      { kind: "header", shape: "square", text: "Sayt" },
      { kind: "hero", shape: "diamond", text: "Sizning g'oyangiz" },
      { kind: "content", shape: "square", text: "Bo'lim 1" },
      { kind: "content", shape: "square", text: "Bo'lim 2" },
      { kind: "cta", shape: "diamond", text: "Boshlash" },
    ],
  },
};

/** keyword -> idea; lower-case, no punctuation, matched by substring. */
const KEYWORD_MAP: ReadonlyArray<readonly [IdeaId, readonly string[]]> = [
  ["onlayn-dokon", ["dokon", "do'kon", "magazin", "sotuv", "market", "shop", "mahsulot"]],
  ["kurs-sayti", ["kurs", "dars", "ta'lim", "talim", "o'quv", "oquv", "maktab", "kursi"]],
  ["telegram-bot", ["bot", "telegram", "chatbot", "chat"]],
];

/** Strip apostrophe variants + punctuation so keyword matching is forgiving. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʻʼ']/g, "'")
    .replace(/[^a-z0-9' ]/gi, " ")
    .trim();
}

/**
 * Resolves a free-typed idea to the closest of the 3 templates by keyword,
 * else the generic "sayt" fallback. Never throws, never empty on empty input.
 */
export function matchIdeaFromText(text: string): IdeaId {
  const normalized = normalize(text);
  if (!normalized) return "sayt";
  for (const [ideaId, keywords] of KEYWORD_MAP) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return ideaId;
  }
  return "sayt";
}

export const IDEA_TEXT_MAX_LENGTH = 60;

/** Clamp free-typed input to the max length the terminal input accepts. */
export function clampIdeaText(text: string): string {
  return text.slice(0, IDEA_TEXT_MAX_LENGTH);
}

export function templateFor(id: IdeaId): IdeaTemplate {
  return IDEA_TEMPLATES[id];
}

export function labelFor(id: IdeaId): string {
  const chip = IDEA_CHIPS.find((c) => c.id === id);
  return chip?.label ?? IDEA_TEMPLATES[id].siteName;
}
