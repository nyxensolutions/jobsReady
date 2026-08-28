import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { prisma } from "@/lib/db"
import { MapPin, Globe, Phone, Briefcase, Building2 } from "lucide-react"

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return "Salary not mentioned"
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const employer = await prisma.employerProfile.findUnique({
    where: { id },
    include: {
      jobListings: {
        where: { status: "ACTIVE" },
        include: { city: { select: { name: true } }, category: { select: { nameEn: true } } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
    },
  })

  if (!employer) notFound()

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
                  <a href={employer.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe size={14} />{employer.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {employer.contactPhone && (
                  <a href={`tel:${employer.contactPhone}`} className="flex items-center gap-1 text-green-600 hover:underline">
                    <Phone size={14} />{employer.contactPhone}
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
