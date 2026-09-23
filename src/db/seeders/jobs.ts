import { db } from "../index";
import { jobOpenings } from "../schema";
import { JOBS_DATA } from "./data/content";

export async function seedJobs(): Promise<void> {
  console.log("10/10 Job Openings seeding...");
  for (const job of JOBS_DATA) {
    await db.insert(jobOpenings).values(job).onConflictDoNothing();
  }
}
