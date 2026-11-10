/**
 * READ-ONLY. For each account proposed for deletion, everything that would
 * cascade away with it. Nothing is written or deleted.
 */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

const TARGETS = [
  "akhil.mittal20@gmail.com",
  "adarshg1204@gmail.com",
  "helloekta85@gmail.com",
  "prakashbackgroundd@gmail.com",
]

async function main() {
  for (const email of TARGETS) {
    const fb = await adminAuth.getUserByEmail(email).catch(() => null)
    console.log(`\n${"=".repeat(72)}\n${email}  uid=${fb?.uid ?? "NOT IN FIREBASE"}`)
    if (!fb) continue

    const u = await prisma.user.findUnique({
      where: { id: fb.uid },
      select: {
        isAdmin: true, role: true,
        employerProfile: {
          select: {
            id: true, companyName: true, status: true,
            jobListings: {
              select: {
                id: true, title: true, status: true, createdAt: true,
                applications: {
                  select: {
                    status: true,
                    seeker: { select: { id: true, name: true, user: { select: { phone: true, email: true } } } },
                  },
                },
              },
            },
            subscriptions: { select: { id: true, planId: true, status: true } },
          },
        },
      },
    })
    if (!u) { console.log("  no postgres row — firebase-only delete"); continue }

    console.log(`  role=${u.role}${u.isAdmin ? "  *** ADMIN ***" : ""}`)
    const p = u.employerProfile
    if (!p) { console.log("  no employer profile"); continue }
    console.log(`  company: ${p.companyName} [${p.status}]`)

    for (const s of p.subscriptions) {
      console.log(`  subscription ${s.planId} [${s.status}]`)
      const unlocks = await prisma.candidateUnlock.count({ where: { subscriptionId: s.id } })
      if (unlocks) console.log(`     ${unlocks} candidate unlock(s) would cascade`)
    }

    if (p.jobListings.length === 0) console.log("  no job listings")
    for (const j of p.jobListings) {
      console.log(
        `  JOB "${j.title}" status=${j.status} posted=${j.createdAt.toISOString().slice(0, 10)}` +
          `  applications=${j.applications.length}`
      )
      for (const a of j.applications) {
        const how = a.seeker.user?.phone ? `phone ${a.seeker.user.phone}` : `email ${a.seeker.user?.email ?? "-"}`
        console.log(`     - ${a.seeker.name} [${a.status}] via ${how}  <-- WOULD BE DESTROYED`)
      }
    }
  }

  const admins = await prisma.user.count({ where: { isAdmin: true } })
  console.log(`\n${"=".repeat(72)}\ntotal admin users in system: ${admins}`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
