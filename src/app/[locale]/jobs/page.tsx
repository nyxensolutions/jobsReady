import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/db"
import { buildJobListingQuery, JOBS_PER_PAGE, type JobListingSearchParams } from "@/lib/jobListingQuery"
import JobSearchBar from "@/components/jobs/JobSearchBar"
import JobFilters from "@/components/jobs/JobFilters"
import MobileFilters from "@/components/jobs/MobileFilters"
import JobCard from "@/components/jobs/JobCard"
import SortSelect from "@/components/jobs/SortSelect"
import JobsPagination from "@/components/jobs/JobsPagination"
import FilterChips from "@/components/jobs/FilterChips"
import { Briefcase } from "lucide-react"
import { alternatesFor } from "@/lib/seo"

const PER_PAGE = JOBS_PER_PAGE

type SearchParams = JobListingSearchParams

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const sp = await searchParams
  const city = sp.city ? ` in ${sp.city.charAt(0).toUpperCase() + sp.city.slice(1)}` : ""
  const cat = sp.category ? ` — ${sp.category.charAt(0).toUpperCase() + sp.category.slice(1)} jobs` : ""
  const q = sp.q ? ` for "${sp.q}"` : ""
  const title = `Jobs${q}${cat}${city} — Jobs24India`
  const description = city || cat || q
    ? `Browse verified${cat || ""} jobs${q}${city} on Jobs24India. Apply in one click, no CV needed.`
    : "Browse lakhs of verified jobs — delivery, driver, security, sales, factory, housekeeping and more. Apply in one click, no CV needed."

  return {
    title,
    description,
    alternates: alternatesFor(locale, "/jobs"),
    robots: sp.q || sp.city || sp.category || sp.type
      ? { index: false }   // filtered views are not indexable — avoid duplicate content
      : { index: true, follow: true },
  }
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  if (max) return `Up to ${fmt(max)}${suffix}`
  return "Salary not mentioned"
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams
  const t = await getTranslations("jobs")

  const q = params.q?.trim() ?? ""
  const city = params.city?.trim() ?? ""
  const category = params.category ?? ""
  const type = params.type ?? ""
  const sort = params.sort ?? "newest"
  const freshersOnly = params.freshers === "1"
  const qualification = params.qualification ?? ""
  const posted = params.posted ?? ""

  const { where, orderBy, page } = buildJobListingQuery(params)

  const [jobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where,
      include: {
        employer: { select: { companyName: true } },
        category: { select: { slug: true } },
        city: { select: { name: true } },
        boost: { select: { expiresAt: true } },
      },
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.jobListing.count({ where }),
  ])

  const mapped = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.source === "SCRAPED" ? "" : j.employer.companyName,
    city: j.city.name,
    salary: formatSalary(j.salaryMin, j.salaryMax, j.salaryUnit),
    type: j.jobType,
    category: j.category.slug,
    vacancies: j.vacancies,
    experienceMin: j.experienceMin,
    postedAt: j.createdAt,
    isFeatured: j.isFeatured,
    description: j.description ?? "",
    requirements: j.requirements ?? [],
    perks: j.perks ?? [],
    callToHrEnabled: j.callToHrEnabled,
    callToHrPhone: j.callToHrPhone ?? null,
    qualificationRequired: j.qualificationRequired ?? null,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <JobSearchBar defaultQuery={q} defaultCity={city} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <JobFilters activeCategory={category} />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MobileFilters activeCategory={category || undefined} />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {t("searchResults", { count: total })}
                    {city && <span className="text-[#1a3461]"> in {city}</span>}
                  </h1>
                  {q && <p className="text-sm text-gray-500 mt-0.5">for &ldquo;{q}&rdquo;</p>}
                </div>
              </div>
              <SortSelect sort={sort} />
            </div>
            <FilterChips
              category={category || undefined}
              type={type || undefined}
              minSalary={params.minSalary || undefined}
              freshers={freshersOnly ? "1" : undefined}
              qualification={qualification || undefined}
              posted={posted || undefined}
            />

            {mapped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Briefcase size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold">{t("noResults")}</p>
                <p className="text-sm text-gray-400 mt-1">Try different keywords or remove filters</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {mapped.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <JobsPagination page={page} total={total} perPage={PER_PAGE} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
