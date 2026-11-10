/** READ-ONLY. The HDFC Bank employer record and who the admins are. */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

async function main() {
  const e = await prisma.employerProfile.findFirst({
    where: { companyName: { contains: "HDFC", mode: "insensitive" } },
    include: {
      user: { select: { id: true, phone: true, email: true, emailVerified: true, createdAt: true } },
      jobListings: { select: { title: true, status: true, createdAt: true } },
      subscriptions: { select: { planId: true, status: true } },
    },
  })

  if (!e) { console.log("no HDFC employer found") }
  else {
    console.log("=== HDFC employer ===")
    console.log(`company      ${e.companyName}`)
    console.log(`status       ${e.status}`)
    console.log(`contact      ${e.contactPerson} / ${e.contactPhone}`)
    console.log(`city         ${e.city}   industry: ${e.industry}`)
    console.log(`gst/cin      ${e.gstCin ?? "-"}`)
    console.log(`website      ${e.website ?? "-"}`)
    console.log(`created      ${e.createdAt.toISOString()}`)
    console.log(`user phone   ${e.user.phone ?? "-"}  email ${e.user.email ?? "-"} (verified=${e.user.emailVerified})`)
    const fb = await adminAuth.getUser(e.user.id).catch(() => null)
    console.log(`providers    ${fb?.providerData.map(p => p.providerId).join("+") ?? "NOT IN FIREBASE"}`)
    console.log(`signed up    ${fb?.metadata.creationTime ?? "?"}`)
    console.log(`last sign-in ${fb?.metadata.lastSignInTime ?? "?"}`)
    console.log(`jobs         ${e.jobListings.length}`)
    for (const j of e.jobListings) console.log(`   "${j.title}" [${j.status}] ${j.createdAt.toISOString().slice(0,10)}`)
    const unlocks = await prisma.candidateUnlock.count({ where: { employerId: e.id } })
    console.log(`contacts unlocked by them: ${unlocks}`)
  }

  console.log("\n=== admins ===")
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true, phone: true, role: true, createdAt: true },
  })
  for (const a of admins) {
    const fb = await adminAuth.getUser(a.id).catch(() => null)
    console.log(
      `${(a.email ?? a.phone ?? "(none)").padEnd(30)} role=${String(a.role).padEnd(8)} ` +
      `${fb?.providerData.map(p => p.providerId).join("+") ?? "NOT IN FIREBASE"}  since ${a.createdAt.toISOString().slice(0,10)}`
    )
  }

  console.log("\n=== all VERIFIED employers, newest first ===")
  const all = await prisma.employerProfile.findMany({
    where: { status: "VERIFIED" },
    orderBy: { createdAt: "desc" },
    select: { companyName: true, gstCin: true, createdAt: true, updatedAt: true },
  })
  for (const p of all) {
    console.log(`${p.companyName.slice(0,28).padEnd(30)} gst=${(p.gstCin ?? "-").padEnd(18)} created ${p.createdAt.toISOString().slice(0,10)}  updated ${p.updatedAt.toISOString().slice(0,10)}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
