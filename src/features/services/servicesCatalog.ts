import { z } from "zod";
import { servicesCatalogSchema } from "./serviceSchemas";

export { serviceOfferSchema, servicesCatalogSchema } from "./serviceSchemas";
export type { ServiceOffer, ServicesCatalog } from "./serviceSchemas";

// XIZMATLAR — boshlang'ich narxlar. Haqiqiy taklif mijoz vazifasi bo'yicha aniqlashtiriladi.
export const servicesCatalog: z.infer<typeof servicesCatalogSchema> = servicesCatalogSchema.parse({
  offers: [
    {
      id: "ai-avtomatlashtirish",
      title: "AI avtomatlashtirish",
      summary: "Takrorlanuvchi vazifalarni AI yordamida kamaytirish va ish jarayonini soddalashtirish.",
      priceRange: { min: 800_000, max: 3_000_000 },
      deliverables: [
        "Vazifangiz va joriy ish jarayoni tahlili",
        "AI yordamida yechiladigan bir jarayon prototipi",
        "Ishlatish bo'yicha qisqa qo'llanma",
      ],
      timeline: "5–10 kun",
      suitableFor: ["Qo'lda bajariladigan takroriy vazifalari bor kichik jamoa"],
      notSuitableFor: ["Natijani oldindan aniq bashorat qilishni xohlaydi"],
      excluded: ["Bulutli xizmatlar uchun doimiy to'lov", "Ma'lumotlarni tozalash va kiritish ishi"],
    },
    {
      id: "telegram-bot",
      title: "Telegram bot",
      summary: "Mijozlar yoki jamoa uchun odatiy savol-javob va boshqaruv botini yaratish.",
      priceRange: { min: 1_200_000, max: 4_000_000 },
      deliverables: [
        "Bot uchun botFather orqali yaratilgan Telegram akkaunti",
        "Asosiy funksiyalar va admin paneli",
        "Sinovdan o'tgan bot va qo'llanma",
      ],
      timeline: "7–14 kun",
      suitableFor: ["Buyurtma, ariza yoki savol-javobni Telegramda qabul qiluvchi biznes"],
      notSuitableFor: ["Telegramdan tashqaridagi barcha jarayonlarni majburan boshqaruvchi"],
      excluded: ["To'lov tizimi infratuzilmasi", "24/7 texnik xizmat"],
    },
    {
      id: "mvp-qurish",
      title: "MVP qurish",
      summary: "Fikrni tekshirish uchun kichik web ilova: asosiy funksiyalar, to'lov va foydalanuvchi oqimi.",
      priceRange: { min: 2_500_000, max: 8_000_000 },
      deliverables: [
        "Talablar va ekranlar ro'yxati",
        "Ishlaydigan web MVP va asosiy funksiyalar",
        "Test natijalari va ishga tushirish qo'llanmasi",
      ],
      timeline: "14–30 kun",
      suitableFor: ["Birinchi versiyani real foydalanuvchilarga ko'rsatishni xohlaydi"],
      notSuitableFor: ["To'liq korporativ tizim yoki katta mobil ilova"],
      excluded: ["Uzoq muddatli texnik xizmat", "Marketing va foydalanuvchini jalb qilish"],
    },
  ],
});
