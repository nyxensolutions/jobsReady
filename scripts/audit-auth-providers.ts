/**
 * READ-ONLY. Lists which Firebase provider each account actually signed up
 * with, and whether a Postgres profile hangs off it. Answers how many people
 * an Apple-sign-in linking flow would have to cover.
 */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

async function main() {
  const byProvider = new Map<string, number>()
  const emails = new Map<string, string[]>() // email -> uids, to spot collisions
  let total = 0
  let pageToken: string | undefined

  do {
    const page = await adminAuth.listUsers(1000, pageToken)
    for (const u of page.users) {
      total++
      const providers = u.providerData.map((p) => p.providerId).sort().join("+") || "none"
      byProvider.set(providers, (byProvider.get(providers) ?? 0) + 1)
      const email = u.email?.toLowerCase()
      if (email) emails.set(email, [...(emails.get(email) ?? []), u.uid])
    }
    pageToken = page.pageToken
  } while (pageToken)

  console.log(`firebase accounts: ${total}`)
  for (const [p, n] of [...byProvider].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${p.padEnd(32)} ${n}`)
  }

  const collisions = [...emails].filter(([, uids]) => uids.length > 1)
  console.log(`\nemails already on more than one firebase account: ${collisions.length}`)

  // Which of these have real data that a relink would have to carry over.
  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
    select: { id: true, email: true, phone: true, employerProfile: { select: { companyName: true, status: true } } },
  })
  console.log(`\npostgres employers: ${employers.length}`)
  for (const e of employers) {
    const fb = await adminAuth.getUser(e.id).catch(() => null)
    const providers = fb?.providerData.map((p) => p.providerId).join("+") ?? "NOT IN FIREBASE"
    console.log(
      `  ${(e.employerProfile?.companyName ?? "(no profile)").slice(0, 26).padEnd(28)}` +
        `${(e.employerProfile?.status ?? "-").padEnd(10)} ${providers}`
    )
  }

  const seekers = await prisma.user.count({ where: { role: "SEEKER" } })
  console.log(`\npostgres seekers: ${seekers}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
