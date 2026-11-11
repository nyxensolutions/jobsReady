import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { liveJobWhere } from "@/lib/jobListingQuery"
import {
  categoriesForSkills,
  hasUsableSignals,
  rankJobs,
  type SeekerSignals,
} from "@/lib/jobRecommendations"

/**
 * GET /api/jobs/recommended?limit=50
 *
 * The ranked head of the job list for the signed-in seeker. Callers show this
 * first and then the ordinary listing beneath it — nothing is removed from
 * that listing, so a seeker always reaches every live job either way.
 *
 * `personalised: false` comes back when the profile has nothing to rank on,
 * which is most profiles today: 1 seeker of 48 has a preferred category. The
 * caller should show its normal listing rather than a thin "recommended"
 * section that is really just the newest jobs wearing a label.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "50") || 50))

  const profile = await prisma.seekerProfile.findUnique({
    where: { userId: session.uid },
    select: {
      skills: true,
      preferredCategories: true,
      city: true,
      preferredCities: true,
      preferredJobTypes: true,
      experienceYears: true,
    },
  })
  if (!profile) return NextResponse.json({ error: "Seeker profile not found" }, { status: 404 })

  const signals: SeekerSignals = {
    skills: profile.skills,
    preferredCategories: profile.preferredCategories,
    city: profile.city,
    preferredCities: profile.preferredCities,
    preferredJobTypes: profile.preferredJobTypes,
    experienceYears: profile.experienceYears,
  }

  if (!hasUsableSignals(signals)) {
    return NextResponse.json({ personalised: false, jobs: [], reason: "profile_incomplete" })
  }

  const [jobs, skillCategories] = await Promise.all([
    prisma.jobListing.findMany({
      where: liveJobWhere(),
      select: {
        id: true,
        title: true,
        salaryMin: true,
        salaryMax: true,
        salaryUnit: true,
        jobType: true,
        vacancies: true,
        experienceMin: true,
        isFeatured: true,
        isHighReach: true,
        source: true,
        publishedAt: true,
        employer: { select: { companyName: true, status: true } },
        category: { select: { slug: true, nameEn: true, nameHi: true } },
        city: { select: { name: true, nameHi: true } },
      },
    }),
    categoriesForSkills(profile.skills),
  ])

  const scorable = jobs.map((j) => ({
    ...j,
    categorySlug: j.category?.slug ?? null,
    cityName: j.city?.name ?? null,
  }))

  const ranked = rankJobs(scorable, signals, skillCategories)
    // Only jobs matching the seeker's trade. A job that is merely in their
    // city and within their experience is not a recommendation — the listing
    // below already shows it, and calling it recommended would be a claim
    // that is not true.
    .filter((r) => r.relevant)
    .slice(0, limit)

  return NextResponse.json({
    personalised: true,
    count: ranked.length,
    jobs: ranked.map(({ job, score }) => ({
      id: job.id,
      title: job.title,
      company: job.source === "SCRAPED" ? null : job.employer.companyName,
      city: job.city,
      category: job.category,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryUnit: job.salaryUnit,
      jobType: job.jobType,
      vacancies: job.vacancies,
      experienceMin: job.experienceMin,
      isFeatured: job.isFeatured,
      isHighReach: job.isHighReach,
      isExternal: job.source === "SCRAPED",
      isVerifiedEmployer: job.source !== "SCRAPED" && job.employer.status === "VERIFIED",
      matchScore: score,
    })),
  })
}
