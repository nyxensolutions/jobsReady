/**
 * Cron-ready scraper entry point.
 * Run with: npx tsx scripts/run-scraper.ts
 *
 * What it does:
 *   1. Upserts Delhi NCR cities into the DB
 *   2. Creates (or finds) the "Job Ready Scraped Jobs" scraper-bot employer
 *   3. Runs the NCS API scraper
 *   4. Runs the structured JSON-LD scraper (for manually-listed URLs)
 *   5. Prints a summary
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { scrapeNcs } from "./scrape-ncs"
import { scrapeStructured } from "./scrape-structured"
import { scrapeAdzuna } from "./scrape-adzuna"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Delhi NCR cities not present in the initial seed
const DELHI_NCR_CITIES = [
  { name: "Delhi", nameHi: "दिल्ली", slug: "delhi", stateCode: "DL", stateName: "Delhi" },
  { name: "Noida", nameHi: "नोएडा", slug: "noida", stateCode: "UP", stateName: "Uttar Pradesh" },
  { name: "Gurgaon", nameHi: "गुड़गांव", slug: "gurgaon", stateCode: "HR", stateName: "Haryana" },
  { name: "Faridabad", nameHi: "फरीदाबाद", slug: "faridabad", stateCode: "HR", stateName: "Haryana" },
  { name: "Ghaziabad", nameHi: "गाजियाबाद", slug: "ghaziabad", stateCode: "UP", stateName: "Uttar Pradesh" },
  { name: "Meerut", nameHi: "मेरठ", slug: "meerut", stateCode: "UP", stateName: "Uttar Pradesh" },
  { name: "Hapur", nameHi: "हापुड़", slug: "hapur", stateCode: "UP", stateName: "Uttar Pradesh" },
  { name: "Greater Noida", nameHi: "ग्रेटर नोएडा", slug: "greater-noida", stateCode: "UP", stateName: "Uttar Pradesh" },
]

const SCRAPER_BOT_EMAIL = "scraper-bot@jobsready.internal"
const SCRAPER_BOT_COMPANY = "Job Ready Scraped Jobs"

async function upsertDelhiNcrCities() {
  console.log("Setting up Delhi NCR cities…")
  for (const city of DELHI_NCR_CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      create: city,
      update: { name: city.name, nameHi: city.nameHi, stateCode: city.stateCode, stateName: city.stateName },
    })
  }
  console.log(`  ✓ ${DELHI_NCR_CITIES.length} cities upserted`)
}

async function getOrCreateScraperEmployer(): Promise<string> {
  // Check if employer already exists
  const existing = await prisma.employerProfile.findFirst({
    where: { companyName: SCRAPER_BOT_COMPANY },
    select: { id: true },
  })
  if (existing) return existing.id

  console.log("Creating scraper-bot employer…")

  // Create the bot user
  const user = await prisma.user.upsert({
    where: { email: SCRAPER_BOT_EMAIL },
    create: {
      email: SCRAPER_BOT_EMAIL,
      role: "EMPLOYER",
      locale: "en",
    },
    update: {},
  })

  // Create employer profile
  const employer = await prisma.employerProfile.create({
    data: {
      userId: user.id,
      companyName: SCRAPER_BOT_COMPANY,
      status: "VERIFIED",
      description: "Automated scraper account — jobs listed here are sourced from public job portals and are pending admin review.",
    },
  })

  console.log(`  ✓ Scraper employer created: ${employer.id}`)
  return employer.id
}

async function main() {
  const startTime = Date.now()
  console.log(`\n${"=".repeat(60)}`)
  console.log(`JobsReady Scraper  —  ${new Date().toISOString()}`)
  console.log("=".repeat(60))

  // Check required env vars
  const missingEnv: string[] = []
  if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) missingEnv.push("DIRECT_URL or DATABASE_URL")
  if (missingEnv.length) {
    console.error(`\nMissing required environment variables:\n  ${missingEnv.join("\n  ")}`)
    console.error("Add them to .env.local and try again.")
    process.exit(1)
  }

  // Setup
  await upsertDelhiNcrCities()
  const employerId = await getOrCreateScraperEmployer()

  const summary: Record<string, { inserted: number; skipped: number; errors: number }> = {}

  // Run NCS scraper
  console.log("\n── NCS API Scraper ──────────────────────────────────────")
  summary.ncs = await scrapeNcs(employerId)
  console.log(`  NCS: ${summary.ncs.inserted} inserted, ${summary.ncs.skipped} skipped, ${summary.ncs.errors} errors`)

  // Run structured JSON-LD scraper
  console.log("\n── Structured JSON-LD Scraper ───────────────────────────")
  summary.structured = await scrapeStructured(employerId)
  console.log(`  Structured: ${summary.structured.inserted} inserted, ${summary.structured.skipped} skipped, ${summary.structured.errors} errors`)

  // Run Adzuna scraper
  console.log("\n── Adzuna Jobs Scraper ──────────────────────────────────")
  summary.adzuna = await scrapeAdzuna(employerId)
  console.log(`  Adzuna: ${summary.adzuna.inserted} inserted, ${summary.adzuna.skipped} skipped, ${summary.adzuna.errors} errors`)

  // Print totals
  const totals = Object.values(summary).reduce(
    (acc, s) => ({ inserted: acc.inserted + s.inserted, skipped: acc.skipped + s.skipped, errors: acc.errors + s.errors }),
    { inserted: 0, skipped: 0, errors: 0 },
  )
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n${"=".repeat(60)}`)
  console.log(`TOTAL  inserted=${totals.inserted}  skipped=${totals.skipped}  errors=${totals.errors}  time=${elapsed}s`)
  console.log("=".repeat(60))
  console.log("Jobs inserted with status=PENDING_REVIEW — review them in the admin panel.\n")
}

main()
  .catch((err) => {
    console.error("\nFatal scraper error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
