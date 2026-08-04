import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle, Users, Clock, CheckCircle, XCircle, AlertCircle,
  Briefcase, UserSearch, Home, ChevronRight, Upload, Info, Eye,
} from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerJobActions from "@/components/employer/EmployerJobActions"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE:         { label: "Active",       color: "text-green-700 bg-green-100",  icon: CheckCircle },
  PENDING_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-100",  icon: Clock },
  DRAFT:          { label: "Draft",        color: "text-gray-600 bg-gray-100",    icon: AlertCircle },
  EXPIRED:        { label: "Expired",      color: "text-red-600 bg-red-100",      icon: XCircle },
  CLOSED:         { label: "Closed",       color: "text-gray-500 bg-gray-100",    icon: XCircle },
  REJECTED:       { label: "Rejected",     color: "text-red-700 bg-red-100",      icon: XCircle },
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return "—"
}

export default async function EmployerDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
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
    live: jobs.filter((j) => j.status === "ACTIVE").length,
    underReview: jobs.filter((j) => j.status === "PENDING_REVIEW").length,
    applications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
    views: jobs.reduce((sum, j) => sum + j.viewCount, 0),
  }

  // Verification steps
  const steps = [
    { label: "Create an account", done: true },
    { label: "Post your first job", done: jobs.length > 0, action: jobs.length > 0 ? { label: "View", href: `/employer/jobs/${jobs[0]?.id}/applicants` } : null },
    { label: "Email Verification", done: !!dbUser.email, action: !dbUser.email ? { label: "Add email", href: "/employer/profile" } : null },
    { label: "Document Submission", done: (employer.docUrls ?? []).length > 0, action: { label: "Upload", href: "/employer/setup/verify-docs", icon: "upload" } },
    { label: "Verification", done: employer.status === "VERIFIED", action: { label: "Info", href: "#", icon: "info" } },
  ]
  const completedSteps = steps.filter((s) => s.done).length
  const progressPct = Math.round((completedSteps / steps.length) * 100)

  const companyInitial = employer.companyName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-white border-r border-gray-200 fixed top-0 h-screen z-10 overflow-y-auto">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/" className="text-lg font-bold text-[#1a3461]">Jobs Ready</Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a3461] flex items-center justify-center text-white font-bold text-base shrink-0">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{employer.contactPerson || employer.companyName}</p>
              <p className="text-xs text-gray-400 truncate">{employer.contactPhone || dbUser.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          <Link
            href="/employer/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1a3461]/5 text-[#1a3461] font-semibold text-sm"
          >
            <Home size={18} />
            Home
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/employer/dashboard"
              className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
            >
              <Briefcase size={18} />
              Jobs
            </Link>
            <Link
              href="/employer/post-job"
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1a3461] transition-colors"
              title="Post a Job"
            >
              <PlusCircle size={17} />
            </Link>
          </div>
          <Link
            href="/employer/candidates"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
          >
            <UserSearch size={18} />
            Database
          </Link>
          <Link
            href="/employer/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
          >
            <Users size={18} />
            More
          </Link>
        </nav>

        {/* Footer company tag */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{employer.companyName}</p>
              <p className="text-xs text-gray-400">{jobs.length} Jobs</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-56 lg:ml-60 min-h-screen">
        {/* Top header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Welcome back, {employer.contactPerson?.split(" ")[0] || employer.companyName}!</h1>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-colors"
          >
            <PlusCircle size={16} />
            Post a Job
          </Link>
        </div>

        <div className="px-4 sm:px-6 py-6 flex flex-col gap-5 max-w-4xl">

          {/* Verification Steps */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#1a3461] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#1a3461]" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Verification Steps</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {steps.map((s) => (
                <div key={s.label} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    s.done ? "bg-green-500" : "border-2 border-gray-300"
                  }`}>
                    {s.done && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span className="flex-1 text-sm text-gray-700">{s.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.done ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"
                  }`}>
                    {s.done ? "Completed" : s.label === "Verification" ? "Pending" : "Not Started"}
                  </span>
                  {s.action && !s.done && (
                    <Link
                      href={s.action.href}
                      className="text-xs text-[#1a3461] font-semibold flex items-center gap-1 hover:underline shrink-0"
                    >
                      {s.action.icon === "upload" ? <Upload size={13} /> : s.action.icon === "info" ? <Info size={13} /> : null}
                      {s.action.label}
                    </Link>
                  )}
                  {s.action && s.done && (s.action as any).href && (s.action as any).label === "View" && (
                    <Link href={(s.action as any).href} className="text-xs text-[#1a3461] font-semibold hover:underline shrink-0">
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Live Jobs",        value: stats.live,         icon: Briefcase, color: "text-green-600 bg-green-50" },
              { label: "Under Review",     value: stats.underReview,  icon: Clock,     color: "text-amber-600 bg-amber-50" },
              { label: "Applications",     value: stats.applications, icon: Users,     color: "text-blue-600 bg-blue-50"   },
              { label: "Total Views",      value: stats.views,        icon: Eye,       color: "text-purple-600 bg-purple-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Jobs list */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Your Job Listings</h2>
              <Link href="/employer/post-job" className="text-xs text-[#1a3461] font-semibold hover:underline flex items-center gap-1">
                <PlusCircle size={13} /> Post Job
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Briefcase size={24} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">No jobs posted yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-5">Post your first job to start getting candidates</p>
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
                    <div key={job.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-semibold text-gray-900 hover:text-[#1a3461] transition-colors text-sm"
                            >
                              {job.title}
                            </Link>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                              <StatusIcon size={11} />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{job.city.name}</span>
                            <span>·</span>
                            <span>{job.category.nameEn}</span>
                            <span>·</span>
                            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center hidden sm:block">
                            <div className="font-bold text-gray-900 text-sm">{job._count.applications}</div>
                            <div className="text-xs text-gray-400">applicants</div>
                          </div>
                        </div>
                      </div>

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

          {/* Help cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-800 text-sm mb-1">Contact Us</p>
              <p className="text-xs text-gray-500 mb-3">Get dedicated support from our team</p>
              <a
                href="mailto:support@jobready.in"
                className="text-xs font-semibold text-[#1a3461] flex items-center gap-1 hover:underline"
              >
                support@jobready.in <ChevronRight size={13} />
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-800 text-sm mb-1">Refer us</p>
              <p className="text-xs text-gray-500 mb-3">Help your network hire faster with Jobs Ready</p>
              <button className="text-xs font-semibold text-[#1a3461] flex items-center gap-1 hover:underline">
                Share with a friend <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
