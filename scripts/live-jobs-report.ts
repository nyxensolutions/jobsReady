/**
 * Read-only snapshot of what we could actually put on a social job card today:
 * active listings, split by source and employer verification, Delhi NCR first.
 *
 * npx tsx scripts/live-jobs-report.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { salaryRangeError } from "../src/lib/salary"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const bySource = await prisma.jobListing.groupBy({
    by: ["status", "source"],
    _count: { _all: true },
  })
  console.log("\n=== Listings by status × source ===")
  for (const row of bySource) {
    console.log(`${row.status.padEnd(16)} ${row.source.padEnd(12)} ${row._count._all}`)
  }

  const topCities = await prisma.jobListing.groupBy({
    by: ["cityId"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
    orderBy: { _count: { cityId: "desc" } },
    take: 10,
  })
  const cities = await prisma.city.findMany({
    where: { id: { in: topCities.map(c => c.cityId) } },
    select: { id: true, name: true },
  })
  console.log("\n=== Active jobs by city (top 10) ===")
  for (const row of topCities) {
    const name = cities.find(c => c.id === row.cityId)?.name ?? row.cityId
    console.log(`${name.padEnd(20)} ${row._count._all}`)
  }

  const postable = await prisma.jobListing.findMany({
    where: {
      status: "ACTIVE",
      source: "EMPLOYER",
      employer: { status: "VERIFIED" },
      salaryMin: { not: null },
    },
    select: {
      title: true,
      salaryMin: true,
      salaryMax: true,
      pincode: true,
      shiftType: true,
      publishedAt: true,
      expiresAt: true,
      city: { select: { name: true } },
      category: { select: { nameEn: true, nameHi: true } },
      employer: { select: { companyName: true, city: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 15,
  })

  console.log(`\n=== Card-ready jobs (ACTIVE + EMPLOYER-posted + VERIFIED employer + salary set): ${postable.length} ===`)
  console.log("The last column is why /api/social/feed would drop the row, if it would.\n")
  for (const j of postable) {
    const salary = j.salaryMax ? `₹${j.salaryMin}–${j.salaryMax}` : `₹${j.salaryMin}`
    const reasons = [
      salaryRangeError(j.salaryMin, j.salaryMax) ? "bad salary range" : null,
      j.expiresAt && j.expiresAt < new Date()
        ? `expired ${j.expiresAt.toISOString().slice(0, 10)}`
        : null,
    ].filter(Boolean)
    console.log(
      `${j.title.slice(0, 32).padEnd(34)} ${salary.padEnd(16)} ${(j.city?.name ?? "?").padEnd(14)} ` +
      `${(j.pincode ?? "-").padEnd(8)} ${(j.category?.nameHi ?? "").padEnd(18)} ` +
      `${reasons.length ? "DROPPED: " + reasons.join(", ") : "ok"}`
    )
  }
}

main()
  .catch(e => { console.error(e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
