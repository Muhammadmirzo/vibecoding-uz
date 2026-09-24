import { db } from "../index";
import { userProfiles, users } from "../schema";
import { SEEDED_USERS_DATA } from "./data/users";
import type { SeedContext } from "./types";

export async function seedUsers(context: SeedContext): Promise<void> {
  console.log("1/10 Users & User Profiles seeding...");
  for (const user of SEEDED_USERS_DATA) {
    const [inserted] = await db
      .insert(users)
      .values({
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tgUsername: user.tgUsername,
        locale: "uz",
        lastLoginAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      await db
        .insert(userProfiles)
        .values({
          userId: inserted.id,
          city: "Toshkent",
          profession: user.role === "student" ? "Startapchi / Tadbirkor" : "AI Injiniring Mutaxassisi",
          goal: "AI yordamida tezkor mahsulotlar qurish va biznesni avtomatlashtirish",
          source: "Telegram Mini App",
          bio: `${user.fullName} Naqsh jamiyatining faol a'zosi.`,
        })
        .onConflictDoNothing();
    }
  }

  const allUsers = await db.select().from(users);
  context.adminUser = allUsers.find((user) => user.role === "superadmin") || allUsers[0];
  context.mentorUser = allUsers.find((user) => user.role === "mentor") || allUsers[0];
  context.studentUsers = allUsers.filter((user) => user.role === "student");
}
