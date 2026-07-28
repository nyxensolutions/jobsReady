import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { PlusCircle, Eye, Users, Clock, CheckCircle, XCircle, AlertCircle, Briefcase, UserSearch } from "lucide-react"
import EmployerJobActions from "@/components/employer/EmployerJobActions"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE:         { label: "Active",       color: "text-green-700 bg-green-100",  icon: CheckCircle },
  PENDING_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-100",  icon: Clock },
  DRAFT:          { label: "Draft",        color: "text-gray-600 bg-gray-100",    icon: AlertCircle },
  EXPIRED:        { label: "Expired",      color: "text-red-600 bg-red-100",      icon: XCircle },
  CLOSED:         { label: "Closed",       color: "text-gray-500 bg-gray-100",    icon: XCircle },
  REJECTED:       { label: "Rejected",     color: "text-red-700 bg-red-100",      icon: XCircle },
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract", GIG: "Gig", WALK_IN: "Walk-in",
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  if (max) return `Up to ${fmt(max)}${suffix}`
  return "—"
}

export default async function EmployerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) redirect("/employer/register")

  const jobs = await prisma.jobListing.findMany({
    where: { employerId: employer.id },
    include: {
      category: { select: { nameEn: true } },
      city: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    applications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
    views: jobs.reduce((sum, j) => sum + j.viewCount, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{employer.companyName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Employer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/employer/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </Link>
            <Link
              href="/employer/candidates"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1a3461] text-[#1a3461] text-sm font-semibold rounded-xl hover:bg-[#1a3461]/5 transition-colors"
            >
              <UserSearch size={16} />
              Find Candidates
            </Link>
            <Link
              href="/employer/post-job"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3461] text-white text-sm font-semibold rounded-xl hover:bg-[#142a52] transition-colors"
            >
              <PlusCircle size={16} />
              Post a Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {[
            { label: "Total Jobs", value: stats.total, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
            { label: "Active Jobs", value: stats.active, icon: CheckCircle, color: "text-green-600 bg-green-50" },
            { label: "Applications", value: stats.applications, icon: Users, color: "text-purple-600 bg-purple-50" },
            { label: "Total Views", value: stats.views, icon: Eye, color: "text-orange-600 bg-orange-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs list */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Job Listings</h2>
            <span className="text-sm text-gray-400">{jobs.length} total</span>
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700">No jobs posted yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">Start hiring by posting your first job</p>
              <Link
                href="/employer/post-job"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3461] text-white text-sm font-semibold rounded-xl hover:bg-[#142a52] transition-colors"
              >
                <PlusCircle size={16} />
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => {
                const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT
                const StatusIcon = cfg.icon
                const canEdit = !["CLOSED", "EXPIRED"].includes(job.status)
                const canClose = job.status === "ACTIVE" || job.status === "PENDING_REVIEW"
                const canRepost = ["CLOSED", "EXPIRED", "REJECTED"].includes(job.status)

                return (
                  <div key={job.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-[#1a3461] transition-colors truncate text-sm">
                            {job.title}
                          </Link>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                          {job.isFeatured && (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{job.city.name}</span>
                          <span>·</span>
                          <span>{job.category.nameEn}</span>
                          <span>·</span>
                          <span>{TYPE_LABELS[job.jobType]}</span>
                          <span>·</span>
                          <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</span>
                        </div>

                        {job.status === "PENDING_REVIEW" && (
                          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                            <Clock size={11} /> Under review — will go live once approved by our team
                          </p>
                        )}
                        {job.status === "REJECTED" && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <XCircle size={11} /> Rejected — edit and repost to resubmit for review
                          </p>
                        )}
                        {job.expiresAt && job.status === "ACTIVE" && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            Expires {new Date(job.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center hidden sm:block">
                          <div className="font-bold text-gray-900 text-sm">{job._count.applications}</div>
                          <div className="text-xs text-gray-400">applicants</div>
                        </div>
                        <div className="text-center hidden sm:block">
                          <div className="font-bold text-gray-900 text-sm">{job.viewCount}</div>
                          <div className="text-xs text-gray-400">views</div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/employer/jobs/${job.id}/applicants`}
                        className="text-xs font-medium text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-1"
                      >
                        <Users size={11} /> {job._count.applications} Applicants
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/employer/jobs/${job.id}/edit`}
                          className="text-xs font-medium text-[#1a3461] border border-[#1a3461]/30 px-3 py-1.5 rounded-lg hover:bg-[#1a3461]/5 transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                      <EmployerJobActions jobId={job.id} canClose={canClose} canRepost={canRepost} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile status banner */}
        {employer.status === "PENDING" && (
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Company verification pending</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your company profile is under review. Jobs submitted will be visible once verified and approved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
