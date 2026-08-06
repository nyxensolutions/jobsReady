import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getActiveSub } from "@/lib/subscription"
import PlansClient from "./PlansClient"

export default async function PlansPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.uid },
  })
  if (!employer) redirect("/employer/register")

  const [plans, activeSub, activeJobCount] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActiveSub(employer.id),
    prisma.jobListing.count({ where: { employerId: employer.id, status: "ACTIVE" } }),
  ])

  return (
    <PlansClient
      plans={plans}
      activeSub={activeSub ? {
        id: activeSub.id,
        planName: activeSub.plan.name,
        planSlug: activeSub.plan.slug,
        status: activeSub.status,
        expiresAt: activeSub.expiresAt.toISOString(),
        candidateUnlocksUsed: activeSub.candidateUnlocksUsed,
        boostsUsed: activeSub.boostsUsed,
        activeJobLimit: activeSub.plan.activeJobLimit,
        candidateUnlockCredits: activeSub.plan.candidateUnlockCredits,
        boostCredits: activeSub.plan.boostCredits,
      } : null}
      activeJobCount={activeJobCount}
      razorpayKeyId={process.env.RAZORPAY_KEY_ID ?? ""}
    />
  )
}
