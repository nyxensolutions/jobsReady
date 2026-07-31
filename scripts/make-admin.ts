import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
})

const INPUT = process.argv[2]

async function main() {
  if (!INPUT) {
    console.error("Usage: npx tsx scripts/make-admin.ts +91XXXXXXXXXX")
    process.exit(1)
  }

  const isPhone = INPUT.startsWith("+") || /^\d{10,}$/.test(INPUT)
  const where = isPhone ? { phone: INPUT } : { email: INPUT }

  const user = await prisma.user.updateMany({
    where,
    data: { role: "ADMIN" },
  })

  if (user.count === 0) {
    // Show all users to help diagnose
    const all = await prisma.user.findMany({ select: { phone: true, email: true, role: true } })
    console.error(`No user found for: ${INPUT}`)
    console.error("Users in DB:")
    all.forEach(u => console.error(`  phone=${u.phone ?? "—"}  email=${u.email ?? "—"}  role=${u.role}`))
    console.error("\nLog in via the app first, then re-run this script.")
    process.exit(1)
  }

  console.log(`✓ ${INPUT} is now ADMIN`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
