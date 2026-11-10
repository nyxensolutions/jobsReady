/**
 * READ-ONLY. Every Firebase account whose only provider is Google, with the
 * Postgres data hanging off it, so a phone-only migration can be sized.
 */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

async function main() {
  const google: { uid: string; email: string | null; created: string; lastSignIn: string }[] = []
  let pageToken: string | undefined
  do {
    const page = await adminAuth.listUsers(1000, pageToken)
    for (const u of page.users) {
      const providers = u.providerData.map((p) => p.providerId)
      if (providers.length === 1 && providers[0] === "google.com") {
        google.push({
          uid: u.uid,
          email: u.email ?? null,
          created: u.metadata.creationTime?.slice(5, 16) ?? "?",
          lastSignIn: u.metadata.lastSignInTime?.slice(5, 16) ?? "never",
        })
      }
    }
    pageToken = page.pageToken
  } while (pageToken)

  google.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))
  console.log(`google-only firebase accounts: ${google.length}\n`)

  for (const g of google) {
    const u = await prisma.user.findUnique({
      where: { id: g.uid },
      select: {
        role: true, phone: true, isAdmin: true,
        employerProfile: {
          select: {
            companyName: true, status: true, contactPhone: true,
            _count: { select: { jobListings: true } },
          },
        },
        seekerProfile: { select: { name: true, _count: { select: { applications: true } } } },
      },
    })

    const prof = u?.employerProfile
    console.log(`${(g.email ?? "(no email)").padEnd(34)} ${g.created}  last:${g.lastSignIn}`)
    if (!u) { console.log(`   no postgres row\n`); continue }
    console.log(
      `   role=${u.role}${u.isAdmin ? " ADMIN" : ""}  postgres phone=${u.phone ?? "-"}`
    )
    if (prof) {
      console.log(
        `   employer: ${prof.companyName} [${prof.status}] jobs=${prof._count.jobListings} contactPhone=${prof.contactPhone ?? "-"}`
      )
    }
    if (u.seekerProfile) {
      console.log(`   seeker: ${u.seekerProfile.name} applications=${u.seekerProfile._count.applications}`)
    }
    if (!prof && !u.seekerProfile) console.log(`   no profile — abandoned registration`)
    console.log()
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
