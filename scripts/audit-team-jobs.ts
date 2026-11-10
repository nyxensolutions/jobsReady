/** READ-ONLY. Jobs owned by the team/admin accounts, and their applications. */
import { prisma } from "../src/lib/db"

const TEAM_IDENTS = ["+919953452046", "nyxencloud@gmail.com", "jobsready26@gmail.com", "+919899983009"]

async function main() {
  const users = await prisma.user.findMany({
    where: { OR: [{ phone: { in: TEAM_IDENTS } }, { email: { in: TEAM_IDENTS } }] },
    select: {
      id: true, phone: true, email: true, role: true, isAdmin: true,
      employerProfile: {
        select: {
          id: true, companyName: true, status: true,
          jobListings: {
            select: {
              id: true, title: true, status: true, source: true, createdAt: true,
              _count: { select: { applications: true } },
            },
          },
        },
      },
    },
  })

  for (const u of users) {
    console.log(`\n${u.email ?? u.phone}  role=${u.role}${u.isAdmin ? " ADMIN" : ""}`)
    const p = u.employerProfile
    if (!p) { console.log("   no employer profile"); continue }
    console.log(`   employer: "${p.companyName}" [${p.status}]  jobs=${p.jobListings.length}`)
    for (const j of p.jobListings) {
      console.log(`      "${j.title}" [${j.status}] src=${j.source ?? "-"} ${j.createdAt.toISOString().slice(0,10)} applications=${j._count.applications}`)
    }
  }

  console.log("\n=== every non-scraped job in the system ===")
  const jobs = await prisma.jobListing.findMany({
    where: { source: { not: "SCRAPED" } },
    select: {
      title: true, status: true, source: true, createdAt: true,
      employer: { select: { companyName: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  if (jobs.length === 0) console.log("  (none)")
  for (const j of jobs) {
    console.log(`  "${j.title.slice(0,30)}" [${j.status}] by ${j.employer?.companyName ?? "-"} ${j.createdAt.toISOString().slice(0,10)} apps=${j._count.applications}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
