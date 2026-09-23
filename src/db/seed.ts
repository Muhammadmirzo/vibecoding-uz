import { runSeeders } from "./seeders";

runSeeders().catch((error: unknown) => {
  console.error("❌ Seeding error:", error);
  process.exit(1);
});
