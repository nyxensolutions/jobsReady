/** READ-ONLY. What a visitor sees now that the test employers are gone. */
import { prisma } from "../src/lib/db"
async function main() {
  const byStatus = await prisma.jobListing.groupBy({ by: ["status"], _count: true })
  console.log("job listings by status:")
  for (const s of byStatus) console.log(`  ${String(s.status).padEnd(12)} ${s._count}`)

  const active = await prisma.jobListing.findMany({
    where: { status: "ACTIVE" },
    select: { title: true, source: true, employer: { select: { companyName: true } } },
    take: 20,
  })
  console.log(`\nactive listings (${active.length} shown):`)
  for (const j of active) {
    console.log(`  ${j.title.slice(0, 34).padEnd(36)} ${j.employer?.companyName ?? "-"}  src=${j.source ?? "-"}`)
  }
  console.log(`\napplications remaining: ${await prisma.application.count()}`)
  console.log(`admins remaining: ${await prisma.user.count({ where: { isAdmin: true } })}`)
}
main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
