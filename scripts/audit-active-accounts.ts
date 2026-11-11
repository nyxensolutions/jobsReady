/** READ-ONLY. Who can sign in today, by what method, and what they own. */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

async function main() {
  const fb = new Map<string, string>()
  const lastSeen = new Map<string, string>()
  let page: string | undefined
  do {
    const p = await adminAuth.listUsers(1000, page)
    for (const u of p.users) {
      fb.set(u.uid, u.providerData.map((x) => x.providerId).join("+") || "none")
      lastSeen.set(u.uid, u.metadata.lastSignInTime?.slice(5, 16) ?? "never")
    }
    page = p.pageToken
  } while (page)

  console.log("════════ EMPLOYERS ════════")
  const employers = await prisma.employerProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      companyName: true, status: true, contactPhone: true,
      user: { select: { id: true, phone: true, email: true, emailVerified: true, isAdmin: true } },
      _count: { select: { jobListings: true } },
    },
  })
  for (const e of employers) {
    const prov = fb.get(e.user.id) ?? "NOT IN FIREBASE"
    console.log(
      `${e.companyName.slice(0, 28).padEnd(30)} ${e.status.padEnd(9)} ${prov.padEnd(12)} ` +
      `jobs=${String(e._count.jobListings).padEnd(4)} last=${(lastSeen.get(e.user.id) ?? "-").padEnd(13)}` +
      `${e.user.isAdmin ? " ADMIN" : ""}`
    )
    console.log(`${" ".repeat(30)} signs in as: ${e.user.phone ?? e.user.email ?? "(no identity)"}`)
  }

  console.log("\n════════ SEEKERS with activity ════════")
  const seekers = await prisma.seekerProfile.findMany({
    select: {
      name: true, city: true,
      user: { select: { id: true, phone: true, email: true } },
      _count: { select: { applications: true } },
    },
  })
  const active = seekers.filter((s) => s._count.applications > 0)
  for (const s of active) {
    console.log(
      `${s.name.slice(0, 24).padEnd(26)} apps=${String(s._count.applications).padEnd(3)} ` +
      `${(fb.get(s.user.id) ?? "NOT IN FIREBASE").padEnd(12)} ${s.user.phone ?? s.user.email}`
    )
  }
  console.log(`\nseekers with 0 applications: ${seekers.length - active.length} of ${seekers.length}`)

  const byProv = new Map<string, number>()
  for (const p of fb.values()) byProv.set(p, (byProv.get(p) ?? 0) + 1)
  console.log("\n════════ sign-in methods in use ════════")
  for (const [p, n] of [...byProv].sort((a, b) => b[1] - a[1])) console.log(`  ${p.padEnd(14)} ${n}`)

}
main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
