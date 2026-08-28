import { Link } from "@/i18n/navigation"
import { MapPin, Users, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/db"

type Props = {
  heading: string
  categorySlug?: string
  citySlug?: string
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => (n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`)
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  if (max) return `Up to ${fmt(max)}${suffix}`
  return "As per interview"
}

const SELECT = {
  id: true,
  title: true,
  salaryMin: true,
  salaryMax: true,
  salaryUnit: true,
  vacancies: true,
  source: true,
  employer: { select: { companyName: true } },
  city: { select: { name: true } },
} as const

/**
 * Live listings pulled from our own DB and injected mid-article.
 *
 * This is what keeps an evergreen guide fresh for crawlers and passes internal
 * link equity to job pages. It degrades quietly: a DB error or an empty result
 * renders nothing rather than breaking the article.
 */
export default async function LiveJobs({ heading, categorySlug, citySlug }: Props) {
  let jobs: Array<{
    id: string
    title: string
    salaryMin: number | null
    salaryMax: number | null
    salaryUnit: string
    vacancies: number
    source: string
    employer: { companyName: string }
    city: { name: string }
  }> = []

  try {
    const base = {
      status: "ACTIVE" as const,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    }

    if (citySlug) {
      jobs = await prisma.jobListing.findMany({
        where: { ...base, city: { slug: citySlug } },
        select: SELECT,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 4,
      })
    }

    // Fall back to the category across all cities so the widget is rarely empty.
    if (jobs.length === 0) {
      jobs = await prisma.jobListing.findMany({
        where: base,
        select: SELECT,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 4,
      })
    }
  } catch {
    return null
  }

  if (jobs.length === 0) return null

  const browseHref = categorySlug ? `/jobs?category=${categorySlug}` : "/jobs"

  return (
    <section className="my-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-black text-[#1a3461] uppercase tracking-wide">{heading}</h2>
        <Link
          href={browseHref}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1a3461]/30 hover:shadow-sm transition-all"
          >
            <p className="font-bold text-sm text-[#1a3461] leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {job.title}
            </p>
            {job.source !== "SCRAPED" && (
              <p className="text-xs text-gray-500 mt-1 truncate">{job.employer.companyName}</p>
            )}
            <p className="text-sm font-bold text-green-700 mt-2">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {job.city.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users size={12} />
                {job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
