import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/firebase/session"

// GET /api/jobs/[id] — job detail. Public (auth optional — when a seeker is
// authenticated, `isSaved` reflects their saved-jobs state). Mirrors the
// Prisma shape used by the web job detail page (src/app/[locale]/jobs/[id]/page.tsx).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: {
      employer: {
        select: { companyName: true, description: true, contactPhone: true, city: true, logoUrl: true },
      },
      category: { select: { slug: true, nameEn: true, nameHi: true, icon: true } },
      city: { select: { name: true, nameHi: true, stateName: true } },
    },
  })

  if (!job || job.status !== "ACTIVE") {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  // fire-and-forget — don't block the response
  prisma.jobListing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const isScraped = job.source === "SCRAPED"
  const callToHrPhone = job.callToHrEnabled && job.callToHrPhone ? job.callToHrPhone : null

  let isSaved = false
  let hasApplied = false
  try {
    const session = await getServerSession()
    if (session) {
      const seeker = await prisma.seekerProfile.findFirst({ where: { userId: session.uid }, select: { id: true } })
      if (seeker) {
        const [saved, application] = await Promise.all([
          prisma.savedJob.findUnique({ where: { seekerId_jobId: { seekerId: seeker.id, jobId: id } } }),
          prisma.application.findUnique({ where: { jobId_seekerId: { jobId: id, seekerId: seeker.id } } }),
        ])
        isSaved = !!saved
        hasApplied = !!application
      }
    }
  } catch {
    // non-fatal — default false
  }

  const similarJobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE", categoryId: job.categoryId, id: { not: id } },
    include: {
      employer: { select: { companyName: true } },
      city: { select: { name: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
  })

  return NextResponse.json({
    id: job.id,
    title: job.title,
    description: job.description,
    company: isScraped ? null : job.employer.companyName,
    employerDescription: isScraped ? null : job.employer.description,
    employerLogoUrl: isScraped ? null : job.employer.logoUrl,
    city: job.city,
    category: job.category,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryUnit: job.salaryUnit,
    jobType: job.jobType,
    vacancies: job.vacancies,
    experienceMin: job.experienceMin,
    qualificationRequired: job.qualificationRequired,
    requirements: job.requirements,
    perks: job.perks,
    languagesRequired: job.languagesRequired,
    pincode: job.pincode,
    isFeatured: job.isFeatured,
    isHighReach: job.isHighReach,
    callToHrPhone,
    createdAt: job.createdAt,
    expiresAt: job.expiresAt,
    isSaved,
    hasApplied,
    similarJobs: similarJobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.source === "SCRAPED" ? null : j.employer.companyName,
      city: j.city.name,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryUnit: j.salaryUnit,
      isFeatured: j.isFeatured,
    })),
  })
}
