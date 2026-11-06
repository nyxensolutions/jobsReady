import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { prisma } from "@/lib/db"
import { liveJobWhere } from "@/lib/jobListingQuery"
import { alternatesFor } from "@/lib/seo"
import { MapPin, Globe, Briefcase, Building2 } from "lucide-react"

/**
 * Public company profile, linked from the company name on every job detail page.
 *
 * Two rules this page has to hold, because it is the one seeker-facing surface
 * that speaks for a company rather than a listing:
 *
 * 1. Only a VERIFIED employer gets a page. A PENDING or REJECTED company with a
 *    public, indexable profile reads as endorsement we have not given, and the
 *    id is guessable from any job it has posted.
 *
 * 2. Only EMPLOYER-source jobs are listed. The scraped corpus is held under a
 *    real employer row ("Jobs24India Partner List", 265 listings at the time of
 *    writing) which is itself VERIFIED, so listing every live job here would
 *    present a few hundred aggregated adverts as one company's own openings —
 *    the exact claim `jobs/page.tsx` and the social feed both refuse to make.
 *
 * The employer's contact phone used to be rendered here. It is not any more: a
 * public page keyed on a guessable id is the cheapest possible scrape of every
 * employer phone number we hold, and the apply flow already carries contact.
 */

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return "Salary not mentioned"
}

/** Shared by the page and its metadata so the two cannot disagree. */
async function getCompany(id: string) {
  return prisma.employerProfile.findUnique({
    where: { id },
    include: {
      jobListings: {
        // Live, employer-posted only — see rule 2 in the file comment.
        where: { ...liveJobWhere(), source: "EMPLOYER" },
        include: { city: { select: { name: true } }, category: { select: { nameEn: true } } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
  const { id, locale } = await params
  const employer = await getCompany(id)

  if (!employer || employer.status !== "VERIFIED") {
    return { title: "Company not found", robots: { index: false, follow: false } }
  }

  const count = employer.jobListings.length
  return {
    // No "| Jobs24India" suffix here — the root layout's title template adds it.
    title: `${employer.companyName} — Jobs & Company Details`,
    description:
      employer.description?.slice(0, 160) ??
      `${employer.companyName}${employer.city ? ` in ${employer.city}` : ""} has ${count} open ${count === 1 ? "position" : "positions"} on Jobs24India.`,
    alternates: alternatesFor(locale, `/company/${id}`),
    // A company with nothing open is a thin page that will be crawled far more
    // often than it changes; let it be followed but not indexed until it has
    // something to say.
    robots: count === 0 ? { index: false, follow: true } : undefined,
  }
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const employer = await getCompany(id)

  // Rule 1: an unverified company has no public profile. 404 rather than a
  // "not verified" page, which would still confirm the company exists to anyone
  // walking ids.
  if (!employer || employer.status !== "VERIFIED") notFound()

  const jobs = employer.jobListings

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Company header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a3461]/10 flex items-center justify-center shrink-0">
              <Building2 size={32} className="text-[#1a3461]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{employer.companyName}</h1>
              {employer.industry && <p className="text-sm text-gray-500 mt-0.5">{employer.industry}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                {employer.city && (
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" />{employer.city}</span>
                )}
                {employer.website && (
                  <a href={employer.website} target="_blank" rel="noreferrer nofollow" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe size={14} />{employer.website.replace(/^https?:\/\//, "")}
                  </a>
                )}

              </div>
            </div>
          </div>
          {employer.description && (
            <p className="mt-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-5">{employer.description}</p>
          )}
        </div>

        {/* Active jobs */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Briefcase size={16} />
            Open Positions ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              No active job openings right now
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1a3461]/30 hover:shadow-sm transition-all block">
                  <p className="font-bold text-[#1a3461] text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.category.nameEn}</p>
                  <p className="text-sm font-bold text-green-600 mt-2">{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <MapPin size={10} />{job.city.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
