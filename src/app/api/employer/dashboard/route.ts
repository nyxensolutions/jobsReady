import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/subscription"

/**
 * Headline counters for the employer dashboard, mirroring what the web
 * dashboard computes inline in its server component so the mobile app shows
 * the same numbers.
 */
export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employers only" }, { status: 403 })
  }
  if (!employer) {
    // The app routes to registration on this specific signal.
    return NextResponse.json({ error: "REGISTRATION_REQUIRED" }, { status: 403 })
  }

  const [jobs, newApplications, limits] = await Promise.all([
    prisma.jobListing.findMany({
      where: { employerId: employer.id, status: { not: "DRAFT" } },
      select: { status: true, viewCount: true, _count: { select: { applications: true } } },
    }),
    prisma.application.count({
      where: { job: { employerId: employer.id }, status: "APPLIED" },
    }),
    getPlanLimits(employer.id),
  ])

  const draftCount = await prisma.jobListing.count({
    where: { employerId: employer.id, status: "DRAFT" },
  })

  return NextResponse.json({
    company: {
      name: employer.companyName,
      contactPerson: employer.contactPerson,
      logoUrl: employer.logoUrl,
      status: employer.status,
    },
    stats: {
      live: jobs.filter((j) => j.status === "ACTIVE").length,
      underReview: jobs.filter((j) => j.status === "PENDING_REVIEW").length,
      paused: jobs.filter((j) => j.status === "PAUSED").length,
      drafts: draftCount,
      totalJobs: jobs.length,
      applications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
      newApplications,
      views: jobs.reduce((sum, j) => sum + j.viewCount, 0),
    },
    plan: {
      activeJobLimit: limits.activeJobLimit,
      unlocksLeft: limits.unlocksLeft,
      boostsLeft: limits.boostsLeft,
      isHighReach: limits.isHighReach,
      planName: limits.sub?.plan.name ?? null,
      expiresAt: limits.sub?.expiresAt ?? null,
    },
  })
}
