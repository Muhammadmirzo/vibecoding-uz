import { db } from "../index";
import { faqs } from "../schema";
import { FAQS_DATA } from "./data/content";

export async function seedFaqs(): Promise<void> {
  console.log("9/10 FAQs seeding...");
  for (const faq of FAQS_DATA) {
    await db.insert(faqs).values(faq).onConflictDoNothing();
  }
}
