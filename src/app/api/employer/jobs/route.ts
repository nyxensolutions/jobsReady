import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

/**
 * The employer's own job listings.
 *
 * The web dashboard renders this straight from Prisma in a server component;
 * the mobile app needs the same data over HTTP, so this exposes it as JSON.
 *
 * Query params:
 *   status  - optional JobStatus filter (e.g. ACTIVE). Drafts are excluded by
 *             default to match the dashboard, and included with status=DRAFT.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employers only" }, { status: 403 })
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Complete employer registration first" }, { status: 403 })

  const status = req.nextUrl.searchParams.get("status")?.trim()

  const jobs = await prisma.jobListing.findMany({
    where: {
      employerId: employer.id,
      ...(status ? { status: status as never } : { status: { not: "DRAFT" } }),
    },
    include: {
      category: { select: { nameEn: true, slug: true } },
      city: { select: { name: true, slug: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryUnit: job.salaryUnit,
      vacancies: job.vacancies,
      isFeatured: job.isFeatured,
      isHighReach: job.isHighReach,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      category: job.category,
      city: job.city,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
    }))
  )
}
