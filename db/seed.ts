import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });
loadDotenv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seeds structural reference data only (the 5 fixed exam tracks), never generated content.
// Actual Units/Skills/Items are seeded per phase (see PLAN.md) or produced by the content
// pipeline (SPEC.md section 6.1).
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
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
