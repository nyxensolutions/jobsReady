import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { buildJobListingQuery } from "@/lib/jobListingQuery"

// GET /api/jobs — search/browse, same filters as the web /jobs page
// (q, city, category, type, sort, minSalary, freshers, qualification, posted, page).
// Public — no auth required, mirrors the public web listing page.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const params = {
    q: sp.get("q") ?? undefined,
    city: sp.get("city") ?? undefined,
    category: sp.get("category") ?? undefined,
    type: sp.get("type") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    minSalary: sp.get("minSalary") ?? undefined,
    freshers: sp.get("freshers") ?? undefined,
    qualification: sp.get("qualification") ?? undefined,
    posted: sp.get("posted") ?? undefined,
    page: sp.get("page") ?? undefined,
  }

  const { where, orderBy, page, perPage } = buildJobListingQuery(params)

  const [jobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where,
      include: {
        employer: { select: { companyName: true } },
        category: { select: { slug: true, nameEn: true, nameHi: true } },
        city: { select: { name: true, nameHi: true } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.jobListing.count({ where }),
  ])

  const results = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.source === "SCRAPED" ? null : j.employer.companyName,
    city: j.city,
    category: j.category,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryUnit: j.salaryUnit,
    jobType: j.jobType,
    vacancies: j.vacancies,
    experienceMin: j.experienceMin,
    isFeatured: j.isFeatured,
    isHighReach: j.isHighReach,
    createdAt: j.createdAt,
  }))

  return NextResponse.json({
    results,
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}
