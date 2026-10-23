import { Prisma, JobType } from "@prisma/client"
import { expandCitySlugs } from "./cityClusters"

// Shared by the web job search page (src/app/[locale]/jobs/page.tsx) and the
// mobile-facing GET /api/jobs endpoint, so the two never drift out of sync.

export const JOBS_PER_PAGE = 20

export type JobListingSearchParams = {
  q?: string
  city?: string      // comma-separated city or cluster slugs, e.g. "delhi-ncr,pune"
  category?: string   // comma-separated slugs for multi-select, e.g. "delivery,driver"
  type?: string      // comma-separated job types, e.g. "FULL_TIME,PART_TIME"
  sort?: string
  minSalary?: string
  freshers?: string
  exp?: string          // max experience in years (from experience filter)
  qualification?: string
  posted?: string
  page?: string
}

export function buildJobListingQuery(params: JobListingSearchParams) {
  const q = params.q?.trim() ?? ""
  // Cities arrive as slugs now, and may name a cluster ("delhi-ncr") which
  // stands for several. Legacy callers passing a display name still work: a
  // single value with no comma falls back to a name match below.
  const cityRaw = params.city?.trim() ?? ""
  const citySlugs = cityRaw ? expandCitySlugs(cityRaw.split(",").map((c) => c.trim()).filter(Boolean)) : []
  // category can be a single slug OR comma-separated slugs for multi-select
  const categoryRaw = params.category ?? ""
  const categories = categoryRaw ? categoryRaw.split(",").map(s => s.trim()).filter(Boolean) : []
  const category = categoryRaw  // keep for backward compat usage below
  const typeRaw = params.type ?? ""
  const types = typeRaw ? typeRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const sort = params.sort ?? "newest"
  const minSalary = params.minSalary ? parseInt(params.minSalary) : null
  const freshersOnly = params.freshers === "1"
  const maxExp = params.exp ? parseInt(params.exp) : null
  const qualification = params.qualification ?? ""
  const posted = params.posted ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1"))

  const postedAfter =
    posted === "today"
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : posted === "week"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : null

  const where: Prisma.JobListingWhereInput = {
    status: "ACTIVE",
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { employer: { companyName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(citySlugs.length > 1
      ? { city: { slug: { in: citySlugs } } }
      : citySlugs.length === 1
      ? // A single value may be a slug or, from older links, a display name.
        { city: { OR: [{ slug: citySlugs[0] }, { name: { equals: citySlugs[0], mode: "insensitive" } }] } }
      : {}),
    ...(categories.length === 1
      ? { category: { slug: categories[0] } }
      : categories.length > 1
      ? { category: { slug: { in: categories } } }
      : {}),
    ...(types.length === 1
      ? { jobType: types[0] as JobType }
      : types.length > 1
      ? { jobType: { in: types as JobType[] } }
      : {}),
    ...(minSalary ? { salaryMin: { gte: minSalary } } : {}),
    ...(freshersOnly ? { experienceMin: 0 } : maxExp ? { experienceMin: { lte: maxExp } } : {}),
    ...(qualification ? { qualificationRequired: qualification } : {}),
    ...(postedAfter ? { createdAt: { gte: postedAfter } } : {}),
  }

  const orderBy: Prisma.JobListingOrderByWithRelationInput[] =
    sort === "vacancies"
      ? [{ isFeatured: "desc" }, { vacancies: "desc" }]
      : sort === "salary"
      ? [{ isFeatured: "desc" }, { salaryMax: "desc" }]
      : [{ isFeatured: "desc" }, { createdAt: "desc" }]

  return { where, orderBy, page, perPage: JOBS_PER_PAGE }
}
