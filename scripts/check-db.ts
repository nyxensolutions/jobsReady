import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
})

async function main() {
  const [total, byCity, bySource, byStatus] = await Promise.all([
    prisma.jobListing.count(),
    prisma.jobListing.groupBy({ by: ["cityId"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.jobListing.groupBy({ by: ["source"], _count: { id: true } }),
    prisma.jobListing.groupBy({ by: ["status"], _count: { id: true } }),
  ])

  const cities = await prisma.city.findMany({ select: { id: true, name: true } })
  const cityMap = Object.fromEntries(cities.map((c) => [c.id, c.name]))

  console.log("\n── Job DB Summary ───────────────────────────────────")
  console.log(`Total jobs: ${total}`)

  console.log("\nBy status:")
  for (const r of byStatus) console.log(`  ${r.status}: ${r._count.id}`)

  console.log("\nBy source:")
  for (const r of bySource) console.log(`  ${r.source}: ${r._count.id}`)

  console.log("\nBy city:")
  for (const r of byCity) console.log(`  ${cityMap[r.cityId] ?? r.cityId}: ${r._count.id}`)

  console.log("─────────────────────────────────────────────────────\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
