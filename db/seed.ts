import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });
loadDotenv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedLessonDemo } from "../content/seed/lesson-demo";

// Structural reference data (the 5 fixed exam tracks) plus, from Phase 1, a small
// hand-authored demo lesson (content/seed/lesson-demo.ts) so a fresh clone has something to
// actually run through the lesson runner. This is NOT the content pipeline (SPEC.md section
// 6.1, Phase 4) - real content generation is dealt with separately.
const TRACKS = [
  { code: "READING", title: "Reading" },
  { code: "USE_OF_ENGLISH", title: "Use of English" },
  { code: "LISTENING", title: "Listening" },
  { code: "WRITING", title: "Writing" },
  { code: "SPEAKING", title: "Speaking" },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the seed script");
  }
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  for (const track of TRACKS) {
    await prisma.track.upsert({
      where: { code: track.code },
      update: { title: track.title },
      create: track,
    });
  }

  console.log(`Seeded ${TRACKS.length} tracks.`);

  const demo = await seedLessonDemo(prisma);
  console.log(`Seeded demo lesson ${demo.lessonId} with ${demo.itemCount} items.`);

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
