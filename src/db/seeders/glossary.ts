import { db } from "../index";
import { glossaryTerms } from "../schema";
import { createGlossaryTerms } from "./data/glossary";

export async function seedGlossary(): Promise<void> {
  console.log("6/10 Glossary Terms seeding...");
  for (const term of createGlossaryTerms()) {
    await db.insert(glossaryTerms).values(term).onConflictDoNothing();
  }
}
