import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle, Users, Clock, CheckCircle, XCircle, AlertCircle,
  Briefcase, UserSearch, Home, ChevronRight, Upload, Info, Eye,
  TrendingUp, ArrowUpRight,
} from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerJobActions from "@/components/employer/EmployerJobActions"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE:         { label: "Active",       color: "text-green-700 bg-green-50 border-green-200",  icon: CheckCircle },
  PENDING_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-50 border-amber-200",  icon: Clock },
  DRAFT:          { label: "Draft",        color: "text-gray-600 bg-gray-50 border-gray-200",    icon: AlertCircle },
  EXPIRED:        { label: "Expired",      color: "text-red-600 bg-red-50 border-red-200",      icon: XCircle },
  CLOSED:         { label: "Closed",       color: "text-gray-500 bg-gray-50 border-gray-200",    icon: XCircle },
  REJECTED:       { label: "Rejected",     color: "text-red-700 bg-red-50 border-red-200",      icon: XCircle },
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

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
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

  const NAV_ITEMS = [
    { href: "/employer/dashboard",  icon: Home,       label: "Home",          active: true  },
    { href: "/employer/dashboard",  icon: Briefcase,  label: "Jobs",          active: false, extra: { href: "/employer/post-job", icon: PlusCircle } },
    { href: "/employer/responses",  icon: Users,      label: "Responses",     active: false },
    { href: "/employer/candidates", icon: UserSearch, label: "Talent Search", active: false },
    { href: "/employer/plans",      icon: TrendingUp, label: "Plans",         active: false },
    { href: "/employer/profile",    icon: ChevronRight,label: "More",         active: false },
  ]

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-white border-r border-gray-100 fixed top-0 h-screen z-10 overflow-y-auto shadow-sm">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a3461] flex items-center justify-center text-white font-extrabold text-sm">J</div>
            <span className="text-base font-extrabold text-[#1a3461] tracking-tight">Jobs Ready</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1a3461] to-[#2a4a7f] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{employer.contactPerson || employer.companyName}</p>
              <p className="text-[11px] text-gray-400 truncate">{employer.companyName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5">
          {/* Home */}
          <Link
            href="/employer/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1a3461] text-white font-bold text-sm shadow-sm"
          >
            <Home size={17} />
            Home
          </Link>

          {/* Jobs with + button */}
          <div className="flex items-center gap-1">
            <Link
              href="/employer/dashboard"
              className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <Briefcase size={17} />
              Jobs
            </Link>
            <Link
              href="/employer/post-job"
              className="p-2 rounded-xl text-gray-400 hover:bg-[#1a3461]/8 hover:text-[#1a3461] transition-colors"
              title="Post a Job"
            >
              <PlusCircle size={16} />
            </Link>
          </div>

          <Link href="/employer/responses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
            <Users size={17} />
            Responses
          </Link>
          <Link href="/employer/candidates" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
            <UserSearch size={17} />
            Talent Search
          </Link>
          <Link href="/employer/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
            <ChevronRight size={17} />
            More
          </Link>
        </nav>

        {/* Bottom tag */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs shrink-0 shadow-sm">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-700 truncate">{employer.companyName}</p>
              <p className="text-[10px] text-gray-400">{jobs.length} Jobs posted</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-56 lg:ml-60 min-h-screen">

        {/* Top header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-[5] shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Welcome back, {employer.contactPerson?.split(" ")[0] || employer.companyName}! 👋
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Here's what's happening with your jobs today.</p>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-all shadow-sm hover:shadow"
          >
            <PlusCircle size={16} />
            Post a Job
          </Link>
        </div>

        <div className="px-4 sm:px-6 py-6 w-full">
          <div className="grid xl:grid-cols-3 gap-5 items-start">

            {/* ── Left column ── */}
            <div className="xl:col-span-2 flex flex-col gap-5">

              {/* ── Stat cards — Jobhai style: large number, label below ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Live Jobs",    value: stats.live,         icon: Briefcase,  bg: "bg-green-50",   iconColor: "text-green-500",  numColor: "text-green-700"  },
                  { label: "Under Review", value: stats.underReview,  icon: Clock,      bg: "bg-amber-50",   iconColor: "text-amber-500",  numColor: "text-amber-700"  },
                  { label: "Applications", value: stats.applications, icon: Users,      bg: "bg-blue-50",    iconColor: "text-blue-500",   numColor: "text-blue-700"   },
                  { label: "Total Views",  value: stats.views,        icon: Eye,        bg: "bg-purple-50",  iconColor: "text-purple-500", numColor: "text-purple-700" },
                ].map(({ label, value, icon: Icon, bg, iconColor, numColor }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-start relative overflow-hidden hover:shadow-md transition-shadow">
                    {/* Icon in top-right */}
                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon size={16} className={iconColor} />
                    </div>
                    {/* Big number */}
                    <span className={`text-3xl font-extrabold ${numColor} leading-none mt-1`}>{value}</span>
                    {/* Label */}
                    <span className="text-xs text-gray-400 font-medium mt-2">{label}</span>
                  </div>
                ))}
              </div>

              {/* Jobs list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="jobs">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Your Job Listings</h2>
                  <Link
                    href="/employer/post-job"
                    className="text-sm text-[#1a3461] font-bold hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Post Job
                  </Link>
                </div>

                {jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center mb-4">
                      <Briefcase size={28} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-700">No jobs posted yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Post your first job to start getting candidates</p>
                    <Link
                      href="/employer/post-job"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-colors shadow-sm hover:shadow"
                    >
                      <PlusCircle size={16} /> Post a Job
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {jobs.map((job) => {
                      const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT
                      const StatusIcon = cfg.icon
                      const canEdit = !["CLOSED", "EXPIRED"].includes(job.status)
                      const canClose = job.status === "ACTIVE" || job.status === "PENDING_REVIEW"
                      const canRepost = ["CLOSED", "EXPIRED", "REJECTED"].includes(job.status)

                      return (
                        <div key={job.id} className="px-5 py-4 hover:bg-gray-50/70 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="font-bold text-gray-900 hover:text-[#1a3461] transition-colors text-sm"
                                >
                                  {job.title}
                                </Link>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
                                  <StatusIcon size={10} /> {cfg.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-400">
                                <span>{job.city.name}</span>
                                <span className="text-gray-200">·</span>
                                <span>{job.category.nameEn}</span>
                                <span className="text-gray-200">·</span>
                                <span className="font-semibold text-gray-500">{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</span>
                              </div>
                            </div>
                            <div className="text-center hidden sm:flex flex-col items-center shrink-0 min-w-[48px]">
                              <div className="text-xl font-extrabold text-gray-900">{job._count.applications}</div>
                              <div className="text-[10px] text-gray-400 font-medium">applicants</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <Link href={`/jobs/${job.id}`} className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                              View
                            </Link>
                            <Link href={`/employer/jobs/${job.id}/applicants`} className="text-xs font-semibold text-[#1a3461] border border-[#1a3461]/20 bg-[#eef2ff] px-3 py-1.5 rounded-xl hover:bg-[#1a3461]/10 transition-colors flex items-center gap-1">
                              <Users size={11} /> {job._count.applications} Applicants
                            </Link>
                            {canEdit && (
                              <Link href={`/employer/jobs/${job.id}/edit`} className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
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
            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-5">

              {/* Verification Steps */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#1a3461]/10 flex items-center justify-center">
                      <TrendingUp size={14} className="text-[#1a3461]" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">Verification Steps</span>
                    <span className="ml-auto text-xs font-extrabold text-[#1a3461] bg-[#eef2ff] px-2 py-0.5 rounded-full">{progressPct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1a3461] to-[#3b6cb7] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {steps.map((s) => (
                    <div key={s.label} className="flex items-center gap-3 px-5 py-3.5">
                      {/* Step indicator */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        s.done ? "bg-green-500 shadow-sm" : "border-2 border-gray-200 bg-gray-50"
                      }`}>
                        {s.done
                          ? <CheckCircle size={13} className="text-white" />
                          : <div className="w-2 h-2 rounded-full bg-gray-300" />
                        }
                      </div>
                      <span className={`flex-1 text-sm ${s.done ? "text-gray-500 line-through" : "text-gray-700"}`}>{s.label}</span>
                      {s.action && !s.done ? (
                        <Link
                          href={s.action.href}
                          className="text-xs text-[#1a3461] font-bold flex items-center gap-1 hover:underline shrink-0"
                        >
                          {s.action.icon === "upload" ? <Upload size={11} /> : s.action.icon === "info" ? <Info size={11} /> : null}
                          {s.action.label}
                        </Link>
                      ) : s.done ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">Done</span>
                      ) : (
                        <span className="text-[11px] text-gray-400 shrink-0">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Help card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-gray-800 mb-1">Need Help?</p>
                <p className="text-xs text-gray-400 mb-4">Our team is here to help you hire faster</p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="mailto:support@jobsready.in"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#eef2ff] hover:border-[#1a3461]/20 border border-transparent transition-all group"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">Contact Support</p>
                      <p className="text-xs text-gray-400">support@jobsready.in</p>
                    </div>
                    <ArrowUpRight size={15} className="text-gray-300 group-hover:text-[#1a3461] transition-colors" />
                  </a>
                  <button className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#eef2ff] hover:border-[#1a3461]/20 border border-transparent transition-all group text-left">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Refer a Friend</p>
                      <p className="text-xs text-gray-400">Help your network hire faster</p>
                    </div>
                    <ArrowUpRight size={15} className="text-gray-300 group-hover:text-[#1a3461] transition-colors" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
