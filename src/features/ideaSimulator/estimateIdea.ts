import {
  categoryLabels,
  excludedCosts,
  ideaPresets,
  type IdeaCategory,
  type IdeaComplexity,
  type IdeaPlan,
  type Range,
} from "./ideaPresets";

export type IdeaEstimate = {
  idea: string;
  category: IdeaCategory;
  categoryLabel: string;
  tools: string[];
  roadmap: string[];
  dayRange: Range;
  costRange: Range;
  complexity: IdeaComplexity;
  rule: string;
  assumptions: string[];
  excludedCosts: readonly string[];
  matched: boolean;
};

const keywordGroups: ReadonlyArray<{
  category: Exclude<IdeaCategory, "boshqa">;
  keywords: readonly string[];
}> = [
  {
    category: "bot-telegram",
    keywords: ["bot", "telegram", "telefon", "tg bot", "chatbot"],
  },
  {
    category: "crm-service",
    keywords: ["crm", "salon", "klinika", "o'quv", "oquv", "kurs", "xizmat"],
  },
  {
    category: "content-social",
    keywords: [
      "content",
      "kontent",
      "social",
      "ijtimoiy",
      "instagram",
      "youtube",
      "smm",
      "post",
      "video",
    ],
  },
  {
    category: "catalog-shop",
    keywords: [
      "catalog",
      "katalog",
      "shop",
      "do'kon",
      "dokon",
      "e-commerce",
      "ecommerce",
      "magazin",
      "misol",
    ],
  },
];

const unmatchedRange: Range = { min: 14, max: 35 };
const unmatchedCostRange: Range = { min: 3_000_000, max: 12_000_000 };

const commonAssumptions = [
  "MVP ko'lami va bir kishilik ishlash rejimi",
  "Tayyor autentifikatsiya va asosiy vizual yechim",
  "Bitta sinov muhiti va cheklangan qo'llab-quvvatlash",
];

export function findIdeaCategory(input: string): IdeaCategory {
  const normalized = input.toLocaleLowerCase("uz-UZ");

  for (const group of keywordGroups) {
    if (group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group.category;
    }
  }

  return "boshqa";
}

function getPreset(category: Exclude<IdeaCategory, "boshqa">): IdeaPlan {
  const preset = ideaPresets.find((item) => item.category === category);

  if (!preset) {
    throw new Error(`Idea preset topilmadi: ${category}`);
  }

  return preset;
}

function buildEstimate(
  idea: string,
  category: IdeaCategory,
  source: IdeaPlan | null,
): IdeaEstimate {
  if (category === "boshqa" || !source) {
    return {
      idea,
      category,
      categoryLabel: categoryLabels[category],
      tools: ["Next.js", "Supabase", "Deployment", "Tashqi xizmatlar"],
      roadmap: [
        "Talablar va foydalanuvchi oqimini aniqlashtirish",
        "Asosiy funksiyalarni vertikal MVP sifatida qurish",
        "Ma'lumotlar va autentifikatsiyani ulash",
        "Test, foydalanish va sinovdan o'tkazish",
      ],
      dayRange: unmatchedRange,
      costRange: unmatchedCostRange,
      complexity: "advanced",
      rule:
        "Kalit so'z topilmadi: murakkablik uchun keng 14–35 kunlik va 3–12 mln so'mlik oraliq ish jarayoni diapazoni qo'llandi.",
      assumptions: [
        ...commonAssumptions,
        "Aniq funksiyalar hali belgilanmagan",
        "To'lov, autentifikatsiya va kamida bitta tashqi integratsiya kerak deb hisoblandi",
      ],
      excludedCosts,
      matched: false,
    };
  }

  return {
    idea,
    category,
    categoryLabel: categoryLabels[category],
    tools: source.tools,
    roadmap: source.roadmap,
    dayRange: source.dayRange,
    costRange: source.costRange,
    complexity: source.complexity,
    rule: `“${categoryLabels[category]}” kategoriyasidagi shablon tanlandi: funksiya hajmi va tashqi integratsiyalar shu kategoriya diapazoniga bog'landi.`,
    assumptions: [
      ...commonAssumptions,
      source.category === "bot-telegram"
        ? "Bot uchun bitta asosiy foydalanuvchi oqimi va bitta til"
        : source.category === "crm-service"
          ? "CRM uchun mijoz, navbat va bitta admin roli"
          : source.category === "content-social"
            ? "Kontent uchun bitta platforma va oddiy nashr jadvali"
            : "Do'kon uchun katalog, savatcha va bitta to'lov ssenariysi",
    ],
    excludedCosts,
    matched: true,
  };
}

export function estimatePreset(presetId: string): IdeaEstimate {
  const preset = ideaPresets.find((item) => item.id === presetId);

  if (!preset) {
    throw new Error(`Idea preset topilmadi: ${presetId}`);
  }

  return buildEstimate(preset.label, preset.category, preset);
}

export function estimateCustomIdea(input: string): IdeaEstimate {
  const idea = input.trim();
  const category = findIdeaCategory(idea);
  const source = category === "boshqa" ? null : getPreset(category);
  return buildEstimate(idea, category, source);
}

export function formatUzsRange(range: Range): string {
  return `${new Intl.NumberFormat("uz-UZ").format(range.min)}–${new Intl.NumberFormat("uz-UZ").format(range.max)} so'm`;
}
