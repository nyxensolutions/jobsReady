/**
 * One-off: set isProfileComplete on seekers created before the profile route
 * started deriving it. Uses the shared rule in src/lib/seekerProfile.ts so a
 * backfilled row matches what the next save would produce.
 *
 *   npx dotenv -e .env.local -- npx tsx scripts/backfill-seeker-profile-complete.ts [--apply]
 */
import { prisma } from "../src/lib/db"
import { isSeekerProfileComplete } from "../src/lib/seekerProfile"

const APPLY = process.argv.includes("--apply")

async function main() {
  const seekers = await prisma.seekerProfile.findMany({
    select: { id: true, name: true, city: true, preferredCategories: true, isProfileComplete: true },
    orderBy: { createdAt: "asc" },
  })

  const changes = seekers
    .map((s) => ({ s, should: isSeekerProfileComplete(s) }))
    .filter(({ s, should }) => s.isProfileComplete !== should)

  console.log(`seekers: ${seekers.length}`)
  console.log(`already correct: ${seekers.length - changes.length}`)
  console.log(`to change: ${changes.length}\n`)

  for (const { s, should } of changes) {
    console.log(
      `  ${s.isProfileComplete ? "true " : "false"} -> ${should ? "true " : "false"}  ` +
      `${(s.name ?? "-").slice(0, 22).padEnd(22)} city=${(s.city ?? "-").padEnd(12)} cats=${s.preferredCategories.length}`
    )
  }

  const complete = seekers.filter((s) => isSeekerProfileComplete(s)).length
  console.log(`\nafter backfill, complete would be: ${complete} of ${seekers.length}`)

  if (!APPLY) {
    console.log("\nDRY RUN. Nothing written. Re-run with --apply.")
    return
  }
  if (changes.length === 0) {
    console.log("\nNothing to do.")
    return
  }

  let n = 0
  for (const { s, should } of changes) {
    await prisma.seekerProfile.update({ where: { id: s.id }, data: { isProfileComplete: should } })
    n++
  }
  console.log(`\nUPDATED ${n} seeker profiles.`)
}

main().finally(() => prisma.$disconnect())
